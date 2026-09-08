const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'src', 'lib', 'assistant', 'intent-guard.ts');

const content = `/**
 * Ask RESORA Domain Guard & Intent Classification Engine
 *
 * Implements:
 * 1. Domain Guard:
 *    - Rejects pure small-talk, greetings, general weather/jokes/math with polite domain-aware guidance.
 *    - Never hallucinates library answers for out-of-scope banter.
 *    - Does NOT over-restrict conversational research questions (e.g. "Hey, which AI coding tools did I save?").
 * 2. Deterministic Intent Classification:
 *    - COUNT questions -> Deterministic DB metric answer without LLM guesswork.
 *    - RECENT / FAVORITES / STATS -> Fast deterministic query.
 *    - RESEARCH / SEARCH / COMPARE / QA -> Hybrid retrieval with verified citation links.
 */

import { ResourceService } from '@/lib/services/resource-service';

export type DomainIntent =
  | 'OUT_OF_SCOPE'
  | 'COUNT'
  | 'RECENT'
  | 'FAVORITES'
  | 'COMPARE'
  | 'DOCUMENT_QA'
  | 'SEARCH'
  | 'GENERAL_RESEARCH';

export interface GuardEvaluation {
  intent: DomainIntent;
  isDomainRelevant: boolean;
  deterministicResponse?: string;
  countEntity?: 'resources' | 'documents' | 'pdfs' | 'favorites' | 'projects' | 'collections' | 'ai_tools';
}

const CHITCHAT_EXACT = new Set([
  'hi', 'hello', 'hey', 'yo', 'howdy', 'greetings',
  'how are you', 'how are you?', 'how are you doing', 'how are you doing?',
  'what is up', 'what is up?', 'whats up', 'whats up?', 'sup',
  'tell me a joke', 'tell me a joke.', 'joke',
  'what is the weather', 'what is the weather?', 'what\\'s the weather', 'what\\'s the weather?', 'weather',
  'who won the match', 'who won the match?', 'who won the game',
  'write me a poem', 'write a poem', 'sing a song',
  'what is 2+2', 'what is 2+2?', 'what\\'s 2+2', '2+2',
  'who are you', 'who are you?', 'what can you do', 'what can you do?',
]);

export class IntentGuard {
  /**
   * Evaluates query against the domain guard and classifies user research intent
   */
  static async evaluate(query: string, userId: string = 'usr_local'): Promise<GuardEvaluation> {
    const raw = query.trim().toLowerCase();
    const clean = raw.replace(/[!?,.;:'"]/g, '').trim();

    // 1. Check for pure smalltalk / greeting / out-of-scope banter
    if (CHITCHAT_EXACT.has(raw) || CHITCHAT_EXACT.has(clean)) {
      return {
        intent: 'OUT_OF_SCOPE',
        isDomainRelevant: false,
        deterministicResponse:
          "I'm **RESORA AI** — your personal research intelligence assistant.\\n\\n" +
          "I can help you search, compare, organize, and synthesize the resources, documents, and tools you've saved.\\n\\n" +
          "*Try asking:*\\n" +
          "- *\\"How many documents do I have?\\"*\\n" +
          "- *\\"What AI coding tools did I save?\\"*\\n" +
          "- *\\"Compare the tools I saved for frontend development.\\"*",
      };
    }

    // 2. Check for COUNT queries ("how many ... do I have?", "count of ...")
    const isCountQuery =
      raw.includes('how many') ||
      raw.startsWith('count ') ||
      raw.includes('number of ') ||
      raw.includes('total count');

    if (isCountQuery) {
      const metrics = await ResourceService.getMetrics(userId);
      const allResources = await ResourceService.getAllResources(userId);

      if (raw.includes('document') || raw.includes('paper') || raw.includes('file')) {
        const count = metrics.documents;
        return {
          intent: 'COUNT',
          isDomainRelevant: true,
          countEntity: 'documents',
          deterministicResponse: \`You have **\${count} document\${count === 1 ? '' : 's'}** in your RESORA library.\`,
        };
      }

      if (raw.includes('pdf')) {
        const pdfCount = allResources.filter((r) => r.resource_type === 'pdf' || r.url.toLowerCase().endsWith('.pdf')).length;
        return {
          intent: 'COUNT',
          isDomainRelevant: true,
          countEntity: 'pdfs',
          deterministicResponse: \`You have **\${pdfCount} PDF\${pdfCount === 1 ? '' : 's'}** in your RESORA library.\`,
        };
      }

      if (raw.includes('favorite') || raw.includes('starred')) {
        const count = metrics.favorites;
        return {
          intent: 'COUNT',
          isDomainRelevant: true,
          countEntity: 'favorites',
          deterministicResponse: \`You have **\${count} favorite resource\${count === 1 ? '' : 's'}** saved in your library.\`,
        };
      }

      if (raw.includes('project')) {
        const count = metrics.projects;
        return {
          intent: 'COUNT',
          isDomainRelevant: true,
          countEntity: 'projects',
          deterministicResponse: \`You have **\${count} active project\${count === 1 ? '' : 's'}** in your workspace.\`,
        };
      }

      if (raw.includes('ai') || raw.includes('tool')) {
        const toolCount = allResources.filter((r) => r.resource_type === 'ai_tool' || r.resource_type === 'developer_tool').length;
        return {
          intent: 'COUNT',
          isDomainRelevant: true,
          countEntity: 'ai_tools',
          deterministicResponse: \`You have **\${toolCount} AI & developer tool\${toolCount === 1 ? '' : 's'}** indexed in your library.\`,
        };
      }

      // Default count = total resources
      const total = metrics.total;
      return {
        intent: 'COUNT',
        isDomainRelevant: true,
        countEntity: 'resources',
        deterministicResponse: \`You have **\${total} total resource\${total === 1 ? '' : 's'}** in your RESORA library.\`,
      };
    }

    // 3. Comparison query
    if (raw.includes('compare') || raw.includes('versus') || raw.includes(' vs ')) {
      return { intent: 'COMPARE', isDomainRelevant: true };
    }

    // 4. Document-specific QA
    if (raw.includes('page ') || raw.includes('in this document') || raw.includes('what does the document say')) {
      return { intent: 'DOCUMENT_QA', isDomainRelevant: true };
    }

    // 5. Recent items
    if (raw.includes('recently') || raw.includes('latest saved') || raw.includes('what did i save last')) {
      return { intent: 'RECENT', isDomainRelevant: true };
    }

    // 6. Favorites
    if (raw.includes('my favorites') || raw.includes('show favorites')) {
      return { intent: 'FAVORITES', isDomainRelevant: true };
    }

    // 7. General search / research
    return { intent: 'SEARCH', isDomainRelevant: true };
  }
}
`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Written to', targetPath);
