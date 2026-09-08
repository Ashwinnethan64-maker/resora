import {
  ResourceModel,
  DocumentModel,
  DocumentPageModel,
  ProjectModel,
  CollectionModel,
  AssistantScopeType,
  AssistantCitation
} from '@/types/database';
import { ResourceService } from '@/lib/services/resource-service';

export interface RetrievalResult {
  resources: ResourceModel[];
  citations: AssistantCitation[];
  contextSnippet: string;
  scopeLabel: string;
}

export type QueryIntent =
  | 'find_resource'
  | 'summarize'
  | 'compare'
  | 'document_question'
  | 'project_gap'
  | 'general_research';

export class RetrievalService {
  /**
   * Deterministic intent classification
   */
  static classifyIntent(query: string): QueryIntent {
    const q = query.toLowerCase();
    if (q.includes('compare') || q.includes('versus') || q.includes('vs')) return 'compare';
    if (q.includes('summarize') || q.includes('overview') || q.includes('summary')) return 'summarize';
    if (q.includes('page') || q.includes('pdf') || q.includes('document') || q.includes('whitepaper')) return 'document_question';
    if (q.includes('missing') || q.includes('gap') || q.includes('next step') || q.includes('what should i')) return 'project_gap';
    if (q.startsWith('find') || q.startsWith('search') || q.startsWith('where')) return 'find_resource';
    return 'general_research';
  }

  /**
   * Hybrid retrieval across library resources and document pages
   */
  static async retrieveContext(
    query: string,
    scopeType: AssistantScopeType = 'library',
    scopeId?: string,
    userId?: string
  ): Promise<RetrievalResult> {
    const q = query.toLowerCase().trim();
    const allResources = await ResourceService.getAllResources(userId);

    // 1. Resolve Scope
    let candidateResources: ResourceModel[] = allResources.filter((r) => !r.is_archived);
    let scopeLabel = 'Entire Library';

    if (scopeType === 'project' && scopeId) {
      const project = await ResourceService.getProjectById(scopeId);
      if (project) {
        scopeLabel = `Project: ${project.name}`;
        candidateResources = candidateResources.filter((r) => project.resource_ids?.includes(r.id));
      }
    } else if (scopeType === 'collection' && scopeId) {
      const collections = await ResourceService.getCollections(userId);
      const col = collections.find((c) => c.id === scopeId);
      if (col) {
        scopeLabel = `Collection: ${col.name}`;
        candidateResources = candidateResources.filter((r) => col.resource_ids?.includes(r.id));
      }
    } else if (scopeType === 'document' && scopeId) {
      const docResource = candidateResources.find((r) => r.id === scopeId);
      if (docResource) {
        scopeLabel = `Document: ${docResource.title}`;
        candidateResources = [docResource];
      }
    } else if (scopeType === 'documents') {
      scopeLabel = 'Documents Only';
      candidateResources = candidateResources.filter((r) => r.resource_type === 'pdf' || r.resource_type === 'document' || !!r.page_count);
    } else if (scopeType === 'tools') {
      scopeLabel = 'Developer Tools Only';
      candidateResources = candidateResources.filter((r) => r.resource_type === 'developer_tool' || r.resource_type === 'ai_tool');
    } else if (scopeType === 'favorites') {
      scopeLabel = 'Favorites Only';
      candidateResources = candidateResources.filter((r) => r.is_favorite);
    }

    // 2. Multi-Signal Scoring Engine
    const queryTokens = q
      .split(/[\s,.;:?!]+/)
      .filter((w) => w.length > 2 && !['what', 'have', 'saved', 'about', 'from', 'this', 'that', 'with', 'your'].includes(w));

    const scored: { resource: ResourceModel; score: number; matchedPages: DocumentPageModel[]; matchSnippet: string }[] = [];

    for (const res of candidateResources) {
      let score = 0;
      const matchedPages: DocumentPageModel[] = [];
      let matchSnippet = res.description || '';

      const title = res.title.toLowerCase();
      const desc = (res.description || '').toLowerCase();
      const tags = (res.tags || []).map((t) => t.toLowerCase());
      const useCases = (res.use_cases || []).map((u) => u.toLowerCase());
      const content = (res.content || '').toLowerCase();

      // Check title & tags
      for (const token of queryTokens) {
        if (title.includes(token)) score += 15;
        if (tags.some((t) => t.includes(token))) score += 12;
        if (useCases.some((u) => u.includes(token))) score += 8;
        if (desc.includes(token)) score += 6;
      }

      // Exact phrase match
      if (q.length > 4 && (title.includes(q) || desc.includes(q) || content.includes(q))) {
        score += 25;
      }

      // Check document pages if document type
      if (res.resource_type === 'pdf' || res.resource_type === 'document') {
        const docRecord = await ResourceService.getDocumentByResourceId(res.id);
        if (docRecord) {
          const pages = await ResourceService.getDocumentPages(docRecord.id);
          for (const page of pages) {
            const pageText = page.content.toLowerCase();
            let pageHits = 0;
            for (const token of queryTokens) {
              if (pageText.includes(token)) pageHits++;
            }
            if (pageHits > 0) {
              score += pageHits * 10;
              matchedPages.push(page);
              if (!matchSnippet || matchSnippet === res.description) {
                matchSnippet = `Page ${page.page_number}: ${page.content.slice(0, 180)}...`;
              }
            }
          }
        }
      }

      if (score > 0) {
        scored.push({ resource: res, score, matchedPages, matchSnippet });
      }
    }

    // Rank descending
    const ranked = scored.sort((a, b) => b.score - a.score).slice(0, 6);

    // 3. Build Structured Citations & Grounded Context Container
    const citations: AssistantCitation[] = [];
    const contextLines: string[] = [];

    for (const item of ranked) {
      const { resource, matchedPages, matchSnippet } = item;
      const pageNum = matchedPages.length > 0 ? matchedPages[0].page_number : undefined;

      citations.push({
        resource_id: resource.id,
        title: resource.title,
        domain: resource.domain,
        resource_type: resource.resource_type,
        url: resource.url,
        page_number: pageNum,
        snippet: matchSnippet,
        relevance_score: item.score,
      });

      contextLines.push(`---
Source [${citations.length}]: ${resource.title} (${resource.resource_type})
Origin: ${resource.domain} ${pageNum ? `| Page ${pageNum}` : ''}
Tags: ${(resource.tags || []).join(', ')}
Use Cases: ${(resource.use_cases || []).join(', ')}
Excerpt: ${matchSnippet || resource.description}
---`);
    }

    return {
      resources: ranked.map((r) => r.resource),
      citations,
      contextSnippet: contextLines.join('\n\n'),
      scopeLabel,
    };
  }
}
