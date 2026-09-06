import { ResourceIntelligence, ResourceModel } from '@/types/database';
import { cleanHtmlContent, formatUntrustedContent } from './content-cleaner';
import { RESOURCE_ANALYSIS_SYSTEM_PROMPT } from './prompts';
import { AIProvider } from './provider';
import * as Sentry from '@sentry/nextjs';

export interface AIAnalysisRequest {
  resource: ResourceModel;
  rawContent?: string;
  forceReanalyze?: boolean;
}

export interface AIAnalysisResult {
  intelligence: Omit<ResourceIntelligence, 'id' | 'created_at' | 'updated_at'>;
  model: string;
  cached: boolean;
}

// In-memory active locks to prevent concurrent duplicate analysis
const activeLocks = new Set<string>();

export class AIService {
  /**
   * Analyzes a resource using NVIDIA Nemotron or deterministic heuristic fallback
   */
  static async analyzeResource(req: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const { resource, rawContent, forceReanalyze } = req;
    const resourceId = resource.id;

    // Check lock
    if (activeLocks.has(resourceId)) {
      throw new Error(`Resource ${resourceId} is currently being analyzed.`);
    }

    activeLocks.add(resourceId);
    const startTime = Date.now();

    try {
      // 1. Clean and truncate content (Prompt injection defense)
      const cleaned = cleanHtmlContent(rawContent || resource.content || '');
      const contentHash = cleaned.contentHash;

      // 2. Prepare metadata context
      const metaSummary = `
Title: ${resource.title}
URL: ${resource.url}
Domain: ${resource.domain}
Description: ${resource.description || 'N/A'}
Type: ${resource.resource_type}
User Notes: ${resource.personal_note || 'None'}
`.trim();

      const sanitizedPrompt = formatUntrustedContent(
        cleaned.text || resource.description || resource.title,
        metaSummary
      );

      // 3. Attempt NVIDIA Provider if configured
      if (AIProvider.isConfigured()) {
        try {
          const rawResponse = await AIProvider.complete(
            [
              { role: 'system', content: RESOURCE_ANALYSIS_SYSTEM_PROMPT },
              { role: 'user', content: sanitizedPrompt },
            ],
            {
              temperature: 0.2,
              responseFormatJson: true,
              maxTokens: 1200,
            }
          );

          const parsed = AIProvider.parseStructuredAnalysis(rawResponse);

          if (parsed && parsed.summary) {
            return {
              intelligence: {
                resource_id: resource.id,
                user_id: resource.user_id,
                status: 'completed',
                summary: parsed.summary || resource.description || 'Resource summary generated.',
                what_it_is: parsed.what_it_is || `${resource.title} is a ${resource.resource_type} on ${resource.domain}.`,
                best_for: parsed.best_for.length > 0 ? parsed.best_for : ['Software development'],
                key_points: parsed.key_points.length > 0 ? parsed.key_points : ['Core functionality indexed.'],
                topics: parsed.topics.length > 0 ? parsed.topics : ['Technology'],
                suggested_tags: parsed.suggested_tags.length > 0 ? parsed.suggested_tags : ['Research'],
                suggested_use_cases: parsed.suggested_use_cases.length > 0 ? parsed.suggested_use_cases : ['Build'],
                confidence: parsed.confidence || (cleaned.text ? 'high' : 'medium'),
                model: AIProvider.model,
                content_hash: contentHash,
              },
              model: AIProvider.model,
              cached: false,
            };
          }
        } catch (nvidiaErr: any) {
          console.warn('[AIService] NVIDIA call failed, falling back to deterministic heuristics:', nvidiaErr.message);
          Sentry.captureException(nvidiaErr, {
            tags: { component: 'AIService', provider: 'nvidia' },
            extra: { resourceId: resource.id },
          });
        }
      }

      // 4. Intelligent Heuristic Rule Engine (Fallback & Local Offline Resilience)
      const heuristicResult = this.generateHeuristicIntelligence(resource, cleaned.text);

      return {
        intelligence: {
          resource_id: resource.id,
          user_id: resource.user_id,
          status: 'completed',
          ...heuristicResult,
          model: 'resora-heuristic-v1',
          content_hash: contentHash,
        },
        model: 'resora-heuristic-v1',
        cached: false,
      };
    } finally {
      activeLocks.delete(resourceId);
      const duration = Date.now() - startTime;
      console.log(`[AI Analysis] Completed for resource ${resourceId} in ${duration}ms`);
    }
  }

