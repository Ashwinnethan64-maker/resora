import { NextRequest, NextResponse } from 'next/server';
import { ResourceService } from '@/lib/services/resource-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isArchived = searchParams.has('isArchived') ? searchParams.get('isArchived') === 'true' : undefined;
    const isInbox = searchParams.has('isInbox') ? searchParams.get('isInbox') === 'true' : undefined;
    const isFavorite = searchParams.has('isFavorite') ? searchParams.get('isFavorite') === 'true' : undefined;
    const resourceType = searchParams.get('type') || undefined;
    const sourceDocumentId = searchParams.get('sourceDocumentId') || undefined;
    const query = searchParams.get('q') || undefined;

    let resources = await ResourceService.queryResources({
      isArchived,
      isInbox,
      isFavorite,
      resourceType: resourceType as any,
      query,
    });

    if (sourceDocumentId) {
      resources = resources.filter((r) => r.source_document_id === sourceDocumentId);
    }

    return NextResponse.json({ resources });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to list resources' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.url && !body.original_url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const { normalizeCanonicalUrl } = await import('@/lib/resources/normalize-url');
    const norm = normalizeCanonicalUrl(body.url || body.original_url);
    if (!norm.isValid) {
      return NextResponse.json({ error: 'Invalid URL structure' }, { status: 400 });
    }

    // Check duplicate
    const existing = await ResourceService.checkDuplicate(norm.normalizedUrl);
    if (existing) {
      return NextResponse.json(
        {
          status: 'duplicate',
          resource_id: existing.id,
          message: 'Resource already exists in your library',
          resource: existing,
        },
        { status: 200 }
      );
    }

    const resource = await ResourceService.createResource({
      title: body.title || norm.domain,
      url: norm.normalizedUrl,
      original_url: body.original_url || body.url,
      normalized_url: norm.normalizedUrl,
      domain: norm.domain,
      description: body.description || '',
      resource_type: body.resource_type || (norm.isDriveDoc ? 'document' : 'website'),
      source_type: body.source_type || 'manual',
      tags: body.tags || ['Web'],
      use_cases: body.use_cases || ['Research'],
      personal_note: body.personal_note || '',
      is_favorite: body.is_favorite || false,
      is_inbox: body.is_inbox !== undefined ? body.is_inbox : false,
      is_archived: false,
    });

    return NextResponse.json({ status: 'created', resource_id: resource.id, resource }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to create resource' },
      { status: 500 }
    );
  }
}
