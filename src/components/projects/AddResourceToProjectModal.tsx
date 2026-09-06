'use client';

import React, { useState } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResourceModel } from '@/types/database';
import {
  X,
  Search,
  Check,
  Plus,
  Globe,
  FileText,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AddResourceToProjectModalProps {
  projectId: string;
  projectResourceIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddResourceToProjectModal({
  projectId,
  projectResourceIds,
  isOpen,
  onClose,
  onAdded,
}: AddResourceToProjectModalProps) {
  const { resources, bulkAddResourcesToProject, showToast } = useResora();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pdf' | 'tool' | 'favorite'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentSet = new Set(projectResourceIds);

  // Filter available resources
  const availableResources = resources.filter((r) => {
    if (r.is_archived || currentSet.has(r.id)) return false;

    if (activeFilter === 'pdf' && r.resource_type !== 'pdf' && r.resource_type !== 'document') return false;
    if (activeFilter === 'tool' && r.resource_type !== 'developer_tool' && r.resource_type !== 'ai_tool') return false;
    if (activeFilter === 'favorite' && !r.is_favorite) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = r.title.toLowerCase().includes(q);
      const matchesDesc = (r.description || '').toLowerCase().includes(q);
      const matchesDomain = r.domain.toLowerCase().includes(q);
      const matchesTag = (r.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchesTitle || matchesDesc || matchesDomain || matchesTag;
    }

    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === availableResources.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableResources.map((r) => r.id));
    }
  };

  const handleAddSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await bulkAddResourcesToProject(projectId, selectedIds);
      onAdded();
      onClose();
    } catch {
      showToast('Failed to link resources to project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#10121b] border border-[#23293d] shadow-2xl shadow-black/90 overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2132]">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Add Library Resources to Project</h2>
            <p className="text-[11px] text-slate-400">
              Select existing resources to connect without duplicating data.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-[#1c2132] bg-[#0c0e17] space-y-3">
          <div className="flex items-center rounded-xl bg-[#161925] border border-[#242a3e] px-3.5 py-2 focus-within:border-indigo-500 transition-colors">
            <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search by title, tag, or technology (e.g. Supabase, PDF, Agent)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-xs"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeFilter === 'all'
                    ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Available ({availableResources.length})
              </button>
              <button
                onClick={() => setActiveFilter('pdf')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeFilter === 'pdf'
                    ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                PDFs & Docs
              </button>
              <button
                onClick={() => setActiveFilter('tool')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeFilter === 'tool'
                    ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Developer Tools
              </button>
              <button
                onClick={() => setActiveFilter('favorite')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeFilter === 'favorite'
                    ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Favorites
              </button>
            </div>

            {availableResources.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap ml-2"
              >
                {selectedIds.length === availableResources.length ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>
        </div>

        {/* Resources List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {availableResources.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <p>No unlinked resources matching your query.</p>
              <p className="text-[11px] text-slate-600">All matching items may already belong to this project.</p>
            </div>
          ) : (
            availableResources.map((res) => {
              const isSelected = selectedIds.includes(res.id);
              return (
                <div
                  key={res.id}
                  onClick={() => toggleSelect(res.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/20 border-indigo-500/50 text-slate-100'
                      : 'bg-[#131622] hover:bg-[#161a28] border-[#202638] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-600 bg-[#0d0f18]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate text-slate-200">
                          {res.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0d0f17] border border-[#1b2131] text-slate-500 shrink-0">
                          {res.resource_type}
                        </span>
                        {res.page_count && (
                          <span className="text-[9px] font-mono text-indigo-400 shrink-0">
                            {res.page_count}p
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {res.description || res.domain}
                      </p>
                    </div>
                  </div>

                  {res.tags && res.tags.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                      {res.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10131d] text-slate-400 border border-[#1d2335]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c2132] flex items-center justify-between bg-[#0c0e17] text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            {selectedIds.length} {selectedIds.length === 1 ? 'resource' : 'resources'} selected
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#23283a] text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSelected}
              disabled={selectedIds.length === 0 || isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-900/30 transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Linking...' : `Add ${selectedIds.length} to project`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
