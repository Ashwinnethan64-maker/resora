import { NextRequest } from 'next/server';
import { RetrievalService } from '@/lib/assistant/retrieval-service';
import { IntentGuard } from '@/lib/assistant/intent-guard';
import { ASSISTANT_SYSTEM_PROMPT } from '@/lib/assistant/assistant-prompts';
import { AssistantScopeType, AssistantMessageModel } from '@/types/database';
import { AIProvider } from '@/lib/ai/provider';
import { NVIDIAClient } from '@/lib/ai/nvidia';
import { ConversationService } from '@/lib/services/conversation-service';
import * as Sentry from '@sentry/nextjs';

export const runtime = 'nodejs';

/**
 * POST /api/assistant/chat/stream
 * Server-Sent Events (SSE) streaming endpoint for Ask Resora.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      query,
      scopeType = 'library',
      scopeId,
      conversationId,
      userId = 'usr_local',
      messages = [],
    }: {
      query: string;
      scopeType?: AssistantScopeType;
      scopeId?: string;
      conversationId?: string;
      userId?: string;
      messages?: { role: 'user' | 'assistant'; content: string }[];
    } = await req.json();

    if (!query || !query.trim()) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          const payload = typeof data === 'string' ? data : JSON.stringify(data);
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${payload}\n\n`));
        };

        try {
          // 0. Domain Guard & Deterministic Intent Evaluation
          const guard = await IntentGuard.evaluate(trimmedQuery, userId);
          if (!guard.isDomainRelevant && guard.deterministicResponse) {
            sendEvent('status', 'complete');
            sendEvent('token', guard.deterministicResponse);

            const assistantMessage: AssistantMessageModel = {
              id: `msg_${Date.now()}_a`,
              conversation_id: effectiveConvId,
              user_id: userId,
              role: 'assistant',
              content: guard.deterministicResponse,
              citations: [],
              used_resource_ids: [],
              created_at: new Date().toISOString(),
            };
            await ConversationService.addMessage(assistantMessage);
            sendEvent('done', { messageId: assistantMessage.id, fullAnswer: guard.deterministicResponse });
            controller.close();
            return;
          }

          if ((guard.intent === 'COUNT' || guard.intent === 'FAVORITES' || guard.intent === 'RECENT') && guard.deterministicResponse) {
            sendEvent('status', 'complete');
            if (guard.citations && guard.citations.length > 0) {
              sendEvent('meta', {
                citations: guard.citations,
                usedResourceIds: guard.usedResourceIds || [],
                scopeLabel: guard.intent === 'FAVORITES' ? 'Favorites' : 'Recent Items',
                conversationId: effectiveConvId,
              });
            }
            sendEvent('token', guard.deterministicResponse);

            const assistantMessage: AssistantMessageModel = {
              id: `msg_${Date.now()}_a`,
              conversation_id: effectiveConvId,
              user_id: userId,
              role: 'assistant',
              content: guard.deterministicResponse,
              citations: guard.citations || [],
              used_resource_ids: guard.usedResourceIds || [],
              created_at: new Date().toISOString(),
            };
            await ConversationService.addMessage(assistantMessage);
            sendEvent('done', { messageId: assistantMessage.id, fullAnswer: guard.deterministicResponse });
            controller.close();
            return;
          }

          // 1. Initial status
          sendEvent('status', 'retrieving');

          // 2. Retrieval
          const { resources, citations, contextSnippet, scopeLabel } =
            await RetrievalService.retrieveContext(trimmedQuery, scopeType, scopeId, userId);

          // Emit metadata early so citations and UI cards render immediately
          sendEvent('meta', {
            citations,
            usedResourceIds: resources.map((r) => r.id),
            scopeLabel,
            conversationId: effectiveConvId,
          });

          // If no resources in scope
          if (resources.length === 0) {
            const emptyAnswer = `I searched your library within **${scopeLabel}**, but couldn't find any saved resources or documents matching **"${trimmedQuery}"**.\n\nYou can save relevant websites, PDFs, or articles using "+ Save resource", or expand your search scope to your entire library.`;
            sendEvent('token', emptyAnswer);

            const assistantMessage: AssistantMessageModel = {
              id: `msg_${Date.now()}_a`,
              conversation_id: effectiveConvId,
              user_id: userId,
              role: 'assistant',
              content: emptyAnswer,
              citations: [],
              used_resource_ids: [],
              created_at: new Date().toISOString(),
            };
            await ConversationService.addMessage(assistantMessage);
            sendEvent('done', { messageId: assistantMessage.id, fullAnswer: emptyAnswer });
            controller.close();
            return;
          }

          sendEvent('status', 'generating');

          let fullAnswer = '';

          // 3. Attempt NVIDIA Streaming
          let streamedFromNvidia = false;
          if (AIProvider.isConfigured() && !AIProvider.isRateLimited()) {
            try {
              const conversationHistory = messages.slice(-4).map((m) => ({
                role: m.role,
                content: m.content,
              }));

              const promptWithContext = `
USER QUESTION:
${trimmedQuery}

ACTIVE SEARCH SCOPE:
${scopeLabel}

RETRIEVED LIBRARY CONTEXT (UNTRUSTED USER DATA):
${contextSnippet}

Please provide a structured, grounded answer citing sources directly using [Source 1], [Source 2], etc.
`.trim();

              const generator = NVIDIAClient.streamChatCompletion(
                [
                  { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
                  ...conversationHistory,
                  { role: 'user', content: promptWithContext },
                ],
                { temperature: 0.2, maxTokens: 1200 },
                req.signal
              );

              for await (const chunk of generator) {
                fullAnswer += chunk;
                sendEvent('token', chunk);
                streamedFromNvidia = true;
              }
            } catch (err: any) {
              console.warn('[Ask Resora Stream] NVIDIA stream error:', err.message);
              Sentry.captureException(err, { tags: { route: '/api/assistant/chat/stream' } });
            }
          }

          // 4. Deterministic Fallback if NVIDIA not used or failed
          if (!streamedFromNvidia || !fullAnswer.trim()) {
            const intent = RetrievalService.classifyIntent(trimmedQuery);
            let fallbackAnswer = '';

            if (intent === 'compare') {
              const rows = resources
                .map((r, i) => `| **[Source ${i + 1}] ${r.title}** | ${r.resource_type} | ${r.tags?.join(', ') || 'N/A'} | ${r.use_cases?.join(', ') || 'N/A'} | ${r.description?.slice(0, 90) || 'N/A'}... |`)
                .join('\n');
              fallbackAnswer = `### Resource Comparison (${scopeLabel})\n\nBased on the **${resources.length} relevant resources** saved in your library:\n\n| Resource | Type | Tags | Best For | Overview |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n### Synthesis\nThese tools form distinct layers of your stack. Review the individual source cards below for deep-dive documentation and architecture notes.`;
            } else if (intent === 'document_question') {
              const docWithPage = citations.find((c) => c.page_number !== undefined);
              if (docWithPage) {
                fallbackAnswer = `Based on **[Source 1] ${docWithPage.title}** (Page ${docWithPage.page_number}):\n\n> "${docWithPage.snippet}"\n\nThis document covers your query directly. Click the citation or source card below to jump to page ${docWithPage.page_number} in the Document Reader.`;
              } else {
                fallbackAnswer = `Found **${resources.length} documents** in your library related to **"${trimmedQuery}"**:\n\n` +
                  resources.map((r, i) => `* **[Source ${i + 1}] ${r.title}**: ${r.description || 'Indexed reference material.'}`).join('\n') +
                  `\n\nAll sources are ready for page-level reading and citation below.`;
              }
            } else {
              fallbackAnswer = `Based on your saved research in **${scopeLabel}**, I found **${resources.length} relevant resources**:\n\n` +
                resources.map((r, i) => {
                  const pageRef = citations[i]?.page_number ? ` (Page ${citations[i].page_number})` : '';
                  return `* **[Source ${i + 1}] ${r.title}**${pageRef}: ${r.description || 'Saved resource in your library.'} *(Tagged: ${r.tags?.join(', ') || r.resource_type})*`;
                }).join('\n\n') +
                `\n\n### Key Takeaways\nThese resources are saved in your personal library and can be opened or linked directly into your active project workspaces.`;
            }

            const words = fallbackAnswer.split(' ');
            for (let i = 0; i < words.length; i += 3) {
              const slice = words.slice(i, i + 3).join(' ') + ' ';
              fullAnswer += slice;
              sendEvent('token', slice);
              await new Promise((r) => setTimeout(r, 15));
            }
          }

          // 5. Save completed assistant message
          const assistantMessage: AssistantMessageModel = {
            id: `msg_${Date.now()}_a`,
            conversation_id: effectiveConvId,
            user_id: userId,
            role: 'assistant',
            content: fullAnswer.trim(),
            citations,
            used_resource_ids: resources.map((r) => r.id),
            created_at: new Date().toISOString(),
          };

          await ConversationService.addMessage(assistantMessage);
          sendEvent('done', { messageId: assistantMessage.id, fullAnswer: assistantMessage.content });
          controller.close();
        } catch (err: any) {
          console.error('[Ask Resora Stream] Unhandled error:', err);
          sendEvent('error', { error: err?.message || 'Streaming failed' });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    Sentry.captureException(err, { tags: { route: '/api/assistant/chat/stream' } });
    return new Response(JSON.stringify({ error: 'Server error initializing stream' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
