import { NextRequest, NextResponse } from 'next/server';
import { normalizeUrl, detectSourceAndType } from '@/lib/url-helper';
import { validateUrlForSsrf } from '@/lib/security/ssrf';
import { ExtractedMetadata } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body.url;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json({ code: 'INVALID_REQUEST', error: 'Valid URL is required' }, { status: 400 });
    }

    const { url, domain, isValid } = normalizeUrl(rawUrl);

    if (!isValid) {
      return NextResponse.json({ code: 'INVALID_REQUEST', error: 'Invalid URL structure' }, { status: 400 });
    }

    // SSRF Firewall validation
    const ssrfCheck = validateUrlForSsrf(url);
    if (!ssrfCheck.isSafe) {
      return NextResponse.json({ code: 'FORBIDDEN', error: ssrfCheck.reason }, { status: 403 });
    }

    const { detectedType, detectedSource } = detectSourceAndType(url, domain);

    const metadata: ExtractedMetadata = {
      domain,
      canonicalUrl: url,
      detectedType,
      detectedSource,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    };

    // Attempt server-side fetch with tight timeout and redirect SSRF verification
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ResoraBot/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      // Verify redirect target URL is safe as well
      if (response.url && response.url !== url) {
        const redirectCheck = validateUrlForSsrf(response.url);
        if (!redirectCheck.isSafe) {
          throw new Error('Redirected to prohibited destination');
        }
      }

      if (response.ok) {
        const html = await response.text();

        // Extract Title (<title> or og:title)
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          metadata.title = decodeHtmlEntities(ogTitleMatch[1].trim());
        } else if (titleMatch && titleMatch[1]) {
          metadata.title = decodeHtmlEntities(titleMatch[1].trim());
        }

        // Extract Description (description or og:description)
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
        if (ogDescMatch && ogDescMatch[1]) {
          metadata.description = decodeHtmlEntities(ogDescMatch[1].trim());
        } else if (descMatch && descMatch[1]) {
          metadata.description = decodeHtmlEntities(descMatch[1].trim());
        }

        // Extract Image (og:image)
        const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
        if (ogImgMatch && ogImgMatch[1]) {
          let img = ogImgMatch[1].trim();
          if (img.startsWith('//')) img = `https:${img}`;
          else if (img.startsWith('/')) img = `https://${domain}${img}`;
          metadata.image = img;
        }
      }
    } catch {
      // Graceful fallback if website blocks scraping, times out, or throws CORS/SSL error
    }

    // Default title fallback if none extracted
    if (!metadata.title) {
      // Clean domain capitalized as title
      metadata.title = domain
        .replace(/\.[a-z]+$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    return NextResponse.json(metadata);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to extract metadata' },
      { status: 500 }
    );
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
