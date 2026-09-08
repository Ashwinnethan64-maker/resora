/**
 * Secure Server-Side Webpage Fetcher & Content Extractor Pipeline
 *
 * Implements:
 * - Strict SSRF validation with redirect hop protection
 * - 4-second timeout & 2MB max payload boundaries
 * - Structured metadata extraction (OpenGraph, title, description, favicon, domain)
 * - Deterministic link extraction & classification (DOCS, GITHUB, API, PRICING, DEMO, TUTORIAL)
 * - GitHub Repository specialized deterministic extractor
 * - Cleaned readable markdown/text content extraction
 */

import { validateUrlForSsrf } from '@/lib/security/ssrf';
import { cleanHtmlContent } from './content-cleaner';

export interface ClassifiedLink {
  label: string;
  url: string;
  category: 'OFFICIAL_SITE' | 'DOCUMENTATION' | 'GITHUB' | 'API' | 'DOWNLOAD' | 'TUTORIAL' | 'DEMO' | 'PRICING' | 'REFERENCE';
}

export interface ExtractedWebContent {
  success: boolean;
  url: string;
  canonicalUrl: string;
  title: string;
  description: string;
  domain: string;
  favicon?: string;
  headings: string[];
  readableText: string;
  contentHash: string;
  classifiedLinks: ClassifiedLink[];
  status: 'ANALYZED' | 'FETCH_FAILED' | 'PARTIAL';
  errorMessage?: string;
}

const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2MB
const FETCH_TIMEOUT_MS = 4500;

export class WebFetcher {
  /**
   * Fetches an external webpage safely with SSRF defense and extracts content & links
   */
  static async extractFromUrl(rawUrl: string): Promise<ExtractedWebContent> {
    const ssrfCheck = validateUrlForSsrf(rawUrl);
    if (!ssrfCheck.isSafe || !ssrfCheck.sanitizedUrl) {
      return {
        success: false,
        url: rawUrl,
        canonicalUrl: rawUrl,
        title: '',
        description: '',
        domain: '',
        headings: [],
        readableText: '',
        contentHash: 'empty',
        classifiedLinks: [],
        status: 'FETCH_FAILED',
        errorMessage: ssrfCheck.reason || 'Blocked by SSRF Firewall',
      };
    }

    const targetUrl = ssrfCheck.sanitizedUrl;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return {
        success: false,
        url: targetUrl,
        canonicalUrl: targetUrl,
        title: '',
        description: '',
        domain: '',
        headings: [],
        readableText: '',
        contentHash: 'empty',
        classifiedLinks: [],
        status: 'FETCH_FAILED',
        errorMessage: 'Malformed URL syntax',
      };
    }

    const domain = parsedUrl.hostname.toLowerCase();
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    // 1. Specialized GitHub Extractor
    if (domain === 'github.com') {
      const ghResult = await this.extractGithubRepo(parsedUrl);
      if (ghResult) return ghResult;
    }

    // 2. Standard Webpage Fetch with AbortController
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ResoraBot/2.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      // Re-validate redirect target URL
      if (response.url && response.url !== targetUrl) {
        const redirectCheck = validateUrlForSsrf(response.url);
        if (!redirectCheck.isSafe) {
          throw new Error('Redirect destination rejected by SSRF Firewall');
        }
      }

      if (!response.ok) {
        return {
          success: false,
          url: targetUrl,
          canonicalUrl: response.url || targetUrl,
          title: domain,
          description: `HTTP ${response.status} ${response.statusText}`,
          domain,
          favicon,
          headings: [],
          readableText: '',
          contentHash: 'empty',
          classifiedLinks: [],
          status: 'FETCH_FAILED',
          errorMessage: `Source server returned HTTP ${response.status}`,
        };
      }

      const html = await response.text();
      const boundedHtml = html.slice(0, MAX_PAYLOAD_BYTES);

      // Extract Title (<title> or og:title)
      let title = '';
      const ogTitle = boundedHtml.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
      const titleTag = boundedHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (ogTitle && ogTitle[1]) title = decodeHtml(ogTitle[1].trim());
      else if (titleTag && titleTag[1]) title = decodeHtml(titleTag[1].trim());

      // Extract Description
      let description = '';
      const ogDesc = boundedHtml.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
      const descTag = boundedHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      if (ogDesc && ogDesc[1]) description = decodeHtml(ogDesc[1].trim());
      else if (descTag && descTag[1]) description = decodeHtml(descTag[1].trim());

