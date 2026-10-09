import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarCheck,
  Ban,
  MoreVertical,
} from 'lucide-react';
import {
  formatCurrencyBRL,
  formatDateBR,
  formatTimeBR,
  formatPhoneBR,
  DAY_NAMES_PT,
} from '../lib/formatters';
import { AppointmentStatus, Appointment } from '../types';

interface ScheduleViewProps {
  onOpenNewAppointment: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenNewAppointment }) => {
  const {
    appointments,
    professionals,
    services,
    updateAppointmentStatus,
    rescheduleAppointment,
    blockouts,
    addBlockout,
    deleteBlockout,
  } = useApp();

  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');
  
  // Modal de detalhes / edição de status
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newRescheduleTime, setNewRescheduleTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');

  // Modal de bloqueio de horário
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('Folga / Intervalo');
  const [blockStart, setBlockStart] = useState(`${selectedDate}T12:00`);
  const [blockEnd, setBlockEnd] = useState(`${selectedDate}T13:00`);
  const [blockProId, setBlockProId] = useState('all');

  // Navegação de datas
  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() - (viewMode === 'day' ? 1 : 7));
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + (viewMode === 'day' ? 1 : 7));
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // Filtragem
  const filteredAppointments = appointments.filter((app) => {
    if (selectedProfessionalId !== 'all' && app.professional_id !== selectedProfessionalId) {
      return false;
    }
    if (viewMode === 'day') {
      return app.start_time.slice(0, 10) === selectedDate;
    } else {
      // Semana
      const curr = new Date(selectedDate + 'T12:00:00');
      const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay()));
      const lastDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));
      const appDate = new Date(app.start_time);
      return appDate >= firstDay && appDate <= lastDay;
    }
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const handleStatusChange = (status: AppointmentStatus) => {
    if (selectedAppointment) {
      updateAppointmentStatus(selectedAppointment.id, status);
      setSelectedAppointment((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleConfirmReschedule = () => {
    if (!selectedAppointment || !newRescheduleTime) return;
    const res = rescheduleAppointment(selectedAppointment.id, newRescheduleTime);
    if (res.success) {
      setIsRescheduling(false);
      setSelectedAppointment(null);
      setRescheduleError('');
    } else {
      setRescheduleError(res.error || 'Erro ao reagendar.');
    }
  };

  const handleCreateBlockout = (e: React.FormEvent) => {
    e.preventDefault();
    addBlockout({
      reason: blockReason,
      start_datetime: new Date(blockStart).toISOString(),
      end_datetime: new Date(blockEnd).toISOString(),
      professional_id: blockProId === 'all' ? undefined : blockProId,
    });
    setIsBlockModalOpen(false);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
      {/* Header com Navegação e Filtros */}
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
            Agenda Administrativa
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '2px' }}>
            Visualize, reagende e gerencie todos os atendimentos da sua equipe.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setIsBlockModalOpen(true)} className="btn btn-secondary">
            <Ban size={16} />
            Bloquear Horário
          </button>
          <button onClick={onOpenNewAppointment} className="btn btn-primary">
            <Plus size={18} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Barra de Controles de Data e Profissional */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Controles de Data */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handlePrevDay} className="btn btn-secondary btn-sm" title="Anterior">
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleToday} className="btn btn-secondary btn-sm">
            Hoje
          </button>
          <button onClick={handleNextDay} className="btn btn-secondary btn-sm" title="Próximo">
            <ChevronRight size={16} />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '6px 12px' }}
          />

          <span style={{ fontWeight: 700, color: 'var(--slate-700)', marginLeft: '8px' }}>
            {formatDateBR(selectedDate + 'T12:00:00')}
          </span>
        </div>

        {/* Filtro por Profissional & Visualização */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--slate-400)" />
            <select
              value={selectedProfessionalId}
              onChange={(e) => setSelectedProfessionalId(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              <option value="all">Todos os profissionais</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', backgroundColor: 'var(--slate-100)', borderRadius: 'var(--radius-sm)', padding: '3px' }}>
            <button
              onClick={() => setViewMode('day')}
              style={{
                border: 'none',
                background: viewMode === 'day' ? '#ffffff' : 'transparent',
                fontWeight: viewMode === 'day' ? 700 : 500,
                color: viewMode === 'day' ? 'var(--primary-700)' : 'var(--slate-600)',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: viewMode === 'day' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              style={{
                border: 'none',
                background: viewMode === 'week' ? '#ffffff' : 'transparent',
                fontWeight: viewMode === 'week' ? 700 : 500,
                color: viewMode === 'week' ? 'var(--primary-700)' : 'var(--slate-600)',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: viewMode === 'week' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Lista / Grade de Agendamentos */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {filteredAppointments.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
            <CalendarIcon size={44} color="var(--slate-300)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              Nenhum agendamento encontrado para este período
            </h3>
            <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
              Utilize o botão "Novo Agendamento" ou compartilhe sua página pública de reservas.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>Horário</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>Cliente</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>Serviço</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>Profissional</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>Valor</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)', textAlign: 'right' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: '1px solid var(--slate-200)',
                      backgroundColor: app.status === 'cancelled' ? '#fafafa' : '#ffffff',
                      opacity: app.status === 'cancelled' ? 0.6 : 1,
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--slate-900)' }}>
                      <div>{formatTimeBR(app.start_time)} - {formatTimeBR(app.end_time)}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 500 }}>
                        {formatDateBR(app.start_time)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.client_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {formatPhoneBR(app.client_phone)}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.service_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {app.service_duration} minutos
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 500, color: 'var(--slate-700)' }}>
                      {app.professional_name}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--primary-600)' }}>
                      {formatCurrencyBRL(app.service_price)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge badge-${app.status}`}>
                        {app.status === 'confirmed' && 'Confirmado'}
                        {app.status === 'completed' && 'Concluído'}
                        {app.status === 'cancelled' && 'Cancelado'}
                        {app.status === 'no_show' && 'Não compareceu'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedAppointment(app);
                          setIsRescheduling(false);
                          setRescheduleError('');
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Gerenciamento do Agendamento */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--slate-200)',
                paddingBottom: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                  {selectedAppointment.code}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Detalhes do Atendimento
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                ✕
              </button>
            </div>

            {/* Informações detalhadas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'var(--slate-50)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>Cliente</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {selectedAppointment.client_name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                  Telefone: {formatPhoneBR(selectedAppointment.client_phone)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--slate-50)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Serviço</div>
                  <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{selectedAppointment.service_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 700 }}>
                    {formatCurrencyBRL(selectedAppointment.service_price)} ({selectedAppointment.service_duration} min)
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--slate-50)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Profissional</div>
                  <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{selectedAppointment.professional_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    {formatTimeBR(selectedAppointment.start_time)} às {formatTimeBR(selectedAppointment.end_time)}
                  </div>
                </div>
              </div>
            </div>

            {/* Ações de Status */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Alterar Status:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  className={`btn btn-sm ${selectedAppointment.status === 'confirmed' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <CalendarCheck size={14} /> Confirmado
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className={`btn btn-sm ${selectedAppointment.status === 'completed' ? 'btn-success' : 'btn-secondary'}`}
                >
                  <CheckCircle size={14} /> Concluído
                </button>
                <button
                  onClick={() => handleStatusChange('no_show')}
                  className={`btn btn-sm ${selectedAppointment.status === 'no_show' ? 'btn-secondary' : 'btn-secondary'}`}
                >
                  <AlertCircle size={14} /> Não compareceu
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className={`btn btn-sm ${selectedAppointment.status === 'cancelled' ? 'btn-danger' : 'btn-secondary'}`}
                >
                  <XCircle size={14} /> Cancelar Reserva
                </button>
              </div>
            </div>

            {/* Reagendamento */}
            <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '16px' }}>
              {!isRescheduling ? (
                <button
                  onClick={() => {
                    setIsRescheduling(true);
                    setNewRescheduleTime(selectedAppointment.start_time.slice(0, 16));
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  <Clock size={16} />
                  Reagendar para Outro Horário
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label className="form-label">Escolha a nova data e horário:</label>
                  <input
                    type="datetime-local"
                    value={newRescheduleTime}
                    onChange={(e) => setNewRescheduleTime(e.target.value)}
                    className="form-input"
                  />
                  {rescheduleError && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                      {rescheduleError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleConfirmReschedule} className="btn btn-primary" style={{ flex: 1 }}>
                      Confirmar Reagendamento
                    </button>
                    <button onClick={() => setIsRescheduling(false)} className="btn btn-secondary">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bloqueio de Horário */}
      {isBlockModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBlockModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '16px' }}>
              Bloquear Horário na Agenda
            </h3>
            <form onSubmit={handleCreateBlockout}>
              <div className="form-group">
                <label className="form-label">Motivo do Bloqueio</label>
                <input
                  type="text"
                  required
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Almoço especial, Folga, Manutenção..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profissional</label>
                <select
                  value={blockProId}
                  onChange={(e) => setBlockProId(e.target.value)}
                  className="form-select"
                >
                  <option value="all">Todo o Estabelecimento</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Início</label>
                  <input
                    type="datetime-local"
                    required
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Fim</label>
                  <input
                    type="datetime-local"
                    required
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Salvar Bloqueio
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
