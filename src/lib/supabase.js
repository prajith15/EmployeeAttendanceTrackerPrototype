import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('=== SUPABASE CLIENT INITIALIZATION ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET');
console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlValid: supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')
});
console.log('==========================================');

// Validate Supabase configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE CONFIGURATION ERROR: Missing URL or API key');
  console.error('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
}

if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.error('❌ SUPABASE URL ERROR: URL should start with https://');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email, password, metadata) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};