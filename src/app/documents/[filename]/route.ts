import { NextRequest, NextResponse } from 'next/server';
import { ResourceService } from '@/lib/services/resource-service';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename) {
      return NextResponse.json({ error: 'Filename missing' }, { status: 400 });
    }

    const decodedFileName = decodeURIComponent(filename);

    // 1. Look up document by file_name or resource url match
    const allResources = await ResourceService.getAllResources();
    const matchingResource = allResources.find(
      (r) =>
        r.file_name === decodedFileName ||
        r.url === `/documents/${filename}` ||
        r.url === `/documents/${decodedFileName}`
    );

    if (matchingResource) {
      const doc = await ResourceService.getDocumentByResourceId(matchingResource.id);
      if (doc) {
        // Try reading from Supabase private storage if bucket configured
        const supabaseServer = getSupabaseServerClient();
        if (supabaseServer && doc.storage_path) {
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

        // Fallback: return extracted text
        if (doc.extracted_text) {
          return new NextResponse(doc.extracted_text, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Content-Disposition': `inline; filename="${doc.file_name || 'document.txt'}"`,
            },
          });
        }
      }

      if (matchingResource.content) {
        return new NextResponse(matchingResource.content, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `inline; filename="${matchingResource.file_name || 'document.txt'}"`,
          },
        });
      }
    }

    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  } catch (err: any) {
    console.error('Error serving document file:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve document' },
      { status: 500 }
    );
  }
}
