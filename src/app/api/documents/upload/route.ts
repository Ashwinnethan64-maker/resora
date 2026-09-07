import { NextRequest, NextResponse } from 'next/server';
import { extractDocumentContent, MAX_FILE_SIZE } from '@/lib/documents/document-extractor';
import { ResourceService } from '@/lib/services/resource-service';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const forceUpload = formData.get('force') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 25MB` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name;
    const mimeType = file.type || 'application/octet-stream';

    // 1. Extract content and compute hash
    const extraction = await extractDocumentContent(buffer, fileName, mimeType);

    if (!extraction.isSupported) {
      return NextResponse.json(
        { error: extraction.errorMessage || 'File type not supported yet. Please upload PDF, TXT, or Markdown.' },
        { status: 415 }
      );
    }

    // 2. Check for duplicate content hash
    if (!forceUpload) {
      const existingDoc = await ResourceService.getDocumentByHash(extraction.contentHash);
      if (existingDoc) {
        return NextResponse.json(
          {
            duplicate: true,
            existingResourceId: existingDoc.resource_id,
            existingFileName: existingDoc.file_name,
            message: `This document already exists in your library as "${existingDoc.file_name}".`,
          },
          { status: 409 }
        );
      }
    }

    // 3. Create Resource model
    const isPdf = fileName.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf';
    const resourceType = isPdf ? 'pdf' : 'document';
    const cleanTitle = fileName.replace(/\.[^/.]+$/, '');

    const resource = await ResourceService.createResource({
      title: cleanTitle,
      url: `/documents/${fileName}`,
      domain: 'documents.local',
      description: extraction.fullText.slice(0, 180) + '...',
      resource_type: resourceType,
      source_type: 'upload',
      content: extraction.fullText,
      file_name: fileName,
      file_size: file.size,
      page_count: extraction.pageCount,
      mime_type: mimeType,
      is_favorite: false,
      is_archived: false,
      is_inbox: false,
      tags: isPdf ? ['PDF', 'Research'] : ['Document', 'Notes'],
      use_cases: ['Research', 'Learn'],
    });

    // 4. Upload raw file buffer to Supabase private storage bucket if configured
    const storagePath = `${resource.user_id}/${resource.id}/${fileName}`;
    try {
      const supabaseServer = getSupabaseServerClient();
      if (supabaseServer) {
        const { error: uploadError } = await supabaseServer.storage
          .from('documents')
          .upload(storagePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });
        if (uploadError) {
          console.warn('[Storage] Supabase bucket upload notice:', uploadError.message);
        }
      }
    } catch (storageErr) {
      console.warn('[Storage] Supabase storage upload exception:', storageErr);
    }

    // 5. Save Document & Document Pages record
    const doc = await ResourceService.saveDocumentRecord({
      resource_id: resource.id,
      user_id: resource.user_id,
      file_name: fileName,
      file_size: file.size,
      mime_type: mimeType,
      storage_path: `documents/${storagePath}`,
      page_count: extraction.pageCount,
      extraction_status: extraction.status,
      extracted_text: extraction.fullText,
      content_hash: extraction.contentHash,
      pages: extraction.pages,
    });

    // 5. Trigger asynchronous AI Intelligence analysis
    if (extraction.fullText && extraction.fullText.length > 30) {
      setTimeout(() => {
        fetch('http://127.0.0.1:3000/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceId: resource.id }),
        }).catch((err) => console.warn('Background AI document analysis trigger failed:', err));
      }, 50);
    }

    return NextResponse.json({
      success: true,
      resource,
      document: doc,
    });
  } catch (err: any) {
    console.error('Error in /api/documents/upload:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process document upload' },
      { status: 500 }
    );
  }
}
