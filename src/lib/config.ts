/**
 * RESORA Centralized Production Configuration & Environment Validator
 */

export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  isProd: boolean;
  appUrl: string;
  supabase: {
    url: string | null;
    publishableKey: string | null;
    secretKey: string | null;
    isConfigured: boolean;
  };
  nvidia: {
    apiKey: string | null;
    baseURL: string;
    model: string;
    isConfigured: boolean;
  };
  sentry: {
    dsn: string | null;
    isConfigured: boolean;
  };
  storage: {
    maxUploadSizeBytes: number;
  };
}

function getEnv(): 'development' | 'staging' | 'production' {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production') return 'production';
  if (process.env.APP_ENV === 'staging' || process.env.VERCEL_ENV === 'preview') return 'staging';
  return 'development';
}

const env = getEnv();
const isProd = env === 'production';

// Supabase configuration (support both publishable key and legacy anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || null;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  null;

// Server-only secret key (never exposed to client)
const supabaseSecretKey =
  typeof window === 'undefined'
    ? process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || null
    : null;

// NVIDIA AI configuration (server-only)
const nvidiaApiKey =
  typeof window === 'undefined'
    ? process.env.NVIDIA_API_KEY || null
    : null;

const nvidiaBaseURL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const nvidiaModel = process.env.NVIDIA_TEXT_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';

// Sentry configuration
const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || null;

/**
 * Validate environment variables safely without leaking secret values
 */
export function validateEnvironment(): {
  valid: boolean;
  warnings: string[];
  errors: string[];
  publicStatus: {
    supabase: boolean;
    nvidia: boolean;
    sentry: boolean;
  };
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!supabaseUrl || !supabasePublishableKey) {
    warnings.push('Supabase public credentials missing. Local fallback active.');
  }

  // Server-side checks only
  if (typeof window === 'undefined') {
    if (!nvidiaApiKey) {
      warnings.push('NVIDIA_API_KEY is not configured. AI requests will fallback to deterministic heuristics.');
    }
    if (!sentryDsn) {
      warnings.push('SENTRY_DSN is not configured. Error monitoring is currently inactive.');
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    publicStatus: {
      supabase: Boolean(supabaseUrl && supabasePublishableKey),
      nvidia: Boolean(nvidiaApiKey),
      sentry: Boolean(sentryDsn),
    },
  };
}

export const config: AppConfig = {
  env,
  isProd,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || (isProd ? 'https://resora-eight.vercel.app' : 'http://localhost:3000'),
  supabase: {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
    secretKey: supabaseSecretKey,
    isConfigured: Boolean(supabaseUrl && supabasePublishableKey),
  },
  nvidia: {
    apiKey: nvidiaApiKey,
    baseURL: nvidiaBaseURL,
    model: nvidiaModel,
    isConfigured: Boolean(nvidiaApiKey),
  },
  sentry: {
    dsn: sentryDsn,
    isConfigured: Boolean(sentryDsn),
  },
  storage: {
    maxUploadSizeBytes: 25 * 1024 * 1024, // 25 MB
  },
};
