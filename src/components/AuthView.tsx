import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase, supabaseUrl } from '../lib/supabaseClient';
import {
  LogIn,
  UserPlus,
  Scissors,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, signup } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('SEU-PROJETO')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isRegister) {
      if (password !== confirmPassword) {
        setErrorMessage('As senhas não coincidem. Digite a mesma senha em ambos os campos.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        if (isRegister) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name: name || 'Dono do Estabelecimento' } },
          });

          if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
          }

          if (data.user && !data.session) {
            setSuccessMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
            setLoading(false);
            return;
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            setErrorMessage('E-mail ou senha incorretos.');
            setLoading(false);
            return;
          }
        }
      } else {
        // Fallback local se Supabase não estiver configurado
        if (isRegister) {
          await signup(email, password, name || 'Dono da Barbearia');
        } else {
          await login(email, password);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar sua autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    await login('dono@barbeariacentral.com.br', 'senha123');
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
        fontFamily: 'var(--font-family)',
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
          backgroundColor: '#ffffff',
          border: '1px solid var(--slate-200)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
              boxShadow: '0 8px 16px rgba(3, 105, 161, 0.25)',
            }}
          >
            A
          </div>
          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--slate-900)',
              letterSpacing: '-0.02em',
            }}
          >
            Agendix
          </h2>
          <p
            style={{
              color: 'var(--slate-500)',
              fontSize: '0.92rem',
              marginTop: '4px',
            }}
          >
            {isRegister
              ? 'Crie a conta da sua barbearia para começar'
              : 'Acesse o painel do seu estabelecimento'}
          </p>
        </div>

        {/* Abas Alternáveis (Entrar / Criar Conta) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            padding: '4px',
            backgroundColor: 'var(--slate-100)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            style={{
              padding: '8px 12px',
              fontSize: '0.9rem',
              fontWeight: !isRegister ? 700 : 500,
              color: !isRegister ? 'var(--primary-700)' : 'var(--slate-600)',
              backgroundColor: !isRegister ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            style={{
              padding: '8px 12px',
              fontSize: '0.9rem',
              fontWeight: isRegister ? 700 : 500,
              color: isRegister ? 'var(--primary-700)' : 'var(--slate-600)',
              backgroundColor: isRegister ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              boxShadow: isRegister ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Criar Conta
          </button>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              color: '#b91c1c',
              fontSize: '0.88rem',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} color="#b91c1c" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#b91c1c',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1.1rem',
              }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              backgroundColor: 'var(--emerald-50)',
              border: '1px solid var(--emerald-200)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--emerald-700)',
              fontSize: '0.88rem',
              marginBottom: '20px',
            }}
          >
            <CheckCircle2 size={18} color="var(--emerald-600)" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Nome da Barbearia ou Dono *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Ex: Carlos (Barbearia Estilo)"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">E-mail do Proprietário *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="dono@barbearia.com.br"
            />
          </div>

          <div className="form-group">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <label className="form-label" style={{ marginBottom: 0 }}>
                Senha *
              </label>
              {!isRegister && (
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Instruções de recuperação de senha serão enviadas para seu e-mail.');
                  }}
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--primary-600)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Esqueceu a senha?
                </a>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate-400)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Confirmar Senha *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Repita a senha"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '16px' }}
          >
            {isRegister ? <UserPlus size={19} /> : <LogIn size={19} />}
            <span>
              {loading
                ? 'Processando...'
                : isRegister
                ? 'Cadastrar & Configurar Barbearia'
                : 'Entrar no Painel'}
            </span>
          </button>
        </form>

        {/* Divisor */}
        <div
          style={{
            position: 'relative',
            textAlign: 'center',
            margin: '24px 0 16px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              borderTop: '1px solid var(--slate-200)',
            }}
          />
          <span
            style={{
              position: 'relative',
              backgroundColor: '#ffffff',
              padding: '0 12px',
              fontSize: '0.8rem',
              color: 'var(--slate-400)',
              fontWeight: 500,
            }}
          >
            ou acesse para testar
          </span>
        </div>

        {/* Botão de Demonstração */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="btn btn-secondary"
          style={{
            width: '100%',
            color: 'var(--slate-700)',
            fontSize: '0.9rem',
          }}
        >
          <Scissors size={17} color="var(--primary-600)" />
          <span>Acessar Barbearia de Demonstração (1 clique)</span>
        </button>

        {/* Rodapé */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '24px',
            borderTop: '1px solid var(--slate-200)',
            paddingTop: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate-600)',
              fontSize: '0.88rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {isRegister ? (
              <span>
                Já possui uma conta?{' '}
                <strong style={{ color: 'var(--primary-600)' }}>Faça login</strong>
              </span>
            ) : (
              <span>
                Ainda não tem conta?{' '}
                <strong style={{ color: 'var(--primary-600)' }}>Cadastre-se grátis</strong>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
