import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | undefined;

export function getSupabaseClient() {
  if (supabase) {
    return supabase;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.');
  }

  supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return supabase;
}