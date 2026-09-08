/**
 * RESORA Central Resource Import Engine
 * 
 * Orchestrates importing links from documents, Google Drive lists, and markdown files:
 * 1. Deduplicates links inside the source file
 * 2. Compares against existing database records
 * 3. Skips already-saved resources (does not create duplicates)
 * 4. Creates only genuinely new resources
 * 5. Runs AI analysis exclusively for new resources (never duplicates intelligence)
 * 6. Returns clear import summary metrics
 */

import { ResourceModel } from '@/types/database';
import { ResourceService } from '../services/resource-service';
import { extractLinksFromText, ExtractedLink } from '../documents/link-extractor';
import { normalizeCanonicalUrl } from './normalize-url';

export interface ImportResourcesResult {
  detected: number;
  newResourcesCreated: number;
  duplicatesSkipped: number;
  newResources: ResourceModel[];
  existingResources: ResourceModel[];
  sourceDocumentId?: string;
  sourceFileName?: string;
}

export async function importResourcesFromDocumentText({
  documentText,
  sourceDocumentId,
  sourceFileName,
  userId = 'usr_local',
}: {
  documentText: string;
  sourceDocumentId: string;
  sourceFileName: string;
  userId?: string;
}): Promise<ImportResourcesResult> {
  if (!documentText || documentText.trim().length === 0) {
    return {
      detected: 0,
      newResourcesCreated: 0,
      duplicatesSkipped: 0,
      newResources: [],
      existingResources: [],
      sourceDocumentId,
      sourceFileName,
    };
  }

  // 1. Extract raw links with contextual tags & heuristics
  const rawLinks = extractLinksFromText(documentText);

  // 2. In-file deduplication (1 canonical URL per file)
  const inMemorySeen = new Set<string>();
  const uniqueLinks: ExtractedLink[] = [];

  for (const item of rawLinks) {
    const norm = normalizeCanonicalUrl(item.normalizedUrl || item.rawUrl);
    if (!norm.isValid) continue;

    if (!inMemorySeen.has(norm.normalizedUrl)) {
      inMemorySeen.add(norm.normalizedUrl);
      uniqueLinks.push({
        ...item,
        normalizedUrl: norm.normalizedUrl,
        domain: norm.domain,
      });
    }
  }

  const detected = uniqueLinks.length;
  const newResources: ResourceModel[] = [];
  const existingResources: ResourceModel[] = [];
  const allUserResources = await ResourceService.getAllResources();

  // Create a fast lookup map for all user's existing resources
  const existingUrlMap = new Map<string, ResourceModel>();
  for (const res of allUserResources) {
    if (res.normalized_url) existingUrlMap.set(res.normalized_url.toLowerCase().trim(), res);
    if (res.url) existingUrlMap.set(res.url.toLowerCase().trim(), res);
    if (res.original_url) existingUrlMap.set(res.original_url.toLowerCase().trim(), res);
  }

  // 3. Separate NEW vs EXISTING links
  const cleanTitle = sourceFileName.replace(/\.[^/.]+$/, '');

  for (const link of uniqueLinks) {
    const normKey = link.normalizedUrl.toLowerCase().trim();
    const existing = existingUrlMap.get(normKey);

    if (existing) {
      existingResources.push(existing);
      continue;
    }

    // 4. Create ONLY genuinely new resource
    const childResource = await ResourceService.createResource({
      title: link.title,
      url: link.normalizedUrl,
      original_url: link.rawUrl,
      normalized_url: link.normalizedUrl,
      domain: link.domain,
      description: link.contextDescription,
      resource_type: link.resourceType,
      source_type: 'document_import' as any,
      source_document_id: sourceDocumentId,
      is_favorite: false,
      is_archived: false,
      is_inbox: false,
      personal_note: `Imported from document: "${sourceFileName}"`,
      tags: [
        ...link.suggestedTags,
        `From: ${cleanTitle.slice(0, 24)}`,
      ],
      use_cases: link.suggestedUseCases,
      favicon_url: `https://www.google.com/s2/favicons?domain=${link.domain}&sz=64`,
    });

    // Update map to prevent duplicates within same batch execution
    existingUrlMap.set(normKey, childResource);
    newResources.push(childResource);
  }

  // 5. Trigger AI analysis ONLY for new resources (Never duplicate AI intelligence)
  if (newResources.length > 0) {
    (async () => {
      try {
        const { AIService } = await import('@/lib/ai/ai-service');
        // Process sequentially so we don't bombard network or hit concurrency throttles
        for (const item of newResources) {
          try {
            const res = await AIService.analyzeResource({
              resource: item,
              rawContent: item.description,
            });
            await ResourceService.saveIntelligence(res.intelligence, userId);
          } catch (err: any) {
            console.warn(`[ImportEngine] AI analysis child notice (${item.id}):`, err?.message);
          }
          // Polite inter-item spacing
          await new Promise((r) => setTimeout(r, 600));
        }
      } catch (aiErr) {
        console.warn('[ImportEngine] AI service initialization notice:', aiErr);
      }
    })();
  }

 return {
 detected,
 newResourcesCreated: newResources.length,
 duplicatesSkipped: existingResources.length,
 newResources,
 existingResources,
 sourceDocumentId,
 sourceFileName,
 };
}
