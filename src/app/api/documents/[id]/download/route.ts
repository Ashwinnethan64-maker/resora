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
    const resource = await ResourceService.getResource(id);

    // Verify ownership (allow usr_local / guest if same or matching resource)
    if (doc && doc.user_id !== userId && doc.user_id !== 'usr_local' && userId !== 'usr_local') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const fileName = doc?.file_name || resource?.file_name || 'document.pdf';
    const mimeType = doc?.mime_type || resource?.mime_type || (fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

    // 1. Check local disk upload directory
    try {
      const fs = await import('fs');
      const path = await import('path');
      const localFilePath = path.join(process.cwd(), 'public', 'uploads', 'documents', id, fileName);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Cache-Control': 'private, max-age=3600',
          },
        });
      }
    } catch (fsErr) {
      console.warn('[Download] Local file read notice:', fsErr);
    }

    // 2. Try reading directly from Supabase private storage if configured
    const supabaseServer = getSupabaseServerClient();
    if (supabaseServer && doc?.storage_path) {
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
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Cache-Control': 'private, max-age=3600',
          },
        });
      }
    }

    // 3. Fallback: return extracted text if original binary is not on disk or bucket
    const textContent = doc?.extracted_text || resource?.content;
    if (textContent) {
      const isPlainDoc = fileName.endsWith('.txt') || fileName.endsWith('.md');
      const fallbackName = isPlainDoc ? fileName : `${fileName.replace(/\.[^/.]+$/, '')}.txt`;
      return new NextResponse(textContent, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fallbackName}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Document content unavailable for download' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to download document' },
      { status: 500 }
    );
  }
}
