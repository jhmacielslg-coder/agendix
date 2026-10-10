import { createClient } from '@supabase/supabase-js';

// Substitua com as credenciais do seu projeto no Supabase
// (Dica: no Vite você também pode usar variáveis em .env como VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://SEU-PROJETO.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUA-CHAVE-ANON-AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
