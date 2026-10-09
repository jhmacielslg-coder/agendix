import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, signup } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('contato@barbeariacentral.com.br');
  const [password, setPassword] = useState('senha123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isRegister) {
      await signup(email, password, name || 'Dono do Estabelecimento');
    } else {
      await login(email, password);
    }
    setLoading(false);
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
          maxWidth: '460px',
          width: '100%',
          padding: '36px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.6rem',
              margin: '0 auto 16px',
            }}
          >
            A
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
            Agendix
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', marginTop: '4px' }}>
            {isRegister ? 'Crie a conta do seu estabelecimento' : 'Acesse o painel do seu estabelecimento'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Seu Nome *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Ex: Carlos Oliveira"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">E-mail *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Senha *</label>
              {!isRegister && (
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Instruções de recuperação enviadas para o e-mail cadastrado.');
                  }}
                  style={{ fontSize: '0.8rem', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Esqueceu a senha?
                </a>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '20px' }}
          >
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegister ? 'Criar Minha Conta' : 'Entrar no Painel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid var(--slate-200)', paddingTop: '20px' }}>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate-600)',
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            {isRegister ? (
              <span>
                Já possui uma conta? <strong style={{ color: 'var(--primary-600)' }}>Faça login</strong>
              </span>
            ) : (
              <span>
                Ainda não tem conta? <strong style={{ color: 'var(--primary-600)' }}>Cadastre-se grátis</strong>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
