'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ResourceModel,
  ResourceIntelligence,
  ProjectModel,
  ProjectNoteModel,
  ProjectDecisionModel,
  CollectionModel,
  ResourceFilterOptions,
} from '@/types/database';
import { ResourceService } from '@/lib/services/resource-service';

interface Metrics {
  total: number;
  inbox: number;
  favorites: number;
  documents: number;
  projects: number;
  collections: number;
  analyzed: number;
  discoveredTopics: string[];
}

interface ResoraContextType {
  resources: ResourceModel[];
  inboxResources: ResourceModel[];
  projects: ProjectModel[];
  collections: CollectionModel[];
  metrics: Metrics;
  isLoading: boolean;
  isCommandPaletteOpen: boolean;
  isSaveModalOpen: boolean;
  editingResource: ResourceModel | null;
  deletingResource: ResourceModel | null;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openSaveModal: () => void;
  closeSaveModal: () => void;
  openEditModal: (res: ResourceModel) => void;
  closeEditModal: () => void;
  openDeleteDialog: (res: ResourceModel) => void;
  closeDeleteDialog: () => void;
  refreshData: () => Promise<void>;
  cleanAllDuplicates: () => Promise<{ removedCount: number; remainingCount: number }>;
  saveResource: (data: Partial<ResourceModel>) => Promise<ResourceModel>;
  updateResource: (id: string, updates: Partial<ResourceModel>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  archiveResource: (id: string, isArchived: boolean) => Promise<void>;
  recordOpen: (id: string) => Promise<void>;
  checkDuplicate: (url: string) => Promise<ResourceModel | null>;
  createProject: (data: any) => Promise<ProjectModel>;
  updateProject: (id: string, updates: Partial<ProjectModel>) => Promise<ProjectModel | null>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string, isArchived: boolean) => Promise<void>;
  addResourceToProject: (projectId: string, resourceId: string, groupName?: string) => Promise<void>;
  removeResourceFromProject: (projectId: string, resourceId: string) => Promise<void>;
  bulkAddResourcesToProject: (projectId: string, resourceIds: string[]) => Promise<void>;
  toggleProjectImportant: (projectId: string, resourceId: string) => Promise<boolean>;
  getProjectNotes: (projectId: string) => Promise<ProjectNoteModel[]>;
  createProjectNote: (projectId: string, title: string, content: string) => Promise<ProjectNoteModel>;
  deleteProjectNote: (projectId: string, noteId: string) => Promise<void>;
  getProjectDecisions: (projectId: string) => Promise<ProjectDecisionModel[]>;
  createProjectDecision: (projectId: string, decision: string, reason: string, date?: string) => Promise<ProjectDecisionModel>;
  deleteProjectDecision: (projectId: string, decisionId: string) => Promise<void>;
  dismissRecommendation: (projectId: string, resourceId: string) => Promise<void>;
  getCrossProjectUsage: (resourceId: string) => Promise<ProjectModel[]>;
  createCollection: (name: string, description: string, topic?: string) => Promise<CollectionModel>;
  deleteCollection: (id: string) => Promise<void>;
  getIntelligence: (resourceId: string) => Promise<ResourceIntelligence | null>;
  analyzeResource: (resourceId: string, force?: boolean) => Promise<ResourceIntelligence | null>;
  acceptSuggestedTag: (resourceId: string, tag: string) => Promise<void>;
  dismissSuggestedTag: (resourceId: string, tag: string) => Promise<void>;
  acceptSuggestedUseCase: (resourceId: string, useCase: string) => Promise<void>;
  dismissSuggestedUseCase: (resourceId: string, useCase: string) => Promise<void>;
  findRelatedResources: (resourceId: string, limit?: number) => Promise<ResourceModel[]>;
  activeToast: string | null;
  showToast: (msg: string) => void;
  activeAiJob: {
    jobId: string;
    query: string;
    scopeLabel: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    answer?: string;
    citations?: any[];
  } | null;
  trackAiJob: (job: { jobId: string; query: string; scopeLabel: string }) => void;
  clearAiJob: () => void;
}

const ResoraContext = createContext<ResoraContextType | undefined>(undefined);

