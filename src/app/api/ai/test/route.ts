import { NextResponse } from 'next/server';
import { NVIDIAClient } from '@/lib/ai/nvidia';

/**
 * Server-side NVIDIA Test Endpoint
 * Safely tests connection to NVIDIA Nemotron without exposing API key to client.
 */
export async function GET() {
  try {
    const health = await NVIDIAClient.testConnection();
    return NextResponse.json(health, {
      status: health.status === 'ok' ? 200 : 503,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unavailable',
        provider: 'nvidia',
        message: 'NVIDIA test request failed.',
      },
      { status: 500 }
    );
  }
}
