import { WorkingHour, Appointment, Blockout, TimeSlot } from '../types';

/**
 * Calcula os slots de horários disponíveis para um determinado profissional em uma data.
 * Regras:
 * - Não permitir reservas no passado.
 * - Considerar a duração completa do serviço.
 * - Respeitar horários de funcionamento e intervalos (almoço).
 * - Respeitar bloqueios específicos do profissional ou do estabelecimento.
 * - Gerar possíveis inícios em intervalos de 15 minutos (00, 15, 30, 45).
 * - Impedir sobreposições com outros agendamentos confirmados.
 */
export function calculateAvailableSlots(
  targetDate: string, // "YYYY-MM-DD"
  durationMinutes: number,
  workingHours: WorkingHour[],
  appointments: Appointment[],
  blockouts: Blockout[],
  professionalId?: string
): TimeSlot[] {
  const [year, month, day] = targetDate.split('-').map(Number);
  const targetObj = new Date(year, month - 1, day);
  const dayOfWeek = targetObj.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  // Encontrar o horário de trabalho correspondente para o dia da semana
  // Prioriza o horário específico do profissional se existir, senão usa o geral
  const wh = workingHours.find(
    (w) => w.day_of_week === dayOfWeek && w.is_active && (professionalId ? w.professional_id === professionalId || !w.professional_id : true)
  );

  if (!wh) {
    return [];
  }

  const [startHour, startMin] = wh.start_time.split(':').map(Number);
  const [endHour, endMin] = wh.end_time.split(':').map(Number);

  const dayStartMinutes = startHour * 60 + startMin;
  const dayEndMinutes = endHour * 60 + endMin;

  let breakStartMinutes = -1;
  let breakEndMinutes = -1;
  if (wh.break_start && wh.break_end) {
    const [bsh, bsm] = wh.break_start.split(':').map(Number);
    const [beh, bem] = wh.break_end.split(':').map(Number);
    breakStartMinutes = bsh * 60 + bsm;
    breakEndMinutes = beh * 60 + bem;
  }

  // Filtrar agendamentos ativos na data para o profissional
  const activeAppointments = appointments.filter((app) => {
    if (app.status === 'cancelled') return false;
    if (professionalId && app.professional_id !== professionalId) return false;
    const appDate = app.start_time.slice(0, 10);
    return appDate === targetDate;
  });

  // Filtrar bloqueios
  const activeBlockouts = blockouts.filter((block) => {
    if (professionalId && block.professional_id && block.professional_id !== professionalId) return false;
    const blockStartDate = block.start_datetime.slice(0, 10);
    const blockEndDate = block.end_datetime.slice(0, 10);
    return targetDate >= blockStartDate && targetDate <= blockEndDate;
  });

  const now = new Date();
  const slots: TimeSlot[] = [];

  // Intervalo de passo: 15 minutos
  for (let m = dayStartMinutes; m + durationMinutes <= dayEndMinutes; m += 15) {
    const slotHour = Math.floor(m / 60);
    const slotMin = m % 60;
    const timeStr = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;
    
    const slotStartObj = new Date(year, month - 1, day, slotHour, slotMin, 0);
    const slotEndObj = new Date(slotStartObj.getTime() + durationMinutes * 60000);
    const slotEndMinutes = m + durationMinutes;

    let available = true;
    let reason = '';

    // 1. Verificar se está no passado (com tolerância de 5 min de buffer)
    if (slotStartObj.getTime() <= now.getTime() + 5 * 60000) {
      available = false;
      reason = 'Horário no passado';
    }

    // 2. Verificar intervalo de almoço / pausa
    if (available && breakStartMinutes !== -1 && breakEndMinutes !== -1) {
      // O serviço conflita com o intervalo se começar antes do fim do intervalo e terminar após o início do intervalo
      if (m < breakEndMinutes && slotEndMinutes > breakStartMinutes) {
        available = false;
        reason = 'Intervalo / Almoço';
      }
    }

    // 3. Verificar conflito com agendamentos existentes
    if (available) {
      for (const app of activeAppointments) {
        const appStart = new Date(app.start_time).getTime();
        const appEnd = new Date(app.end_time).getTime();
        const sStart = slotStartObj.getTime();
        const sEnd = slotEndObj.getTime();

        // Conflito de sobreposição: slotStart < appEnd && slotEnd > appStart
        if (sStart < appEnd && sEnd > appStart) {
          available = false;
          reason = 'Já reservado';
          break;
        }
      }
    }

    // 4. Verificar bloqueios
    if (available) {
      for (const block of activeBlockouts) {
        const bStart = new Date(block.start_datetime).getTime();
        const bEnd = new Date(block.end_datetime).getTime();
        const sStart = slotStartObj.getTime();
        const sEnd = slotEndObj.getTime();

        if (sStart < bEnd && sEnd > bStart) {
          available = false;
          reason = `Bloqueado: ${block.reason || 'Indisponível'}`;
          break;
        }
      }
    }

    slots.push({
      time: timeStr,
      datetime: slotStartObj.toISOString(),
      available,
      reason,
    });
  }

  return slots;
}
