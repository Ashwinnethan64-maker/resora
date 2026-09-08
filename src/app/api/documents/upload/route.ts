import { NextRequest, NextResponse } from 'next/server';
import { extractDocumentContent, MAX_FILE_SIZE } from '@/lib/documents/document-extractor';
import { ResourceService } from '@/lib/services/resource-service';
import { getSupabaseServerClient } from '@/lib/supabase';
import { findDuplicateDocument } from '@/lib/resources/deduplicate';
import { importResourcesFromDocumentText } from '@/lib/resources/import-resources';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user with server-side token/session verification
    const authUser = getAuthenticatedUser(req);
    const authenticatedUserId = authUser?.id || 'usr_local';

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

    // 2. Check for duplicate content hash using Central Deduplication Engine
    if (!forceUpload) {
      const dupDoc = await findDuplicateDocument(extraction.contentHash);
      if (dupDoc.isDuplicate && dupDoc.document) {
        const existingDoc = dupDoc.document;
        // Check how many sub-resources were already indexed for this source document
        const existingLinks = await ResourceService.getResourcesBySourceDocumentId(existingDoc.resource_id);

        return NextResponse.json(
          {
            status: 'duplicate_document',
            duplicate: true,
            document_id: existingDoc.id,
            existingResourceId: existingDoc.resource_id,
            existingFileName: existingDoc.file_name,
            linkCount: existingLinks.length,
            message: `This file is already in your research archive. ${existingLinks.length > 0 ? `${existingLinks.length} links already indexed.` : ''}`,
          },
          { status: 409 }
        );
      }
    }

    // 3. Create Resource model for parent document
    const isPdf = fileName.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf';
    const resourceType = isPdf ? 'pdf' : 'document';
    const cleanTitle = fileName.replace(/\.[^/.]+$/, '');

    const resource = await ResourceService.createResource({
      user_id: authenticatedUserId,
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

    // 6. Intelligent Sub-Resource Import (In-file deduplication + database skip + new-only creation)
    const importSummary = await importResourcesFromDocumentText({
      documentText: extraction.fullText,
      sourceDocumentId: resource.id,
      sourceFileName: fileName,
      userId: resource.user_id,
    });

    // 7. Trigger asynchronous AI Intelligence analysis for parent doc
    if (extraction.fullText && extraction.fullText.length > 30) {
      (async () => {
        try {
          const { AIService } = await import('@/lib/ai/ai-service');
          AIService.analyzeResource({
            resource,
            rawContent: extraction.fullText,
          })
            .then((res) => ResourceService.saveIntelligence(res.intelligence, authenticatedUserId))
            .catch((err) => console.warn('[Upload] Background AI doc analysis notice:', err?.message));
        } catch (aiErr) {
          console.warn('[Upload] Background AI service notice:', aiErr);
        }
      })();
    }

    return NextResponse.json({
      status: 'import_complete',
      success: true,
      resource,
      document: doc,
      extractedResources: importSummary.newResources,
      existingResources: importSummary.existingResources,
      summary: {
        detected: importSummary.detected,
        created: importSummary.newResourcesCreated,
        duplicates: importSummary.duplicatesSkipped,
        sourceFileName: fileName,
      },
      message:
        importSummary.detected > 0
          ? `Indexed "${cleanTitle}": ${importSummary.newResourcesCreated} new resources created, ${importSummary.duplicatesSkipped} already in library.`
          : `Indexed "${cleanTitle}".`,
    });
  } catch (err: any) {
    console.error('Error in /api/documents/upload:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process document upload' },
      { status: 500 }
    );
  }
}
