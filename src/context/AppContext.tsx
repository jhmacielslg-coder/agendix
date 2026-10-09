import React, { createContext, useContext, useState, useEffect } from 'react';
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
  completeOnboarding: (bizData: Partial<Business>, firstService: Partial<Service>, firstProfessional: Partial<Professional>) => void;

  // Data
  business: Business;
  updateBusiness: (data: Partial<Business>) => void;
  
  services: Service[];
  addService: (service: Omit<Service, 'id' | 'business_id' | 'created_at'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;

  professionals: Professional[];
  addProfessional: (pro: Omit<Professional, 'id' | 'business_id' | 'created_at'>) => void;
  updateProfessional: (id: string, pro: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;

  workingHours: WorkingHour[];
  updateWorkingHours: (hours: WorkingHour[]) => void;

  blockouts: Blockout[];
  addBlockout: (block: Omit<Blockout, 'id' | 'business_id' | 'created_at'>) => void;
  deleteBlockout: (id: string) => void;

  clients: Client[];
  addOrUpdateClient: (name: string, phone: string, email?: string, notes?: string) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;

  appointments: Appointment[];
  createAppointment: (data: {
    service_id: string;
    professional_id: string;
    client_name: string;
    client_phone: string;
    client_email?: string;
    start_time: string;
    notes?: string;
  }) => { success: boolean; appointment?: Appointment; error?: string };
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (id: string, newStartTime: string) => { success: boolean; error?: string };

  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Reset / Demo
  resetToDemoData: () => void;
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
    return saved ? JSON.parse(saved) : { id: 'usr-1', email: 'contato@barbeariacentral.com.br', name: 'Carlos Dono' };
  });

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    return saved ? JSON.parse(saved) : true;
  });

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

  // Salvar estados no localStorage para persistência imediata
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
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
  const login = async (email: string, _pass: string) => {
    setUser({ id: 'usr-1', email, name: email.split('@')[0] });
    return true;
  };

  const signup = async (email: string, _pass: string, name: string) => {
    setUser({ id: 'usr-' + Date.now(), email, name });
    setIsOnboardingCompleted(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const completeOnboarding = (
    bizData: Partial<Business>,
    firstService: Partial<Service>,
    firstProfessional: Partial<Professional>
  ) => {
    const newBiz: Business = {
      ...business,
      ...bizData,
      id: 'biz-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setBusiness(newBiz);

    const srvId = 'srv-' + Date.now();
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

    const proId = 'pro-' + Date.now();
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
  };

  const updateBusiness = (data: Partial<Business>) => {
    setBusiness((prev) => ({ ...prev, ...data }));
  };

  // Gerenciamento de Serviços
  const addService = (srv: Omit<Service, 'id' | 'business_id' | 'created_at'>) => {
    const newService: Service = {
      ...srv,
      id: 'srv-' + Date.now(),
      business_id: business.id,
      created_at: new Date().toISOString(),
    };
    setServices((prev) => [...prev, newService]);
  };

  const updateService = (id: string, srv: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...srv } : s)));
  };

  const deleteService = (id: string) => {
    // Desativar logicamente para preservar integridade histórica
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: false } : s)));
  };

  // Gerenciamento de Profissionais
  const addProfessional = (pro: Omit<Professional, 'id' | 'business_id' | 'created_at'>) => {
    const newPro: Professional = {
      ...pro,
      id: 'pro-' + Date.now(),
      business_id: business.id,
      created_at: new Date().toISOString(),
    };
    setProfessionals((prev) => [...prev, newPro]);
  };

  const updateProfessional = (id: string, pro: Partial<Professional>) => {
    setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, ...pro } : p)));
  };

  const deleteProfessional = (id: string) => {
    setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)));
  };

  const updateWorkingHours = (hours: WorkingHour[]) => {
    setWorkingHours(hours);
  };

  const addBlockout = (block: Omit<Blockout, 'id' | 'business_id' | 'created_at'>) => {
    const newBlock: Blockout = {
      ...block,
      id: 'blk-' + Date.now(),
      business_id: business.id,
      created_at: new Date().toISOString(),
    };
    setBlockouts((prev) => [...prev, newBlock]);
  };

  const deleteBlockout = (id: string) => {
    setBlockouts((prev) => prev.filter((b) => b.id !== id));
  };

  // Clientes com isolamento e normalização de telefone
  const addOrUpdateClient = (name: string, phone: string, email?: string, notes?: string): Client => {
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
      return updated;
    }

    const newClient: Client = {
      id: 'cli-' + Date.now(),
      business_id: business.id,
      name: name.trim(),
      phone: normalized,
      email: email?.trim() || '',
      internal_notes: notes?.trim() || '',
      created_at: new Date().toISOString(),
    };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  // Criar Agendamento com Concorrência e Snapshots
  const createAppointment = (data: {
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
    const client = addOrUpdateClient(data.client_name, data.client_phone, data.client_email);

    const newApp: Appointment = {
      id: 'app-' + Date.now(),
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
      id: 'notif-' + Date.now(),
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

    return { success: true, appointment: newApp };
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const rescheduleAppointment = (id: string, newStartTime: string) => {
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

    return { success: true };
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
