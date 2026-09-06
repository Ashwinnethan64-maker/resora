import { NextRequest, NextResponse } from 'next/server';
import { ResourceService } from '@/lib/services/resource-service';
import { AIService } from '@/lib/ai/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resourceId = body.resourceId;
    const forceReanalyze = Boolean(body.force);

    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
    }

    const resource = await ResourceService.getResourceById(resourceId);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check existing intelligence unless forced
    const existing = await ResourceService.getIntelligence(resourceId);
    if (existing && existing.status === 'completed' && !forceReanalyze) {
      return NextResponse.json({ intelligence: existing, cached: true });
    }

    // Run AI Service
    const analysis = await AIService.analyzeResource({
      resource,
      rawContent: resource.content,
      forceReanalyze,
    });

    // Save intelligence
    const saved = await ResourceService.saveIntelligence(analysis.intelligence);

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
