import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  Users,
  Share2,
  Plus,
  ArrowUpRight,
  Clock,
  DollarSign,
  CheckCircle,
  Bell,
  Sparkles,
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR, formatTimeBR, formatPhoneBR } from '../lib/formatters';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenNewAppointment: () => void;
  onOpenNewClient: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNewAppointment,
  onOpenNewClient,
}) => {
  const { business, appointments, notifications } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);
  
  // Agendamentos de hoje
  const todayAppointments = appointments.filter(
    (app) => app.start_time.slice(0, 10) === todayStr && app.status !== 'cancelled'
  );

  const confirmedToday = todayAppointments.filter((app) => app.status === 'confirmed');
  const completedToday = todayAppointments.filter((app) => app.status === 'completed');

  // Estimativa do valor previsto dos confirmados de hoje
  const estimatedRevenue = confirmedToday.reduce((acc, curr) => acc + (curr.service_price || 0), 0);

  // Próximos atendimentos (a partir de agora)
  const now = new Date();
  const upcomingAppointments = appointments
    .filter(
      (app) =>
        new Date(app.start_time).getTime() >= now.getTime() - 15 * 60000 &&
        app.status === 'confirmed'
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner / Boas-vindas */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Olá, {business.name} 👋
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '4px' }}>
            Aqui está o resumo da sua agenda para hoje, {formatDateBR(new Date())}.
          </p>
        </div>

        {/* Action Buttons Principais */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={onOpenNewAppointment} className="btn btn-primary">
            <Plus size={18} />
            Novo Agendamento
          </button>
          <button onClick={onOpenNewClient} className="btn btn-secondary">
            <Users size={18} />
            Cadastrar Cliente
          </button>
          <button onClick={() => onNavigate('share')} className="btn btn-success">
            <Share2 size={18} />
            Compartilhar meu link
          </button>
        </div>
      </div>

      {/* Grid de Métricas do Dia */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Card 1: Agendamentos Confirmados Hoje */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarIcon size={26} color="var(--primary-600)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              Confirmados Hoje
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {confirmedToday.length}
            </div>
          </div>
        </div>

        {/* Card 2: Valor Previsto do Dia */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--emerald-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={26} color="var(--emerald-600)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              Valor Previsto do Dia
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {formatCurrencyBRL(estimatedRevenue)}
            </div>
          </div>
        </div>

        {/* Card 3: Concluídos Hoje */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={26} color="var(--slate-600)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              Concluídos Hoje
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {completedToday.length}
            </div>
          </div>
        </div>

        {/* Card 4: Notificações */}
        <div
          className="card card-clickable"
          onClick={() => onNavigate('notifications')}
          style={{ display: 'flex', alignItems: 'center', gap: '18px' }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: unreadNotifications.length > 0 ? '#fef2f2' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={26} color={unreadNotifications.length > 0 ? '#ef4444' : 'var(--slate-400)'} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              Notificações
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {unreadNotifications.length}{' '}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--slate-500)' }}>não lidas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Painel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Próximos Atendimentos */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Próximos Atendimentos
            </h3>
            <button
              onClick={() => onNavigate('schedule')}
              className="btn btn-secondary btn-sm"
            >
              Ver agenda completa
              <ArrowUpRight size={14} />
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--slate-500)' }}>
              <Clock size={36} color="var(--slate-300)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600 }}>Nenhum atendimento próximo agendado</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Compartilhe seu link para receber novas reservas de clientes!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingAppointments.map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--slate-200)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                        {formatTimeBR(app.start_time)}
                      </span>
                      <span style={{ color: 'var(--slate-400)' }}>•</span>
                      <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.client_name}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                      {app.service_name} com <strong>{app.professional_name}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                      {formatCurrencyBRL(app.service_price)}
                    </div>
                    <span className="badge badge-confirmed" style={{ marginTop: '4px' }}>
                      Confirmado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link Rápido de Agendamento */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Sparkles size={22} color="var(--primary-600)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Sua Página Pública
              </h3>
            </div>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Seus clientes podem agendar horários sozinhos 24 horas por dia através do seu link exclusivo.
            </p>

            <div
              style={{
                backgroundColor: 'var(--slate-100)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                wordBreak: 'break-all',
                fontSize: '0.9rem',
                color: 'var(--slate-700)',
                fontWeight: 600,
                border: '1px solid var(--slate-200)',
                marginBottom: '16px',
              }}
            >
              {window.location.origin}/agendar/{business.slug}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('share')}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <Share2 size={16} />
              Ver QR Code e Compartilhar
            </button>
            <a
              href={`/agendar/${business.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              Testar Página
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
