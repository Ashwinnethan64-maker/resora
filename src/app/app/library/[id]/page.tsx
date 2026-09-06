'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceIntelligencePanel } from '@/components/resources/ResourceIntelligencePanel';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { RESOURCE_TYPE_CONFIGS } from '@/lib/resource-types';
import { ResourceIntelligence, ResourceModel, DocumentModel, ProjectModel } from '@/types/database';
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Globe,
  Tag,
  Sparkles,
  Link2,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  Clock,
  Brain,
  FileText,
  Eye,
  Download,
  Layers
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
    showToast,
    getCrossProjectUsage,
  } = useResora();

  const resourceId = params.id as string;
  const resource = resources.find((r) => r.id === resourceId);

  const [intelligence, setIntelligence] = useState<ResourceIntelligence | null>(null);
  const [relatedResources, setRelatedResources] = useState<ResourceModel[]>([]);
  const [connectedProjects, setConnectedProjects] = useState<ProjectModel[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentModel | null>(null);

  // Load intelligence & related resources & document details
  useEffect(() => {
    if (resourceId) {
      getIntelligence(resourceId).then(setIntelligence);
      findRelatedResources(resourceId, 3).then(setRelatedResources);
      getCrossProjectUsage(resourceId).then(setConnectedProjects);

      if (resource?.resource_type === 'pdf' || resource?.resource_type === 'document') {
        fetch(`/api/documents/${resourceId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.document) setDocumentMetadata(data.document);
          })
          .catch(() => {});
      }
    }
  }, [resourceId, getIntelligence, findRelatedResources, resource?.resource_type]);

  if (!resource) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 text-center">
        <h2 className="text-xl font-bold text-slate-200">Resource not found</h2>
        <p className="text-xs text-slate-400">
          The requested resource may have been deleted or archived.
        </p>
        <Link
          href="/app/library"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
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
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="p-6 rounded-2xl bg-[#11131d] border border-[#1f2434] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-medium ${typeConfig.badgeClass}`}>
                {typeConfig.label}
              </span>
              <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                <Globe className="w-3 h-3" /> {resource.domain}
              </span>
              {documentMetadata && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {documentMetadata.page_count} {documentMetadata.page_count === 1 ? 'page' : 'pages'} · {(documentMetadata.file_size / 1024).toFixed(0)} KB
                </span>
              )}
              {intelligence?.status === 'completed' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> Understood
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              {resource.title}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
              {resource.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Favorite Action */}
            <button
              onClick={() => toggleFavorite(resource.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                resource.is_favorite
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-[#171b29] border-[#252c3e] text-slate-400 hover:text-slate-200'
              }`}
              title={resource.is_favorite ? 'Favorited' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${resource.is_favorite ? 'fill-rose-400' : ''}`} />
            </button>

            {/* Edit Action */}
            <button
              onClick={() => openEditModal(resource)}
              className="p-2.5 rounded-xl bg-[#171b29] border border-[#252c3e] text-slate-400 hover:text-slate-200 transition-colors"
              title="Edit resource"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Archive Action */}
            <button
              onClick={() => archiveResource(resource.id, !resource.is_archived)}
              className="p-2.5 rounded-xl bg-[#171b29] border border-[#252c3e] text-slate-400 hover:text-slate-200 transition-colors"
              title={resource.is_archived ? 'Unarchive resource' : 'Archive resource'}
            >
              {resource.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>

            {/* Delete Action */}
            <button
              onClick={() => openDeleteDialog(resource)}
              className="p-2.5 rounded-xl bg-[#171b29] border border-[#252c3e] text-rose-400 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
              title="Delete resource"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Ask Resora about this resource */}
            <Link
              href={`/app/assistant?scope=document&scopeId=${resource.id}`}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-medium text-xs border border-indigo-500/30 transition-all shadow-sm"
              title="Ask Resora questions scoped to this resource"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Ask Resora</span>
            </Link>

            {/* Document Reader Trigger (if document) */}
            {isDocumentType && (
              <button
                onClick={() => setIsViewerOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Read Document</span>
              </button>
            )}

            {/* Launch / Download Action */}
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenResource}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/30 transition-all ml-1"
            >
              {resource.storage_path ? (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </>
              ) : (
                <>
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </a>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#11131c] border border-[#1f2434] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Resource Type
          </div>
          <div className="text-sm font-semibold text-slate-200">{typeConfig.label}</div>
          <div className="text-xs text-slate-500 font-mono">Source: {resource.source_type}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#11131c] border border-[#1f2434] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Saved Timestamp
          </div>
          <div className="text-sm font-semibold text-slate-200">
            {new Date(resource.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {resource.last_opened_at
              ? `Opened ${new Date(resource.last_opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Not opened yet'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11131c] border border-[#1f2434] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Domain Origin
          </div>
          <div className="text-sm font-semibold text-slate-200 font-mono">{resource.domain}</div>
          <div className="text-xs text-slate-500 truncate">{resource.url}</div>
        </div>
      </div>

      {/* Two-Dimensional Taxonomy: User-Approved Tags & Use Cases */}
      <div className="p-5 rounded-2xl bg-[#11131d] border border-[#1f2434] space-y-4">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            Active Tags <span className="text-[10px] font-normal text-slate-500">("What is this?")</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.tags && resource.tags.length > 0 ? (
              resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-[#181c2b] text-slate-300 font-mono text-xs border border-[#252b3e] flex items-center gap-1.5"
                >
                  <span>#{tag}</span>
                  {resource.tag_sources?.[tag] === 'ai' && (
                    <span className="text-[9px] font-mono text-indigo-400">AI</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No tags attached. Accept AI suggestions above or click Edit.</span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-[#1c2132]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Active Use Cases <span className="text-[10px] font-normal text-slate-500">("Why would I use this?")</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.use_cases && resource.use_cases.length > 0 ? (
              resource.use_cases.map((uc) => (
                <span
                  key={uc}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20 font-medium flex items-center gap-1.5"
                >
                  <span>{uc}</span>
                  {resource.use_case_sources?.[uc] === 'ai' && (
                    <span className="text-[9px] font-mono text-indigo-400">AI</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No use cases assigned.</span>
            )}
          </div>
        </div>
      </div>

      {/* Personal Notes (Explicitly Separated from AI) */}
      <div className="p-5 rounded-2xl bg-[#11131d] border border-[#1f2434] space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            My Personal Notes <span className="text-[10px] text-slate-500 font-normal">(Never overwritten by AI)</span>
          </h3>
          <button
            onClick={() => openEditModal(resource)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Edit note
          </button>
        </div>
        <div className="p-4 rounded-xl bg-[#0d0f17] border border-[#1a1f2e] text-xs sm:text-sm text-slate-300 leading-relaxed italic">
          {resource.personal_note
            ? `"${resource.personal_note}"`
            : '"No personal note added yet. Click Edit to record why you saved this resource."'}
        </div>
      </div>

      {/* Connected Project Workspaces (Cross-Project Reuse) */}
      <div className="p-5 rounded-2xl bg-[#11131d] border border-[#1f2434] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Connected Project Workspaces
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            {connectedProjects.length === 0
              ? 'Not in any project'
              : `Used in ${connectedProjects.length} ${connectedProjects.length === 1 ? 'workspace' : 'workspaces'}`}
          </span>
        </div>

        {connectedProjects.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            This resource is stored globally in your library and not currently linked to any active project workspace.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {connectedProjects.map((proj) => (
              <Link
                key={proj.id}
                href={`/app/projects/${proj.id}`}
                className="p-3 rounded-xl bg-[#141825] hover:bg-[#181d2d] border border-[#212739] hover:border-indigo-500/40 transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                      {proj.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                      {proj.project_type?.replace('_', ' ') || 'project'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {proj.objective || proj.description}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Deterministic Related Resources */}
      {relatedResources.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-sky-400" />
              Related Resources
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Matched via shared topics & tags</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
