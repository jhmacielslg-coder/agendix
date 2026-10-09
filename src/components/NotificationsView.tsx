import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, Calendar, Clock, User, Scissors, ArrowRight } from 'lucide-react';
import { formatDateBR, formatTimeBR } from '../lib/formatters';

interface NotificationsViewProps {
  onNavigateToSchedule: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigateToSchedule }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Notificações do Painel
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '2px' }}>
            Avisos em tempo real de novas reservas realizadas por clientes na página pública.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button onClick={markAllNotificationsAsRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={16} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Bell size={40} color="var(--slate-300)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              Nenhuma notificação no momento
            </h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Quando um cliente agendar online, você verá o alerta detalhado aqui.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: notif.read ? '#ffffff' : 'var(--primary-50)',
                borderColor: notif.read ? 'var(--slate-200)' : 'var(--primary-200)',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: notif.read ? 'var(--slate-100)' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bell size={20} color={notif.read ? 'var(--slate-400)' : 'var(--primary-600)'} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span
                        style={{
                          backgroundColor: 'var(--primary-600)',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        NOVA
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-700)', marginTop: '2px' }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    <span>Data: {formatDateBR(notif.appointment_time)}</span>
                    <span>Horário: {formatTimeBR(notif.appointment_time)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {!notif.read && (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Marcar lida
                  </button>
                )}
                <button
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    onNavigateToSchedule();
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Abrir Agenda
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
