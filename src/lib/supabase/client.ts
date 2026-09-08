import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

let client: SupabaseClient | null = null;

const FALLBACK_URL = 'https://placeholder-resora.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export function createClient(): SupabaseClient {
  if (client) return client;

  const rawUrl = supabaseUrl && !supabaseUrl.includes('placeholder') ? supabaseUrl : FALLBACK_URL;
  const validUrl = rawUrl.replace(/\/+$/, '');
  const validKey = supabaseAnonKey && !supabaseAnonKey.includes('placeholder') ? supabaseAnonKey : FALLBACK_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or publishable key. Initializing fallback client.');
  }

  client = createBrowserClient(validUrl, validKey);
  return client;
}
