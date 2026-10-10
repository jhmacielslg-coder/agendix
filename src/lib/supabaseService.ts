import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Business,
  Service,
  Professional,
  WorkingHour,
  Blockout,
  Client,
  Appointment,
  Notification,
  AppointmentStatus,
} from '../types';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==========================================
// ESTABELECIMENTOS (BUSINESSES)
// ==========================================

export async function fetchBusinessByOwner(ownerId: string): Promise<Business | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar estabelecimento por proprietário:', error);
    return null;
  }
  return data;
}

export async function fetchBusinessBySlug(slug: string): Promise<Business | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar estabelecimento por slug:', error);
    return null;
  }
  return data;
}

export async function upsertBusiness(business: Partial<Business> & { id?: string }): Promise<Business | null> {
  if (!isSupabaseConfigured) return null;
  const payload = {
    ...business,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('businesses')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar estabelecimento:', error);
    throw error;
  }
  return data;
}

// ==========================================
// SERVIÇOS (SERVICES)
// ==========================================

export async function fetchServices(businessId: string, onlyActive = false): Promise<Service[]> {
  if (!isSupabaseConfigured) return [];
  let query = supabase.from('services').select('*').eq('business_id', businessId);
  if (onlyActive) {
    query = query.eq('active', true);
  }
  const { data, error } = await query.order('name');
  if (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }
  return data || [];
}

export async function insertService(service: Omit<Service, 'id' | 'created_at'> & { id?: string }): Promise<Service> {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado');
  const newService = {
    ...service,
    id: service.id || generateUUID(),
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('services')
    .insert(newService)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar serviço:', error);
    throw error;
  }
  return data;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw error;
  }
}

// ==========================================
// PROFISSIONAIS (PROFESSIONALS)
// ==========================================

export async function fetchProfessionals(businessId: string, onlyActive = false): Promise<Professional[]> {
  if (!isSupabaseConfigured) return [];
  let query = supabase.from('professionals').select('*').eq('business_id', businessId);
  if (onlyActive) {
    query = query.eq('active', true);
  }
  const { data, error } = await query.order('name');
  if (error) {
    console.error('Erro ao buscar profissionais:', error);
    return [];
  }
  return (data || []).map((p: any) => ({
    ...p,
    service_ids: Array.isArray(p.service_ids) ? p.service_ids : [],
  }));
}

export async function insertProfessional(
  pro: Omit<Professional, 'id' | 'created_at'> & { id?: string }
): Promise<Professional> {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado');
  const newPro = {
    ...pro,
    id: pro.id || generateUUID(),
    service_ids: pro.service_ids || [],
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('professionals')
    .insert(newPro)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar profissional:', error);
    throw error;
  }
  return {
    ...data,
    service_ids: Array.isArray(data.service_ids) ? data.service_ids : [],
  };
}

export async function updateProfessional(id: string, updates: Partial<Professional>): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('professionals')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar profissional:', error);
    throw error;
  }
}

// ==========================================
// HORÁRIOS DE TRABALHO (WORKING HOURS)
// ==========================================

export async function fetchWorkingHours(businessId: string): Promise<WorkingHour[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('working_hours')
    .select('*')
    .eq('business_id', businessId)
    .order('day_of_week');

  if (error) {
    console.error('Erro ao buscar horários de trabalho:', error);
    return [];
  }
  return data || [];
}

export async function syncWorkingHours(businessId: string, hours: WorkingHour[]): Promise<void> {
  if (!isSupabaseConfigured) return;
  // Remove horários anteriores do estabelecimento para substituir
  await supabase.from('working_hours').delete().eq('business_id', businessId);

  const formattedHours = hours.map((h) => ({
    id: h.id?.includes('-') && h.id.length === 36 ? h.id : generateUUID(),
    business_id: businessId,
    professional_id: h.professional_id || null,
    day_of_week: h.day_of_week,
    start_time: h.start_time,
    end_time: h.end_time,
    break_start: h.break_start || null,
    break_end: h.break_end || null,
    is_active: h.is_active,
  }));

  const { error } = await supabase.from('working_hours').insert(formattedHours);
  if (error) {
    console.error('Erro ao sincronizar horários de trabalho:', error);
  }
}

// ==========================================
// BLOQUEIOS (BLOCKOUTS)
// ==========================================

export async function fetchBlockouts(businessId: string): Promise<Blockout[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('blockouts')
    .select('*')
    .eq('business_id', businessId)
    .order('start_datetime');

  if (error) {
    console.error('Erro ao buscar bloqueios:', error);
    return [];
  }
  return data || [];
}

export async function insertBlockout(block: Omit<Blockout, 'id' | 'created_at'>): Promise<Blockout> {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado');
  const newBlock = {
    ...block,
    id: generateUUID(),
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('blockouts')
    .insert(newBlock)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar bloqueio:', error);
    throw error;
  }
  return data;
}

export async function deleteBlockout(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('blockouts').delete().eq('id', id);
  if (error) {
    console.error('Erro ao remover bloqueio:', error);
    throw error;
  }
}

// ==========================================
// CLIENTES (CLIENTS)
// ==========================================

export async function fetchClients(businessId: string): Promise<Client[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', businessId)
    .order('name');

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
  return data || [];
}

export async function upsertClient(client: Omit<Client, 'id' | 'created_at'> & { id?: string }): Promise<Client> {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado');
  const payload = {
    ...client,
    id: client.id || generateUUID(),
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('clients')
    .upsert(payload, { onConflict: 'business_id,phone' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao registrar cliente:', error);
    throw error;
  }
  return data;
}

// ==========================================
// AGENDAMENTOS (APPOINTMENTS)
// ==========================================

export async function fetchAppointments(businessId: string): Promise<Appointment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('business_id', businessId)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }
  return data || [];
}

export async function insertAppointment(
  appointment: Omit<Appointment, 'id' | 'created_at'> & { id?: string }
): Promise<Appointment> {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado');
  const payload = {
    ...appointment,
    id: appointment.id || generateUUID(),
    client_id: appointment.client_id || null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir agendamento:', error);
    throw error;
  }
  return data;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    throw error;
  }
}

export async function rescheduleAppointment(id: string, startTime: string, endTime: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('appointments')
    .update({ start_time: startTime, end_time: endTime, status: 'confirmed' })
    .eq('id', id);

  if (error) {
    console.error('Erro ao reagendar atendimento:', error);
    throw error;
  }
}

// ==========================================
// NOTIFICAÇÕES (NOTIFICATIONS)
// ==========================================

export async function fetchNotifications(businessId: string): Promise<Notification[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
  return data || [];
}

export async function insertNotification(
  notification: Omit<Notification, 'id' | 'created_at'>
): Promise<Notification> {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado');
  const payload = {
    ...notification,
    id: generateUUID(),
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
  return data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
}

export async function markAllNotificationsAsRead(businessId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('business_id', businessId);

  if (error) {
    console.error('Erro ao marcar todas notificações como lidas:', error);
  }
}

// ==========================================
// UPLOAD DE IMAGENS (SUPABASE STORAGE)
// ==========================================

export async function uploadImage(file: File, folder: 'logos' | 'services' | 'professionals'): Promise<string> {
  if (!isSupabaseConfigured) {
    // Fallback: Converte para Data URL base64 se offline/sem conexão
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
  const fileExt = cleanName.split('.').pop() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('agendix-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('agendix-media')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

