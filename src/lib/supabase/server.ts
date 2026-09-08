import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const FALLBACK_URL = 'https://placeholder-resora.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const validUrl = supabaseUrl && !supabaseUrl.includes('placeholder') ? supabaseUrl : FALLBACK_URL;
  const validKey = supabaseAnonKey && !supabaseAnonKey.includes('placeholder') ? supabaseAnonKey : FALLBACK_KEY;

  return createServerClient(validUrl, validKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Can happen in Server Components where cookies cannot be mutated
        }
      },
    },
  });
}
