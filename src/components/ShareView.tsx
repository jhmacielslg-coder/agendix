import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Check, Download, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';

export const ShareView: React.FC = () => {
  const { business } = useApp();
  const [copied, setCopied] = useState(false);

  // Geração do link dinâmico a partir do window.location
  const publicUrl = `${window.location.origin}/agendar/${business.slug}`;

  const defaultMessage = `Olá! Agende seu horário na ${business.name}: ${publicUrl}. Escolha o serviço e o melhor horário para você!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(defaultMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('agendix-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 20, 20, 360, 360);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qrcode-${business.slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Compartilhar Agendamento
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '2px' }}>
          Divulgue seu link e QR Code para que seus clientes agendem sem precisar baixar nada.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Card do Link e WhatsApp */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Share2 size={20} color="var(--primary-600)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Seu Link Exclusivo
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '16px' }}>
              Coloque este link na bio do seu Instagram, envie para seus contatos ou divulgue em materiais impressos.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--slate-100)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-300)',
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--slate-800)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {publicUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            {/* Prévia da mensagem */}
            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontSize: '0.85rem',
                color: 'var(--slate-700)',
                marginBottom: '20px',
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--slate-500)', display: 'block', marginBottom: '4px' }}>
                Mensagem pronta para WhatsApp:
              </span>
              "{defaultMessage}"
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button
              onClick={handleShareWhatsApp}
              className="btn btn-success"
              style={{ width: '100%', gap: '10px' }}
            >
              <MessageSquare size={18} />
              Enviar pelo WhatsApp
            </button>
            <a
              href={`/agendar/${business.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ width: '100%', gap: '8px' }}
            >
              <ExternalLink size={16} />
              Abrir Página Pública
            </a>
          </div>
        </div>

        {/* Card do QR Code Verdadeiro */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
            QR Code do Estabelecimento
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginBottom: '20px' }}>
            Imprima e coloque no balcão da recepção, espelho ou cartões de visita.
          </p>

          <div
            style={{
              padding: '18px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--slate-300)',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <QRCodeSVG
              id="agendix-qr-code"
              value={publicUrl}
              size={190}
              level="H"
              includeMargin={true}
            />
          </div>

          <button onClick={handleDownloadQR} className="btn btn-primary" style={{ width: '100%' }}>
            <Download size={18} />
            Baixar QR Code em PNG
          </button>
        </div>
      </div>
    </div>
  );
};
