import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, Check, RefreshCw, Building } from 'lucide-react';

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

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      category: category as any,
      phone,
      whatsapp,
      address,
      city,
      state,
      timezone,
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
          Gerencie as informações públicas, endereço e link exclusivo da sua empresa.
        </p>
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
