import { NextRequest, NextResponse } from 'next/server';
import { RetrievalService } from '@/lib/assistant/retrieval-service';
import { ASSISTANT_SYSTEM_PROMPT } from '@/lib/assistant/assistant-prompts';
import { AssistantScopeType, AssistantMessageModel, AssistantCitation } from '@/types/database';
import { AIProvider } from '@/lib/ai/provider';
import { ConversationService } from '@/lib/services/conversation-service';
import * as Sentry from '@sentry/nextjs';

/**
 * Executes AI research synthesis for a query within a scope.
 * Pure logic shared across direct response and async background jobs.
 */
export async function executeResearchQuery({
  query,
  scopeType = 'library',
  scopeId,
  messages = [],
}: {
  query: string;
  scopeType?: AssistantScopeType;
  scopeId?: string;
  messages?: { role: 'user' | 'assistant'; content: string }[];
}): Promise<{
  answer: string;
  citations: AssistantCitation[];
  usedResourceIds: string[];
  scopeLabel: string;
}> {
  const trimmedQuery = query.trim();

  // 1. Run Hybrid Retrieval Pipeline across user library
  const { resources, citations, contextSnippet, scopeLabel } =
    await RetrievalService.retrieveContext(trimmedQuery, scopeType, scopeId);

  // 2. If no resources found in scope
  if (resources.length === 0) {
    return {
      answer: `I searched your library within **${scopeLabel}**, but couldn't find any saved resources or documents matching **"${trimmedQuery}"**.\n\nYou can save relevant websites, PDFs, or articles using "+ Save resource", or expand your search scope to your entire library.`,
      citations: [],
      usedResourceIds: [],
      scopeLabel,
    };
  }

  // 3. Prepare AI Prompt & Untrusted Content Container
  const promptWithContext = `
USER QUESTION:
${trimmedQuery}

ACTIVE SEARCH SCOPE:
${scopeLabel}

RETRIEVED LIBRARY CONTEXT (UNTRUSTED USER DATA):
${contextSnippet}

Please provide a structured, grounded answer citing sources directly using [Source 1], [Source 2], etc.
`.trim();

  let answer = '';

  // 4. Call NVIDIA AI Provider if available and not rate limited
  if (AIProvider.isConfigured() && !AIProvider.isRateLimited()) {
    try {
      const conversationHistory = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      answer = await AIProvider.complete(
        [
          { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
          ...conversationHistory,
          { role: 'user', content: promptWithContext },
        ],
        {
          temperature: 0.2,
          maxTokens: 1500,
        }
      );
    } catch (err: any) {
      console.warn('[Ask Resora] NVIDIA inference failed, using deterministic grounded synthesis:', err.message);
      Sentry.captureException(err, {
        tags: { route: '/api/assistant/chat', provider: 'nvidia' },
      });
    }
  }

  // 5. Deterministic Grounded Synthesis Fallback (Guaranteed to work even if offline)
  if (!answer) {
    const intent = RetrievalService.classifyIntent(trimmedQuery);

    if (intent === 'compare') {
      const rows = resources
        .map((r, i) => {
          return `| **[Source ${i + 1}] ${r.title}** | ${r.resource_type} | ${r.tags?.join(', ') || 'N/A'} | ${r.use_cases?.join(', ') || 'N/A'} | ${r.description?.slice(0, 90) || 'N/A'}... |`;
        })
        .join('\n');

      answer = `### Resource Comparison (${scopeLabel})\n\nBased on the **${resources.length} relevant resources** saved in your library:\n\n| Resource | Type | Tags | Best For | Overview |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n### Synthesis\nThese tools form distinct layers of your stack. Review the individual source cards below for deep-dive documentation and architecture notes.`;
    } else if (intent === 'document_question') {
      const docWithPage = citations.find((c) => c.page_number !== undefined);
      if (docWithPage) {
        answer = `Based on **[Source 1] ${docWithPage.title}** (Page ${docWithPage.page_number}):\n\n> "${docWithPage.snippet}"\n\nThis document covers your query directly. Click the citation or source card below to jump to page ${docWithPage.page_number} in the Document Reader.`;
      } else {
        answer =
          `Found **${resources.length} documents** in your library related to **"${trimmedQuery}"**:\n\n` +
          resources
            .map(
              (r, i) =>
                `* **[Source ${i + 1}] ${r.title}**: ${r.description || 'Indexed reference material.'}`
            )
            .join('\n') +
          `\n\nAll sources are ready for page-level reading and citation below.`;
      }
    } else {
      answer =
        `Based on your saved research in **${scopeLabel}**, I found **${resources.length} relevant resources**:\n\n` +
        resources
          .map((r, i) => {
            const pageRef = citations[i]?.page_number ? ` (Page ${citations[i].page_number})` : '';
            return `* **[Source ${i + 1}] ${r.title}**${pageRef}: ${r.description || 'Saved resource in your library.'} *(Tagged: ${r.tags?.join(', ') || r.resource_type})*`;
          })
          .join('\n\n') +
        `\n\n### Key Takeaways\nThese resources are saved in your personal library and can be opened or linked directly into your active project workspaces.`;
    }
  }

  return {
    answer,
    citations,
    usedResourceIds: resources.map((r) => r.id),
    scopeLabel,
  };
}

/**
 * GET /api/assistant/chat?jobId=...
 * Query status of an asynchronous background job.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId parameter is required' }, { status: 400 });
    }

    const job = await ConversationService.getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (err: any) {
    Sentry.captureException(err, { tags: { route: '/api/assistant/chat', method: 'GET' } });
    return NextResponse.json({ error: 'Failed to retrieve job status' }, { status: 500 });
  }
}

/**
 * POST /api/assistant/chat
 * Accepts a research query and processes it either immediately or via an async job.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let authUserId = body.userId || 'usr_local';

    try {
      const { createClient: createServerSupabaseClient } = await import('@/lib/supabase/server');
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        authUserId = user.id;
      }
    } catch {}

    const {
      query,
      scopeType = 'library',
      scopeId,
      conversationId,
      userId = authUserId,
      asyncMode = false,
      messages = [],
    }: {
      query: string;
      scopeType?: AssistantScopeType;
      scopeId?: string;
      conversationId?: string;
      userId?: string;
      asyncMode?: boolean;
      messages?: { role: 'user' | 'assistant'; content: string }[];
    } = body;

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const trimmedQuery = query.trim();
    const effectiveConvId = conversationId || `conv_${Date.now()}`;

    // Record user message
    const userMessage: AssistantMessageModel = {
      id: `msg_${Date.now()}_u`,
      conversation_id: effectiveConvId,
      user_id: userId,
      role: 'user',
      content: trimmedQuery,
      created_at: new Date().toISOString(),
    };
    await ConversationService.addMessage(userMessage);

    // If asyncMode requested, create job and trigger background task
    if (asyncMode) {
      const job = await ConversationService.createJob({
        conversationId: effectiveConvId,
        userId,
        query: trimmedQuery,
        scopeType,
        scopeId,
      });

      // Spawn non-blocking background execution
      (async () => {
        try {
          await ConversationService.updateJob(job.id, { status: 'processing' });
          const result = await executeResearchQuery({
            query: trimmedQuery,
            scopeType,
            scopeId,
            messages,
          });

          const assistantMessage: AssistantMessageModel = {
            id: `msg_${Date.now()}_a`,
            conversation_id: effectiveConvId,
            user_id: userId,
            role: 'assistant',
            content: result.answer,
            citations: result.citations,
            used_resource_ids: result.usedResourceIds,
            created_at: new Date().toISOString(),
          };

          await ConversationService.addMessage(assistantMessage);
          await ConversationService.updateJob(job.id, {
            status: 'completed',
            result_message_id: assistantMessage.id,
            result_message: assistantMessage,
          });
        } catch (err: any) {
          console.error('[Ask Resora] Job failed:', err);
          await ConversationService.updateJob(job.id, {
            status: 'failed',
            error: err?.message || 'Processing failed',
          });
        }
      })();

      return NextResponse.json(
        {
          jobId: job.id,
          conversationId: effectiveConvId,
          status: 'queued',
          userMessage,
        },
        { status: 202 }
      );
    }

    // Direct synchronous execution
    const result = await executeResearchQuery({
      query: trimmedQuery,
      scopeType,
      scopeId,
      messages,
    });

    const assistantMessage: AssistantMessageModel = {
      id: `msg_${Date.now()}_a`,
      conversation_id: effectiveConvId,
      user_id: userId,
      role: 'assistant',
      content: result.answer,
      citations: result.citations,
      used_resource_ids: result.usedResourceIds,
      created_at: new Date().toISOString(),
    };

    await ConversationService.addMessage(assistantMessage);

    return NextResponse.json({
      answer: result.answer,
      citations: result.citations,
      usedResourceIds: result.usedResourceIds,
      scopeLabel: result.scopeLabel,
      conversationId: effectiveConvId,
      userMessage,
      assistantMessage,
    });
  } catch (err: any) {
    Sentry.captureException(err, { tags: { route: '/api/assistant/chat' } });
    return NextResponse.json(
      { error: 'RESORA AI is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
