/**
 * RESORA Central URL Normalization Service
 * 
 * Safely canonicalizes URLs across all entry points (Manual Capture, Document
 * Link Extraction, Google Drive / Docs, API routes, and Bookmarklets).
 * 
 * Invariants:
 * - Lowercases scheme and hostname
 * - Removes default ports (:80, :443)
 * - Safely strips non-essential tracking parameters (utm_*, fbclid, gclid, etc.)
 * - Preserves meaningful query parameters (?id=, ?v=, ?q=, etc.)
 * - Strips trailing slashes from path (except single root '/')
 * - Canonicalizes Google Docs, Sheets, Slides, and Drive folders to standard resource URLs
 * - Preserves original URL alongside normalized URL
 */

export const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'ref_url',
  '_hsenc',
  '_hsmi',
  'yclid',
  'igshid',
]);

export interface NormalizedUrlResult {
  normalizedUrl: string;
  originalUrl: string;
  domain: string;
  isValid: boolean;
  isDriveDoc: boolean;
  driveDocType?: 'document' | 'spreadsheet' | 'presentation' | 'folder' | 'file';
  driveId?: string;
}

/**
 * Canonicalizes an input URL string safely without destructive loss of application state.
 */
export function normalizeCanonicalUrl(inputUrl: string): NormalizedUrlResult {
  const originalUrl = (inputUrl || '').trim();
  if (!originalUrl) {
    return {
      normalizedUrl: '',
      originalUrl: '',
      domain: '',
      isValid: false,
      isDriveDoc: false,
    };
  }

  let prepared = originalUrl;
  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(prepared)) {
    prepared = `https://${prepared}`;
  }

  try {
    const parsed = new URL(prepared);

    // 1. Lowercase protocol and hostname
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();

    // 2. Strip default ports
    if (
      (parsed.protocol === 'http:' && parsed.port === '80') ||
      (parsed.protocol === 'https:' && parsed.port === '443')
    ) {
      parsed.port = '';
    }

    // 3. Remove leading www. from domain
    const domain = parsed.hostname.replace(/^www\./, '');

    // 4. Strip known marketing/tracking parameters only
    const keysToRemove: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
        keysToRemove.push(key);
      }
    });
    for (const key of keysToRemove) {
      parsed.searchParams.delete(key);
    }

    // Sort query parameters deterministically to prevent ordering duplicates
    parsed.searchParams.sort();

    // 5. Special Canonicalization for Google Docs & Google Drive URLs
    let isDriveDoc = false;
    let driveDocType: 'document' | 'spreadsheet' | 'presentation' | 'folder' | 'file' | undefined;
    let driveId: string | undefined;

    if (domain === 'docs.google.com' || domain === 'drive.google.com') {
      isDriveDoc = true;

      // Google Docs: /document/d/{ID}/edit... -> https://docs.google.com/document/d/{ID}
      const docMatch = parsed.pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      if (docMatch) {
        driveDocType = 'document';
        driveId = docMatch[1];
        parsed.hostname = 'docs.google.com';
        parsed.pathname = `/document/d/${driveId}`;
        parsed.search = ''; // Strip edit/usp=sharing
        parsed.hash = '';
      }

      // Google Sheets: /spreadsheets/d/{ID}/edit... -> https://docs.google.com/spreadsheets/d/{ID}
      const sheetMatch = parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (sheetMatch) {
        driveDocType = 'spreadsheet';
        driveId = sheetMatch[1];
        parsed.hostname = 'docs.google.com';
        parsed.pathname = `/spreadsheets/d/${driveId}`;
        parsed.search = '';
        parsed.hash = '';
      }

      // Google Presentation: /presentation/d/{ID}/edit... -> https://docs.google.com/presentation/d/{ID}
      const presMatch = parsed.pathname.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      if (presMatch) {
        driveDocType = 'presentation';
        driveId = presMatch[1];
        parsed.hostname = 'docs.google.com';
        parsed.pathname = `/presentation/d/${driveId}`;
        parsed.search = '';
        parsed.hash = '';
      }

      // Google Drive Folder: /drive/folders/{ID} -> https://drive.google.com/drive/folders/{ID}
      const folderMatch = parsed.pathname.match(/\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
      if (folderMatch) {
        driveDocType = 'folder';
        driveId = folderMatch[1];
        parsed.hostname = 'drive.google.com';
        parsed.pathname = `/drive/folders/${driveId}`;
        parsed.search = '';
        parsed.hash = '';
      }

      // Google Drive File: /file/d/{ID}/view... -> https://drive.google.com/file/d/{ID}
      const fileMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch) {
        driveDocType = 'file';
        driveId = fileMatch[1];
        parsed.hostname = 'drive.google.com';
        parsed.pathname = `/file/d/${driveId}`;
        parsed.search = '';
        parsed.hash = '';
      }
    }

    // 6. Safe trailing slash removal for standard paths (not root '/')
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    // 7. Remove empty hash/fragment '#'
    if (parsed.hash === '#') {
      parsed.hash = '';
    }

    const normalizedUrl = parsed.toString();

    return {
      normalizedUrl,
      originalUrl,
      domain,
      isValid: true,
      isDriveDoc,
      driveDocType,
      driveId,
    };
  } catch {
    return {
      normalizedUrl: originalUrl,
      originalUrl,
      domain: originalUrl.split('/')[0].replace(/^www\./, ''),
      isValid: false,
      isDriveDoc: false,
    };
  }
}
