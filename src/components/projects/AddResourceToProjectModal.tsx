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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-none animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-none bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-[#FFFDF5]">
          <div>
            <h2 className="text-base font-black uppercase text-black">ADD LIBRARY RESOURCES TO PROJECT</h2>
            <p className="text-xs text-black font-medium">
              Select existing resources to connect without duplicating data.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-neo p-1.5 border-2 border-black bg-white hover:bg-[#FFD93D] text-black shadow-[2px_2px_0px_0px_#000] transition-colors"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b-4 border-black bg-[#FFFDF5] space-y-3">
          <div className="flex items-center rounded-none bg-white border-4 border-black px-3.5 py-2.5 focus-within:bg-[#FFD93D] transition-colors shadow-[3px_3px_0px_0px_#000]">
            <Search className="w-4 h-4 text-black stroke-[3px] mr-2 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search by title, tag, or technology (e.g. Supabase, PDF, Agent)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-black placeholder-black/50 focus:outline-none text-xs font-black uppercase"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`btn-neo px-3 py-1.5 rounded-none font-black uppercase text-xs border-2 border-black transition-all ${
                  activeFilter === 'all'
                    ? 'bg-[#FFD93D] text-black shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white text-black hover:bg-[#FFFDF5]'
                }`}
              >
                ALL ({availableResources.length})
              </button>
              <button
                onClick={() => setActiveFilter('pdf')}
                className={`btn-neo px-3 py-1.5 rounded-none font-black uppercase text-xs border-2 border-black transition-all ${
                  activeFilter === 'pdf'
                    ? 'bg-[#FF6B6B] text-black shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white text-black hover:bg-[#FFFDF5]'
                }`}
              >
                PDFS & DOCS
              </button>
              <button
                onClick={() => setActiveFilter('tool')}
                className={`btn-neo px-3 py-1.5 rounded-none font-black uppercase text-xs border-2 border-black transition-all ${
                  activeFilter === 'tool'
                    ? 'bg-[#C4B5FD] text-black shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white text-black hover:bg-[#FFFDF5]'
                }`}
              >
                DEV TOOLS
              </button>
              <button
                onClick={() => setActiveFilter('favorite')}
                className={`btn-neo px-3 py-1.5 rounded-none font-black uppercase text-xs border-2 border-black transition-all ${
                  activeFilter === 'favorite'
                    ? 'bg-[#FFD93D] text-black shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white text-black hover:bg-[#FFFDF5]'
                }`}
              >
                FAVORITES
              </button>
            </div>

            {availableResources.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-xs text-black font-black uppercase underline hover:text-[#FF6B6B] whitespace-nowrap ml-2"
              >
                {selectedIds.length === availableResources.length ? 'DESELECT ALL' : 'SELECT ALL'}
              </button>
            )}
          </div>
        </div>

        {/* Resources List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
          {availableResources.length === 0 ? (
            <div className="py-12 text-center text-xs text-black space-y-1 font-bold">
              <p>No unlinked resources matching your query.</p>
              <p className="text-[11px] text-black/60">All matching items may already belong to this project.</p>
            </div>
          ) : (
            availableResources.map((res) => {
              const isSelected = selectedIds.includes(res.id);
              return (
                <div
                  key={res.id}
                  onClick={() => toggleSelect(res.id)}
                  className={`p-3 rounded-none border-2 border-black flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FFD93D] text-black shadow-[3px_3px_0px_0px_#000]'
                      : 'bg-white hover:bg-[#FFFDF5] text-black shadow-[1px_1px_0px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-5 h-5 rounded-none border-2 border-black flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase truncate text-black">
                          {res.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-none bg-[#C4B5FD] border border-black text-black font-black shrink-0 uppercase">
                          {res.resource_type}
                        </span>
                        {res.page_count && (
                          <span className="text-[10px] font-mono font-black text-black shrink-0 bg-[#FF6B6B] px-1 border border-black">
                            {res.page_count}P
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-black truncate mt-0.5 font-medium">
                        {res.description || res.domain}
                      </p>
                    </div>
                  </div>

                  {res.tags && res.tags.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                      {res.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-none bg-white text-black border border-black font-bold"
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
        <div className="p-4 border-t-4 border-black flex items-center justify-between bg-[#FFFDF5] text-xs">
          <span className="text-black font-mono font-black text-xs uppercase bg-[#FFD93D] px-2 py-0.5 border border-black">
            {selectedIds.length} {selectedIds.length === 1 ? 'RESOURCE' : 'RESOURCES'} SELECTED
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-neo px-4 py-2 rounded-none border-2 border-black text-black font-black uppercase text-xs bg-white shadow-[2px_2px_0px_0px_#000]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSelected}
              disabled={selectedIds.length === 0 || isSubmitting}
              className="btn-neo flex items-center gap-1.5 px-5 py-2.5 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs border-4 border-black shadow-[4px_4px_0px_0px_#000] transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>{isSubmitting ? 'LINKING...' : `ADD ${selectedIds.length} TO PROJECT`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
