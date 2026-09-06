import { NextRequest, NextResponse } from 'next/server';
import { ResourceService } from '@/lib/services/resource-service';
import { calculateProjectRecommendations } from '@/lib/projects/project-recommendations';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }

    const project = await ResourceService.getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const allResources = await ResourceService.getAllResources();
    const dismissedIds = await ResourceService.getDismissedRecommendations(id);

    const recommendations = calculateProjectRecommendations(project, allResources, dismissedIds);

    return NextResponse.json({
      projectId: id,
      recommendations,
      count: recommendations.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to calculate recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { resourceId } = await req.json();

    if (!id || !resourceId) {
      return NextResponse.json({ error: 'Missing project id or resource id' }, { status: 400 });
    }

    await ResourceService.dismissRecommendation(id, resourceId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to dismiss recommendation' },
      { status: 500 }
    );
  }
}