export function ResoraProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [inboxResources, setInboxResources] = useState<ResourceModel[]>([]);
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [collections, setCollections] = useState<CollectionModel[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    inbox: 0,
    favorites: 0,
    documents: 0,
    projects: 0,
    collections: 0,
    analyzed: 0,
    discoveredTopics: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modals & toasts
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceModel | null>(null);
  const [deletingResource, setDeletingResource] = useState<ResourceModel | null>(null);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Global Background AI Job Tracker
  const [activeAiJob, setActiveAiJob] = useState<{
    jobId: string;
    query: string;
    scopeLabel: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    answer?: string;
    citations?: any[];
  } | null>(null);

  const trackAiJob = useCallback((job: { jobId: string; query: string; scopeLabel: string }) => {
    setActiveAiJob({
      ...job,
      status: 'queued',
    });
  }, []);

  const clearAiJob = useCallback(() => {
    setActiveAiJob(null);
  }, []);

  const showToast = useCallback((msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast((curr) => (curr === msg ? null : curr));
    }, 3500);
  }, []);

  // Global background poller for active AI job across routes
  useEffect(() => {
    if (!activeAiJob || activeAiJob.status === 'completed' || activeAiJob.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/assistant/chat?jobId=${activeAiJob.jobId}`);
        if (!res.ok) return;
        const data = await res.json();
        const job = data.job;

        if (job) {
          if (job.status === 'completed') {
            setActiveAiJob((prev) => prev ? {
              ...prev,
              status: 'completed',
              answer: job.result_message?.content || '',
              citations: job.result_message?.citations || [],
            } : null);
            showToast(`AI Synthesis Ready: "${activeAiJob.query.slice(0, 32)}..."`);
          } else if (job.status === 'failed') {
            setActiveAiJob((prev) => prev ? { ...prev, status: 'failed' } : null);
            showToast('AI synthesis encountered an issue');
          } else if (job.status === 'processing' && activeAiJob.status !== 'processing') {
            setActiveAiJob((prev) => prev ? { ...prev, status: 'processing' } : null);
          }
        }
      } catch {
        // Silently retry next tick
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeAiJob, showToast]);

  const cleanAllDuplicates = useCallback(async () => {
    const res = await ResourceService.cleanDuplicates();
    await refreshData();
    if (res.removedCount > 0) {
      showToast(`Removed ${res.removedCount} duplicate resources`);
    } else {
      showToast('No duplicates found — your library is 100% deduplicated');
    }
    return res;
  }, [showToast]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Automatically keep the library 100% duplicate-free
      await ResourceService.cleanDuplicates();

      const all = await ResourceService.getAllResources();
      const nonArchived = all.filter((r) => !r.is_archived);
      setResources(nonArchived.filter((r) => !r.is_inbox));
      setInboxResources(nonArchived.filter((r) => r.is_inbox));

      const [projs, cols, m] = await Promise.all([
        ResourceService.getProjects(),
        ResourceService.getCollections(),
        ResourceService.getMetrics(),
      ]);

      setProjects(projs);
      setCollections(cols);
      setMetrics(m);
    } catch (err) {
      console.error('Failed to load Resora data:', err);
      showToast('Error refreshing workspace data');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Keyboard shortcut listener (⌘K, ⌘⇧S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSaveModalOpen(true);
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsSaveModalOpen(false);
        setEditingResource(null);
        setDeletingResource(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCommandPalette = () => setIsCommandPaletteOpen(true);
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);

  const openSaveModal = () => setIsSaveModalOpen(true);
  const closeSaveModal = () => setIsSaveModalOpen(false);

  const openEditModal = (res: ResourceModel) => setEditingResource(res);
  const closeEditModal = () => setEditingResource(null);

  const openDeleteDialog = (res: ResourceModel) => setDeletingResource(res);
  const closeDeleteDialog = () => setDeletingResource(null);

  const saveResource = async (data: Partial<ResourceModel>): Promise<ResourceModel> => {
    const created = await ResourceService.createResource({
      title: data.title || 'Untitled Resource',
      url: data.url || 'https://resora.app',
      domain: data.domain || 'resora.app',
      description: data.description || '',
      resource_type: data.resource_type || 'website',
      source_type: data.source_type || 'web',
      tags: data.tags || [],
      use_cases: data.use_cases || [],
      personal_note: data.personal_note || '',
      is_favorite: data.is_favorite || false,
      is_archived: false,
      is_inbox: data.is_inbox !== undefined ? data.is_inbox : false,
      thumbnail_url: data.thumbnail_url,
      favicon_url: data.favicon_url,
    });

    await refreshData();
    showToast(`Saved "${created.title}" to library`);
    return created;
  };

  const updateResource = async (id: string, updates: Partial<ResourceModel>) => {
    await ResourceService.updateResource(id, updates);
    await refreshData();
    showToast('Resource updated');
  };

  const deleteResource = async (id: string) => {
    // Find all linked child resources to provide immediate optimistic UI removal
    setResources((prev) => prev.filter((r) => r.id !== id && r.source_document_id !== id));
    setInboxResources((prev) => prev.filter((r) => r.id !== id && r.source_document_id !== id));

    try {
      await ResourceService.deleteResource(id);
      // Synchronize deletion with server state as well
      fetch(`/api/resources/${id}`, { method: 'DELETE' }).catch(() => {});
      await refreshData();
      showToast('Resource removed');
    } catch (err) {
      console.error('Failed to delete resource:', err);
      await refreshData();
      showToast('Failed to delete resource');
    }
  };

  const toggleFavorite = async (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_favorite: !r.is_favorite } : r))
    );
    try {
      const nextState = await ResourceService.toggleFavorite(id);
      showToast(nextState ? 'Added to favorites' : 'Removed from favorites');
      await refreshData();
    } catch {
      await refreshData();
      showToast('Failed to update favorite status');
    }
  };

  const archiveResource = async (id: string, isArchived: boolean) => {
    await ResourceService.setArchived(id, isArchived);
    await refreshData();
    showToast(isArchived ? 'Archived resource' : 'Unarchived resource');
  };

  const recordOpen = async (id: string) => {
    await ResourceService.recordOpen(id);
  };

  const checkDuplicate = async (url: string) => {
    return ResourceService.checkDuplicate(url);
  };

  const createProject = async (data: any) => {
    const payload = typeof data === 'string' ? { name: data, description: '' } : data;
    const proj = await ResourceService.createProject(payload);
    await refreshData();
    showToast(`Created project "${proj.name}"`);
    return proj;
  };

  const updateProject = async (id: string, updates: Partial<ProjectModel>) => {
    const updated = await ResourceService.updateProject(id, updates);
    await refreshData();
    showToast('Project updated');
    return updated;
  };

  const deleteProject = async (id: string) => {
    await ResourceService.deleteProject(id);
    await refreshData();
    showToast('Deleted project. Your library resources were preserved.');
  };

  const archiveProject = async (id: string, isArchived: boolean) => {
    await ResourceService.archiveProject(id, isArchived);
    await refreshData();
    showToast(isArchived ? 'Project workspace archived' : 'Project workspace reactivated');
  };

  const addResourceToProject = async (projectId: string, resourceId: string, groupName?: string) => {
    await ResourceService.addResourceToProject(projectId, resourceId, groupName);
    await refreshData();
    showToast('Added resource to project');
  };

  const removeResourceFromProject = async (projectId: string, resourceId: string) => {
    await ResourceService.removeResourceFromProject(projectId, resourceId);
    await refreshData();
    showToast('Removed resource from project');
  };

  const bulkAddResourcesToProject = async (projectId: string, resourceIds: string[]) => {
    await ResourceService.bulkAddResourcesToProject(projectId, resourceIds);
    await refreshData();
    showToast(`Added ${resourceIds.length} resources to project`);
  };

  const toggleProjectImportant = async (projectId: string, resourceId: string) => {
    const nextState = await ResourceService.toggleProjectImportant(projectId, resourceId);
    showToast(nextState ? 'Marked as key project resource' : 'Unmarked key resource');
    return nextState;
  };

  const getProjectNotes = async (projectId: string) => {
    return ResourceService.getProjectNotes(projectId);
  };

  const createProjectNote = async (projectId: string, title: string, content: string) => {
    const note = await ResourceService.createProjectNote(projectId, title, content);
    showToast('Note created');
    return note;
  };

  const deleteProjectNote = async (projectId: string, noteId: string) => {
    await ResourceService.deleteProjectNote(projectId, noteId);
    showToast('Note removed');
  };

  const getProjectDecisions = async (projectId: string) => {
    return ResourceService.getProjectDecisions(projectId);
  };

  const createProjectDecision = async (projectId: string, decision: string, reason: string, date?: string) => {
    const dec = await ResourceService.createProjectDecision(projectId, decision, reason, date);
    showToast('Decision recorded');
    return dec;
  };

  const deleteProjectDecision = async (projectId: string, decisionId: string) => {
    await ResourceService.deleteProjectDecision(projectId, decisionId);
    showToast('Decision removed');
  };

  const dismissRecommendation = async (projectId: string, resourceId: string) => {
    await ResourceService.dismissRecommendation(projectId, resourceId);
    showToast('Recommendation dismissed');
  };

  const getCrossProjectUsage = async (resourceId: string) => {
    return ResourceService.getCrossProjectUsage(resourceId);
  };

  const createCollection = async (name: string, description: string, topic?: string) => {
    const col = await ResourceService.createCollection(name, description, topic);
    await refreshData();
    showToast(`Created collection "${col.name}"`);
    return col;
  };

  const deleteCollection = async (id: string) => {
    await ResourceService.deleteCollection(id);
    await refreshData();
    showToast('Collection deleted');
  };

  // AI Intelligence Handlers
  const getIntelligence = async (resourceId: string) => {
    return ResourceService.getIntelligence(resourceId);
  };

  const analyzeResource = async (resourceId: string, force = false): Promise<ResourceIntelligence | null> => {
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, force }),
      });
      if (res.ok) {
        const data = await res.json();
        await refreshData();
        showToast('Resora Intelligence updated');
        return data.intelligence;
      }
    } catch (e) {
      console.error('Failed to run AI analysis:', e);
      showToast('AI analysis error');
    }
    return null;
  };

  const acceptSuggestedTag = async (resourceId: string, tag: string) => {
    await ResourceService.acceptSuggestedTag(resourceId, tag);
    await refreshData();
    showToast(`Added #${tag} to resource tags`);
  };

  const dismissSuggestedTag = async (resourceId: string, tag: string) => {
    await ResourceService.dismissSuggestedTag(resourceId, tag);
    await refreshData();
  };

  const acceptSuggestedUseCase = async (resourceId: string, useCase: string) => {
    await ResourceService.acceptSuggestedUseCase(resourceId, useCase);
    await refreshData();
    showToast(`Added "${useCase}" to resource use cases`);
  };

  const dismissSuggestedUseCase = async (resourceId: string, useCase: string) => {
    await ResourceService.dismissSuggestedUseCase(resourceId, useCase);
    await refreshData();
  };

  const findRelatedResources = async (resourceId: string, limit = 4) => {
    return ResourceService.findRelatedResources(resourceId, limit);
  };

  return (
    <ResoraContext.Provider
      value={{
        resources,
        inboxResources,
        projects,
        collections,
        metrics,
        isLoading,
        isCommandPaletteOpen,
        isSaveModalOpen,
        editingResource,
        deletingResource,
        openCommandPalette,
        closeCommandPalette,
        openSaveModal,
        closeSaveModal,
        openEditModal,
        closeEditModal,
        openDeleteDialog,
        closeDeleteDialog,
        refreshData,
        cleanAllDuplicates,
        saveResource,
        updateResource,
        deleteResource,
        toggleFavorite,
        archiveResource,
        recordOpen,
        checkDuplicate,
        createProject,
        updateProject,
        deleteProject,
        archiveProject,
        addResourceToProject,
        removeResourceFromProject,
        bulkAddResourcesToProject,
        toggleProjectImportant,
        getProjectNotes,
        createProjectNote,
        deleteProjectNote,
        getProjectDecisions,
        createProjectDecision,
        deleteProjectDecision,
        dismissRecommendation,
        getCrossProjectUsage,
        createCollection,
        deleteCollection,
        getIntelligence,
        analyzeResource,
        acceptSuggestedTag,
        dismissSuggestedTag,
        acceptSuggestedUseCase,
        dismissSuggestedUseCase,
        findRelatedResources,
        activeToast,
        showToast,
        activeAiJob,
        trackAiJob,
        clearAiJob,
      }}
    >
      {children}
    </ResoraContext.Provider>
  );
}

export function useResora() {
  const context = useContext(ResoraContext);
  if (!context) {
    throw new Error('useResora must be used within a ResoraProvider');
  }
  return context;
}
