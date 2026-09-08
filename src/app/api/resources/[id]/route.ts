import { NextRequest, NextResponse } from 'next/server';
import { ResourceService } from '@/lib/services/resource-service';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_local';

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing resource id' }, { status: 400 });
    }

    const resource = await ResourceService.getResourceById(id, userId);
    if (!resource || resource.user_id !== userId) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const intel = await ResourceService.getIntelligence(id, userId);
    const doc = await ResourceService.getDocumentByResourceId(id);

    return NextResponse.json({
      resource,
      intelligence: intel,
      document: doc,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to get resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_local';

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing resource id' }, { status: 400 });
    }

    const resource = await ResourceService.getResourceById(id, userId);
    if (!resource || resource.user_id !== userId) {
      return NextResponse.json({ error: 'Resource not found or unauthorized' }, { status: 404 });
    }

    const success = await ResourceService.deleteResource(id, userId);
    return NextResponse.json({ success, id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to delete resource' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_local';

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing resource id' }, { status: 400 });
    }

    const resource = await ResourceService.getResourceById(id, userId);
    if (!resource || resource.user_id !== userId) {
      return NextResponse.json({ error: 'Resource not found or unauthorized' }, { status: 404 });
    }

    const body = await req.json();
    const updated = await ResourceService.updateResource(id, body, userId);
    return NextResponse.json({ success: true, resource: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update resource' },
      { status: 500 }
    );
  }
}
