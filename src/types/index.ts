export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: 'barbearia' | 'salao' | 'clinica' | 'petshop' | 'personal' | 'tatuagem' | 'dentista' | 'massoterapia' | 'outro';
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  timezone: string; // 'America/Sao_Paulo'
  logo_url?: string;
  banner_color?: string;
  created_at: string;
  owner_id?: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number; // Em reais (R$)
  duration_minutes: number;
  active: boolean;
  created_at: string;
}

export interface WorkingHour {
  id: string;
  business_id: string;
  professional_id?: string; // se undefined, é o horário geral do estabelecimento
  day_of_week: DayOfWeek;
  start_time: string; // "09:00"
  end_time: string; // "19:00"
  break_start?: string; // "12:00"
  break_end?: string; // "13:00"
  is_active: boolean;
}

export interface Professional {
  id: string;
  business_id: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  service_ids: string[];
  active: boolean;
  working_hours?: WorkingHour[];
  created_at: string;
}

export interface Blockout {
  id: string;
  business_id: string;
  professional_id?: string; // se null/undefined, bloqueia todo o estabelecimento
  start_datetime: string; // ISO 8601
  end_datetime: string; // ISO 8601
  reason: string;
  created_at: string;
}

export interface Client {
  id: string;
  business_id: string;
  name: string;
  phone: string; // Telefone normalizado com DDD
  email?: string;
  internal_notes?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  code: string; // ex: AGX-7482
  service_id: string;
  service_name: string; // snapshot do nome no momento da reserva
  service_price: number; // snapshot do preço contratado
  service_duration: number; // snapshot dos minutos contratados
  professional_id: string;
  professional_name: string; // snapshot do profissional
  client_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  start_time: string; // ISO 8601 ex: 2026-10-09T14:30:00-03:00
  end_time: string; // ISO 8601
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  business_id: string;
  appointment_id?: string;
  title: string;
  message: string;
  read: boolean;
  client_name: string;
  service_name: string;
  professional_name: string;
  appointment_time: string;
  created_at: string;
}

export interface TimeSlot {
  time: string; // "09:00"
  datetime: string; // ISO string completa
  available: boolean;
  reason?: string;
}
