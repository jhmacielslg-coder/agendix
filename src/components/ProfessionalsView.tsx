import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, UserCheck, Phone, CheckSquare, Square, Clock } from 'lucide-react';
import { Professional, WorkingHour } from '../types';
import { DAY_NAMES_PT } from '../lib/formatters';

export const ProfessionalsView: React.FC = () => {
  const {
    professionals,
    services,
    addProfessional,
    updateProfessional,
    workingHours,
    updateWorkingHours,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPro, setEditingPro] = useState<Professional | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Horários de Atendimento Modal
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [hoursList, setHoursList] = useState<WorkingHour[]>([]);

  const handleOpenModal = (pro?: Professional) => {
    if (pro) {
      setEditingPro(pro);
      setName(pro.name);
      setPhone(pro.phone || '');
      setSelectedServiceIds(pro.service_ids || []);
    } else {
      setEditingPro(null);
      setName('');
      setPhone('');
      setSelectedServiceIds(services.map((s) => s.id));
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPro) {
      updateProfessional(editingPro.id, {
        name,
        phone,
        service_ids: selectedServiceIds,
      });
    } else {
      addProfessional({
        name,
        phone,
        service_ids: selectedServiceIds,
        active: true,
      });
    }
    setIsModalOpen(false);
  };

  const toggleService = (srvId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId]
    );
  };

  const handleOpenHoursModal = () => {
    setHoursList([...workingHours]);
    setIsHoursModalOpen(true);
  };

  const handleUpdateHourRow = (index: number, field: keyof WorkingHour, value: any) => {
    setHoursList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSaveHours = () => {
    updateWorkingHours(hoursList);
    setIsHoursModalOpen(false);
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
            Profissionais e Equipe
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '2px' }}>
            Gerencie os profissionais que realizam os atendimentos e configure a disponibilidade.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleOpenHoursModal} className="btn btn-secondary">
            <Clock size={16} />
            Horários de Atendimento
          </button>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus size={18} />
            Cadastrar Profissional
          </button>
        </div>
      </div>

      {/* Grid de Profissionais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {professionals.map((pro) => {
          const proServices = services.filter((s) => pro.service_ids.includes(s.id));
          return (
            <div key={pro.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                    }}
                  >
                    {pro.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {pro.name}
                    </h3>
                    {pro.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                        <Phone size={13} />
                        <span>{pro.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                    Serviços Habilitados ({proServices.length})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {proServices.map((s) => (
                      <span
                        key={s.id}
                        style={{
                          backgroundColor: 'var(--slate-100)',
                          color: 'var(--slate-700)',
                          fontSize: '0.8rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 500,
                        }}
                      >
                        {s.name}
                      </span>
                    ))}
                    {proServices.length === 0 && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
                        Nenhum serviço vinculado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid var(--slate-100)',
                  paddingTop: '16px',
                  marginTop: '20px',
                }}
              >
                <button onClick={() => handleOpenModal(pro)} className="btn btn-secondary btn-sm">
                  <Edit2 size={14} />
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro / Edição do Profissional */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '18px' }}>
              {editingPro ? 'Editar Profissional' : 'Novo Profissional'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nome do Profissional *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Carlos Oliveira, Dra. Fernanda..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefone / WhatsApp (Opcional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  placeholder="(11) 98888-7777"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Serviços que este profissional realiza:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {services.map((s) => {
                    const isChecked = selectedServiceIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isChecked ? 'var(--primary-50)' : 'var(--slate-50)',
                          cursor: 'pointer',
                          border: `1px solid ${isChecked ? 'var(--primary-200)' : 'var(--slate-200)'}`,
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare size={18} color="var(--primary-600)" />
                        ) : (
                          <Square size={18} color="var(--slate-400)" />
                        )}
                        <span style={{ fontSize: '0.9rem', fontWeight: isChecked ? 600 : 500, color: 'var(--slate-800)' }}>
                          {s.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Salvar Profissional
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

      {/* Modal de Horários Gerais de Atendimento */}
      {isHoursModalOpen && (
        <div className="modal-overlay" onClick={() => setIsHoursModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '6px' }}>
              Horários de Atendimento do Estabelecimento
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginBottom: '20px' }}>
              Configure os dias abertos, horário de início, término e intervalo de almoço.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hoursList.map((wh, idx) => (
                <div
                  key={wh.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: wh.is_active ? '#ffffff' : 'var(--slate-100)',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={wh.is_active}
                      onChange={(e) => handleUpdateHourRow(idx, 'is_active', e.target.checked)}
                    />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: wh.is_active ? 'var(--slate-800)' : 'var(--slate-400)' }}>
                      {DAY_NAMES_PT[wh.day_of_week]}
                    </span>
                  </label>

                  {wh.is_active ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <input
                        type="time"
                        value={wh.start_time}
                        onChange={(e) => handleUpdateHourRow(idx, 'start_time', e.target.value)}
                        className="form-input"
                        style={{ width: '90px', padding: '4px 6px' }}
                      />
                      <span>às</span>
                      <input
                        type="time"
                        value={wh.end_time}
                        onChange={(e) => handleUpdateHourRow(idx, 'end_time', e.target.value)}
                        className="form-input"
                        style={{ width: '90px', padding: '4px 6px' }}
                      />
                      <span style={{ marginLeft: '4px', color: 'var(--slate-400)' }}>Almoço:</span>
                      <input
                        type="time"
                        value={wh.break_start || ''}
                        onChange={(e) => handleUpdateHourRow(idx, 'break_start', e.target.value)}
                        className="form-input"
                        style={{ width: '85px', padding: '4px 6px' }}
                      />
                      <span>-</span>
                      <input
                        type="time"
                        value={wh.break_end || ''}
                        onChange={(e) => handleUpdateHourRow(idx, 'break_end', e.target.value)}
                        className="form-input"
                        style={{ width: '85px', padding: '4px 6px' }}
                      />
                    </div>
                  ) : (
                    <span style={{ color: 'var(--slate-400)', fontSize: '0.85rem', fontWeight: 500 }}>
                      Fechado
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={handleSaveHours} className="btn btn-primary" style={{ flex: 1 }}>
                Salvar Horários
              </button>
              <button onClick={() => setIsHoursModalOpen(false)} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
