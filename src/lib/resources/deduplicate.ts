/**
 * RESORA Central Deduplication Service
 * 
 * Provides unified duplicate checking across:
 * - Resources: Checks normalized_url and original_url against user's records
 * - Documents: Checks SHA-256 content_hash against user's records
 * - Batches: In-memory list deduplication before database insertion
 */

import { ResourceModel, DocumentModel } from '@/types/database';
import { normalizeCanonicalUrl } from './normalize-url';
import { ResourceService } from '../services/resource-service';

export interface DuplicateResourceMatch {
  isDuplicate: boolean;
  resource: ResourceModel | null;
  normalizedUrl: string;
}

export interface DuplicateDocumentMatch {
  isDuplicate: boolean;
  document: DocumentModel | null;
  resourceId?: string;
  fileName?: string;
}

/**
 * Checks if a URL is already registered in the user's library.
 * Checks normalized_url, original_url, and candidate URL variants.
 */
export async function findDuplicateResource(
  rawUrl: string,
  userId: string = 'usr_local'
): Promise<DuplicateResourceMatch> {
  const norm = normalizeCanonicalUrl(rawUrl);
  if (!norm.isValid) {
    return { isDuplicate: false, resource: null, normalizedUrl: rawUrl };
  }

  const all = await ResourceService.getAllResources();
  const cleanNorm = norm.normalizedUrl.toLowerCase().trim();
  const cleanRaw = rawUrl.toLowerCase().trim();

  const match = all.find((r) => {
    if (r.user_id && r.user_id !== userId) return false;
    const rNorm = (r.normalized_url || '').toLowerCase().trim();
    const rOrig = (r.original_url || '').toLowerCase().trim();
    const rUrl = (r.url || '').toLowerCase().trim();

    return (
      rNorm === cleanNorm ||
      rUrl === cleanNorm ||
      rOrig === cleanRaw ||
      rUrl === cleanRaw
    );
  });

  return {
    isDuplicate: Boolean(match),
    resource: match || null,
    normalizedUrl: norm.normalizedUrl,
  };
}

/**
 * Checks if an uploaded document's exact bytes/SHA-256 hash already exists.
 */
export async function findDuplicateDocument(
  contentHash: string,
  userId: string = 'usr_local'
): Promise<DuplicateDocumentMatch> {
  if (!contentHash) {
    return { isDuplicate: false, document: null };
  }

  const doc = await ResourceService.getDocumentByHash(contentHash);
  if (doc && (!doc.user_id || doc.user_id === userId)) {
    return {
      isDuplicate: true,
      document: doc,
      resourceId: doc.resource_id,
      fileName: doc.file_name,
    };
  }

  return {
    isDuplicate: false,
    document: null,
  };
}

/**
 * Deduplicates an array of raw URLs within a single file or batch.
 * If the same link appears multiple times (e.g. with/without tracking tags),
 * preserves only ONE canonical representation.
 */
export function deduplicateUrlList(rawUrls: string[]): Array<{
  rawUrl: string;
  normalizedUrl: string;
  domain: string;
}> {
  const seen = new Set<string>();
  const unique: Array<{ rawUrl: string; normalizedUrl: string; domain: string }> = [];

  for (const raw of rawUrls) {
    const norm = normalizeCanonicalUrl(raw);
    if (!norm.isValid) continue;

    if (!seen.has(norm.normalizedUrl)) {
      seen.add(norm.normalizedUrl);
      unique.push({
        rawUrl: raw,
        normalizedUrl: norm.normalizedUrl,
        domain: norm.domain,
      });
    }
  }

  return unique;
}
