import { NextRequest, NextResponse } from 'next/server';
import { ResourceService } from '@/lib/services/resource-service';
import { detectSourceAndType } from '@/lib/url-helper';
import { normalizeCanonicalUrl } from '@/lib/resources/normalize-url';
import { validateUrlForSsrf } from '@/lib/security/ssrf';

/**
 * RESORA Quick Capture REST API
 * Used by Browser Extensions, Bookmarklets, and Mobile Shortcuts.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    // For local resilience and production bearer token validation:
    // In production, verify authHeader with Supabase auth token
    const body = await req.json();
    const { url: rawUrl, title: userTitle, note, tags = [], use_cases = [] } = body;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json({ code: 'INVALID_REQUEST', error: 'Valid URL is required' }, { status: 400 });
    }

    const norm = normalizeCanonicalUrl(rawUrl);

    if (!norm.isValid) {
      return NextResponse.json({ code: 'INVALID_REQUEST', error: 'Invalid URL structure' }, { status: 400 });
    }

    const url = norm.normalizedUrl;
    const domain = norm.domain;

    // SSRF verification
    const ssrfCheck = validateUrlForSsrf(url);
    if (!ssrfCheck.isSafe) {
      return NextResponse.json({ code: 'FORBIDDEN', error: ssrfCheck.reason }, { status: 403 });
    }

    // Duplicate check using central canonical engine
    const existing = await ResourceService.checkDuplicate(url);
    if (existing) {
      return NextResponse.json(
        {
          status: 'duplicate',
          code: 'DUPLICATE',
          resource_id: existing.id,
          message: 'Resource already exists in your library',
          resource: existing,
        },
        { status: 200 }
      );
    }

    const { detectedType, detectedSource } = detectSourceAndType(url, domain);

    const resource = await ResourceService.createResource({
      title: userTitle || domain.replace(/\.[a-z]+$/i, ''),
      url,
      domain,
      resource_type: detectedType,
      source_type: detectedSource,
      personal_note: note || '',
      tags: tags.length > 0 ? tags : ['Web'],
      use_cases: use_cases.length > 0 ? use_cases : ['Research'],
      favicon_url: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      is_favorite: false,
      is_archived: false,
      is_inbox: true,
    });

    return NextResponse.json(
      {
        code: 'CREATED',
        message: 'Successfully saved to Resora library',
        resource,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', error: err?.message || 'Failed to capture resource' },
      { status: 500 }
    );
  }
}
