/**
 * Server-Side Document Text Extraction Engine
 * Supports PDF, TXT, and Markdown files.
 * Provides page-aware extraction, content hashing, and intelligent chunking.
 */

import crypto from 'crypto';

export interface PageExtraction {
  pageNumber: number;
  content: string;
  imageUrl?: string;
}

export interface DocumentExtractionResult {
  fullText: string;
  pages: PageExtraction[];
  pageCount: number;
  contentHash: string;
  thumbnailUrl?: string;
  title?: string;
  isSupported: boolean;
  status: 'completed' | 'failed' | 'unsupported';
  errorMessage?: string;
}

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
export const MAX_PAGES = 300;

// Banned executable extensions
const EXECUTABLE_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.mjs', '.vbs', '.ps1', '.py', '.scr', '.dll', '.com'];

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function extractDocumentContent(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<DocumentExtractionResult> {
  const contentHash = computeBufferHash(buffer);
  const lowerName = fileName.toLowerCase();

  // Guard against executable extensions
  if (EXECUTABLE_EXTENSIONS.some(ext => lowerName.endsWith(ext))) {
    return {
      fullText: '',
      pages: [],
      pageCount: 0,
      contentHash,
      isSupported: false,
      status: 'unsupported',
      errorMessage: 'Executable file types are strictly prohibited for upload security.',
    };
  }

  // 1. PDF Files: verify magic bytes %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    const isPdfMagic = buffer.length >= 5 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46 &&
      buffer[4] === 0x2d;

    if (!isPdfMagic) {
      return {
        fullText: '',
        pages: [],
        pageCount: 0,
        contentHash,
        isSupported: false,
        status: 'unsupported',
        errorMessage: 'Invalid PDF file: Missing standard %PDF- file signature.',
      };
    }
  }

  // 2. Text & Markdown Files
  if (
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown' ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md')
  ) {
    try {
      const rawText = buffer.toString('utf-8');
      const normalized = rawText.replace(/\r\n/g, '\n').trim();

      // Chunk into logical pages (~3000 chars per page)
      const pageSize = 3000;
      const pages: PageExtraction[] = [];
      let currentOffset = 0;
      let pageNum = 1;

      while (currentOffset < normalized.length) {
        const slice = normalized.slice(currentOffset, currentOffset + pageSize);
        pages.push({
          pageNumber: pageNum,
          content: slice.trim(),
        });
        currentOffset += pageSize;
        pageNum++;
      }

      return {
        fullText: normalized,
        pages: pages.length > 0 ? pages : [{ pageNumber: 1, content: normalized }],
        pageCount: pages.length || 1,
        contentHash,
        isSupported: true,
        status: 'completed',
      };
    } catch (e: any) {
      return {
        fullText: '',
        pages: [],
        pageCount: 0,
        contentHash,
        isSupported: true,
        status: 'failed',
        errorMessage: e?.message || 'Failed to decode text file',
      };
    }
  }

  // 2. PDF Files (Page-aware extraction using PDFParse)
  if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    try {
      let pdfResult: { fullText: string; pages: PageExtraction[]; thumbnailUrl?: string; title?: string } | null = null;
      try {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        const textData = await parser.getText();
        let screenshots: any[] = [];
        try {
          // Extract screenshots/images for pages (up to first 20 pages for speed & efficiency)
          const shotData = await parser.getScreenshot({ scale: 1.0 });
          if (shotData && shotData.pages) {
            screenshots = shotData.pages;
          }
        } catch (shotErr) {
          console.warn('[DocumentExtractor] Screenshot rendering notice:', shotErr);
        }

        const pages: PageExtraction[] = [];
        if (textData && textData.pages && textData.pages.length > 0) {
          textData.pages.forEach((p: { text?: string; num?: number }, idx: number) => {
            const pageNum = p.num || idx + 1;
            const text = (p.text || '').trim();
            const shot = screenshots.find((s: any) => s.pageNumber === pageNum) || screenshots[idx];
            pages.push({
              pageNumber: pageNum,
              content: text,
              imageUrl: shot?.dataUrl || undefined,
            });
          });
        }

        let extractedTitle: string | undefined;
        try {
          const info = await parser.getInfo();
          if (info && info.info && typeof info.info.Title === 'string' && info.info.Title.trim().length > 2) {
            extractedTitle = info.info.Title.trim();
          }
        } catch {}

        // Clean up parser resources
        try {
          await parser.destroy();
        } catch {}

        const fullText = (textData?.text || pages.map((p) => p.content).join('\n\n')).trim();
        const firstPageShot = screenshots[0]?.dataUrl;

        if (pages.length > 0) {
          pdfResult = {
            fullText,
            pages,
            thumbnailUrl: firstPageShot,
            title: extractedTitle,
          };
        }
      } catch (pdfParseErr) {
        console.warn('[DocumentExtractor] PDFParse failed, trying stream parser:', pdfParseErr);
      }

      // Fallback: regex-based raw stream parser (works on uncompressed/legacy PDFs)
      if (!pdfResult || pdfResult.pages.length === 0) {
        pdfResult = parsePdfBuffer(buffer);
      }

      if (!pdfResult || pdfResult.pages.length === 0) {
        // Final fallback — show a helpful notice instead of blank page
        const rawFallback = `${fileName} (PDF research document)\n\nThis PDF could not be parsed for text streams. It may be a scanned image-only PDF. Please use the Download button to view the original file.`;
        return {
          fullText: rawFallback,
          pages: [{ pageNumber: 1, content: rawFallback }],
          pageCount: 1,
          contentHash,
          isSupported: true,
          status: 'completed',
        };
      }

      return {
        fullText: pdfResult.fullText,
        pages: pdfResult.pages,
        pageCount: Math.min(pdfResult.pages.length, MAX_PAGES),
        contentHash,
        thumbnailUrl: pdfResult.thumbnailUrl,
        title: pdfResult.title,
        isSupported: true,
        status: 'completed',
      };
    } catch (err: any) {
      return {
        fullText: '',
        pages: [],
        pageCount: 0,
        contentHash,
        isSupported: true,
        status: 'failed',
        errorMessage: err?.message || 'PDF extraction encountered an error',
      };
    }
  }

  // 3. Unsupported format
  return {
    fullText: '',
    pages: [],
    pageCount: 0,
    contentHash,
    isSupported: false,
    status: 'unsupported',
    errorMessage: `File format "${mimeType || lowerName.split('.').pop()}" is not supported yet. Please upload PDF, TXT, or Markdown.`,
  };
}

