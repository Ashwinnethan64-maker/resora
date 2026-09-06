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

    const document = await ResourceService.getDocumentByResourceId(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const pages = await ResourceService.getDocumentPages(document.id);

    return NextResponse.json({
      document,
      pages,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch document' },
      { status: 500 }
    );
  }
}
