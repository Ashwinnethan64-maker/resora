import { NVIDIAClient } from './nvidia';
import { ChatMessage, NVIDIACompletionOptions, NVIDIACompletionResult, StructuredAnalysisOutput } from './types';
import * as Sentry from '@sentry/nextjs';

/**
 * Unified AI Provider for RESORA
 * Backed primarily by NVIDIA Nemotron, with graceful fallback heuristics
 */
export class AIProvider {
  public static isConfigured(): boolean {
    return NVIDIAClient.isConfigured();
  }

  public static isRateLimited(): boolean {
    return NVIDIAClient.isRateLimited();
  }

  public static get model(): string {
    return process.env.NVIDIA_TEXT_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';
  }

  /**
   * Complete natural language prompt
   */
  public static async complete(
    messages: ChatMessage[],
    options: NVIDIACompletionOptions = {}
  ): Promise<string> {
    const result = await NVIDIAClient.chatCompletion(messages, options);
    return result.content;
  }

  /**
   * Safely parse and validate structured JSON analysis output
   */
  public static parseStructuredAnalysis(raw: string): StructuredAnalysisOutput | null {
    if (!raw) return null;

    try {
      // Clean possible Markdown fence blocks like ```json ... ```
      let cleaned = raw.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);

      // Validate core schema fields
      if (typeof parsed !== 'object' || parsed === null) {
        return null;
      }

      return {
        summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
        what_it_is: typeof parsed.what_it_is === 'string' ? parsed.what_it_is.trim() : '',
        best_for: Array.isArray(parsed.best_for)
          ? parsed.best_for.map((s: any) => String(s).trim()).filter(Boolean)
          : [],
        key_points: Array.isArray(parsed.key_points)
          ? parsed.key_points.map((s: any) => String(s).trim()).filter(Boolean)
          : [],
        topics: Array.isArray(parsed.topics)
          ? parsed.topics.map((s: any) => String(s).trim()).filter(Boolean)
          : [],
        suggested_tags: Array.isArray(parsed.suggested_tags)
          ? parsed.suggested_tags.map((s: any) => String(s).trim()).filter(Boolean)
          : [],
        suggested_use_cases: Array.isArray(parsed.suggested_use_cases)
          ? parsed.suggested_use_cases.map((s: any) => String(s).trim()).filter(Boolean)
          : [],
        confidence: ['high', 'medium', 'low'].includes(parsed.confidence)
          ? parsed.confidence
          : 'medium',
      };
    } catch (err) {
      Sentry.captureException(err, {
        tags: { parser: 'structured_analysis' },
        extra: { rawLength: raw.length },
      });
      return null;
    }
  }
}
