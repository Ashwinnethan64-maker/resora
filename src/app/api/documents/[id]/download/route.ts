import { NextRequest, NextResponse } from 'next/server';
import { ResourceService } from '@/lib/services/resource-service';
import { getSupabaseServerClient } from '@/lib/supabase';
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

    const doc = await ResourceService.getDocumentByResourceId(id);
    if (!doc || doc.user_id !== userId) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Try reading directly from Supabase private storage if configured
    const supabaseServer = getSupabaseServerClient();
    if (supabaseServer && doc.storage_path) {
      // storage_path format: documents/{userId}/{resourceId}/{fileName}
      const rawPath = doc.storage_path.startsWith('documents/')
        ? doc.storage_path.replace(/^documents\//, '')
        : doc.storage_path;

      const { data, error } = await supabaseServer.storage
        .from('documents')
        .download(rawPath);

      if (!error && data) {
        const buffer = Buffer.from(await data.arrayBuffer());
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': doc.mime_type || 'application/octet-stream',
            'Content-Disposition': `inline; filename="${doc.file_name}"`,
            'Cache-Control': 'private, max-age=3600',
          },
        });
      }
    }

    // Fallback: return extracted text if original binary is not in bucket
    if (doc.extracted_text) {
      return new NextResponse(doc.extracted_text, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `inline; filename="${doc.file_name || 'document.txt'}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Document content unavailable' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to download document' },
      { status: 500 }
    );
  }
}
