import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, Check, RefreshCw, Building, Upload, Trash2, Camera, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/supabaseService';

export const SettingsView: React.FC = () => {
  const { business, updateBusiness, resetToDemoData } = useApp();

  const [name, setName] = useState(business.name);
  const [slug, setSlug] = useState(business.slug);
  const [category, setCategory] = useState(business.category);
  const [phone, setPhone] = useState(business.phone);
  const [whatsapp, setWhatsapp] = useState(business.whatsapp);
  const [address, setAddress] = useState(business.address);
  const [city, setCity] = useState(business.city);
  const [state, setState] = useState(business.state);
  const [timezone, setTimezone] = useState(business.timezone || 'America/Sao_Paulo');
  const [logoUrl, setLogoUrl] = useState(business.logo_url || '');

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setIsUploadingLogo(true);
    try {
      const publicUrl = await uploadImage(file, 'logos');
      setLogoUrl(publicUrl);
      await updateBusiness({ logo_url: publicUrl });
    } catch (err: any) {
      setUploadError(err.message || 'Falha ao fazer upload da logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoUrl('');
    await updateBusiness({ logo_url: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBusiness({
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      category: category as any,
      phone,
      whatsapp,
      address,
      city,
      state,
      timezone,
      logo_url: logoUrl,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Configurações do Estabelecimento
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '2px' }}>
          Gerencie a identidade visual, logo, informações públicas e link exclusivo da sua empresa.
        </p>
      </div>

      {/* Card da Logo do Estabelecimento */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '6px' }}>
          Logo do Estabelecimento
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '18px' }}>
          Essa imagem será exibida no topo da sua página pública de agendamento e no menu principal.
        </p>

        {uploadError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
            {uploadError}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '20px',
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
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Camera size={32} style={{ color: 'var(--slate-400)' }} />
            )}

            {isUploadingLogo && (
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
                <Loader2 size={24} className="animate-spin" />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <Upload size={14} />
              {isUploadingLogo ? 'Enviando...' : logoUrl ? 'Trocar Logo' : 'Enviar Logo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploadingLogo}
                style={{ display: 'none' }}
              />
            </label>

            {logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="btn btn-secondary btn-sm"
                style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} />
                Remover Logo
              </button>
            )}

            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              Formatos suportados: PNG, JPG, WebP (Máx. 5MB). Salvo no Supabase Storage.
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Nome do Estabelecimento *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Endereço Público Exclusivo (Link / Slug) *</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  backgroundColor: 'var(--slate-100)',
                  padding: '10px 14px',
                  border: '1px solid var(--slate-300)',
                  borderRight: 'none',
                  borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                  color: 'var(--slate-500)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                /agendar/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="form-input"
                style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '4px', display: 'block' }}>
              Este será o link que seus clientes acessarão para agendar.
            </span>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Tipo de Estabelecimento</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="form-select"
              >
                <option value="barbearia">Barbearia</option>
                <option value="salao">Salão de Beleza / Estética</option>
                <option value="clinica">Clínica / Consultório</option>
                <option value="petshop">Pet Shop / Banho e Tosa</option>
                <option value="personal">Personal Trainer</option>
                <option value="tatuagem">Estúdio de Tatuagem</option>
                <option value="dentista">Dentista / Odontologia</option>
                <option value="massoterapia">Massoterapia / Fisioterapia</option>
                <option value="outro">Outro Segmento</option>
              </select>
            </div>

            <div>
              <label className="form-label">Fuso Horário Padrão</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="form-select"
              >
                <option value="America/Sao_Paulo">Horário de Brasília (America/Sao_Paulo)</option>
                <option value="America/Manaus">Manaus / Amazonas (America/Manaus)</option>
                <option value="America/Belem">Belém / Norte (America/Belem)</option>
                <option value="America/Fortaleza">Nordeste (America/Fortaleza)</option>
                <option value="America/Cuiaba">Cuiabá / MT (America/Cuiaba)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Telefone de Contato</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                placeholder="(11) 98765-4321"
              />
            </div>
            <div>
              <label className="form-label">WhatsApp para Confirmações</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="form-input"
                placeholder="11987654321"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Endereço Completo</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-input"
              placeholder="Rua, número, bairro..."
            />
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Estado (UF)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="form-input"
                maxLength={2}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '28px' }}>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }}>
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? 'Alterações Salvas!' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      {/* Opções de Demonstração e Reset */}
      <div className="card" style={{ borderColor: '#e2e8f0', backgroundColor: 'var(--slate-50)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '6px' }}>
          Dados de Demonstração
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '16px' }}>
          Se desejar reiniciar o sistema com os dados de exemplo pré-configurados para testes.
        </p>
        <button onClick={resetToDemoData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          Restaurar Dados Padrão de Demonstração
        </button>
      </div>
    </div>
  );
};
