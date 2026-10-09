import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, CheckCircle2, Building, Scissors, UserCheck, Clock, Share2 } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { user, completeOnboarding } = useApp();

  const [step, setStep] = useState(1);

  // Etapa 1: Dados do Estabelecimento
  const [bizName, setBizName] = useState('Minha Barbearia Central');
  const [bizCategory, setBizCategory] = useState<'barbearia' | 'salao' | 'clinica' | 'outro'>('barbearia');
  const [bizPhone, setBizPhone] = useState('(11) 98765-4321');
  const [bizWhatsapp, setBizWhatsapp] = useState('11987654321');
  const [bizAddress, setBizAddress] = useState('Rua Principal, 100 - Centro');
  const [bizSlug, setBizSlug] = useState('minha-barbearia');

  // Etapa 2: Primeiro Serviço
  const [serviceName, setServiceName] = useState('Corte Tradicional');
  const [servicePrice, setServicePrice] = useState(45);
  const [serviceDuration, setServiceDuration] = useState(30);

  // Etapa 3: Primeiro Profissional
  const [proName, setProName] = useState(user?.name || 'Carlos Oliveira');

  const handleFinish = () => {
    completeOnboarding(
      {
        name: bizName,
        category: bizCategory as any,
        phone: bizPhone,
        whatsapp: bizWhatsapp,
        address: bizAddress,
        slug: bizSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      },
      {
        name: serviceName,
        price: Number(servicePrice),
        duration_minutes: Number(serviceDuration),
      },
      {
        name: proName,
      }
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '36px',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Header do Wizard */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.5rem',
              margin: '0 auto 16px',
            }}
          >
            A
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Bem-vindo ao Agendix!
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Vamos configurar seu estabelecimento em poucos passos simples.
          </p>

          {/* Indicador de Passos */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: '32px',
                  height: '6px',
                  borderRadius: '999px',
                  backgroundColor: step >= i ? 'var(--primary-600)' : 'var(--slate-200)',
                  transition: 'background-color 0.2s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Passo 1: Informações do Estabelecimento */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '16px' }}>
              1. Dados do Estabelecimento
            </h3>

            <div className="form-group">
              <label className="form-label">Nome do seu negócio *</label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => {
                  setBizName(e.target.value);
                  setBizSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '')
                  );
                }}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Segmento</label>
              <select
                value={bizCategory}
                onChange={(e) => setBizCategory(e.target.value as any)}
                className="form-select"
              >
                <option value="barbearia">Barbearia</option>
                <option value="salao">Salão de Beleza</option>
                <option value="clinica">Clínica / Consultório</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Endereço público exclusivo (Slug)</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    backgroundColor: 'var(--slate-100)',
                    padding: '10px 12px',
                    border: '1px solid var(--slate-300)',
                    borderRight: 'none',
                    borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                    color: 'var(--slate-500)',
                    fontSize: '0.85rem',
                  }}
                >
                  /agendar/
                </span>
                <input
                  type="text"
                  required
                  value={bizSlug}
                  onChange={(e) => setBizSlug(e.target.value)}
                  className="form-input"
                  style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Telefone</label>
                <input
                  type="text"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">WhatsApp</label>
                <input
                  type="text"
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Endereço Completo</label>
              <input
                type="text"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                className="form-input"
              />
            </div>

            <button onClick={() => setStep(2)} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px' }}>
              Continuar
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Passo 2: Primeiro Serviço */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '16px' }}>
              2. Cadastre seu Primeiro Serviço
            </h3>

            <div className="form-group">
              <label className="form-label">Nome do Serviço *</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="form-input"
                placeholder="Ex: Corte Tradicional, Manicure..."
              />
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Preço (R$) *</label>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={servicePrice}
                  onChange={(e) => setServicePrice(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Duração *</label>
                <select
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(Number(e.target.value))}
                  className="form-select"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (1h)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary btn-lg">
                Voltar
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                Continuar
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Passo 3: Primeiro Profissional */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '16px' }}>
              3. Cadastre o Profissional
            </h3>

            <div className="form-group">
              <label className="form-label">Nome do Profissional (pode ser você) *</label>
              <input
                type="text"
                required
                value={proName}
                onChange={(e) => setProName(e.target.value)}
                className="form-input"
              />
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '20px' }}>
              Você poderá cadastrar mais profissionais e definir horários de atendimento detalhados no painel a qualquer momento.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary btn-lg">
                Voltar
              </button>
              <button onClick={() => setStep(4)} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                Continuar
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Passo 4: Conclusão & Compartilhamento */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-50)',
                color: 'var(--emerald-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Tudo pronto! 🎉
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', marginTop: '6px', marginBottom: '24px' }}>
              Seu link exclusivo de agendamento já está criado e funcionando:
            </p>

            <div
              style={{
                backgroundColor: 'var(--slate-100)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                color: 'var(--primary-700)',
                marginBottom: '28px',
                fontSize: '0.95rem',
              }}
            >
              {window.location.origin}/agendar/{bizSlug}
            </div>

            <button onClick={handleFinish} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Acessar meu Painel Agendix
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
