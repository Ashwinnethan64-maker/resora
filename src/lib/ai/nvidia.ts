import { ChatMessage, NVIDIACompletionOptions, NVIDIACompletionResult, AIHealthStatus } from './types';
import * as Sentry from '@sentry/nextjs';

/**
 * Server-side NVIDIA AI Client
 * Connects to NVIDIA's OpenAI-compatible API endpoint
 * Model: nvidia/nemotron-3-ultra-550b-a55b
 * 
 * NEVER expose NVIDIA_API_KEY to browser/client components.
 */
export class NVIDIAClient {
  private static get apiKey(): string | null {
    if (typeof window !== 'undefined') {
      throw new Error('NVIDIAClient cannot be initialized in client-side code.');
    }
    return process.env.NVIDIA_API_KEY || null;
  }

  private static get baseURL(): string {
    return (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/+$/, '');
  }

  private static get model(): string {
    return process.env.NVIDIA_TEXT_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';
  }

  private static circuitBreakerUntil = 0;

  public static isConfigured(): boolean {
    if (typeof window !== 'undefined') return false;
    return Boolean(process.env.NVIDIA_API_KEY && !process.env.NVIDIA_API_KEY.includes('your_'));
  }

  public static isRateLimited(): boolean {
    return Date.now() < this.circuitBreakerUntil;
  }

  /**
   * Execute chat completion via NVIDIA Nemotron
   */
  public static async chatCompletion(
    messages: ChatMessage[],
    options: NVIDIACompletionOptions = {}
  ): Promise<NVIDIACompletionResult> {
    const key = this.apiKey;
    if (!key) {
      throw new Error('NVIDIA API key not configured on server.');
    }

    if (Date.now() < this.circuitBreakerUntil) {
      const waitSec = Math.ceil((this.circuitBreakerUntil - Date.now()) / 1000);
      throw new Error(`NVIDIA rate limit active. Circuit breaker engaged for ${waitSec}s.`);
    }

    const endpoint = `${this.baseURL}/chat/completions`;
    const requestBody: Record<string, any> = {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1024,
    };

    if (options.responseFormatJson) {
      requestBody.response_format = { type: 'json_object' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s fast timeout

    try {
      let response: Response | null = null;
      const maxRetries = 2;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        // If 503 (Overloaded) or 429 (Rate limited) and retry attempts left, wait briefly
        if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
          continue;
        }
        break;
      }

      clearTimeout(timeout);

      if (!response || !response.ok) {
        const status = response ? response.status : 500;
        let errMessage = `NVIDIA API error: HTTP ${status}`;
        try {
          const errData = await response?.json();
          if (errData?.error?.message) {
            errMessage = `NVIDIA error (${status}): ${errData.error.message}`;
          } else if (errData?.message) {
            errMessage = `NVIDIA error (${status}): ${errData.message}`;
          }
        } catch {
          // ignore non-json error body
        }

        // Capture in Sentry safely without leaking key
        Sentry.captureException(new Error(errMessage), {
          tags: { provider: 'nvidia', model: this.model },
          extra: { status },
        });

        if (status === 429) {
          // Back off NVIDIA calls for 45 seconds to let quota recover
          NVIDIAClient.circuitBreakerUntil = Date.now() + 45000;
        }

        throw new Error(errMessage);
      }

      const data = await response.json();
      const choice = data?.choices?.[0];
      const content = choice?.message?.content || '';

      return {
        content,
        model: data?.model || this.model,
        finishReason: choice?.finish_reason,
        usage: data?.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (err: any) {
      clearTimeout(timeout);

      if (err.name === 'AbortError') {
        const timeoutErr = new Error('NVIDIA request timed out after 12 seconds.');
        Sentry.captureException(timeoutErr, { tags: { provider: 'nvidia', timeout: true } });
        throw timeoutErr;
      }

      throw err;
    }
  }

  /**
   * Health check to test connectivity with NVIDIA endpoint
   */
  public static async testConnection(): Promise<AIHealthStatus> {
    if (!this.isConfigured()) {
      return {
        status: 'unavailable',
        provider: 'nvidia',
        model: this.model,
        configured: false,
        message: 'NVIDIA_API_KEY environment variable is not set.',
      };
    }

    try {
      // Minimal test ping with harmless query
      const result = await this.chatCompletion(
        [
          { role: 'system', content: 'You are a test probe.' },
          { role: 'user', content: 'Respond with the word "pong".' },
        ],
        { maxTokens: 10, temperature: 0.1 }
      );

      return {
        status: 'ok',
        provider: 'nvidia',
        model: result.model || this.model,
        configured: true,
        message: 'NVIDIA Nemotron is reachable and responding.',
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        provider: 'nvidia',
        model: this.model,
        configured: true,
        message: err?.message || 'Failed to connect to NVIDIA API.',
      };
    }
  }
}
