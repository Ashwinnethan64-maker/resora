import { ResourceType, SourceType } from '@/types/database';

export const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'ref_url',
];

/**
 * Safely normalizes input URL:
 * - prepends https:// if missing
 * - strips tracking parameters (utm_*, fbclid, etc.)
 * - normalizes host casing
 * - preserves valid query parameters & anchors
 */
export function normalizeUrl(rawUrl: string): { url: string; domain: string; isValid: boolean } {
  let trimmed = rawUrl.trim();
  if (!trimmed) {
    return { url: '', domain: '', isValid: false };
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // Strip tracking parameters
    for (const param of TRACKING_PARAMS) {
      parsed.searchParams.delete(param);
    }

    // Clean domain (remove leading 'www.')
    const domain = parsed.hostname.toLowerCase().replace(/^www\./, '');

    // Return clean URL string
    return {
      url: parsed.toString(),
      domain,
      isValid: true,
    };
  } catch {
    return {
      url: trimmed,
      domain: trimmed.split('/')[0].replace(/^www\./, ''),
      isValid: false,
    };
  }
}

/**
 * Deterministically detects resource type & source from domain and path
 */
export function detectSourceAndType(url: string, domain: string): {
  detectedType: ResourceType;
  detectedSource: SourceType;
} {
  const lowerDomain = domain.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // GitHub Repository
  if (lowerDomain === 'github.com') {
    return { detectedType: 'github', detectedSource: 'web' };
  }

  // Videos
  if (lowerDomain === 'youtube.com' || lowerDomain === 'youtu.be' || lowerDomain === 'vimeo.com') {
    return { detectedType: 'video', detectedSource: 'web' };
  }

  // Social Posts
  if (
    lowerDomain === 'x.com' ||
    lowerDomain === 'twitter.com' ||
    lowerDomain === 'instagram.com' ||
    lowerDomain === 'linkedin.com'
  ) {
    return { detectedType: 'social_post', detectedSource: 'social' };
  }

  // PDF
  if (lowerUrl.endsWith('.pdf') || lowerUrl.includes('/pdf/') || lowerDomain === 'arxiv.org') {
    return { detectedType: 'pdf', detectedSource: 'document' };
  }

  // Documents
  if (
    lowerDomain === 'drive.google.com' ||
    lowerDomain === 'docs.google.com' ||
    lowerDomain === 'notion.so' ||
    lowerDomain === 'notion.site'
  ) {
    return { detectedType: 'document', detectedSource: 'document' };
  }

  // Articles & Tutorials
  if (
    lowerDomain === 'medium.com' ||
    lowerDomain === 'substack.com' ||
    lowerDomain === 'dev.to' ||
    lowerDomain === 'hashnode.dev' ||
    lowerUrl.includes('/blog/') ||
    lowerUrl.includes('/article/')
  ) {
    return { detectedType: 'article', detectedSource: 'web' };
  }

  if (lowerUrl.includes('/tutorial') || lowerUrl.includes('/guides/') || lowerUrl.includes('/docs/')) {
    return { detectedType: 'tutorial', detectedSource: 'web' };
  }

  // AI & Developer tools known heuristics
  if (
    lowerDomain.includes('ai') ||
    lowerUrl.includes('gpt') ||
    lowerUrl.includes('agent') ||
    lowerDomain === 'anthropic.com' ||
    lowerDomain === 'openai.com' ||
    lowerDomain === 'nvidia.com' ||
    lowerDomain === 'huggingface.co'
  ) {
    return { detectedType: 'ai_tool', detectedSource: 'web' };
  }

  // Default fallback
  return { detectedType: 'website', detectedSource: 'web' };
}
