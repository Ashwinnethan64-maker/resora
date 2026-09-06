export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StructuredAnalysisOutput {
  summary: string;
  what_it_is: string;
  best_for: string[];
  key_points: string[];
  topics: string[];
  suggested_tags: string[];
  suggested_use_cases: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface NVIDIACompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

export interface NVIDIACompletionResult {
  content: string;
  model: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIHealthStatus {
  status: 'ok' | 'degraded' | 'unavailable';
  provider: 'nvidia';
  model: string;
  configured: boolean;
  message?: string;
}
