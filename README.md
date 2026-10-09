# 📅 Agendix - Plataforma de Agendamentos Online

O **Agendix** é uma plataforma moderna, intuitiva e completa de agendamento online desenvolvida para pequenos estabelecimentos e profissionais autônomos (barbearias, salões de beleza, clínicas, pet shops, estúdios de tatuagem, personal trainers, dentistas, massoterapeutas, etc.).

---

## 🚀 Funcionalidades Principais

1. **Painel do Dono do Estabelecimento:**
   - Métricas em tempo real: Agendamentos de hoje, estimativa de faturamento previsto do dia e atendimentos concluídos.
   - Agenda visual (diária e semanal) com filtros por profissional.
   - Gerenciamento de status: Confirmado, Concluído, Cancelado e Não compareceu.
   - Reagendamento com validação de conflitos e preservação de agendamento original em caso de falha.
   - Bloqueio de horários (almoço, folgas e manutenções).

2. **Serviços & Profissionais:**
   - Gestão de serviços com preço em Reais (R$), duração em minutos e desativação lógica (preserva histórico).
   - Vínculo de serviços por profissional habilitado.
   - Configuração de horários de funcionamento semanais e intervalos.

3. **Base de Clientes & Proteção de Dados:**
   - Normalização automática de telefone com DDD.
   - Histórico de atendimentos do cliente.
   - Observações internas protegidas (nunca expostas na página pública).
   - Isolamento estrito por estabelecimento.

4. **Página Pública de Agendamento (`/agendar/[slug]`):**
   - Rápida, intuitiva e 100% otimizada para celular.
   - Sem necessidade de criar conta por parte do cliente final.
   - Cálculo dinâmico de slots livres em passos de 15 minutos respeitando duração real, intervalos e bloqueios.
   - Validação contra concorrência e duplicidade de reservas.
   - Comprovante de agendamento com código único e botão direto para WhatsApp do estabelecimento.

5. **Compartilhamento & QR Code:**
   - Link dinâmico exclusivo.
   - QR Code verdadeiro renderizado via SVG e com botão de download em alta resolução (PNG).
   - Botão para envio direto pelo WhatsApp com mensagem pronta.

6. **Notificações do Painel:**
   - Avisos persistentes e contador em tempo real de novas reservas realizadas online.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React + TypeScript + Vite
- **Ícones:** Lucide React
- **QR Code:** qrcode.react
- **Efeitos e UI:** Canvas Confetti + Design System Moderno em CSS
- **Banco de Dados & Backend:** Supabase (PostgreSQL com RLS) + Fallback Reativo Local

---

## 📦 Como Executar o Projeto

1. Acesse o diretório do projeto:
   ```bash
   cd c:\Users\Henrique\Documents\MCPs\agendix
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse a aplicação no seu navegador:
   - **Painel Administrativo:** `http://localhost:5173/`
   - **Página Pública de Exemplo:** `http://localhost:5173/agendar/barbearia-central`

---

## 🗄️ Supabase & Regras de Acesso (RLS)

O script completo com as tabelas, índices, triggers de prevenção de concorrência e políticas de Row Level Security (RLS) está localizado em:
[`supabase/schema.sql`](file:///c:/Users/Henrique/Documents/MCPs/agendix/supabase/schema.sql)

Para conectar ao seu banco na nuvem Supabase:
1. Copie o arquivo [`.env.example`](file:///c:/Users/Henrique/Documents/MCPs/agendix/.env.example) para `.env`.
2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Execute o script `supabase/schema.sql` no SQL Editor do seu projeto Supabase.
