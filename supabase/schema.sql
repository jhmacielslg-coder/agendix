-- =============================================================================
-- AGENDIX - SCHEMA SUPABASE PRODUÇÃO COM RLS E PERFORMANCE BLINDADA
-- =============================================================================

-- 0. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. CRIAÇÃO DAS TABELAS
-- =============================================================================

-- 1.1 Estabelecimentos (Businesses)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'barbearia',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'São Paulo',
  state TEXT NOT NULL DEFAULT 'SP',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  logo_url TEXT,
  banner_color TEXT DEFAULT '#0ea5e9',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Serviços (Services)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Profissionais (Professionals)
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  service_ids UUID[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Horários de Trabalho (Working Hours)
CREATE TABLE IF NOT EXISTS public.working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 1.5 Bloqueios de Horários (Blockouts)
CREATE TABLE IF NOT EXISTS public.blockouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Indisponível',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Clientes (Clients)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_business_client_phone UNIQUE (business_id, phone)
);

-- 1.7 Agendamentos (Appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id),
  service_name TEXT NOT NULL,
  service_price NUMERIC(10,2) NOT NULL,
  service_duration INTEGER NOT NULL,
  professional_id UUID NOT NULL REFERENCES public.professionals(id),
  professional_name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 Notificações do Painel (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  client_name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  professional_name TEXT NOT NULL,
  appointment_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. ÍNDICES DE PERFORMANCE E COBERTURA DE FOREIGN KEYS
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_services_business ON public.services(business_id);
CREATE INDEX IF NOT EXISTS idx_professionals_business ON public.professionals(business_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_business ON public.working_hours(business_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_professional_id ON public.working_hours(professional_id);
CREATE INDEX IF NOT EXISTS idx_blockouts_business ON public.blockouts(business_id);
CREATE INDEX IF NOT EXISTS idx_blockouts_professional_id ON public.blockouts(professional_id);
CREATE INDEX IF NOT EXISTS idx_clients_business_phone ON public.clients(business_id, phone);
CREATE INDEX IF NOT EXISTS idx_appointments_business ON public.appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_schedule ON public.appointments(professional_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_notifications_business ON public.notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id ON public.notifications(appointment_id);

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS) - POLÍTICAS SEGURAS E OTIMIZADAS
-- =============================================================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3.1 Estabelecimentos
CREATE POLICY "Donos gerenciam seus estabelecimentos" ON public.businesses
  FOR ALL TO authenticated
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Publico consulta estabelecimentos por slug" ON public.businesses
  FOR SELECT TO public
  USING (true);

-- 3.2 Serviços
CREATE POLICY "Donos gerenciam seus servicos" ON public.services
  FOR ALL TO authenticated
  USING (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())))
  WITH CHECK (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())));

CREATE POLICY "Publico visualiza servicos ativos" ON public.services
  FOR SELECT TO public
  USING (active = true);

-- 3.3 Profissionais
CREATE POLICY "Donos gerenciam seus profissionais" ON public.professionals
  FOR ALL TO authenticated
  USING (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())))
  WITH CHECK (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())));

CREATE POLICY "Publico visualiza profissionais ativos" ON public.professionals
  FOR SELECT TO public
  USING (active = true);

-- 3.4 Horários de Trabalho
CREATE POLICY "Donos gerenciam horarios de trabalho" ON public.working_hours
  FOR ALL TO authenticated
  USING (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())))
  WITH CHECK (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())));

CREATE POLICY "Publico consulta horarios de trabalho" ON public.working_hours
  FOR SELECT TO public
  USING (true);

-- 3.5 Bloqueios de Agenda
CREATE POLICY "Donos gerenciam bloqueios de agenda" ON public.blockouts
  FOR ALL TO authenticated
  USING (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())))
  WITH CHECK (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())));

CREATE POLICY "Publico consulta bloqueios para calculo de slots" ON public.blockouts
  FOR SELECT TO public
  USING (true);

-- 3.6 Clientes (Segurança: notas e telefones protegidos contra raspagem pública)
CREATE POLICY "Donos gerenciam sua base de clientes" ON public.clients
  FOR ALL TO authenticated
  USING (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())))
  WITH CHECK (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())));

CREATE POLICY "Publico pode cadastrar cliente ao agendar" ON public.clients
  FOR INSERT TO public
  WITH CHECK (true);

-- 3.7 Agendamentos
CREATE POLICY "Donos gerenciam todos os agendamentos" ON public.appointments
  FOR ALL TO authenticated
  USING (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())))
  WITH CHECK (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())));

CREATE POLICY "Publico pode criar agendamento online" ON public.appointments
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Publico visualiza slots ocupados para evitar conflito" ON public.appointments
  FOR SELECT TO public
  USING (status != 'cancelled');

-- 3.8 Notificações
CREATE POLICY "Donos gerenciam notificacoes do seu estabelecimento" ON public.notifications
  FOR ALL TO authenticated
  USING (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())))
  WITH CHECK (business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (select auth.uid())));

CREATE POLICY "Sistema e publico podem gerar notificacao de nova reserva" ON public.notifications
  FOR INSERT TO public
  WITH CHECK (true);

-- =============================================================================
-- 4. FUNÇÕES E GATILHOS DE SEGURANÇA E CONCORRÊNCIA
-- =============================================================================

-- Gatilho para prevenir conflito de horários no banco
CREATE OR REPLACE FUNCTION public.check_appointment_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE professional_id = NEW.professional_id
      AND status != 'cancelled'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (NEW.start_time < end_time AND NEW.end_time > start_time)
  ) THEN
    RAISE EXCEPTION 'Conflito de horário detectado: este profissional já possui atendimento neste período.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trigger_check_appointment_conflict ON public.appointments;
CREATE TRIGGER trigger_check_appointment_conflict
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.check_appointment_conflict();

-- Gatilho para criação automática de estabelecimento para novos usuários de auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.businesses (
    owner_id,
    name,
    slug,
    category,
    phone,
    whatsapp,
    address,
    city,
    state
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Minha Barbearia'),
    'barbearia-' || substr(NEW.id::text, 1, 8),
    'barbearia',
    '',
    '',
    '',
    'São Paulo',
    'SP'
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Revogar execução direta via PostgREST RPC pública por segurança
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
