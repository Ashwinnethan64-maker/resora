const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'src', 'lib', 'assistant', 'intent-guard.ts');

const content = `/**
 * Ask RESORA Domain Guard & Fast-Path Engine
 *
 * Provides:
 * 1. Domain Guard:
 *    - Rejects pure small-talk, greetings, weather, jokes, math with polite domain-aware guidance.
 *    - Never executes expensive embeddings or LLM calls for off-topic banter.
 * 2. Deterministic Database Fast-Paths:
 *    - COUNT questions ("how many documents/resources/favorites...") -> Direct DB count, 0ms LLM latency.
 *    - FAVORITES ("show my favorites", "what are my favorite resources?") -> Direct DB lookup, instant Markdown format.
 *    - RECENT ("what did I save recently?", "latest saved") -> Direct DB ORDER BY created_at DESC, instant Markdown list.
 * 3. Cache-Key Architecture:
 *    - Isolated per verified Firebase UID (e.g. \`ask:\${userId}:\${scope}:\${hash}\`).
 */

import { ResourceService } from '@/lib/services/resource-service';
import { AssistantCitation, ResourceModel } from '@/types/database';

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
  citations?: AssistantCitation[];
  usedResourceIds?: string[];
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

// In-memory per-user cache for deterministic queries (TTL: 60s)
const responseCache = new Map<string, { response: GuardEvaluation; timestamp: number }>();

export class IntentGuard {
  /**
   * Generates a safe user-scoped cache key
   */
  static getCacheKey(userId: string, scope: string, query: string): string {
    return \`ask:\${userId}:\${scope}:\${query.trim().toLowerCase()}\`;
  }

  /**
   * Evaluates query against the domain guard and classifies user research intent
   */
  static async evaluate(query: string, userId: string = 'usr_local', scope: string = 'library'): Promise<GuardEvaluation> {
    const raw = query.trim().toLowerCase();
    const clean = raw.replace(/[!?,.;:'"]/g, '').trim();

    // Check user-scoped cache
    const cacheKey = this.getCacheKey(userId, scope, raw);
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.response;
    }

    // 1. Check for pure smalltalk / greeting / out-of-scope banter
    if (CHITCHAT_EXACT.has(raw) || CHITCHAT_EXACT.has(clean)) {
      const res: GuardEvaluation = {
        intent: 'OUT_OF_SCOPE',
        isDomainRelevant: false,
        deterministicResponse:
          "I'm **RESORA AI** — your personal research intelligence assistant.\\n\\n" +
          "I can help you search, compare, organize, and synthesize the resources, documents, and tools you've saved.\\n\\n" +
          "*Try asking:*\\n" +
          "- *\\"How many documents do I have?\\"*\\n" +
          "- *\\"What are my favorite resources?\\"*\\n" +
          "- *\\"What did I save recently?\\"*\\n" +
          "- *\\"What AI coding tools did I save?\\"*",
      };
      return res;
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

      let deterministicResponse = '';
      let countEntity: GuardEvaluation['countEntity'] = 'resources';

      if (raw.includes('document') || raw.includes('paper') || raw.includes('file')) {
        const count = metrics.documents;
        countEntity = 'documents';
        deterministicResponse = \`You have **\${count} document\${count === 1 ? '' : 's'}** in your RESORA library.\`;
      } else if (raw.includes('pdf')) {
        const pdfCount = allResources.filter((r) => r.resource_type === 'pdf' || r.url.toLowerCase().endsWith('.pdf')).length;
        countEntity = 'pdfs';
        deterministicResponse = \`You have **\${pdfCount} PDF\${pdfCount === 1 ? '' : 's'}** in your RESORA library.\`;
      } else if (raw.includes('favorite') || raw.includes('starred')) {
        const count = metrics.favorites;
        countEntity = 'favorites';
        deterministicResponse = \`You have **\${count} favorite resource\${count === 1 ? '' : 's'}** saved in your library.\`;
      } else if (raw.includes('project')) {
        const count = metrics.projects;
        countEntity = 'projects';
        deterministicResponse = \`You have **\${count} active project\${count === 1 ? '' : 's'}** in your workspace.\`;
      } else if (raw.includes('ai') || raw.includes('tool')) {
        const toolCount = allResources.filter((r) => r.resource_type === 'ai_tool' || r.resource_type === 'developer_tool').length;
        countEntity = 'ai_tools';
        deterministicResponse = \`You have **\${toolCount} AI & developer tool\${toolCount === 1 ? '' : 's'}** indexed in your library.\`;
      } else {
        const total = metrics.total;
        deterministicResponse = \`You have **\${total} total resource\${total === 1 ? '' : 's'}** in your RESORA library.\`;
      }

      const res: GuardEvaluation = {
        intent: 'COUNT',
        isDomainRelevant: true,
        countEntity,
        deterministicResponse,
      };
      responseCache.set(cacheKey, { response: res, timestamp: Date.now() });
      return res;
    }

    // 3. Fast-Path: FAVORITES ("what are my favorites", "show my favorites")
    if (
      raw === 'show favorites' ||
      raw === 'my favorites' ||
      raw.includes('what are my favorite') ||
      raw.includes('show my favorite') ||
      raw.includes('list my favorite')
    ) {
      const allResources = await ResourceService.getAllResources(userId);
      const favs = allResources.filter((r) => r.is_favorite && !r.is_archived).slice(0, 10);

      if (favs.length === 0) {
        return {
          intent: 'FAVORITES',
          isDomainRelevant: true,
          deterministicResponse: "You don't have any resources marked as favorites yet. Click the heart icon on any card in your Library to add favorites.",
        };
      }

      const citations: AssistantCitation[] = favs.map((r, i) => ({
        resource_id: r.id,
        title: r.title,
        domain: r.domain,
        resource_type: r.resource_type,
        url: r.url,
        relevance_score: 100,
        snippet: r.description || 'Favorited resource in your library.',
      }));

      const listLines = favs
        .map((r, i) => \`* **[Source \${i + 1}] \${r.title}** (\${r.resource_type}) — \${r.domain}\\n  *\${r.description || 'No description provided.'}*\`)
        .join('\\n\\n');

      const res: GuardEvaluation = {
        intent: 'FAVORITES',
        isDomainRelevant: true,
        deterministicResponse: \`### Your Favorite Resources (\${favs.length})\\n\\nHere are your starred resources:\\n\\n\${listLines}\`,
        citations,
        usedResourceIds: favs.map((r) => r.id),
      };
      responseCache.set(cacheKey, { response: res, timestamp: Date.now() });
      return res;
    }

    // 4. Fast-Path: RECENT RESOURCES ("what did I save recently?", "latest saved")
    if (
      raw.includes('save recently') ||
      raw.includes('saved recently') ||
      raw.includes('latest saved') ||
      raw.includes('what did i save last') ||
      raw.includes('what did i save today')
    ) {
      const allResources = await ResourceService.getAllResources(userId);
      const recent = allResources.filter((r) => !r.is_archived).slice(0, 6);

      if (recent.length === 0) {
        return {
          intent: 'RECENT',
          isDomainRelevant: true,
          deterministicResponse: "You haven't saved any resources to your library yet. Use '+ Save resource' or drag-and-drop documents to begin.",
        };
      }

      const citations: AssistantCitation[] = recent.map((r, i) => ({
        resource_id: r.id,
        title: r.title,
        domain: r.domain,
        resource_type: r.resource_type,
        url: r.url,
        relevance_score: 100,
        snippet: r.description || 'Recently saved resource.',
      }));

      const listLines = recent
        .map((r, i) => \`* **[Source \${i + 1}] \${r.title}** (\${r.resource_type}) — \${r.domain}\\n  *\${r.description || 'Saved resource.'}*\`)
        .join('\\n\\n');

      const res: GuardEvaluation = {
        intent: 'RECENT',
        isDomainRelevant: true,
        deterministicResponse: \`### Recently Saved Resources (\${recent.length})\\n\\nHere is what you've indexed recently in your library:\\n\\n\${listLines}\`,
        citations,
        usedResourceIds: recent.map((r) => r.id),
      };
      responseCache.set(cacheKey, { response: res, timestamp: Date.now() });
      return res;
    }

    // 5. Comparison query
    if (raw.includes('compare') || raw.includes('versus') || raw.includes(' vs ')) {
      return { intent: 'COMPARE', isDomainRelevant: true };
    }

    // 6. Document-specific QA
    if (raw.includes('page ') || raw.includes('in this document') || raw.includes('what does the document say')) {
      return { intent: 'DOCUMENT_QA', isDomainRelevant: true };
    }

    // 7. General search / research
    return { intent: 'SEARCH', isDomainRelevant: true };
  }
}
`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Updated intent-guard.ts with Fast-Paths');
