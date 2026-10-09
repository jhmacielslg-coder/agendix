import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, Plus, Phone, Mail, FileText, Calendar, Edit2 } from 'lucide-react';
import { formatPhoneBR, formatDateBR, formatTimeBR, formatCurrencyBRL } from '../lib/formatters';
import { Client } from '../types';

export const ClientsView: React.FC = () => {
  const { clients, appointments, updateClient, addOrUpdateClient } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Modal de Edição / Cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm.replace(/\D/g, ''))
  );

  const handleOpenEdit = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setClientName(client.name);
      setClientPhone(client.phone);
      setClientEmail(client.email || '');
      setClientNotes(client.internal_notes || '');
    } else {
      setSelectedClient(null);
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setClientNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClient) {
      updateClient(selectedClient.id, {
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        internal_notes: clientNotes,
      });
    } else {
      addOrUpdateClient(clientName, clientPhone, clientEmail, clientNotes);
    }
    setIsModalOpen(false);
  };

  // Histórico de agendamentos do cliente selecionado
  const clientAppointments = selectedClient
    ? appointments
        .filter((a) => a.client_id === selectedClient.id || a.client_phone === selectedClient.phone)
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    : [];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
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
            Base de Clientes
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '2px' }}>
            Consulte o histórico de agendamentos, observações internas e contatos.
          </p>
        </div>

        <button onClick={() => handleOpenEdit()} className="btn btn-primary">
          <Plus size={18} />
          Cadastrar Cliente
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="var(--slate-400)" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ border: 'none', padding: '6px 0', fontSize: '0.95rem' }}
          />
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredClients.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Users size={40} color="var(--slate-300)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              Nenhum cliente cadastrado
            </h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Os clientes serão cadastrados automaticamente quando fizerem reservas online.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>Nome</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>Telefone</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>E-mail</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)' }}>Observações</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-600)', textAlign: 'right' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid var(--slate-200)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {client.name}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--slate-700)' }}>
                      {formatPhoneBR(client.phone)}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--slate-500)' }}>
                      {client.email || '—'}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--slate-600)', fontSize: '0.85rem' }}>
                      {client.internal_notes ? (
                        <span style={{ backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                          {client.internal_notes}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: '6px' }}
                      >
                        Histórico
                      </button>
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Histórico do Cliente */}
      {selectedClient && !isModalOpen && (
        <div className="modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--slate-200)',
                paddingBottom: '14px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {selectedClient.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                  {formatPhoneBR(selectedClient.phone)} {selectedClient.email && `• ${selectedClient.email}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                ✕
              </button>
            </div>

            {selectedClient.internal_notes && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: '#92400e',
                  marginBottom: '18px',
                }}
              >
                <strong>Nota Interna:</strong> {selectedClient.internal_notes}
              </div>
            )}

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '12px' }}>
              Histórico de Agendamentos ({clientAppointments.length})
            </h4>

            {clientAppointments.length === 0 ? (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>Nenhum agendamento registrado.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {clientAppointments.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--slate-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--slate-200)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.9rem' }}>
                        {a.service_name} com {a.professional_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {formatDateBR(a.start_time)} às {formatTimeBR(a.start_time)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', marginTop: '2px' }}>
                        {formatCurrencyBRL(a.service_price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setSelectedClient(null)} className="btn btn-secondary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição / Cadastro */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '18px' }}>
              {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
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

              <div className="form-group">
                <label className="form-label">E-mail (Opcional)</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Observações Internas (Visível apenas para você)</label>
                <textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="Ex: Alergia a algum produto, preferências de corte, etc..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Salvar Cliente
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
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
