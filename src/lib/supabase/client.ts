import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (client) return client;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or publishable key');
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
