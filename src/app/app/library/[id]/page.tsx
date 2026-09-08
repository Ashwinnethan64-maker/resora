'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import dynamic from 'next/dynamic';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceIntelligencePanel } from '@/components/resources/ResourceIntelligencePanel';
import { RESOURCE_TYPE_CONFIGS } from '@/lib/resource-types';
import { resolveResourceTarget } from '@/lib/resources/resolve-target';

const DocumentViewerModal = dynamic(
  () => import('@/components/documents/DocumentViewerModal').then((mod) => mod.DocumentViewerModal),
  { ssr: false }
);
import { NeoBadge, NeoSticker } from '@/components/brand/NeoSticker';
import { ResourceIntelligence, ResourceModel, DocumentModel, ProjectModel } from '@/types/database';
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Globe,
  Tag,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  Clock,
  Brain,
  Eye,
  Download,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    resources,
    toggleFavorite,
    archiveResource,
    openEditModal,
    openDeleteDialog,
    recordOpen,
    getIntelligence,
    analyzeResource,
    acceptSuggestedTag,
    dismissSuggestedTag,
    acceptSuggestedUseCase,
    dismissSuggestedUseCase,
    findRelatedResources,
    getCrossProjectUsage,
  } = useResora();

  const resourceId = params.id as string;
  const contextResource = resources.find((r) => r.id === resourceId);
  const [remoteResource, setRemoteResource] = useState<ResourceModel | null>(null);
  const [isFetchingResource, setIsFetchingResource] = useState(!contextResource);

  const resource = contextResource || remoteResource;

  const [intelligence, setIntelligence] = useState<ResourceIntelligence | null>(null);
  const [relatedResources, setRelatedResources] = useState<ResourceModel[]>([]);
  const [connectedProjects, setConnectedProjects] = useState<ProjectModel[]>([]);
  const [extractedSubResources, setExtractedSubResources] = useState<ResourceModel[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentModel | null>(null);

  useEffect(() => {
    if (!resourceId) return;

    // 1. If not found in context yet, fetch from server or local service
    if (!contextResource) {
      setIsFetchingResource(true);
      fetch(`/api/resources/${resourceId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then(async (data) => {
          if (data?.resource) {
            setRemoteResource(data.resource);
            if (data.intelligence) setIntelligence(data.intelligence);
            if (data.document) setDocumentMetadata(data.document);
            // Sync into client store
            const { ResourceService } = await import('@/lib/services/resource-service');
            await ResourceService.syncResource(data.resource);
            if (data.document) {
              await ResourceService.syncDocumentRecord(data.document);
            }
          } else {
            // Also check client ResourceService directly in case storage wasn't hydrated
            const { ResourceService } = await import('@/lib/services/resource-service');
            const local = await ResourceService.getResourceById(resourceId);
            if (local) setRemoteResource(local);
          }
        })
        .catch(() => {})
        .finally(() => setIsFetchingResource(false));
    }

    getIntelligence(resourceId).then((intel) => {
      if (intel) setIntelligence(intel);
    });
    findRelatedResources(resourceId, 3).then(setRelatedResources);
    getCrossProjectUsage(resourceId).then(setConnectedProjects);

    // Fetch child resources extracted from this source document
    fetch(`/api/resources?sourceDocumentId=${resourceId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        let items: ResourceModel[] = [];
        if (data?.resources && data.resources.length > 0) {
          items = data.resources;
        } else {
          // Fallback to local client store check
          const { ResourceService } = await import('@/lib/services/resource-service');
          items = await ResourceService.getResourcesBySourceDocumentId(resourceId);
        }
        // Deduplicate items by ID and normalized URL
        const seenIds = new Set<string>();
        const seenUrls = new Set<string>();
        const uniqueItems = items.filter((item) => {
          const urlKey = item.normalized_url || item.url;
          if (seenIds.has(item.id) || seenUrls.has(urlKey)) return false;
          seenIds.add(item.id);
          seenUrls.add(urlKey);
          return true;
        });
        setExtractedSubResources(uniqueItems);
      })
      .catch(async () => {
        const { ResourceService } = await import('@/lib/services/resource-service');
        const localChildren = await ResourceService.getResourcesBySourceDocumentId(resourceId);
        const seenIds = new Set<string>();
        const uniqueItems = localChildren.filter((item) => {
          if (seenIds.has(item.id)) return false;
          seenIds.add(item.id);
          return true;
        });
        setExtractedSubResources(uniqueItems);
      });

    fetch(`/api/documents/${resourceId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.document) setDocumentMetadata(data.document);
      })
      .catch(() => {});
  }, [resourceId, contextResource, getIntelligence, findRelatedResources, getCrossProjectUsage]);

  if (isFetchingResource) {
    return (
      <div className="p-12 max-w-4xl mx-auto space-y-4 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-black border-t-[#FFD93D] rounded-none mb-2" />
        <h2 className="text-xl font-black uppercase text-black">RETRIEVING DOSSIER...</h2>
        <p className="text-xs font-mono font-bold text-black/60">ACCESSING RESEARCH INDEX</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 text-center">
        <h2 className="text-3xl font-black uppercase text-black">RESOURCE NOT FOUND</h2>
        <p className="text-xs font-bold text-black/70">
          The requested research dossier is unavailable.
        </p>
        <Link
          href="/app/library"
          className="btn-neo inline-flex items-center gap-2 px-5 py-2.5 bg-white border-4 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO LIBRARY
        </Link>
      </div>
    );
  }

  const typeConfig = RESOURCE_TYPE_CONFIGS[resource.resource_type] || RESOURCE_TYPE_CONFIGS.website;
  const isDocumentType = resource.resource_type === 'pdf' || resource.resource_type === 'document' || !!resource.storage_path;

  const handleOpenResource = () => {
    recordOpen(resource.id);
  };

  const handleRunAnalysis = async (force = false) => {
    setIsAnalyzing(true);
    const updated = await analyzeResource(resource.id, force);
    if (updated) {
      setIntelligence(updated);
      findRelatedResources(resource.id, 3).then(setRelatedResources);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-100">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="btn-neo inline-flex items-center gap-2 px-4 py-2 bg-white border-4 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>BACK TO LIBRARY</span>
        </button>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="p-6 md:p-8 bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <NeoBadge label={typeConfig.label} type={resource.resource_type} />
              <span className="text-xs font-mono font-black text-black flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> {resource.domain}
              </span>
              {documentMetadata && (
                <NeoSticker color="yellow" size="sm">
                  {documentMetadata.page_count} PAGES · {(documentMetadata.file_size / 1024).toFixed(0)} KB
                </NeoSticker>
              )}
              {intelligence?.status === 'completed' && (
                <NeoSticker color="violet" size="sm" rotate="1">
                  SYNTHESIZED
                </NeoSticker>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-black leading-[0.9]">
              {resource.title}
            </h1>

            <p className="text-sm font-bold text-black/80 leading-relaxed max-w-3xl">
              {resource.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Favorite Action */}
            <button
              onClick={() => toggleFavorite(resource.id)}
              className={`p-3 rounded-none border-4 border-black transition-all ${
                resource.is_favorite
                  ? 'bg-[#FF6B6B] text-black shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-white text-black hover:bg-[#FFD93D]'
              }`}
              title={resource.is_favorite ? 'Favorited' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 stroke-[2.5] ${resource.is_favorite ? 'fill-black' : ''}`} />
            </button>

            {/* Edit Action */}
            <button
              onClick={() => openEditModal(resource)}
              className="p-3 rounded-none bg-white border-4 border-black text-black hover:bg-[#FFD93D] transition-colors"
              title="Edit resource"
            >
              <Edit2 className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Archive Action */}
            <button
              onClick={() => archiveResource(resource.id, !resource.is_archived)}
              className="p-3 rounded-none bg-white border-4 border-black text-black hover:bg-[#C4B5FD] transition-colors"
              title={resource.is_archived ? 'Unarchive resource' : 'Archive resource'}
            >
              {resource.is_archived ? <ArchiveRestore className="w-4 h-4 stroke-[2.5]" /> : <Archive className="w-4 h-4 stroke-[2.5]" />}
            </button>

            {/* Delete Action */}
            <button
              onClick={() => openDeleteDialog(resource)}
              className="p-3 rounded-none bg-white border-4 border-black text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-black transition-colors"
              title="Delete resource"
            >
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Ask Resora */}
            <Link
              href={`/app/assistant?scope=document&scopeId=${resource.id}`}
              className="btn-neo flex items-center gap-1.5 px-4 py-3 bg-[#FFD93D] hover:bg-[#ffe366] text-black border-4 border-black font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
            >
              <Sparkles className="w-4 h-4 stroke-[3]" />
              <span>QUERY AI</span>
            </Link>

            {/* Document Reader Trigger */}
            {isDocumentType && (
              <button
                onClick={() => setIsViewerOpen(true)}
                className="btn-neo flex items-center gap-1.5 px-4 py-3 bg-[#C4B5FD] text-black border-4 border-black font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
              >
                <Eye className="w-4 h-4 stroke-[3]" />
                <span>READER</span>
              </button>
            )}

            {/* Primary Action Button */}
            {(() => {
              const target = resolveResourceTarget(resource);
              if (target.type === 'internal_document') {
                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsViewerOpen(true)}
                      className="btn-neo flex items-center gap-2 px-5 py-3 bg-[#FFD93D] hover:bg-[#ffe366] text-black border-4 border-black font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
                    >
                      <Eye className="w-4 h-4 stroke-[3]" />
                      <span>READ DOCUMENT</span>
                    </button>
                    {target.downloadUrl && (
                      <a
                        href={target.downloadUrl}
                        download={resource.file_name || 'document'}
                        className="btn-neo flex items-center gap-2 px-4 py-3 bg-white hover:bg-[#C4B5FD] text-black border-4 border-black font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
                        title="Download Original"
                      >
                        <Download className="w-4 h-4 stroke-[3]" />
                        <span className="hidden sm:inline">DOWNLOAD</span>
                      </a>
                    )}
                  </div>
                );
              }
              return (
                <a
                  href={target.href}
                  target={target.isExternal ? '_blank' : undefined}
                  rel={target.isExternal ? 'noopener noreferrer' : undefined}
                  onClick={handleOpenResource}
                  className="btn-neo flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] hover:bg-[#ff5252] text-black border-4 border-black font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
                >
                  <span>{target.label}</span>
                  {target.isExternal && <ExternalLink className="w-4 h-4 stroke-[3]" />}
                </a>
              );
            })()}
          </div>
        </div>
      </div>

      {/* SECTION: RESORA INTELLIGENCE PANEL */}
      <ResourceIntelligencePanel
        intelligence={intelligence}
        onAnalyze={handleRunAnalysis}
        isAnalyzing={isAnalyzing}
        onAcceptTag={async (tag) => {
          await acceptSuggestedTag(resource.id, tag);
          const updated = await getIntelligence(resource.id);
          setIntelligence(updated);
        }}
        onDismissTag={async (tag) => {
          await dismissSuggestedTag(resource.id, tag);
          const updated = await getIntelligence(resource.id);
          setIntelligence(updated);
        }}
        onAcceptUseCase={async (useCase) => {
          await acceptSuggestedUseCase(resource.id, useCase);
          const updated = await getIntelligence(resource.id);
          setIntelligence(updated);
        }}
        onDismissUseCase={async (useCase) => {
          await dismissSuggestedUseCase(resource.id, useCase);
          const updated = await getIntelligence(resource.id);
          setIntelligence(updated);
        }}
      />

      {/* Metadata Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-black/60 font-black">
            RESOURCE TYPE
          </div>
          <div className="text-sm font-black uppercase text-black">{typeConfig.label}</div>
          <div className="text-xs text-black/70 font-mono font-bold">SOURCE: {resource.source_type}</div>
        </div>

        <div className="p-5 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-black/60 font-black">
            TIMESTAMP RECORD
          </div>
          <div className="text-sm font-black uppercase text-black">
            {new Date(resource.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="text-xs text-black/70 font-mono font-bold">
            {resource.last_opened_at
              ? `OPENED ${new Date(resource.last_opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'NOT OPENED YET'}
          </div>
        </div>

        <div className="p-5 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-black/60 font-black">
            ORIGIN DOMAIN
          </div>
          <div className="text-sm font-black uppercase text-black font-mono">{resource.domain}</div>
          <div className="text-xs text-black/70 truncate font-mono font-bold">{resource.url}</div>
        </div>
      </div>

      {/* Taxonomy: Tags & Use Cases */}
      <div className="p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-5">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 stroke-[3]" />
            ACTIVE TAXONOMY TAGS
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.tags && resource.tags.length > 0 ? (
              Array.from(new Set(resource.tags)).map((tag, idx) => (
                <span
                  key={`tag-${tag}-${idx}`}
                  className="px-3 py-1 bg-[#FFFDF5] text-black font-mono font-black text-xs border-2 border-black flex items-center gap-2 shadow-[2px_2px_0px_#000]"
                >
                  <span>#{tag}</span>
                  {resource.tag_sources?.[tag] === 'ai' && (
                    <span className="text-[9px] font-mono font-black bg-[#FFD93D] px-1 border border-black">AI</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs font-bold text-black/60 italic">No tags attached. Accept AI suggestions above or click Edit.</span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t-4 border-black">
          <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD93D] border-2 border-black" />
            ACTIVE USE CASES
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.use_cases && resource.use_cases.length > 0 ? (
              Array.from(new Set(resource.use_cases)).map((uc, idx) => (
                <span
                  key={`uc-${uc}-${idx}`}
                  className="px-3 py-1 bg-[#C4B5FD] text-black text-xs font-black uppercase border-2 border-black flex items-center gap-2 shadow-[2px_2px_0px_#000]"
                >
                  <span>{uc}</span>
                  {resource.use_case_sources?.[uc] === 'ai' && (
                    <span className="text-[9px] font-mono font-black bg-white px-1 border border-black">AI</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs font-bold text-black/60 italic">No use cases assigned.</span>
            )}
          </div>
        </div>
      </div>

      {/* Personal Notes */}
      <div className="p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
            <Clock className="w-4 h-4 stroke-[3]" />
            PERSONAL RESEARCH NOTE <span className="text-[10px] text-black/60 font-bold">(NEVER OVERWRITTEN BY AI)</span>
          </h3>
          <button
            onClick={() => openEditModal(resource)}
            className="btn-neo px-3 py-1 bg-[#FFD93D] border-2 border-black text-xs font-black uppercase tracking-wider"
          >
            EDIT NOTE
          </button>
        </div>
        <div className="p-4 bg-[#FFFDF5] border-2 border-black text-sm font-bold text-black leading-relaxed italic">
          {resource.personal_note
            ? `"${resource.personal_note}"`
            : '"No personal note recorded yet."'}
        </div>
      </div>

      {/* EXTRACTED RESOURCES (SOURCE DOCUMENT RELATIONSHIP) */}
      {extractedSubResources.length > 0 && (
        <div className="p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-4 border-black gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#FFD93D] border-2 border-black" />
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  EXTRACTED RESOURCES
                </h3>
                <span className="px-2 py-0.5 bg-[#C4B5FD] text-black border-2 border-black font-mono font-black text-xs">
                  {extractedSubResources.length} LINKS FOUND
                </span>
              </div>
              <p className="text-xs font-bold text-black/70 mt-1">
                Parsed from source document &quot;{resource.file_name || resource.title}&quot; into individual categorized dossiers.
              </p>
            </div>

            {/* Category counts overview */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(
                extractedSubResources.reduce((acc, r) => {
                  const cfg = RESOURCE_TYPE_CONFIGS[r.resource_type];
                  const label = cfg ? cfg.label.toUpperCase() : r.resource_type.toUpperCase();
                  acc[label] = (acc[label] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([label, count]) => (
                <span
                  key={label}
                  className="px-2 py-0.5 bg-[#FFFDF5] text-black border-2 border-black text-[10px] font-mono font-black shadow-[1.5px_1.5px_0px_#000]"
                >
                  [{label}] {count}
                </span>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {extractedSubResources.map((child, idx) => (
              <ResourceCard key={`${child.id}-${idx}`} resource={child} />
            ))}
          </div>
        </div>
      )}

      {/* Connected Project Workspaces */}
      <div className="p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
            <Layers className="w-4 h-4 stroke-[3]" />
            CONNECTED PROJECT WORKSPACES
          </h3>
          <span className="text-xs font-mono font-black text-black/60">
            {connectedProjects.length === 0
              ? 'NOT IN ANY PROJECT'
              : `LINKED TO ${connectedProjects.length} WORKSPACES`}
          </span>
        </div>

        {connectedProjects.length === 0 ? (
          <p className="text-xs font-bold text-black/60 italic">
            This resource is preserved globally in your central library and not linked to any active project workspace.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {connectedProjects.map((proj) => (
              <Link
                key={proj.id}
                href={`/app/projects/${proj.id}`}
                className="card-neo p-4 bg-[#FFFDF5] hover:bg-[#FFD93D] border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between group transition-all"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-black truncate">
                      {proj.name}
                    </span>
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 bg-white text-black border border-black uppercase">
                      {proj.project_type?.replace('_', ' ') || 'PROJECT'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-black/70 truncate mt-1">
                    {proj.objective || proj.description}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Related Resources */}
      {relatedResources.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b-4 border-black">
            <h3 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-3 h-3 bg-[#FF6B6B] border-2 border-black" />
              RELATED RESEARCH DOSSIERS
            </h3>
            <span className="text-xs font-mono font-black text-black/60 uppercase">TOPIC MATCH</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedResources.map((rel) => (
              <ResourceCard key={rel.id} resource={rel} />
            ))}
          </div>
        </div>
      )}

      {/* In-browser Document Viewer Modal */}
      {isViewerOpen && (
        <DocumentViewerModal
          resource={resource}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
}
