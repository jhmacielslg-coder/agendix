import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Business,
  Service,
  Professional,
  WorkingHour,
  Client,
  Appointment,
  Notification,
  Blockout,
  AppointmentStatus,
} from '../types';
import {
  INITIAL_BUSINESS,
  INITIAL_SERVICES,
  INITIAL_PROFESSIONALS,
  INITIAL_WORKING_HOURS,
  INITIAL_CLIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_BLOCKOUTS,
} from '../lib/mockData';
import { cleanPhone, generateAppointmentCode } from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import * as db from '../lib/supabaseService';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AppContextType {
  // Auth
  user: AuthUser | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
  isOnboardingCompleted: boolean;
  completeOnboarding: (
    bizData: Partial<Business>,
    firstService: Partial<Service>,
    firstProfessional: Partial<Professional>
  ) => Promise<void>;

  // Data
  business: Business;
  updateBusiness: (data: Partial<Business>) => Promise<void>;

  services: Service[];
  addService: (service: Omit<Service, 'id' | 'business_id' | 'created_at'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  professionals: Professional[];
  addProfessional: (pro: Omit<Professional, 'id' | 'business_id' | 'created_at'>) => Promise<void>;
  updateProfessional: (id: string, pro: Partial<Professional>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;

  workingHours: WorkingHour[];
  updateWorkingHours: (hours: WorkingHour[]) => Promise<void>;

  blockouts: Blockout[];
  addBlockout: (block: Omit<Blockout, 'id' | 'business_id' | 'created_at'>) => Promise<void>;
  deleteBlockout: (id: string) => Promise<void>;

  clients: Client[];
  addOrUpdateClient: (name: string, phone: string, email?: string, notes?: string) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;

  appointments: Appointment[];
  createAppointment: (data: {
    service_id: string;
    professional_id: string;
    client_name: string;
    client_phone: string;
    client_email?: string;
    start_time: string;
    notes?: string;
  }) => Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  rescheduleAppointment: (id: string, newStartTime: string) => Promise<{ success: boolean; error?: string }>;

  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // Reset / Demo
  resetToDemoData: () => void;
  isLoadingData: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'agendix_user',
  BUSINESS: 'agendix_business',
  SERVICES: 'agendix_services',
  PROFESSIONALS: 'agendix_professionals',
  WORKING_HOURS: 'agendix_working_hours',
  CLIENTS: 'agendix_clients',
  APPOINTMENTS: 'agendix_appointments',
  NOTIFICATIONS: 'agendix_notifications',
  BLOCKOUTS: 'agendix_blockouts',
  ONBOARDING: 'agendix_onboarding_done',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed || parsed.id === 'usr-1' || parsed.email === 'contato@barbeariacentral.com.br') {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  });

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!savedUser) return false;
    const saved = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const [business, setBusiness] = useState<Business>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUSINESS);
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
    return saved ? JSON.parse(saved) : INITIAL_PROFESSIONALS;
  });

  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKING_HOURS);
    return saved ? JSON.parse(saved) : INITIAL_WORKING_HOURS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [blockouts, setBlockouts] = useState<Blockout[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BLOCKOUTS);
    return saved ? JSON.parse(saved) : INITIAL_BLOCKOUTS;
  });

  // Carregar dados de um estabelecimento a partir do Supabase
  const loadBusinessData = useCallback(async (bizId: string) => {
    if (!isSupabaseConfigured) return;
    setIsLoadingData(true);
    try {
      const [
        fetchedServices,
        fetchedPros,
        fetchedHours,
        fetchedBlockouts,
        fetchedClients,
        fetchedAppointments,
        fetchedNotifications,
      ] = await Promise.all([
        db.fetchServices(bizId),
        db.fetchProfessionals(bizId),
        db.fetchWorkingHours(bizId),
        db.fetchBlockouts(bizId),
        db.fetchClients(bizId),
        db.fetchAppointments(bizId),
        db.fetchNotifications(bizId),
      ]);

      if (fetchedServices.length > 0) setServices(fetchedServices);
      if (fetchedPros.length > 0) setProfessionals(fetchedPros);
      if (fetchedHours.length > 0) setWorkingHours(fetchedHours);
      setBlockouts(fetchedBlockouts);
      setClients(fetchedClients);
      setAppointments(fetchedAppointments);
      setNotifications(fetchedNotifications);
    } catch (err) {
      console.error('Erro ao carregar dados do Supabase:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // 1. Ouvinte de Sessão do Supabase Auth
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
        };
        setUser(authUser);
      }
    });

    // Escutar alterações de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
        };
        setUser(authUser);
      } else if (!localStorage.getItem(STORAGE_KEYS.USER)?.includes('usr-')) {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Quando o usuário estiver logado, carregar seu estabelecimento no Supabase
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    // Se for usuário mock de demonstração, não busca no Supabase
    if (user.id.startsWith('usr-')) return;

    const fetchOwnerBusiness = async () => {
      setIsLoadingData(true);
      try {
        const biz = await db.fetchBusinessByOwner(user.id);
        if (biz) {
          setBusiness(biz);
          setIsOnboardingCompleted(true);
          await loadBusinessData(biz.id);
        } else {
          setIsOnboardingCompleted(false);
        }
      } catch (err) {
        console.error('Erro ao buscar estabelecimento do usuário:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchOwnerBusiness();
  }, [user, loadBusinessData]);

  // 3. Suporte para Página Pública (/agendar/:slug): Carrega dados pelo slug no Supabase
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/agendar/')) {
      const slug = path.replace('/agendar/', '').trim();
      if (slug && isSupabaseConfigured) {
        db.fetchBusinessBySlug(slug).then((biz) => {
          if (biz) {
            setBusiness(biz);
            loadBusinessData(biz.id);
          }
        });
      }
    }
  }, [loadBusinessData]);

  // Persistência local como backup / cache
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(isOnboardingCompleted));
  }, [isOnboardingCompleted]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(business));
  }, [business]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(professionals));
  }, [professionals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKING_HOURS, JSON.stringify(workingHours));
  }, [workingHours]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOCKOUTS, JSON.stringify(blockouts));
  }, [blockouts]);

  // Funções de Autenticação
  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || email.split('@')[0],
        });
        return true;
      }
    }
    // Fallback demo local
    setUser({ id: 'usr-' + Date.now(), email, name: email.split('@')[0] });
    return true;
  };

  const signup = async (email: string, pass: string, name: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name } },
      });
      if (error) throw error;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || email, name });
        setIsOnboardingCompleted(false);
        return true;
      }
    }
    // Fallback demo local
    setUser({ id: 'usr-' + Date.now(), email, name });
    setIsOnboardingCompleted(false);
    return true;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
    setUser(null);
    setIsOnboardingCompleted(false);
  };

  const completeOnboarding = async (
    bizData: Partial<Business>,
    firstService: Partial<Service>,
    firstProfessional: Partial<Professional>
  ) => {
    const bizId = db.generateUUID();
    const newBiz: Business = {
      ...business,
      ...bizData,
      id: bizId,
      owner_id: user?.id,
      created_at: new Date().toISOString(),
    };
    setBusiness(newBiz);

    const srvId = db.generateUUID();
    const newSrv: Service = {
      id: srvId,
      business_id: newBiz.id,
      name: firstService.name || 'Atendimento Principal',
      description: firstService.description || '',
      price: firstService.price || 50,
      duration_minutes: firstService.duration_minutes || 30,
      active: true,
      created_at: new Date().toISOString(),
    };
    setServices([newSrv]);

    const proId = db.generateUUID();
    const newPro: Professional = {
      id: proId,
      business_id: newBiz.id,
      name: firstProfessional.name || user?.name || 'Profissional',
      phone: firstProfessional.phone || newBiz.phone,
      service_ids: [srvId],
      active: true,
      created_at: new Date().toISOString(),
    };
    setProfessionals([newPro]);

    setIsOnboardingCompleted(true);

    if (isSupabaseConfigured && user) {
      try {
        await db.upsertBusiness(newBiz);
        await db.insertService(newSrv);
        await db.insertProfessional(newPro);
      } catch (err) {
        console.error('Erro ao persistir onboarding no Supabase:', err);
      }
    }
  };

  const updateBusiness = async (data: Partial<Business>) => {
    const updated = { ...business, ...data };
    setBusiness(updated);
    if (isSupabaseConfigured) {
      try {
        await db.upsertBusiness(updated);
      } catch (err) {
        console.error('Erro ao atualizar dados do estabelecimento no Supabase:', err);
      }
    }
  };

  // Gerenciamento de Serviços
  const addService = async (srv: Omit<Service, 'id' | 'business_id' | 'created_at'>) => {
    const newService: Service = {
      ...srv,
      id: db.generateUUID(),
      business_id: business.id,
      created_at: new Date().toISOString(),
    };
    setServices((prev) => [...prev, newService]);

    if (isSupabaseConfigured) {
      try {
        const saved = await db.insertService(newService);
        setServices((prev) => prev.map((s) => (s.id === newService.id ? saved : s)));
      } catch (err) {
        console.error('Erro ao salvar serviço no Supabase:', err);
      }
    }
  };

  const updateService = async (id: string, srv: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...srv } : s)));
    if (isSupabaseConfigured) {
      try {
        await db.updateService(id, srv);
      } catch (err) {
        console.error('Erro ao atualizar serviço no Supabase:', err);
      }
    }
  };

  const deleteService = async (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: false } : s)));
    if (isSupabaseConfigured) {
      try {
        await db.updateService(id, { active: false });
      } catch (err) {
        console.error('Erro ao desativar serviço no Supabase:', err);
      }
    }
  };

  // Gerenciamento de Profissionais
  const addProfessional = async (pro: Omit<Professional, 'id' | 'business_id' | 'created_at'>) => {
    const newPro: Professional = {
      ...pro,
      id: db.generateUUID(),
      business_id: business.id,
      created_at: new Date().toISOString(),
    };
    setProfessionals((prev) => [...prev, newPro]);

    if (isSupabaseConfigured) {
      try {
        const saved = await db.insertProfessional(newPro);
        setProfessionals((prev) => prev.map((p) => (p.id === newPro.id ? saved : p)));
      } catch (err) {
        console.error('Erro ao salvar profissional no Supabase:', err);
      }
    }
  };

  const updateProfessional = async (id: string, pro: Partial<Professional>) => {
    setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, ...pro } : p)));
    if (isSupabaseConfigured) {
      try {
        await db.updateProfessional(id, pro);
      } catch (err) {
        console.error('Erro ao atualizar profissional no Supabase:', err);
      }
    }
  };

  const deleteProfessional = async (id: string) => {
    setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)));
    if (isSupabaseConfigured) {
      try {
        await db.updateProfessional(id, { active: false });
      } catch (err) {
        console.error('Erro ao desativar profissional no Supabase:', err);
      }
    }
  };

  const updateWorkingHours = async (hours: WorkingHour[]) => {
    setWorkingHours(hours);
    if (isSupabaseConfigured) {
      try {
        await db.syncWorkingHours(business.id, hours);
      } catch (err) {
        console.error('Erro ao sincronizar horários no Supabase:', err);
      }
    }
  };

  const addBlockout = async (block: Omit<Blockout, 'id' | 'business_id' | 'created_at'>) => {
    const newBlock: Blockout = {
      ...block,
      id: db.generateUUID(),
      business_id: business.id,
      created_at: new Date().toISOString(),
    };
    setBlockouts((prev) => [...prev, newBlock]);

    if (isSupabaseConfigured) {
      try {
        const saved = await db.insertBlockout(newBlock);
        setBlockouts((prev) => prev.map((b) => (b.id === newBlock.id ? saved : b)));
      } catch (err) {
        console.error('Erro ao salvar bloqueio no Supabase:', err);
      }
    }
  };

  const deleteBlockout = async (id: string) => {
    setBlockouts((prev) => prev.filter((b) => b.id !== id));
    if (isSupabaseConfigured) {
      try {
        await db.deleteBlockout(id);
      } catch (err) {
        console.error('Erro ao excluir bloqueio no Supabase:', err);
      }
    }
  };

  // Clientes
  const addOrUpdateClient = async (name: string, phone: string, email?: string, notes?: string): Promise<Client> => {
    const normalized = cleanPhone(phone);
    const existing = clients.find((c) => c.business_id === business.id && cleanPhone(c.phone) === normalized);
    if (existing) {
      const updated = {
        ...existing,
        name: name.trim() || existing.name,
        email: email !== undefined ? email : existing.email,
        internal_notes: notes !== undefined ? notes : existing.internal_notes,
      };
      setClients((prev) => prev.map((c) => (c.id === existing.id ? updated : c)));

      if (isSupabaseConfigured) {
        db.upsertClient(updated).catch((err) => console.error('Erro ao atualizar cliente no Supabase:', err));
      }
      return updated;
    }

    const newClient: Client = {
      id: db.generateUUID(),
      business_id: business.id,
      name: name.trim(),
      phone: normalized,
      email: email?.trim() || '',
      internal_notes: notes?.trim() || '',
      created_at: new Date().toISOString(),
    };
    setClients((prev) => [...prev, newClient]);

    if (isSupabaseConfigured) {
      try {
        const saved = await db.upsertClient(newClient);
        setClients((prev) => prev.map((c) => (c.id === newClient.id ? saved : c)));
        return saved;
      } catch (err) {
        console.error('Erro ao salvar cliente no Supabase:', err);
      }
    }
    return newClient;
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    const target = clients.find((c) => c.id === id);
    if (isSupabaseConfigured && target) {
      db.upsertClient({ ...target, ...data }).catch((err) =>
        console.error('Erro ao atualizar cliente no Supabase:', err)
      );
    }
  };

  // Criar Agendamento com Concorrência e Snapshots
  const createAppointment = async (data: {
    service_id: string;
    professional_id: string;
    client_name: string;
    client_phone: string;
    client_email?: string;
    start_time: string;
    notes?: string;
  }) => {
    const srv = services.find((s) => s.id === data.service_id);
    const pro = professionals.find((p) => p.id === data.professional_id);

    if (!srv || !pro) {
      return { success: false, error: 'Serviço ou profissional não encontrado.' };
    }

    const startObj = new Date(data.start_time);
    const endObj = new Date(startObj.getTime() + srv.duration_minutes * 60000);
    const sStart = startObj.getTime();
    const sEnd = endObj.getTime();

    // Verificação de concorrência e sobreposição no profissional
    const hasConflict = appointments.some((app) => {
      if (app.status === 'cancelled') return false;
      if (app.professional_id !== data.professional_id) return false;
      const aStart = new Date(app.start_time).getTime();
      const aEnd = new Date(app.end_time).getTime();
      return sStart < aEnd && sEnd > aStart;
    });

    if (hasConflict) {
      return {
        success: false,
        error: 'Este horário acabou de ser reservado para este profissional. Por favor, escolha outro horário.',
      };
    }

    // Registrar ou recuperar cliente no estabelecimento
    const client = await addOrUpdateClient(data.client_name, data.client_phone, data.client_email);

    const appId = db.generateUUID();
    const newApp: Appointment = {
      id: appId,
      business_id: business.id,
      code: generateAppointmentCode(),
      service_id: srv.id,
      service_name: srv.name,
      service_price: srv.price,
      service_duration: srv.duration_minutes,
      professional_id: pro.id,
      professional_name: pro.name,
      client_id: client.id,
      client_name: client.name,
      client_phone: client.phone,
      client_email: client.email,
      start_time: data.start_time,
      end_time: endObj.toISOString(),
      status: 'confirmed',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    };

    setAppointments((prev) => [newApp, ...prev]);

    // Criar Notificação no Painel
    const newNotif: Notification = {
      id: db.generateUUID(),
      business_id: business.id,
      appointment_id: newApp.id,
      title: 'Nova reserva confirmada',
      message: `${client.name} agendou ${srv.name} com ${pro.name}`,
      read: false,
      client_name: client.name,
      service_name: srv.name,
      professional_name: pro.name,
      appointment_time: data.start_time,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (isSupabaseConfigured) {
      try {
        const savedApp = await db.insertAppointment(newApp);
        setAppointments((prev) => prev.map((a) => (a.id === newApp.id ? savedApp : a)));
        await db.insertNotification(newNotif);
      } catch (err: any) {
        console.error('Erro ao persistir agendamento no Supabase:', err);
        if (err.message && err.message.includes('Conflito de horário')) {
          setAppointments((prev) => prev.filter((a) => a.id !== newApp.id));
          return {
            success: false,
            error: 'Conflito de horário detectado: este profissional já possui atendimento neste período.',
          };
        }
      }
    }

    return { success: true, appointment: newApp };
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (isSupabaseConfigured) {
      try {
        await db.updateAppointmentStatus(id, status);
      } catch (err) {
        console.error('Erro ao atualizar status do agendamento no Supabase:', err);
      }
    }
  };

  const rescheduleAppointment = async (id: string, newStartTime: string) => {
    const existing = appointments.find((a) => a.id === id);
    if (!existing) return { success: false, error: 'Agendamento não encontrado.' };

    const startObj = new Date(newStartTime);
    const endObj = new Date(startObj.getTime() + existing.service_duration * 60000);
    const sStart = startObj.getTime();
    const sEnd = endObj.getTime();

    const conflict = appointments.some((app) => {
      if (app.id === id || app.status === 'cancelled') return false;
      if (app.professional_id !== existing.professional_id) return false;
      const aStart = new Date(app.start_time).getTime();
      const aEnd = new Date(app.end_time).getTime();
      return sStart < aEnd && sEnd > aStart;
    });

    if (conflict) {
      return { success: false, error: 'Horário indisponível para este profissional.' };
    }

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              start_time: newStartTime,
              end_time: endObj.toISOString(),
              status: 'confirmed',
            }
          : a
      )
    );

    if (isSupabaseConfigured) {
      try {
        await db.rescheduleAppointment(id, newStartTime, endObj.toISOString());
      } catch (err) {
        console.error('Erro ao reagendar no Supabase:', err);
      }
    }

    return { success: true };
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (isSupabaseConfigured) {
      try {
        await db.markNotificationAsRead(id);
      } catch (err) {
        console.error('Erro ao marcar notificação no Supabase:', err);
      }
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (isSupabaseConfigured) {
      try {
        await db.markAllNotificationsAsRead(business.id);
      } catch (err) {
        console.error('Erro ao marcar todas notificações no Supabase:', err);
      }
    }
  };

  const resetToDemoData = () => {
    setBusiness(INITIAL_BUSINESS);
    setServices(INITIAL_SERVICES);
    setProfessionals(INITIAL_PROFESSIONALS);
    setWorkingHours(INITIAL_WORKING_HOURS);
    setClients(INITIAL_CLIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setBlockouts(INITIAL_BLOCKOUTS);
    setIsOnboardingCompleted(true);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isOnboardingCompleted,
        completeOnboarding,
        business,
        updateBusiness,
        services,
        addService,
        updateService,
        deleteService,
        professionals,
        addProfessional,
        updateProfessional,
        deleteProfessional,
        workingHours,
        updateWorkingHours,
        blockouts,
        addBlockout,
        deleteBlockout,
        clients,
        addOrUpdateClient,
        updateClient,
        appointments,
        createAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDemoData,
        isLoadingData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
