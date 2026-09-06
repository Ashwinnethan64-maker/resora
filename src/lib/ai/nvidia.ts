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

  public static isConfigured(): boolean {
    if (typeof window !== 'undefined') return false;
    return Boolean(process.env.NVIDIA_API_KEY && !process.env.NVIDIA_API_KEY.includes('your_'));
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
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errMessage = `NVIDIA API error: HTTP ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            errMessage = `NVIDIA error (${response.status}): ${errData.error.message}`;
          } else if (errData?.message) {
            errMessage = `NVIDIA error (${response.status}): ${errData.message}`;
          }
        } catch {
          // ignore non-json error body
        }

        // Capture in Sentry safely without leaking key
        Sentry.captureException(new Error(errMessage), {
          tags: { provider: 'nvidia', model: this.model },
          extra: { status: response.status },
        });

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
        const timeoutErr = new Error('NVIDIA request timed out after 25 seconds.');
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
