'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { AddResourceToProjectModal } from '@/components/projects/AddResourceToProjectModal';
import { ProjectRecommendationsPanel } from '@/components/projects/ProjectRecommendationsPanel';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import {
  ProjectModel,
  ResourceModel,
  ProjectNoteModel,
  ProjectDecisionModel,
  ProjectRecommendationModel
} from '@/types/database';
import {
  ArrowLeft,
  Plus,
  Layers,
  Sparkles,
  FileText,
  Bookmark,
  CheckSquare,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  Archive,
  ArchiveRestore,
  Clock,
  Eye,
  Star,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    projects,
    resources,
    openSaveModal,
    updateProject,
    deleteProject,
    archiveProject,
    removeResourceFromProject,
    toggleProjectImportant,
    getProjectNotes,
    createProjectNote,
    deleteProjectNote,
    getProjectDecisions,
    createProjectDecision,
    deleteProjectDecision,
    showToast,
  } = useResora();

  const project = projects.find((p) => p.id === projectId);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'resources' | 'documents' | 'notes' | 'decisions' | 'settings'
  >('overview');

  // Modals & Viewers
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [selectedViewerResource, setSelectedViewerResource] = useState<ResourceModel | null>(null);

  // Recommendations State
  const [recommendations, setRecommendations] = useState<ProjectRecommendationModel[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

  // Project Notes & Decisions State
  const [notes, setNotes] = useState<ProjectNoteModel[]>([]);
  const [decisions, setDecisions] = useState<ProjectDecisionModel[]>([]);

  // Note form state
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Decision form state
  const [isCreatingDecision, setIsCreatingDecision] = useState(false);
  const [newDecision, setNewDecision] = useState('');
  const [newDecisionReason, setNewDecisionReason] = useState('');

  // Resource Filter & Search State
  const [resourceSearch, setResourceSearch] = useState('');
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'pdf' | 'tool' | 'important'>('all');

  // Load project recommendations, notes, and decisions
  const loadWorkspaceData = async () => {
    if (!projectId) return;

    // 1. Fetch recommendations from server API
    setIsRecommendationsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/recommendations`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch {
      // fallback
    } finally {
      setIsRecommendationsLoading(false);
    }

    // 2. Fetch notes & decisions
    const n = await getProjectNotes(projectId);
    setNotes(n);
    const d = await getProjectDecisions(projectId);
    setDecisions(d);
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [projectId]);

  if (!project) {
    return (
      <div className="p-10 max-w-2xl mx-auto space-y-4 text-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] my-12">
        <h2 className="text-2xl font-black uppercase text-black">WORKSPACE NOT FOUND</h2>
        <p className="text-xs font-bold text-black">The requested research workspace does not exist or has been removed.</p>
        <Link href="/app/projects" className="btn-neo inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFD93D] text-black border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]">
          <ArrowLeft className="w-4 h-4 stroke-[3px]" />
          <span>BACK TO WORKSPACES</span>
        </Link>
      </div>
    );
  }

  // Linked Resources from Global Library (Zero Duplication)
  const linkedResources = resources.filter(
    (r) => !r.is_archived && project.resource_ids?.includes(r.id)
  );

  const documentResources = linkedResources.filter(
    (r) => r.resource_type === 'pdf' || r.resource_type === 'document' || !!r.page_count
  );

  const toolResources = linkedResources.filter(
    (r) => r.resource_type === 'developer_tool' || r.resource_type === 'ai_tool'
  );

  // Filtered resources for Resources Tab
  const filteredResources = linkedResources.filter((r) => {
    if (activeTypeFilter === 'pdf' && r.resource_type !== 'pdf' && r.resource_type !== 'document') return false;
    if (activeTypeFilter === 'tool' && r.resource_type !== 'developer_tool' && r.resource_type !== 'ai_tool') return false;

    if (resourceSearch.trim()) {
      const q = resourceSearch.toLowerCase().trim();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = (r.description || '').toLowerCase().includes(q);
      const matchTag = (r.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTag;
    }
    return true;
  });

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const note = await createProjectNote(projectId, newNoteTitle.trim(), newNoteContent.trim());
    setNotes([note, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsCreatingNote(false);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteProjectNote(projectId, id);
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.trim() || !newDecisionReason.trim()) return;
    const dec = await createProjectDecision(projectId, newDecision.trim(), newDecisionReason.trim());
    setDecisions([dec, ...decisions]);
    setNewDecision('');
    setNewDecisionReason('');
    setIsCreatingDecision(false);
  };

  const handleDeleteDecision = async (id: string) => {
    await deleteProjectDecision(projectId, id);
    setDecisions(decisions.filter((d) => d.id !== id));
  };

  const handleDeleteProject = async () => {
    if (confirm(`Are you sure you want to delete "${project.name}"? Your library resources will NOT be deleted.`)) {
      await deleteProject(project.id);
      router.push('/app/projects');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Back Button */}
      <div>
        <Link
          href="/app/projects"
          className="btn-neo inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD93D]"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[3px]" />
          <span>BACK TO WORKSPACES</span>
        </Link>
      </div>

      {/* Main Workspace Header Card */}
      <div className="p-6 md:p-8 rounded-none bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-none bg-[#FFD93D] text-black border-2 border-black uppercase font-black shadow-[2px_2px_0px_0px_#000]">
                {project.project_type || 'Software Project'}
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-none bg-[#C4B5FD] text-black border-2 border-black capitalize font-black shadow-[2px_2px_0px_0px_#000]">
                STATUS: {project.status}
              </span>
              {project.template_id && (
                <span className="text-[10px] font-mono text-black font-bold bg-[#FFFDF5] px-2 py-0.5 border border-black">
                  TEMPLATE: {project.template_id.toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-black leading-none">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-black font-medium max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            <Link
              href={`/app/assistant?scope=project&scopeId=${project.id}`}
              className="btn-neo flex items-center gap-1.5 px-4 py-2.5 rounded-none bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black text-xs border-4 border-black shadow-[4px_4px_0px_0px_#000] uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5px]" />
              <span>ASK RESORA</span>
            </Link>
            <button
              onClick={() => setIsAddResourceOpen(true)}
              className="btn-neo flex items-center gap-1.5 px-4 py-2.5 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black text-xs border-4 border-black shadow-[4px_4px_0px_0px_#000] uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>+ FROM LIBRARY</span>
            </button>
            <button
              onClick={openSaveModal}
              className="btn-neo flex items-center gap-1.5 px-4 py-2.5 rounded-none bg-white hover:bg-[#FFFDF5] text-black font-black text-xs border-4 border-black shadow-[4px_4px_0px_0px_#000] uppercase tracking-wider"
            >
              <span>+ SAVE LINK</span>
            </button>
          </div>
        </div>

        {/* Objective & Context Strip */}
        {project.objective && (
          <div className="p-4 rounded-none bg-[#FFFDF5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-black font-black flex items-center gap-1.5 bg-[#FFD93D] px-1.5 py-0.5 w-max border border-black">
              <Sparkles className="w-3.5 h-3.5" />
              WORKSPACE OBJECTIVE
            </div>
            <p className="text-xs sm:text-sm text-black leading-relaxed font-bold">
              {project.objective}
            </p>
          </div>
        )}

        {/* Technologies and Constraints Badges */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-black font-bold uppercase">Planned Stack:</span>
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-mono px-2.5 py-0.5 rounded-none bg-[#C4B5FD] text-black border-2 border-black font-black shadow-[1px_1px_0px_0px_#000]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Metrics Overview Bar */}
        <div className="flex items-center gap-4 text-xs font-mono text-black pt-3 border-t-2 border-black overflow-x-auto">
          <span className="flex items-center gap-1.5 font-black bg-[#FFFDF5] px-2 py-0.5 border border-black">
            <Layers className="w-3.5 h-3.5 text-black" />
            {linkedResources.length} RESOURCES
          </span>
          <span className="flex items-center gap-1.5 font-black bg-[#FFFDF5] px-2 py-0.5 border border-black">
            <FileText className="w-3.5 h-3.5 text-black" />
            {documentResources.length} DOCUMENTS
          </span>
          <span className="flex items-center gap-1.5 font-black bg-[#FFFDF5] px-2 py-0.5 border border-black">
            <Bookmark className="w-3.5 h-3.5 text-black" />
            {notes.length} NOTES
          </span>
          <span className="flex items-center gap-1.5 font-black bg-[#FFFDF5] px-2 py-0.5 border border-black">
            <CheckSquare className="w-3.5 h-3.5 text-black" />
            {decisions.length} DECISIONS
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-4 border-black pb-3 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn-neo px-4 py-2.5 rounded-none transition-all font-black uppercase tracking-wider whitespace-nowrap border-2 border-black ${
            activeTab === 'overview'
              ? 'bg-[#FFD93D] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          OVERVIEW
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`btn-neo px-4 py-2.5 rounded-none transition-all font-black uppercase tracking-wider whitespace-nowrap border-2 border-black ${
            activeTab === 'resources'
              ? 'bg-[#FF6B6B] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          RESOURCES ({linkedResources.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`btn-neo px-4 py-2.5 rounded-none transition-all font-black uppercase tracking-wider whitespace-nowrap border-2 border-black ${
            activeTab === 'documents'
              ? 'bg-[#C4B5FD] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          DOCUMENTS ({documentResources.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`btn-neo px-4 py-2.5 rounded-none transition-all font-black uppercase tracking-wider whitespace-nowrap border-2 border-black ${
            activeTab === 'notes'
              ? 'bg-[#FFD93D] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          NOTES ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('decisions')}
          className={`btn-neo px-4 py-2.5 rounded-none transition-all font-black uppercase tracking-wider whitespace-nowrap border-2 border-black ${
            activeTab === 'decisions'
              ? 'bg-[#FF6B6B] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          DECISIONS ({decisions.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`btn-neo px-4 py-2.5 rounded-none transition-all font-black uppercase tracking-wider whitespace-nowrap border-2 border-black ${
            activeTab === 'settings'
              ? 'bg-black text-white shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          SETTINGS
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* AI RECOMMENDATIONS PANEL */}
          <ProjectRecommendationsPanel
            project={project}
            recommendations={recommendations}
            isLoading={isRecommendationsLoading}
            onRefresh={loadWorkspaceData}
            onAdded={loadWorkspaceData}
          />

          {/* Quick Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Connected Resources */}
            <div className="p-6 rounded-none bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FFD93D] border border-black" />
                  <h2 className="text-xs font-black text-black uppercase tracking-wider">
                    RECENT WORKSPACE RESOURCES
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="text-xs font-black uppercase text-black hover:text-[#FF6B6B] transition-colors"
                >
                  VIEW ALL ({linkedResources.length}) →
                </button>
              </div>

              {linkedResources.length === 0 ? (
                <div className="py-8 text-center text-xs text-black border-2 border-dashed border-black p-4 space-y-3 bg-[#FFFDF5]">
                  <p className="font-bold">No resources connected to this workspace yet.</p>
                  <button
                    onClick={() => setIsAddResourceOpen(true)}
                    className="btn-neo px-4 py-2 bg-[#FF6B6B] hover:bg-[#ff5252] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                  >
                    + ADD FROM LIBRARY
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {linkedResources.slice(0, 4).map((res) => (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-none bg-[#FFFDF5] border-2 border-black flex items-center justify-between gap-3 group hover:bg-[#FFD93D] transition-colors shadow-[2px_2px_0px_0px_#000]"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/app/library/${res.id}`}
                          className="text-xs font-black text-black truncate block uppercase tracking-tight"
                        >
                          {res.title}
                        </Link>
                        <span className="text-[10px] font-mono font-bold text-black uppercase">
                          {res.domain} · {res.resource_type}
                        </span>
                      </div>
                      <button
                        onClick={() => removeResourceFromProject(project.id, res.id)}
                        className="btn-neo p-1 text-black hover:bg-[#FF6B6B] border border-black transition-colors"
                        title="Remove from project"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Architecture Decisions Log Preview */}
            <div className="p-6 rounded-none bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF6B6B] border border-black" />
                  <h2 className="text-xs font-black text-black uppercase tracking-wider">
                    ARCHITECTURE DECISIONS LOG
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('decisions')}
                  className="text-xs font-black uppercase text-black hover:text-[#FF6B6B] transition-colors"
                >
                  MANAGE ({decisions.length}) →
                </button>
              </div>

              {decisions.length === 0 ? (
                <div className="py-8 text-center text-xs text-black font-bold border-2 border-dashed border-black p-4 bg-[#FFFDF5]">
                  No decisions logged yet. Record key technical choices and framework decisions.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {decisions.slice(0, 3).map((dec) => (
                    <div
                      key={dec.id}
                      className="p-3.5 rounded-none bg-[#FFFDF5] border-2 border-black space-y-1 shadow-[2px_2px_0px_0px_#000]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-black uppercase">
                          {dec.decision}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-black bg-[#C4B5FD] px-1.5 py-0.5 border border-black">{dec.date}</span>
                      </div>
                      <p className="text-xs text-black font-medium leading-relaxed">
                        {dec.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-black pb-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[3px]" />
              <input
                type="text"
                placeholder="SEARCH PROJECT RESOURCES..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-none bg-white border-2 border-black text-xs text-black placeholder-black/50 font-black uppercase focus:bg-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsAddResourceOpen(true)}
                className="btn-neo flex items-center gap-1.5 px-4 py-2.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000]"
              >
                <Plus className="w-4 h-4 stroke-[3px]" />
                <span>+ ADD FROM LIBRARY</span>
              </button>
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <div className="py-16 text-center border-4 border-dashed border-black rounded-none p-8 space-y-3 bg-white shadow-[6px_6px_0px_0px_#000]">
              <Layers className="w-10 h-10 text-black mx-auto stroke-2" />
              <h3 className="text-sm font-black uppercase text-black">NO MATCHING RESOURCES IN WORKSPACE</h3>
              <p className="text-xs font-bold text-black">
                Click "+ Add from library" to link research without duplicating files.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => (
                <div key={res.id} className="relative group">
                  <ResourceCard resource={res} />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeResourceFromProject(project.id, res.id);
                    }}
                    className="btn-neo absolute top-3 right-12 z-20 p-1.5 rounded-none bg-white hover:bg-[#FF6B6B] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove from project workspace"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
            <div>
              <h2 className="text-base font-black uppercase text-black">
                WORKSPACE RESEARCH PAPERS & PDFS
              </h2>
              <p className="text-xs font-bold text-black mt-0.5">
                Documents linked to {project.name}. View with in-browser page search.
              </p>
            </div>
            <button
              onClick={() => setIsAddResourceOpen(true)}
              className="btn-neo flex items-center gap-1.5 px-4 py-2.5 bg-[#FFD93D] hover:bg-[#ffe169] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>+ LINK DOCUMENT</span>
            </button>
          </div>

          {documentResources.length === 0 ? (
            <div className="py-16 text-center border-4 border-dashed border-black rounded-none p-8 space-y-3 bg-white shadow-[6px_6px_0px_0px_#000]">
              <FileText className="w-10 h-10 text-black mx-auto stroke-2" />
              <h3 className="text-sm font-black uppercase text-black">NO DOCUMENTS CONNECTED YET</h3>
              <p className="text-xs font-bold text-black">
                Connect research whitepapers, architecture briefs, or project guides.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentResources.map((doc) => (
                <div key={doc.id} className="relative group">
                  <ResourceCard resource={doc} />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedViewerResource(doc);
                    }}
                    className="btn-neo absolute top-3 right-12 z-20 p-1.5 rounded-none bg-white hover:bg-[#C4B5FD] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all"
                    title="Open in Document Reader"
                  >
                    <Eye className="w-4 h-4 stroke-[3px]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
            <div>
              <h2 className="text-base font-black uppercase text-black">WORKSPACE NOTES</h2>
              <p className="text-xs font-bold text-black mt-0.5">
                Capture thoughts, architectural questions, and reference notes specifically for this build.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingNote(!isCreatingNote)}
              className="btn-neo flex items-center gap-1.5 px-4 py-2.5 bg-[#C4B5FD] hover:bg-[#b5a3fa] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>{isCreatingNote ? 'CANCEL NOTE' : '+ NEW NOTE'}</span>
            </button>
          </div>

          {/* New Note Form */}
          {isCreatingNote && (
            <form
              onSubmit={handleCreateNote}
              className="p-6 rounded-none bg-white border-4 border-black space-y-4 text-xs shadow-[8px_8px_0px_0px_#000] animate-in fade-in"
            >
              <div className="font-black uppercase text-xs bg-[#FFD93D] px-2 py-0.5 border border-black w-max">
                ADD PROJECT NOTE
              </div>
              <input
                type="text"
                required
                autoFocus
                placeholder="NOTE TITLE (E.G. MODEL REFLECTION LOOP FINDINGS)"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-2 border-black px-3.5 py-2.5 text-black font-black uppercase placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
              <textarea
                rows={4}
                required
                placeholder="Write your notes, findings, or questions..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-2 border-black px-3.5 py-2.5 text-black font-medium placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none resize-none shadow-[2px_2px_0px_0px_#000]"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreatingNote(false)}
                  className="btn-neo px-4 py-2 rounded-none border-2 border-black bg-white text-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-neo px-5 py-2 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                >
                  SAVE NOTE
                </button>
              </div>
            </form>
          )}

          {/* Notes List */}
          {notes.length === 0 && !isCreatingNote ? (
            <div className="py-16 text-center border-4 border-dashed border-black rounded-none p-8 space-y-3 bg-white shadow-[6px_6px_0px_0px_#000]">
              <Bookmark className="w-10 h-10 text-black mx-auto stroke-2" />
              <h3 className="text-sm font-black uppercase text-black">NO PROJECT NOTES YET</h3>
              <p className="text-xs font-bold text-black">
                Record thoughts, stack evaluations, or questions as you build.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-6 rounded-none bg-white border-4 border-black space-y-3 flex flex-col justify-between shadow-[6px_6px_0px_0px_#000]"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 border-b-2 border-black pb-2">
                      <h3 className="text-sm font-black uppercase text-black">
                        {note.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="btn-neo p-1 text-black hover:bg-[#FF6B6B] border border-black transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-black whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-black text-[10px] font-mono font-bold text-black uppercase">
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DECISIONS */}
      {activeTab === 'decisions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
            <div>
              <h2 className="text-base font-black uppercase text-black">TECHNICAL DECISION LOG</h2>
              <p className="text-xs font-bold text-black mt-0.5">
                Document critical architectural and library choices to preserve context across sprint iterations.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingDecision(!isCreatingDecision)}
              className="btn-neo flex items-center gap-1.5 px-4 py-2.5 bg-[#FFD93D] hover:bg-[#ffe169] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>{isCreatingDecision ? 'CANCEL' : '+ LOG DECISION'}</span>
            </button>
          </div>

          {/* New Decision Form */}
          {isCreatingDecision && (
            <form
              onSubmit={handleCreateDecision}
              className="p-6 rounded-none bg-white border-4 border-black space-y-4 text-xs shadow-[8px_8px_0px_0px_#000] animate-in fade-in"
            >
              <div className="font-black uppercase text-xs bg-[#FFD93D] px-2 py-0.5 border border-black w-max">
                RECORD ARCHITECTURE DECISION
              </div>
              <input
                type="text"
                required
                autoFocus
                placeholder="DECISION (E.G. USE SUPABASE INSTEAD OF FIREBASE)"
                value={newDecision}
                onChange={(e) => setNewDecision(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-2 border-black px-3.5 py-2.5 text-black font-black uppercase placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
              <textarea
                rows={3}
                required
                placeholder="Reason (e.g. Better PostgreSQL compatibility, native RLS, and built-in vector support)"
                value={newDecisionReason}
                onChange={(e) => setNewDecisionReason(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-2 border-black px-3.5 py-2.5 text-black font-medium placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none resize-none shadow-[2px_2px_0px_0px_#000]"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreatingDecision(false)}
                  className="btn-neo px-4 py-2 rounded-none border-2 border-black bg-white text-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-neo px-5 py-2 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                >
                  RECORD DECISION
                </button>
              </div>
            </form>
          )}

          {/* Decisions List */}
          {decisions.length === 0 && !isCreatingDecision ? (
            <div className="py-16 text-center border-4 border-dashed border-black rounded-none p-8 space-y-3 bg-white shadow-[6px_6px_0px_0px_#000]">
              <CheckSquare className="w-10 h-10 text-black mx-auto stroke-2" />
              <h3 className="text-sm font-black uppercase text-black">NO DECISIONS LOGGED YET</h3>
              <p className="text-xs font-bold text-black">
                Preserve the "Why" behind your technology and framework choices.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {decisions.map((dec) => (
                <div
                  key={dec.id}
                  className="p-5 rounded-none bg-white border-4 border-black space-y-2 shadow-[6px_6px_0px_0px_#000]"
                >
                  <div className="flex items-start justify-between gap-3 border-b-2 border-black pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-black stroke-[3px] shrink-0" />
                      <h3 className="text-sm font-black uppercase text-black">
                        {dec.decision}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-black bg-[#C4B5FD] px-2 py-0.5 border border-black uppercase">{dec.date}</span>
                      <button
                        onClick={() => handleDeleteDecision(dec.id)}
                        className="btn-neo p-1 text-black hover:bg-[#FF6B6B] border border-black transition-colors"
                        title="Delete decision"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-black leading-relaxed">
                    {dec.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 md:p-8 rounded-none bg-white border-4 border-black space-y-6 max-w-2xl animate-in fade-in duration-150 text-xs shadow-[8px_8px_0px_0px_#000]">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-base font-black uppercase text-black">WORKSPACE SETTINGS & LIFECYCLE</h2>
            <p className="text-xs font-bold text-black mt-0.5">Manage project status, archive, or deletion.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-black font-black uppercase text-xs">Workspace Status</label>
            <div className="flex flex-wrap gap-2">
              {(['active', 'planning', 'paused', 'completed', 'archived'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => updateProject(project.id, { status: st })}
                  className={`btn-neo px-3.5 py-2 rounded-none border-2 border-black capitalize font-black text-xs ${
                    project.status === st
                      ? 'bg-[#FFD93D] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                      : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t-4 border-black space-y-3">
            <h3 className="text-xs font-black text-black bg-[#FF6B6B] px-2 py-0.5 border border-black w-max uppercase tracking-wider">
              DANGER ZONE
            </h3>
            <div className="p-5 rounded-none bg-[#FFFDF5] border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#000]">
              <div className="space-y-1">
                <span className="font-black uppercase text-xs text-black">DELETE PROJECT WORKSPACE</span>
                <p className="text-xs text-black font-medium leading-relaxed">
                  Deletes this workspace organization, notes, and decisions. All connected library resources remain safe in your library.
                </p>
              </div>
              <button
                onClick={handleDeleteProject}
                className="btn-neo px-4 py-2.5 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000] whitespace-nowrap self-start sm:self-auto"
              >
                DELETE WORKSPACE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource to Project Modal */}
      {isAddResourceOpen && (
        <AddResourceToProjectModal
          projectId={project.id}
          projectResourceIds={project.resource_ids || []}
          isOpen={isAddResourceOpen}
          onClose={() => setIsAddResourceOpen(false)}
          onAdded={() => {
            loadWorkspaceData();
          }}
        />
      )}

      {/* Document Reader Modal */}
      {selectedViewerResource && (
        <DocumentViewerModal
          resource={selectedViewerResource}
          isOpen={!!selectedViewerResource}
          onClose={() => setSelectedViewerResource(null)}
        />
      )}
    </div>
  );
}
