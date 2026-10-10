import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCheck,
  Share2,
  Settings,
  Bell,
  LogOut,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  X,
  Menu,
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR, formatTimeBR, formatPhoneBR } from '../lib/formatters';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewAppointment: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, onOpenNewAppointment }) => {
  const { business, notifications, logout } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'schedule', label: 'Agenda', icon: Calendar },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'professionals', label: 'Profissionais', icon: UserCheck },
    { id: 'share', label: 'Compartilhar', icon: Share2 },
    { id: 'notifications', label: 'Notificações', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--slate-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                objectFit: 'cover',
                border: '1px solid var(--slate-200)',
              }}
            />
          ) : (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
              }}
            >
              {(business.name ? business.name[0] : 'A').toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
              Agendix
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 500 }}>
              {business.name || 'Minha Empresa'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ padding: '16px 20px' }}>
        <button
          onClick={onOpenNewAppointment}
          className="btn btn-primary"
          style={{ width: '100%', gap: '8px' }}
        >
          <Plus size={18} />
          Novo Agendamento
        </button>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: active ? 'var(--primary-50)' : 'transparent',
                color: active ? 'var(--primary-700)' : 'var(--slate-600)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={19} color={active ? 'var(--primary-600)' : 'var(--slate-400)'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '999px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--slate-200)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'none',
            border: 'none',
            color: 'var(--slate-600)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            width: '100%',
          }}
        >
          <LogOut size={18} color="var(--slate-400)" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
};
