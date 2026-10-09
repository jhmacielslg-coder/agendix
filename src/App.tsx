import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ScheduleView } from './components/ScheduleView';
import { ServicesView } from './components/ServicesView';
import { ProfessionalsView } from './components/ProfessionalsView';
import { ClientsView } from './components/ClientsView';
import { ShareView } from './components/ShareView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { PublicBookingPage } from './components/PublicBookingPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { AuthView } from './components/AuthView';
import { Menu, X, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isOnboardingCompleted, business } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Roteamento baseado no pathname
  const path = window.location.pathname;
  if (path.startsWith('/agendar/')) {
    const slug = path.replace('/agendar/', '');
    return <PublicBookingPage slug={slug} />;
  }

  // Se não autenticado
  if (!user) {
    return <AuthView />;
  }

  // Se onboarding não concluído
  if (!isOnboardingCompleted) {
    return <OnboardingWizard />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Desktop */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewAppointment={() => setIsNewAppointmentModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Navbar para Mobile e Ações Rápidas */}
        <header
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--slate-200)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex' }}
            >
              <Menu size={18} />
            </button>
            <span style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.95rem' }}>
              {business.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href={`/agendar/${business.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <ExternalLink size={14} />
              Página Pública
            </a>
          </div>
        </header>

        {/* Menu Mobile Dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid var(--slate-200)',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {[
              { id: 'dashboard', label: 'Início' },
              { id: 'schedule', label: 'Agenda' },
              { id: 'clients', label: 'Clientes' },
              { id: 'services', label: 'Serviços' },
              { id: 'professionals', label: 'Profissionais' },
              { id: 'share', label: 'Compartilhar' },
              { id: 'notifications', label: 'Notificações' },
              { id: 'settings', label: 'Configurações' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setCurrentTab(m.id);
                  setMobileMenuOpen(false);
                }}
                className={`btn btn-sm ${currentTab === m.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start' }}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* View Switcher */}
        {currentTab === 'dashboard' && (
          <Dashboard
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenNewAppointment={() => setIsNewAppointmentModalOpen(true)}
            onOpenNewClient={() => setCurrentTab('clients')}
          />
        )}
        {currentTab === 'schedule' && (
          <ScheduleView onOpenNewAppointment={() => setIsNewAppointmentModalOpen(true)} />
        )}
        {currentTab === 'services' && <ServicesView />}
        {currentTab === 'professionals' && <ProfessionalsView />}
        {currentTab === 'clients' && <ClientsView />}
        {currentTab === 'share' && <ShareView />}
        {currentTab === 'notifications' && (
          <NotificationsView onNavigateToSchedule={() => setCurrentTab('schedule')} />
        )}
        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* Modal de Novo Agendamento */}
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
      />
    </div>
  );
};
export default App;
