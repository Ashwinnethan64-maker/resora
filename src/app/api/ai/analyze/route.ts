import { NextRequest, NextResponse } from 'next/server';
import { ResourceService } from '@/lib/services/resource-service';
import { AIService } from '@/lib/ai/ai-service';
import { WebFetcher } from '@/lib/ai/web-fetcher';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_local';

    const body = await req.json();
    const resourceId = body.resourceId;
    const forceReanalyze = Boolean(body.force);
    const providedResource = body.resource;

    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
    }

    // 1. Resolve resource by ID (partitioned by userId, then fallback to global/usr_local, then body.resource)
    let resource = await ResourceService.getResourceById(resourceId, userId);
    if (!resource && userId !== 'usr_local') {
      resource = await ResourceService.getResourceById(resourceId, 'usr_local');
    }
    if (!resource && providedResource && providedResource.id === resourceId) {
      resource = providedResource;
    }

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Sync into server cache for future requests
    await ResourceService.syncResource(resource);

    // Ensure resource has user_id populated
    if (!resource.user_id) {
      resource.user_id = userId;
    }

    // 2. Check existing intelligence unless forced
    const existing = await ResourceService.getIntelligence(resourceId, userId) ||
                     (userId !== 'usr_local' ? await ResourceService.getIntelligence(resourceId, 'usr_local') : null);
    if (existing && existing.status === 'completed' && !forceReanalyze) {
      return NextResponse.json({ intelligence: existing, cached: true });
    }

    // 3. Resolve raw content (from resource, document model, web extraction, or body)
    let contentToAnalyze = resource.content || body.rawContent || '';
    if (!contentToAnalyze || contentToAnalyze.length < 50) {
      const doc = await ResourceService.getDocumentByResourceId(resourceId);
      if (doc?.extracted_text) {
        contentToAnalyze = doc.extracted_text;
      }
    }

    // If still empty and valid URL exists, run server-side safe WebFetcher
    if ((!contentToAnalyze || contentToAnalyze.length < 50) && resource.url && (resource.url.startsWith('http://') || resource.url.startsWith('https://'))) {
      try {
        const webData = await WebFetcher.extractFromUrl(resource.url);
        if (webData.success && webData.readableText) {
          contentToAnalyze = webData.readableText;
          // Enrich resource metadata if description was missing
          if (!resource.description && webData.description) {
            resource.description = webData.description;
            await ResourceService.updateResource(resource.id, { description: webData.description }, userId);
          }
        }
      } catch (fetchErr) {
        console.warn('WebFetcher extraction failed for resource URL:', fetchErr);
      }
    }

    // 4. Run AI Service with NVIDIA Nemotron (or deterministic heuristic fallback)
    const analysis = await AIService.analyzeResource({
      resource,
      rawContent: contentToAnalyze,
      forceReanalyze,
    });

    // 5. Save intelligence partitioned for authenticated user
    const saved = await ResourceService.saveIntelligence(analysis.intelligence, userId);

    return NextResponse.json({
      intelligence: saved,
      model: analysis.model,
      cached: false,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/analyze:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to analyze resource' },
      { status: 500 }
    );
  }
}
