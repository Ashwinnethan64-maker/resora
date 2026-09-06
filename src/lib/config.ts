/**
 * RESORA Centralized Production Configuration & Environment Validator
 */

export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  isProd: boolean;
  appUrl: string;
  supabase: {
    url: string | null;
    anonKey: string | null;
    serviceRoleKey: string | null;
    isConfigured: boolean;
  };
  ai: {
    apiKey: string | null;
    baseURL: string;
    model: string;
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

const aiApiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || null;
const aiBaseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const aiModel = process.env.AI_MODEL_NAME || 'gpt-4o-mini';

// Validate environment variables on startup
export function validateEnvironment(): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (isProd) {
    if (!supabaseUrl || !supabaseAnonKey) {
      warnings.push('Supabase credentials not fully configured in production. Local storage fallback will be utilized.');
    }
    if (!aiApiKey) {
      warnings.push('OpenAI/AI Provider API key missing. Resora will run with deterministic grounded synthesis.');
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

export const config: AppConfig = {
  env,
  isProd,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || (isProd ? 'https://resora.app' : 'http://localhost:3000'),
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceKey,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  },
  ai: {
    apiKey: aiApiKey,
    baseURL: aiBaseURL,
    model: aiModel,
    isConfigured: Boolean(aiApiKey),
  },
  storage: {
    maxUploadSizeBytes: 25 * 1024 * 1024, // 25 MB
  },
};
