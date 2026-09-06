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
      <div className="p-8 max-w-4xl mx-auto space-y-4 text-center">
        <h2 className="text-xl font-bold text-slate-200">Project Workspace not found</h2>
        <p className="text-xs text-slate-400">The requested workspace does not exist or was deleted.</p>
        <Link href="/app/projects" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
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
            <div className="p-5 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Recent Resources
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  View all ({linkedResources.length})
                </button>
              </div>

              {linkedResources.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-[#202536] rounded-xl p-4 space-y-2">
                  <p>No resources connected to this workspace yet.</p>
                  <button
                    onClick={() => setIsAddResourceOpen(true)}
                    className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px]"
                  >
                    + Add from Library
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedResources.slice(0, 4).map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-[#141724] border border-[#1f2537] flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/app/library/${res.id}`}
                          className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate block"
                        >
                          {res.title}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-500">
                          {res.domain} · {res.resource_type}
                        </span>
                      </div>
                      <button
                        onClick={() => removeResourceFromProject(project.id, res.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Architecture Decisions Log Preview */}
            <div className="p-5 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Architecture Decisions Log
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('decisions')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  Manage ({decisions.length})
                </button>
              </div>

              {decisions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-[#202536] rounded-xl p-4">
                  No decisions logged yet. Record key technical choices (e.g. Supabase vs Firebase).
                </div>
              ) : (
                <div className="space-y-2">
                  {decisions.slice(0, 3).map((dec) => (
                    <div
                      key={dec.id}
                      className="p-3 rounded-xl bg-[#141724] border border-[#1f2537] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">
                          {dec.decision}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{dec.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
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
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center rounded-xl bg-[#161925] border border-[#242a3e] px-3 py-1.5 focus-within:border-indigo-500 transition-colors w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search project resources..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-xs"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsAddResourceOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add from library</span>
              </button>
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#23293c] rounded-2xl p-8 space-y-2">
              <Layers className="w-8 h-8 text-slate-600 mx-auto stroke-1" />
              <h3 className="text-xs font-semibold text-slate-300">No matching resources in this workspace</h3>
              <p className="text-[11px] text-slate-500">
                Click "+ Add from library" to link research without duplicating files.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((res) => (
                <div key={res.id} className="relative group">
                  <ResourceCard resource={res} />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeResourceFromProject(project.id, res.id);
                    }}
                    className="absolute top-3 right-12 z-20 p-1.5 rounded-lg bg-[#141825]/90 hover:bg-rose-600 text-slate-400 hover:text-white border border-[#282f44] opacity-0 group-hover:opacity-100 transition-all shadow-md"
                    title="Remove from project workspace"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                Workspace Research Papers & PDFs
              </h2>
              <p className="text-xs text-slate-400">
                Documents linked to {project.name}. View with in-browser page search.
              </p>
            </div>
            <button
              onClick={() => setIsAddResourceOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
            >
              + Link Document
            </button>
          </div>

          {documentResources.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#23293c] rounded-2xl p-8 space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto stroke-1" />
              <h3 className="text-xs font-semibold text-slate-300">No documents connected yet</h3>
              <p className="text-[11px] text-slate-500">
                Connect research whitepapers, architecture briefs, or project guides.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentResources.map((doc) => (
                <div key={doc.id} className="relative group">
                  <ResourceCard resource={doc} />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedViewerResource(doc);
                    }}
                    className="absolute top-3 right-12 z-20 p-1.5 rounded-lg bg-[#141825]/90 hover:bg-indigo-600 text-slate-300 hover:text-white border border-[#282f44] transition-all shadow-md"
                    title="Open in Document Reader"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Workspace Notes</h2>
              <p className="text-xs text-slate-400">
                Capture thoughts, architectural questions, and reference notes specifically for this build.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingNote(!isCreatingNote)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingNote ? 'Cancel Note' : 'New Note'}</span>
            </button>
          </div>

          {/* New Note Form */}
          {isCreatingNote && (
            <form
              onSubmit={handleCreateNote}
              className="p-5 rounded-2xl bg-[#11131e] border border-indigo-500/30 space-y-3 text-xs shadow-xl animate-in fade-in"
            >
              <h3 className="font-semibold text-slate-200">Add Project Note</h3>
              <input
                type="text"
                required
                autoFocus
                placeholder="Note title (e.g. Model Reflection Loop Findings)"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                rows={4}
                required
                placeholder="Write your notes, findings, or questions..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNote(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#23283a] text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Save Note
                </button>
              </div>
            </form>
          )}

          {/* Notes List */}
          {notes.length === 0 && !isCreatingNote ? (
            <div className="py-16 text-center border border-dashed border-[#23293c] rounded-2xl p-8 space-y-2">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto stroke-1" />
              <h3 className="text-xs font-semibold text-slate-300">No project notes yet</h3>
              <p className="text-[11px] text-slate-500">
                Record thoughts, stack evaluations, or questions as you build.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-200">
                        {note.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#1a1f2e] text-[10px] font-mono text-slate-500">
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
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Technical Decision Log</h2>
              <p className="text-xs text-slate-400">
                Document critical architectural and library choices to preserve context across sprint iterations.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingDecision(!isCreatingDecision)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingDecision ? 'Cancel' : 'Log Decision'}</span>
            </button>
          </div>

          {/* New Decision Form */}
          {isCreatingDecision && (
            <form
              onSubmit={handleCreateDecision}
              className="p-5 rounded-2xl bg-[#11131e] border border-amber-500/30 space-y-3 text-xs shadow-xl animate-in fade-in"
            >
              <h3 className="font-semibold text-slate-200">Record Architecture Decision</h3>
              <input
                type="text"
                required
                autoFocus
                placeholder="Decision (e.g. Use Supabase instead of Firebase)"
                value={newDecision}
                onChange={(e) => setNewDecision(e.target.value)}
                className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                rows={3}
                required
                placeholder="Reason (e.g. Better PostgreSQL compatibility, native RLS, and built-in vector support)"
                value={newDecisionReason}
                onChange={(e) => setNewDecisionReason(e.target.value)}
                className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingDecision(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#23283a] text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Record Decision
                </button>
              </div>
            </form>
          )}

          {/* Decisions List */}
          {decisions.length === 0 && !isCreatingDecision ? (
            <div className="py-16 text-center border border-dashed border-[#23293c] rounded-2xl p-8 space-y-2">
              <CheckSquare className="w-8 h-8 text-slate-600 mx-auto stroke-1" />
              <h3 className="text-xs font-semibold text-slate-300">No decisions logged yet</h3>
              <p className="text-[11px] text-slate-500">
                Preserve the "Why" behind your technology and framework choices.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {decisions.map((dec) => (
                <div
                  key={dec.id}
                  className="p-4 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <h3 className="text-sm font-semibold text-slate-200">
                        {dec.decision}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{dec.date}</span>
                      <button
                        onClick={() => handleDeleteDecision(dec.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete decision"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
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
        <div className="p-6 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-6 max-w-2xl animate-in fade-in duration-150 text-xs">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Workspace Settings & Lifecycle</h2>
            <p className="text-slate-400 mt-0.5">Manage project status, archive, or deletion.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-400 font-semibold">Workspace Status</label>
            <div className="flex flex-wrap gap-2">
              {(['active', 'planning', 'paused', 'completed', 'archived'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => updateProject(project.id, { status: st })}
                  className={`px-3 py-1.5 rounded-lg border capitalize font-medium ${
                    project.status === st
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                      : 'bg-[#151926] text-slate-400 border-[#22293c] hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-[#1f2434] space-y-3">
            <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Danger Zone
            </h3>
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200">Delete Project Workspace</span>
                <p className="text-[11px] text-slate-400">
                  Deletes this workspace organization, notes, and decisions. All connected library resources remain safe in your library.
                </p>
              </div>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all font-medium whitespace-nowrap self-start sm:self-auto"
              >
                Delete Workspace
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
