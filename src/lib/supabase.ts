import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

// Browser-safe key (publishable or legacy anon key)
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder')
);

/**
 * Public browser-safe Supabase client (Row-Level Security enforced)
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

/**
 * Server-only privileged Supabase client.
 * NEVER expose to browser or client components.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseServerClient cannot be called from browser-side code');
  }

  const serverSecret =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serverSecret) {
    return supabase; // fallback to standard client if secret key not provided
  }

  return createClient(supabaseUrl, serverSecret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