  /**
   * Deterministic semantic extraction when third-party provider is temporarily unavailable
   */
  private static generateHeuristicIntelligence(
    resource: ResourceModel,
    extractedText: string
  ): {
    summary: string;
    what_it_is: string;
    best_for: string[];
    key_points: string[];
    topics: string[];
    suggested_tags: string[];
    suggested_use_cases: string[];
    confidence: 'high' | 'medium' | 'low';
  } {
    const title = resource.title;
    const desc = resource.description || '';
    const domain = resource.domain;
    const type = resource.resource_type;

    let what_it_is = '';
    let summary = '';
    const best_for: string[] = [];
    const key_points: string[] = [];
    const topics: string[] = [];
    const suggested_tags: string[] = [];
    const suggested_use_cases: string[] = [];

    if (domain.includes('github.com')) {
      what_it_is = `An open-source repository for ${title} providing developer source code, issues, and tooling.`;
      summary = desc || `${title} provides an open-source codebase for software engineers and autonomous systems.`;
      best_for.push('Codebase inspection', 'Contributing or forking', 'Self-hosted deployment');
      key_points.push('Open-source GitHub codebase', 'Developer community discussion and issues', 'Direct repository integration');
      topics.push('Open Source', 'Coding', 'Developer Tools');
      suggested_tags.push('GitHub', 'OpenSource', 'Coding');
      suggested_use_cases.push('Code', 'Build');
    } else if (type === 'pdf' || domain.includes('arxiv.org')) {
      what_it_is = `A technical research publication focused on ${title}.`;
      summary = desc || `Academic study and algorithmic formulation regarding ${title}.`;
      best_for.push('Academic citation', 'Architecture validation', 'Theoretical research');
      key_points.push('Formal research findings and methodology', 'Mathematical or empirical benchmarking', 'System design foundation');
      topics.push('Research', 'Computer Science', 'AI');
      suggested_tags.push('Research', 'Paper', 'AI');
      suggested_use_cases.push('Research', 'Learn');
    } else if (type === 'ai_tool' || desc.toLowerCase().includes('ai') || title.toLowerCase().includes('ai')) {
      what_it_is = `An AI-powered software tool designed to augment developer productivity and reasoning workflows.`;
      summary = desc || `${title} leverages machine learning models to accelerate execution and synthesis.`;
      best_for.push('AI-assisted development', 'Rapid prototyping', 'Hackathons');
      key_points.push('Autonomous or assisted LLM integration', 'Accelerated iteration velocity', 'Streamlined developer interface');
      topics.push('AI', 'Developer Tools', 'Automation');
      suggested_tags.push('AI', 'Coding', 'Agents');
      suggested_use_cases.push('Build', 'Automate', 'Hackathon');
    } else {
      what_it_is = `A digital software resource for ${title} hosted on ${domain}.`;
      summary = desc || `${title} provides reference and operational utility on ${domain}.`;
      best_for.push('Project reference', 'Workflow optimization');
      key_points.push('Online platform access', 'Cloud infrastructure utility', 'Reference documentation');
      topics.push('Web', 'SaaS', 'Productivity');
      suggested_tags.push('Web', 'Productivity');
      suggested_use_cases.push('Build', 'Learn');
    }

    if (resource.tags) {
      for (const t of resource.tags) {
        if (!suggested_tags.includes(t)) suggested_tags.push(t);
      }
    }

    return {
      summary,
      what_it_is,
      best_for: best_for.slice(0, 4),
      key_points: key_points.slice(0, 5),
      topics: Array.from(new Set(topics)).slice(0, 4),
      suggested_tags: Array.from(new Set(suggested_tags)).slice(0, 4),
      suggested_use_cases: Array.from(new Set(suggested_use_cases)).slice(0, 4),
      confidence: extractedText.length > 200 ? 'high' : 'medium',
    };
  }
}
