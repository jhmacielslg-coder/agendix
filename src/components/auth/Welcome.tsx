import React from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

interface WelcomeProps {
  user: User;
}

export const Welcome: React.FC<WelcomeProps> = ({ user }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
        {user.email ? user.email.charAt(0).toUpperCase() : '✓'}
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo!</h1>
      <p className="text-slate-600 mb-6">
        Você está autenticado com sucesso como:
        <br />
        <span className="font-semibold text-slate-800 break-all">{user.email}</span>
      </p>

      <button
        onClick={handleSignOut}
        className="w-full py-2.5 px-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-medium rounded-lg border border-slate-200 transition duration-150 ease-in-out cursor-pointer"
      >
        Sair (Sign Out)
      </button>
    </div>
  );
};