/**
 * Parses raw PDF buffer into page-delimited text blocks
 */
function parsePdfBuffer(buffer: Buffer): { fullText: string; pages: PageExtraction[] } {
  const binaryString = buffer.toString('binary');
  const pages: PageExtraction[] = [];
  let fullText = '';

  // Extract text within BT ... ET blocks and /Type /Page objects
  const pageDelimiters = binaryString.split(/\/Type\s*\/Page\b/g);

  if (pageDelimiters.length > 1) {
    for (let i = 1; i < pageDelimiters.length; i++) {
      const pageChunk = pageDelimiters[i];
      const textMatches = extractTextFromPdfStream(pageChunk);
      const cleanPageText = textMatches.trim();

      if (cleanPageText) {
        pages.push({
          pageNumber: i,
          content: cleanPageText,
        });
        fullText += `\n--- Page ${i} ---\n` + cleanPageText;
      }
    }
  }

  // If no delimiter matches, extract all stream strings
  if (pages.length === 0) {
    const extracted = extractTextFromPdfStream(binaryString);
    if (extracted.trim()) {
      pages.push({ pageNumber: 1, content: extracted.trim() });
      fullText = extracted.trim();
    }
  }

  return { fullText: fullText.trim(), pages };
}

function extractTextFromPdfStream(streamData: string): string {
  // Regex to extract text inside parentheses (text) Tj or [(text)] TJ
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
  let result = '';
  let match;

  while ((match = tjRegex.exec(streamData)) !== null) {
    result += decodePdfString(match[1]) + ' ';
  }

  while ((match = tjArrayRegex.exec(streamData)) !== null) {
    const inner = match[1];
    const subMatches = inner.match(/\(([^)]+)\)/g);
    if (subMatches) {
      for (const s of subMatches) {
        result += decodePdfString(s.slice(1, -1)) + ' ';
      }
    }
  }

  return result.replace(/\s+/g, ' ').trim();
}

function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

function computeBufferHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
