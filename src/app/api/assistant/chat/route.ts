import { NextRequest, NextResponse } from 'next/server';
import { RetrievalService } from '@/lib/assistant/retrieval-service';
import { ASSISTANT_SYSTEM_PROMPT } from '@/lib/assistant/assistant-prompts';
import { AssistantScopeType, AssistantCitation } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const {
      query,
      scopeType = 'library',
      scopeId,
      messages = [],
    }: {
      query: string;
      scopeType?: AssistantScopeType;
      scopeId?: string;
      messages?: { role: 'user' | 'assistant'; content: string }[];
    } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const trimmedQuery = query.trim();

    // 1. Run Hybrid Retrieval Pipeline across user library
    const { resources, citations, contextSnippet, scopeLabel } =
      await RetrievalService.retrieveContext(trimmedQuery, scopeType, scopeId);

    // 2. Fallback check: if no resources found in scope
    if (resources.length === 0) {
      return NextResponse.json({
        answer: `I searched your library within **${scopeLabel}**, but couldn't find any saved resources or documents matching **"${trimmedQuery}"**.\n\nYou can save relevant websites, PDFs, or articles using "+ Save resource", or expand your search scope to your entire library.`,
        citations: [],
        usedResourceIds: [],
        scopeLabel,
      });
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

    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    const apiBase = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    let answer = '';

    if (apiKey) {
      try {
        const response = await fetch(`${apiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: process.env.AI_MODEL_NAME || 'gpt-4o-mini',
            temperature: 0.2,
            messages: [
              { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
              ...messages.slice(-4), // bounded conversation history
              { role: 'user', content: promptWithContext },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          answer = data.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.error('AI call failed, utilizing deterministic grounded synthesis:', err);
      }
    }

    // 4. Deterministic Grounded Synthesis Fallback (Guaranteed to work without external API key)
    if (!answer) {
      const intent = RetrievalService.classifyIntent(trimmedQuery);

      if (intent === 'compare') {
        const rows = resources.map((r, i) => {
          return `| **[Source ${i + 1}] ${r.title}** | ${r.resource_type} | ${r.tags?.join(', ') || 'N/A'} | ${r.use_cases?.join(', ') || 'N/A'} | ${r.description?.slice(0, 90) || 'N/A'}... |`;
        }).join('\n');

        answer = `### Resource Comparison (${scopeLabel})\n\nBased on the **${resources.length} relevant resources** saved in your library:\n\n| Resource | Type | Tags | Best For | Overview |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n### Synthesis\nThese tools form distinct layers of your stack. Review the individual source cards below for deep-dive documentation and architecture notes.`;
      } else if (intent === 'document_question') {
        const docWithPage = citations.find((c) => c.page_number !== undefined);
        if (docWithPage) {
          answer = `Based on **[Source 1] ${docWithPage.title}** (Page ${docWithPage.page_number}):\n\n> "${docWithPage.snippet}"\n\nThis document covers your query directly. Click the citation or source card below to jump to page ${docWithPage.page_number} in the Document Reader.`;
        } else {
          answer = `Found **${resources.length} documents** in your library related to **"${trimmedQuery}"**:\n\n` +
            resources.map((r, i) => `* **[Source ${i + 1}] ${r.title}**: ${r.description || 'Indexed reference material.'}`).join('\n') +
            `\n\nAll sources are ready for page-level reading and citation below.`;
        }
      } else {
        answer = `Based on your saved research in **${scopeLabel}**, I found **${resources.length} relevant resources**:\n\n` +
          resources.map((r, i) => {
            const pageRef = citations[i]?.page_number ? ` (Page ${citations[i].page_number})` : '';
            return `* **[Source ${i + 1}] ${r.title}**${pageRef}: ${r.description || 'Saved resource in your library.'} *(Tagged: ${r.tags?.join(', ') || r.resource_type})*`;
          }).join('\n\n') +
          `\n\n### Key Takeaways\nThese resources are saved in your personal library and can be opened or linked directly into your active project workspaces.`;
      }
    }

    return NextResponse.json({
      answer,
      citations,
      usedResourceIds: resources.map((r) => r.id),
      scopeLabel,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process assistant request' },
      { status: 500 }
    );
  }
}
