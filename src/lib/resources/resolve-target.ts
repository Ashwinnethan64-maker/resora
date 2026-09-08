import { ResourceModel } from '@/types/database';

export type TargetType = 'external' | 'internal_document' | 'download' | 'drive';

export interface ResolvedResourceTarget {
  type: TargetType;
  href: string;
  isExternal: boolean;
  label: string;
  downloadUrl?: string;
  readerUrl?: string;
}

export function sanitizeExternalUrl(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function resolveResourceTarget(resource: ResourceModel): ResolvedResourceTarget {
  const isDocType =
    resource.resource_type === 'pdf' ||
    resource.resource_type === 'document' ||
    Boolean(resource.storage_path) ||
    Boolean(resource.file_name);

  if (resource.storage_path || resource.file_name) {
    const downloadHref = `/api/documents/${encodeURIComponent(resource.id)}/download`;
    const readerHref = `/app/documents/${encodeURIComponent(resource.id)}`;

    return {
      type: 'internal_document',
      href: readerHref,
      isExternal: false,
      label: 'READ DOCUMENT',
      downloadUrl: downloadHref,
      readerUrl: readerHref,
    };
  }

  const lowerUrl = (resource.url || '').toLowerCase();
  const lowerDomain = (resource.domain || '').toLowerCase();
  if (
    lowerDomain.includes('drive.google.com') ||
    lowerDomain.includes('docs.google.com') ||
    lowerUrl.includes('drive.google.com') ||
    lowerUrl.includes('docs.google.com')
  ) {
    const validUrl = sanitizeExternalUrl(resource.url) || `https://${resource.domain || 'drive.google.com'}`;
    return {
      type: 'drive',
      href: validUrl,
      isExternal: true,
      label: 'OPEN IN DRIVE',
      readerUrl: `/app/library/${encodeURIComponent(resource.id)}`,
    };
  }

  if (isDocType) {
    const validUrl = sanitizeExternalUrl(resource.url);
    if (validUrl) {
      return {
        type: 'external',
        href: validUrl,
        isExternal: true,
        label: 'SOURCE LINK',
        readerUrl: `/app/library/${encodeURIComponent(resource.id)}`,
      };
    }
    return {
      type: 'internal_document',
      href: `/app/documents/${encodeURIComponent(resource.id)}`,
      isExternal: false,
      label: 'READ DOCUMENT',
    };
  }

  const validExternalUrl = sanitizeExternalUrl(resource.url);
  if (validExternalUrl) {
    return {
      type: 'external',
      href: validExternalUrl,
      isExternal: true,
      label: 'SOURCE LINK',
    };
  }

  if (resource.domain && !resource.domain.includes('/')) {
    return {
      type: 'external',
      href: `https://${resource.domain}`,
      isExternal: true,
      label: 'SOURCE LINK',
    };
  }

  return {
    type: 'internal_document',
    href: `/app/library/${encodeURIComponent(resource.id)}`,
    isExternal: false,
    label: 'VIEW DOSSIER',
  };
}
