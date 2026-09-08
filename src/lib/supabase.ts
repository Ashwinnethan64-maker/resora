import { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserSupabaseClient } from './supabase/client';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

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
 * Public browser-safe Supabase client (Row-Level Security enforced).
 * Uses @supabase/ssr cookie storage under the hood.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? (typeof window !== 'undefined'
      ? createBrowserSupabaseClient()
      : null)
  : null;

/**
 * Helper to get the browser client
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  return createBrowserSupabaseClient();
}

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
    return null;
  }

  // Use raw createClient for backend service-role operations
  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, serverSecret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
