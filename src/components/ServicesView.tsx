import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Check, X, Clock, DollarSign } from 'lucide-react';
import { formatCurrencyBRL } from '../lib/formatters';
import { Service } from '../types';

export const ServicesView: React.FC = () => {
  const { services, addService, updateService, deleteService, professionals } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(40);
  const [duration, setDuration] = useState(30);
  const [active, setActive] = useState(true);

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setDescription(service.description || '');
      setPrice(service.price);
      setDuration(service.duration_minutes);
      setActive(service.active);
    } else {
      setEditingService(null);
      setName('');
      setDescription('');
      setPrice(50);
      setDuration(30);
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateService(editingService.id, {
        name,
        description,
        price: Number(price),
        duration_minutes: Number(duration),
        active,
      });
    } else {
      addService({
        name,
        description,
        price: Number(price),
        duration_minutes: Number(duration),
        active: true,
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleActive = (service: Service) => {
    updateService(service.id, { active: !service.active });
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
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
            Serviços do Estabelecimento
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '2px' }}>
            Cadastre os procedimentos, preços e durações oferecidos aos seus clientes.
          </p>
        </div>

        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={18} />
          Cadastrar Serviço
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {services.map((srv) => (
          <div
            key={srv.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: srv.active ? 1 : 0.6,
              borderColor: srv.active ? 'var(--slate-200)' : '#fca5a5',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {srv.name}
                </h3>
                <span className={`badge ${srv.active ? 'badge-completed' : 'badge-cancelled'}`}>
                  {srv.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {srv.description && (
                <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginTop: '8px', lineHeight: 1.4 }}>
                  {srv.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-600)', fontWeight: 700 }}>
                  <DollarSign size={16} />
                  <span>{formatCurrencyBRL(srv.price)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--slate-600)', fontSize: '0.9rem' }}>
                  <Clock size={16} />
                  <span>{srv.duration_minutes} min</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--slate-100)',
                paddingTop: '16px',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() => handleToggleActive(srv)}
                className="btn btn-secondary btn-sm"
              >
                {srv.active ? 'Desativar' : 'Ativar'}
              </button>

              <button
                onClick={() => handleOpenModal(srv)}
                className="btn btn-secondary btn-sm"
              >
                <Edit2 size={14} />
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '18px' }}>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Corte Masculino, Barba Terapia, Manicure..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição (Opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="Explique o que está incluso no serviço..."
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Duração (minutos) *</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="form-select"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min (1 hora)</option>
                    <option value={90}>90 min (1h30)</option>
                    <option value={120}>120 min (2 horas)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Salvar Serviço
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
