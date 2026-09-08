import { NextResponse } from 'next/server';
import { validateEnvironment } from '@/lib/config';
import { NVIDIAClient } from '@/lib/ai/nvidia';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isFirebaseConfigured } from '@/lib/firebase/client';

/**
 * Health Check API Endpoint
 * Verifies system services status without exposing any secrets or keys.
 */
export async function GET() {
  const envValidation = validateEnvironment();
  const nvidiaConfigured = NVIDIAClient.isConfigured();
  const sentryConfigured = Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);

  return NextResponse.json(
    {
      status: 'ok',
      service: 'RESORA',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        firebase: isFirebaseConfigured ? 'configured' : 'fallback',
        supabase: isSupabaseConfigured ? 'configured' : 'fallback',
        nvidia: nvidiaConfigured ? 'configured' : 'fallback',
        sentry: sentryConfigured ? 'configured' : 'unconfigured',
        analytics: 'disabled',
      },
      validation: {
        valid: envValidation.valid,
        warnings: envValidation.warnings,
      },
    },
    { status: 200 }
  );
}
