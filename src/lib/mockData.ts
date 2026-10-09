import { Business, Service, Professional, WorkingHour, Client, Appointment, Notification, Blockout } from '../types';

export const INITIAL_BUSINESS: Business = {
  id: 'biz-1',
  name: 'Barbearia Central & Estilo',
  slug: 'barbearia-central',
  category: 'barbearia',
  phone: '(11) 98765-4321',
  whatsapp: '11987654321',
  address: 'Rua das Flores, 142 - Centro',
  city: 'São Paulo',
  state: 'SP',
  timezone: 'America/Sao_Paulo',
  banner_color: '#0ea5e9',
  created_at: new Date().toISOString(),
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    business_id: 'biz-1',
    name: 'Corte Tradicional',
    description: 'Corte de cabelo com máquina e tesoura, acabamento na navalha e lavagem.',
    price: 45.0,
    duration_minutes: 30,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    business_id: 'biz-1',
    name: 'Barba Terapia Completa',
    description: 'Desenho e alinhamento de barba com toalha quente, óleos essenciais e balm.',
    price: 35.0,
    duration_minutes: 30,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    business_id: 'biz-1',
    name: 'Combo: Corte + Barba',
    description: 'O pacote completo para renovar o visual com direito a tratamento facial.',
    price: 70.0,
    duration_minutes: 60,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-4',
    business_id: 'biz-1',
    name: 'Acabamento / Pezinho',
    description: 'Manutenção do contorno e nuca.',
    price: 20.0,
    duration_minutes: 15,
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'pro-1',
    business_id: 'biz-1',
    name: 'Carlos Oliveira (Mestre)',
    phone: '(11) 98888-1111',
    service_ids: ['srv-1', 'srv-2', 'srv-3', 'srv-4'],
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pro-2',
    business_id: 'biz-1',
    name: 'Lucas Barbeiro',
    phone: '(11) 97777-2222',
    service_ids: ['srv-1', 'srv-2', 'srv-3'],
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_WORKING_HOURS: WorkingHour[] = [
  // 0 = Domingo (Fechado)
  { id: 'wh-0', business_id: 'biz-1', day_of_week: 0, start_time: '09:00', end_time: '14:00', is_active: false },
  // Segunda a Sexta: 09:00 às 19:00 com almoço 12:00 às 13:00
  { id: 'wh-1', business_id: 'biz-1', day_of_week: 1, start_time: '09:00', end_time: '19:00', break_start: '12:00', break_end: '13:00', is_active: true },
  { id: 'wh-2', business_id: 'biz-1', day_of_week: 2, start_time: '09:00', end_time: '19:00', break_start: '12:00', break_end: '13:00', is_active: true },
  { id: 'wh-3', business_id: 'biz-1', day_of_week: 3, start_time: '09:00', end_time: '19:00', break_start: '12:00', break_end: '13:00', is_active: true },
  { id: 'wh-4', business_id: 'biz-1', day_of_week: 4, start_time: '09:00', end_time: '19:00', break_start: '12:00', break_end: '13:00', is_active: true },
  { id: 'wh-5', business_id: 'biz-1', day_of_week: 5, start_time: '09:00', end_time: '19:00', break_start: '12:00', break_end: '13:00', is_active: true },
  // Sábado: 08:30 às 17:00 sem intervalo longo
  { id: 'wh-6', business_id: 'biz-1', day_of_week: 6, start_time: '08:30', end_time: '17:00', is_active: true },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    business_id: 'biz-1',
    name: 'Matheus Silva',
    phone: '11999990001',
    email: 'matheus@email.com',
    internal_notes: 'Prefere corte baixo nas laterais (disfarce na zero).',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cli-2',
    business_id: 'biz-1',
    name: 'Rodrigo Fernandes',
    phone: '11999990002',
    email: 'rodrigo@email.com',
    internal_notes: 'Cliente antigo, pontual.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cli-3',
    business_id: 'biz-1',
    name: 'Gabriel Costa',
    phone: '11999990003',
    email: '',
    internal_notes: '',
    created_at: new Date().toISOString(),
  },
];

// Helper para gerar agendamento hoje e amanhã para demonstração
const today = new Date();
const todayStr = today.toISOString().slice(0, 10);

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    business_id: 'biz-1',
    code: 'AGX-7281',
    service_id: 'srv-1',
    service_name: 'Corte Tradicional',
    service_price: 45.0,
    service_duration: 30,
    professional_id: 'pro-1',
    professional_name: 'Carlos Oliveira (Mestre)',
    client_id: 'cli-1',
    client_name: 'Matheus Silva',
    client_phone: '11999990001',
    client_email: 'matheus@email.com',
    start_time: `${todayStr}T10:00:00`,
    end_time: `${todayStr}T10:30:00`,
    status: 'confirmed',
    notes: 'Cliente confirmou presença',
    created_at: new Date().toISOString(),
  },
  {
    id: 'app-2',
    business_id: 'biz-1',
    code: 'AGX-9943',
    service_id: 'srv-3',
    service_name: 'Combo: Corte + Barba',
    service_price: 70.0,
    service_duration: 60,
    professional_id: 'pro-2',
    professional_name: 'Lucas Barbeiro',
    client_id: 'cli-2',
    client_name: 'Rodrigo Fernandes',
    client_phone: '11999990002',
    client_email: 'rodrigo@email.com',
    start_time: `${todayStr}T14:30:00`,
    end_time: `${todayStr}T15:30:00`,
    status: 'confirmed',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    business_id: 'biz-1',
    appointment_id: 'app-1',
    title: 'Nova reserva online',
    message: 'Matheus Silva agendou Corte Tradicional com Carlos Oliveira',
    read: false,
    client_name: 'Matheus Silva',
    service_name: 'Corte Tradicional',
    professional_name: 'Carlos Oliveira (Mestre)',
    appointment_time: `${todayStr}T10:00:00`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    business_id: 'biz-1',
    appointment_id: 'app-2',
    title: 'Nova reserva online',
    message: 'Rodrigo Fernandes agendou Combo: Corte + Barba com Lucas Barbeiro',
    read: false,
    client_name: 'Rodrigo Fernandes',
    service_name: 'Combo: Corte + Barba',
    professional_name: 'Lucas Barbeiro',
    appointment_time: `${todayStr}T14:30:00`,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_BLOCKOUTS: Blockout[] = [];
