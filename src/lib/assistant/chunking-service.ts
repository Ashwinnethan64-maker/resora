import { ResourceModel, DocumentModel, DocumentPageModel, ResourceChunkModel, DocumentChunkModel } from '@/types/database';

/**
 * Clean chunking service for documents and web resources.
 * Preserves page numbers, headers, and section boundaries without arbitrary breaks.
 */
export class ChunkingService {
  /**
   * Chunks a web resource or note by paragraphs / semantic sections
   */
  static chunkResource(resource: ResourceModel, maxChunkLength = 800): Omit<ResourceChunkModel, 'id' | 'created_at'>[] {
    const rawText = resource.content || resource.description || '';
    if (!rawText.trim()) {
      return [
        {
          resource_id: resource.id,
          user_id: resource.user_id,
          chunk_index: 0,
          content: `${resource.title}: ${resource.description || 'No content provided.'}`,
        },
      ];
    }

    const sections = rawText.split(/\n\s*\n/);
    const chunks: Omit<ResourceChunkModel, 'id' | 'created_at'>[] = [];
    let currentBuffer = '';
    let chunkIndex = 0;

    for (const sec of sections) {
      const trimmed = sec.trim();
      if (!trimmed) continue;

      if ((currentBuffer + '\n\n' + trimmed).length > maxChunkLength && currentBuffer) {
        chunks.push({
          resource_id: resource.id,
          user_id: resource.user_id,
          chunk_index: chunkIndex++,
          content: currentBuffer.trim(),
        });
        currentBuffer = trimmed;
      } else {
        currentBuffer = currentBuffer ? `${currentBuffer}\n\n${trimmed}` : trimmed;
      }
    }

    if (currentBuffer.trim()) {
      chunks.push({
        resource_id: resource.id,
        user_id: resource.user_id,
        chunk_index: chunkIndex++,
        content: currentBuffer.trim(),
      });
    }

    return chunks;
  }

  /**
   * Chunks document pages, strictly preserving page numbers and section headers
   */
  static chunkDocumentPages(
    documentId: string,
    userId: string,
    pages: DocumentPageModel[],
    maxChunkLength = 900
  ): Omit<DocumentChunkModel, 'id' | 'created_at'>[] {
    const chunks: Omit<DocumentChunkModel, 'id' | 'created_at'>[] = [];
    let globalIndex = 0;

    for (const page of pages) {
      const pageText = page.content.trim();
      if (!pageText) continue;

      // Extract section heading if present
      const firstLine = pageText.split('\n')[0].replace(/^#+\s*/, '').trim();
      const heading = firstLine.length < 60 ? firstLine : undefined;

      const paragraphs = pageText.split(/\n\s*\n/);
      let pageBuffer = '';

      for (const p of paragraphs) {
        const trimmed = p.trim();
        if (!trimmed) continue;

        if ((pageBuffer + '\n\n' + trimmed).length > maxChunkLength && pageBuffer) {
          chunks.push({
            document_id: documentId,
            user_id: userId,
            page_number: page.page_number,
            chunk_index: globalIndex++,
            heading,
            content: pageBuffer.trim(),
          });
          pageBuffer = trimmed;
        } else {
          pageBuffer = pageBuffer ? `${pageBuffer}\n\n${trimmed}` : trimmed;
        }
      }

      if (pageBuffer.trim()) {
        chunks.push({
          document_id: documentId,
          user_id: userId,
          page_number: page.page_number,
          chunk_index: globalIndex++,
          heading,
          content: pageBuffer.trim(),
        });
      }
    }

    return chunks;
  }
}