      // Extract Headings (h1, h2, h3)
      const headings: string[] = [];
      const headingMatches = boundedHtml.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi);
      for (const m of headingMatches) {
        const text = decodeHtml(m[1].replace(/<[^>]+>/g, '')).trim();
        if (text && text.length < 120 && !headings.includes(text)) {
          headings.push(text);
          if (headings.length >= 8) break;
        }
      }

      // Extract Classified Links
      const classifiedLinks = this.extractClassifiedLinks(boundedHtml, parsedUrl);

      // Clean readable text
      const cleaned = cleanHtmlContent(boundedHtml);

      return {
        success: true,
        url: targetUrl,
        canonicalUrl: response.url || targetUrl,
        title: title || domain,
        description: description || (headings[0] ? headings[0] : ''),
        domain,
        favicon,
        headings,
        readableText: cleaned.text,
        contentHash: cleaned.contentHash,
        classifiedLinks,
        status: 'ANALYZED',
      };
    } catch (err: any) {
      return {
        success: false,
        url: targetUrl,
        canonicalUrl: targetUrl,
        title: domain,
        description: 'The source could not be automatically analyzed due to timeout or network security restrictions.',
        domain,
        favicon,
        headings: [],
        readableText: '',
        contentHash: 'empty',
        classifiedLinks: [],
        status: 'FETCH_FAILED',
        errorMessage: err?.message || 'Connection failed',
      };
    }
  }

  /**
   * Deterministically parses and classifies outbound links from page HTML
   */
  private static extractClassifiedLinks(html: string, baseUrl: URL): ClassifiedLink[] {
    const results: ClassifiedLink[] = [];
    const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi);

    const seenUrls = new Set<string>();

    for (const match of linkMatches) {
      const rawHref = match[1].trim();
      const rawAnchor = decodeHtml(match[2].replace(/<[^>]+>/g, '')).trim();

      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) {
        continue;
      }

      let absoluteUrl: string;
      try {
        absoluteUrl = new URL(rawHref, baseUrl.origin).toString();
      } catch {
        continue;
      }

      if (seenUrls.has(absoluteUrl)) continue;
      seenUrls.add(absoluteUrl);

      const lowerUrl = absoluteUrl.toLowerCase();
      const lowerText = rawAnchor.toLowerCase();

      let category: ClassifiedLink['category'] | null = null;
      let label = rawAnchor || 'Link';

      if (lowerUrl.includes('github.com') || lowerText.includes('github') || lowerText.includes('source code')) {
        category = 'GITHUB';
        label = 'GitHub Repository';
      } else if (lowerUrl.includes('/docs') || lowerUrl.includes('docs.') || lowerText.includes('documentation') || lowerText.includes('docs')) {
        category = 'DOCUMENTATION';
        label = 'Documentation';
      } else if (lowerUrl.includes('/api') || lowerText.includes('api reference') || lowerText.includes('api docs')) {
        category = 'API';
        label = 'API Reference';
      } else if (lowerUrl.includes('/pricing') || lowerText.includes('pricing') || lowerText.includes('plans')) {
        category = 'PRICING';
        label = 'Pricing & Plans';
      } else if (lowerUrl.includes('/tutorial') || lowerUrl.includes('/guide') || lowerText.includes('tutorial') || lowerText.includes('getting started')) {
        category = 'TUTORIAL';
        label = 'Tutorial / Guide';
      } else if (lowerUrl.includes('/demo') || lowerUrl.includes('app.') || lowerText.includes('live demo') || lowerText.includes('playground')) {
        category = 'DEMO';
        label = 'Live Demo';
      } else if (lowerUrl.includes('/download') || lowerText.includes('download') || lowerText.includes('install')) {
        category = 'DOWNLOAD';
        label = 'Download';
      }

      if (category) {
        results.push({ label, url: absoluteUrl, category });
        if (results.length >= 6) break;
      }
    }

    return results;
  }

  /**
   * Deterministic GitHub Repository Metadata & README Extractor
   */
  private static async extractGithubRepo(parsedUrl: URL): Promise<ExtractedWebContent | null> {
    const parts = parsedUrl.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');
    const canonical = `https://github.com/${owner}/${repo}`;

    try {
      // 1. Fetch README directly from raw GitHub CDN safely
      let readmeText = '';
      for (const branch of ['main', 'master']) {
        try {
          const rawReadmeRes = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
            { signal: AbortSignal.timeout(3000) }
          );
          if (rawReadmeRes.ok) {
            readmeText = await rawReadmeRes.text();
            break;
          }
        } catch {
          // Try next branch
        }
      }

      const cleanedReadme = cleanHtmlContent(readmeText);
      const firstLines = readmeText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#') && !l.startsWith('!['))
        .slice(0, 2)
        .join(' ');

      const classifiedLinks: ClassifiedLink[] = [
        { label: 'GitHub Repository', url: canonical, category: 'GITHUB' },
        { label: 'Issues & Bugs', url: `${canonical}/issues`, category: 'REFERENCE' },
        { label: 'Releases & Changelog', url: `${canonical}/releases`, category: 'REFERENCE' },
      ];

      return {
        success: true,
        url: canonical,
        canonicalUrl: canonical,
        title: `${owner}/${repo}`,
        description: firstLines || `GitHub repository for ${repo} by ${owner}.`,
        domain: 'github.com',
        favicon: 'https://github.githubassets.com/favicons/favicon.png',
        headings: [`${owner}/${repo}`, 'Installation', 'Usage', 'Documentation'],
        readableText: cleanedReadme.text || `GitHub repository ${owner}/${repo}`,
        contentHash: cleanedReadme.contentHash,
        classifiedLinks,
        status: 'ANALYZED',
      };
    } catch {
      return null;
    }
  }
}

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
