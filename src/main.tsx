import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProvider } from './context/AppContext';

// Garante que sessões antigas de demonstração sejam limpas para exibir a tela de login inicial
if (localStorage.getItem('agendix_user')?.includes('barbeariacentral.com.br')) {
  localStorage.removeItem('agendix_user');
  localStorage.removeItem('agendix_onboarding_done');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
