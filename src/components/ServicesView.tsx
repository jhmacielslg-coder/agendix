import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Check, X, Clock, DollarSign, Image as ImageIcon, Upload, Camera, Loader2 } from 'lucide-react';
import { formatCurrencyBRL } from '../lib/formatters';
import { Service } from '../types';
import { uploadImage } from '../lib/supabaseService';

export const ServicesView: React.FC = () => {
  const { services, addService, updateService, deleteService } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(40);
  const [duration, setDuration] = useState(30);
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleOpenModal = (service?: Service) => {
    setUploadError('');
    if (service) {
      setEditingService(service);
      setName(service.name);
      setDescription(service.description || '');
      setPrice(service.price);
      setDuration(service.duration_minutes);
      setActive(service.active);
      setImageUrl(service.image_url || '');
    } else {
      setEditingService(null);
      setName('');
      setDescription('');
      setPrice(50);
      setDuration(30);
      setActive(true);
      setImageUrl('');
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadError('');
    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadImage(file, 'services');
      setImageUrl(publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Falha ao fazer upload da imagem.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      await updateService(editingService.id, {
        name,
        description,
        price: Number(price),
        duration_minutes: Number(duration),
        active,
        image_url: imageUrl,
      });
    } else {
      await addService({
        name,
        description,
        price: Number(price),
        duration_minutes: Number(duration),
        active: true,
        image_url: imageUrl,
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
            Cadastre seus serviços com fotos ilustrativas, preços e tempos de atendimento.
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
              padding: '0',
              overflow: 'hidden',
            }}
          >
            {/* Foto do Serviço (se houver) */}
            {srv.image_url && (
              <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={srv.image_url}
                  alt={srv.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {srv.name}
                </h3>
                <span className={`badge ${srv.active ? 'badge-completed' : 'badge-cancelled'}`}>
                  {srv.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {srv.description && (
                <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginTop: '8px', lineHeight: 1.4, flex: 1 }}>
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
          </div>
        ))}
      </div>

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '18px' }}>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>

            {uploadError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* Campo de Upload de Foto do Serviço */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Foto Demonstrativa do Serviço</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      border: '2px dashed var(--slate-300)',
                      backgroundColor: 'var(--slate-50)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon size={26} style={{ color: 'var(--slate-400)' }} />
                    )}

                    {isUploadingImage && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        <Loader2 size={20} className="animate-spin" />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Upload size={14} />
                      {isUploadingImage ? 'Enviando...' : imageUrl ? 'Trocar Foto' : 'Adicionar Foto'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={13} />
                        Remover Foto
                      </button>
                    )}
                    <span style={{ fontSize: '0.73rem', color: 'var(--slate-400)' }}>
                      Ideal para corte, manicure, estética, etc.
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Corte Degrade, Limpeza de Pele, Clareamento..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição (Opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="Explique o que está incluso no procedimento..."
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
