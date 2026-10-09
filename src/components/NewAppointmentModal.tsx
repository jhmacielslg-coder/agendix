import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Clock, DollarSign, User, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrencyBRL } from '../lib/formatters';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose }) => {
  const { services, professionals, clients, createAppointment } = useApp();

  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === serviceId);

  // Auto-completar caso selecione cliente existente
  const handleSelectClient = (clientId: string) => {
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setClientPhone(found.phone);
      setClientEmail(found.email || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const startDateTime = `${date}T${time}:00`;

    const res = createAppointment({
      service_id: serviceId,
      professional_id: professionalId,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      start_time: startDateTime,
      notes,
    });

    if (res.success) {
      setSuccessMsg('Agendamento criado com sucesso!');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1200);
    } else {
      setError(res.error || 'Erro ao realizar agendamento.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Novo Agendamento Manual
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Selecionar Cliente Existente ou Cadastrar */}
          <div className="form-group">
            <label className="form-label">Selecionar Cliente Cadastrado (Opcional):</label>
            <select
              onChange={(e) => handleSelectClient(e.target.value)}
              className="form-select"
              defaultValue=""
            >
              <option value="">Novo Cliente / Preencher Manualmente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Nome do Cliente *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Telefone com DDD *</label>
              <input
                type="text"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="form-input"
                placeholder="(11) 99999-8888"
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Serviço *</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="form-select"
                required
              >
                {services.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {formatCurrencyBRL(s.price)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Profissional *</label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="form-select"
                required
              >
                {professionals.filter((p) => p.active).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Data *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Horário de Início *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações (Opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              placeholder="Ex: Pagamento na recepção..."
            />
          </div>

          {selectedService && (
            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <span style={{ fontSize: '0.88rem', color: 'var(--slate-600)' }}>
                Duração estimada: <strong>{selectedService.duration_minutes} min</strong>
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                {formatCurrencyBRL(selectedService.price)}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Confirmar Agendamento
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
