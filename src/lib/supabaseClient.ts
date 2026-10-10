import { createClient } from '@supabase/supabase-js';

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://yhvrvoisylxlieekxuiz.supabase.co';

export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodnJ2b2lzeWx4bGllZWt4dWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMjUyNzMsImV4cCI6MjEwNjkwMTI3M30.xvZXMdmkpydw9gO9aQwD3P-hCVPHRcsZGJc79mCZB8g';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseAnonKey.includes('SUA-CHAVE')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
