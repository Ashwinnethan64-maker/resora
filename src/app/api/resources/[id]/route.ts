import { NextRequest, NextResponse } from 'next/server';
import { ResourceService } from '@/lib/services/resource-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing resource id' }, { status: 400 });
    }

    const resource = await ResourceService.getResourceById(id);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const intel = await ResourceService.getIntelligence(id);
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
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing resource id' }, { status: 400 });
    }

    const success = await ResourceService.deleteResource(id);
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
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing resource id' }, { status: 400 });
    }

    const body = await req.json();
    const updated = await ResourceService.updateResource(id, body);
    return NextResponse.json({ success: true, resource: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update resource' },
      { status: 500 }
    );
  }
}
