import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle,
  MapPin,
  Phone,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  formatCurrencyBRL,
  formatDateBR,
  formatTimeBR,
  formatPhoneBR,
  DAY_NAMES_SHORT_PT,
} from '../lib/formatters';
import { calculateAvailableSlots } from '../lib/scheduleEngine';
import confetti from 'canvas-confetti';
import { Appointment } from '../types';

interface PublicBookingPageProps {
  slug?: string;
}

export const PublicBookingPage: React.FC<PublicBookingPageProps> = () => {
  const {
    business,
    services,
    professionals,
    workingHours,
    appointments,
    blockouts,
    createAppointment,
  } = useApp();

  // Etapas do Agendamento
  // 1 = Escolher Serviço
  // 2 = Escolher Profissional
  // 3 = Escolher Data & Horário
  // 4 = Dados do Cliente & Revisão
  // 5 = Sucesso / Confirmação
  const [step, setStep] = useState(1);

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>(''); // ex: "14:30"
  const [selectedSlotDatetime, setSelectedSlotDatetime] = useState<string>(''); // ISO

  // Dados do cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Objetos selecionados
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedProfessional = professionals.find((p) => p.id === selectedProfessionalId);

  // Profissionais habilitados para o serviço escolhido
  const eligibleProfessionals = useMemo(() => {
    if (!selectedServiceId) return [];
    return professionals.filter((p) => p.active && p.service_ids.includes(selectedServiceId));
  }, [selectedServiceId, professionals]);

  // Próximos 14 dias para seleção rápida
  const nextDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        dateStr: iso,
        dayOfWeek: d.getDay(),
        dayNumber: d.getDate(),
        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
        dayName: DAY_NAMES_SHORT_PT[d.getDay()],
      });
    }
    return days;
  }, []);

  // Slots de horários disponíveis calculados pela engine com respeito a bloqueios e reservas
  const availableSlots = useMemo(() => {
    if (!selectedService || !selectedProfessionalId || !selectedDate) return [];
    return calculateAvailableSlots(
      selectedDate,
      selectedService.duration_minutes,
      workingHours,
      appointments,
      blockouts,
      selectedProfessionalId
    );
  }, [selectedService, selectedProfessionalId, selectedDate, workingHours, appointments, blockouts]);

  const handleSelectService = (id: string) => {
    setSelectedServiceId(id);
    setSelectedProfessionalId('');
    setSelectedSlotTime('');
    setStep(2);
  };

  const handleSelectProfessional = (id: string) => {
    setSelectedProfessionalId(id);
    setSelectedSlotTime('');
    setStep(3);
  };

  const handleSelectSlot = (slot: { time: string; datetime: string }) => {
    setSelectedSlotTime(slot.time);
    setSelectedSlotDatetime(slot.datetime);
    setStep(4);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await createAppointment({
      service_id: selectedServiceId,
      professional_id: selectedProfessionalId,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      start_time: selectedSlotDatetime,
    });

    setIsSubmitting(false);

    if (res.success && res.appointment) {
      setConfirmedAppointment(res.appointment);
      setStep(5);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setErrorMessage(res.error || 'Erro ao confirmar agendamento. Tente outro horário.');
      setStep(3); // Voltar para seleção de horário se houver conflito
    }
  };

  const handleWhatsAppContact = () => {
    if (!confirmedAppointment) return;
    const msg = `Olá! Acabei de fazer um agendamento no Agendix para ${confirmedAppointment.service_name} no dia ${formatDateBR(confirmedAppointment.start_time)} às ${formatTimeBR(confirmedAppointment.start_time)}. Código da reserva: ${confirmedAppointment.code}.`;
    const cleanNum = business.whatsapp.replace(/\D/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 16px',
      }}
    >
      {/* Card do Estabelecimento / Header Público */}
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          marginBottom: '20px',
          padding: '20px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                flexShrink: 0,
                border: '1px solid var(--slate-200)',
              }}
            />
          ) : (
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.4rem',
                flexShrink: 0,
              }}
            >
              {business.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.2 }}>
              {business.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              <MapPin size={13} />
              <span>{business.address}, {business.city} - {business.state}</span>
            </div>
            {business.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                <Phone size={13} />
                <span>{business.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Container Principal de Agendamento */}
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Barra de Progresso e Botão Voltar */}
        {step > 1 && step < 5 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid var(--slate-100)',
              paddingBottom: '12px',
            }}
          >
            <button
              onClick={() => setStep(step - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--slate-600)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={18} />
              Voltar
            </button>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-600)' }}>
              Etapa {step} de 4
            </span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* ETAPA 1: ESCOLHER SERVIÇO */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
              1. Escolha o serviço desejado
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '16px' }}>
              Selecione o procedimento que deseja realizar:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {services.filter((s) => s.active).map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => handleSelectService(srv.id)}
                  className="card-clickable"
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--slate-200)',
                    backgroundColor: 'var(--slate-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    {srv.image_url && (
                      <img
                        src={srv.image_url}
                        alt={srv.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          flexShrink: 0,
                          border: '1px solid var(--slate-200)',
                        }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                        {srv.name}
                      </h4>
                      {srv.description && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '2px', maxWidth: '300px' }}>
                          {srv.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '6px' }}>
                        <Clock size={13} />
                        <span>{srv.duration_minutes} minutos</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                      {formatCurrencyBRL(srv.price)}
                    </span>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', marginTop: '4px' }}>
                      Agendar →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 2: ESCOLHER PROFISSIONAL */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
              2. Escolha o profissional
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '16px' }}>
              Para o serviço <strong>{selectedService?.name}</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {eligibleProfessionals.map((pro) => (
                <div
                  key={pro.id}
                  onClick={() => handleSelectProfessional(pro.id)}
                  className="card-clickable"
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--slate-200)',
                    backgroundColor: 'var(--slate-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {pro.avatar_url ? (
                      <img
                        src={pro.avatar_url}
                        alt={pro.name}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--primary-200)',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                          flexShrink: 0,
                        }}
                      >
                        {pro.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                        {pro.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
                        ● Disponível
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                    Escolher →
                  </span>
                </div>
              ))}

              {eligibleProfessionals.length === 0 && (
                <p style={{ textAlign: 'center', padding: '24px', color: 'var(--slate-500)' }}>
                  Nenhum profissional habilitado para este serviço no momento.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ETAPA 3: ESCOLHER DATA E HORÁRIO */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
              3. Escolha o dia e horário
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '16px' }}>
              Com <strong>{selectedProfessional?.name}</strong>:
            </p>

            {/* Carrossel de Dias da Semana */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                marginBottom: '20px',
              }}
            >
              {nextDays.map((d) => {
                const isSelected = selectedDate === d.dateStr;
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.dateStr);
                      setSelectedSlotTime('');
                    }}
                    style={{
                      flexShrink: 0,
                      width: '64px',
                      padding: '10px 4px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--primary-600)' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--slate-700)',
                      border: `1px solid ${isSelected ? 'var(--primary-600)' : 'var(--slate-200)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 10px rgba(2, 132, 199, 0.25)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.9 }}>{d.dayName}</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{d.dayNumber}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{d.month}</span>
                  </button>
                );
              })}
            </div>

            {/* Grade de Horários Livres */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '10px' }}>
                Horários livres para {formatDateBR(selectedDate + 'T12:00:00')}:
              </span>

              {availableSlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                    Nenhum horário disponível para este dia ou estabelecimento fechado.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '4px' }}>
                    Por favor, selecione outro dia no calendário acima.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '8px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    paddingRight: '4px',
                  }}
                >
                  {availableSlots.map((slot) => {
                    if (!slot.available) return null; // Apenas horários livres são exibidos
                    return (
                      <button
                        key={slot.time}
                        onClick={() => handleSelectSlot(slot)}
                        style={{
                          padding: '10px 4px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--primary-200)',
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-700)',
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ETAPA 4: DADOS DO CLIENTE E REVISÃO */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
              4. Seus dados e confirmação
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '16px' }}>
              Não é necessário criar conta. Preencha apenas para registrar a reserva:
            </p>

            {/* Resumo do Atendimento */}
            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Serviço:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  {selectedService?.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Profissional:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedProfessional?.avatar_url && (
                    <img
                      src={selectedProfessional.avatar_url}
                      alt={selectedProfessional.name}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  {selectedProfessional?.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Data e Horário:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                  {formatDateBR(selectedDate + 'T12:00:00')} às {selectedSlotTime}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--slate-200)', paddingTop: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)' }}>Valor Total:</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                  {formatCurrencyBRL(selectedService?.price || 0)}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking}>
              <div className="form-group">
                <label className="form-label">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="form-input"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Seu Telefone / WhatsApp com DDD *</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="form-input"
                  placeholder="(11) 99999-8888"
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-mail (Opcional)</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="form-input"
                  placeholder="joao@email.com"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <ShieldCheck size={16} color="var(--slate-400)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  Seus dados são usados exclusivamente para gerenciar esta reserva pelo estabelecimento.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        )}

        {/* ETAPA 5: SUCESSO / COMPROVANTE */}
        {step === 5 && confirmedAppointment && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-50)',
                color: 'var(--emerald-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Agendamento Confirmado!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginTop: '4px', marginBottom: '20px' }}>
              Sua reserva foi registrada com sucesso no estabelecimento.
            </p>

            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '20px',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)' }}>Código da Reserva:</span>
                <strong style={{ color: 'var(--primary-600)', fontSize: '0.95rem' }}>
                  {confirmedAppointment.code}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)' }}>Serviço:</span>
                <strong style={{ color: 'var(--slate-800)' }}>{confirmedAppointment.service_name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)' }}>Profissional:</span>
                <strong style={{ color: 'var(--slate-800)' }}>{confirmedAppointment.professional_name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)' }}>Data e Horário:</span>
                <strong style={{ color: 'var(--slate-800)' }}>
                  {formatDateBR(confirmedAppointment.start_time)} às {formatTimeBR(confirmedAppointment.start_time)}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)' }}>Duração e Valor:</span>
                <strong style={{ color: 'var(--emerald-600)' }}>
                  {confirmedAppointment.service_duration} min • {formatCurrencyBRL(confirmedAppointment.service_price)}
                </strong>
              </div>

              <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.8rem' }}>Endereço:</span>
                <strong style={{ color: 'var(--slate-800)' }}>
                  {business.address}, {business.city} - {business.state}
                </strong>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '18px' }}>
              Para cancelar ou reagendar seu horário, por favor entre em contato diretamente com o estabelecimento:
            </p>

            <button
              onClick={handleWhatsAppContact}
              className="btn btn-success btn-lg"
              style={{ width: '100%', gap: '10px' }}
            >
              <MessageSquare size={18} />
              Falar com Estabelecimento no WhatsApp
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
          Powered by <strong>Agendix</strong> • Plataforma de Agendamentos Online
        </p>
      </div>
    </div>
  );
};
