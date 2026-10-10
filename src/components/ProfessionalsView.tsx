import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, UserCheck, Phone, CheckSquare, Square, Clock, Upload, Trash2, Camera, Loader2 } from 'lucide-react';
import { Professional, WorkingHour } from '../types';
import { DAY_NAMES_PT } from '../lib/formatters';
import { uploadImage } from '../lib/supabaseService';

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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Horários de Atendimento Modal
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [hoursList, setHoursList] = useState<WorkingHour[]>([]);

  const handleOpenModal = (pro?: Professional) => {
    setUploadError(null);
    if (pro) {
      setEditingPro(pro);
      setName(pro.name);
      setPhone(pro.phone || '');
      setAvatarUrl(pro.avatar_url || '');
      setSelectedServiceIds(pro.service_ids || []);
    } else {
      setEditingPro(null);
      setName('');
      setPhone('');
      setAvatarUrl('');
      setSelectedServiceIds(services.map((s) => s.id));
    }
    setIsModalOpen(true);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem deve ter no máximo 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const publicUrl = await uploadImage(file, 'professionals');
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error('Erro no upload da foto do profissional:', err);
      setUploadError('Erro ao enviar imagem. Verifique a conexão com o Supabase.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPro) {
      updateProfessional(editingPro.id, {
        name,
        phone,
        avatar_url: avatarUrl || undefined,
        service_ids: selectedServiceIds,
      });
    } else {
      addProfessional({
        name,
        phone,
        avatar_url: avatarUrl || undefined,
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
                  {pro.avatar_url ? (
                    <img
                      src={pro.avatar_url}
                      alt={pro.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--primary-200)',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
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
                        flexShrink: 0,
                      }}
                    >
                      {pro.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
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
              {/* Foto do Profissional */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Foto do Profissional / Colaborador</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--slate-100)',
                      border: '2px dashed var(--slate-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Camera size={26} color="var(--slate-400)" />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '6px' }}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            {avatarUrl ? 'Trocar Foto' : 'Adicionar Foto'}
                          </>
                        )}
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                          title="Remover foto"
                        >
                          <Trash2 size={14} />
                          Remover
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      PNG, JPG ou WebP até 5MB. Barbeiro, dentista, especialista, etc.
                    </span>
                  </div>
                </div>

                {uploadError && (
                  <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '6px' }}>
                    {uploadError}
                  </p>
                )}
              </div>
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
