'use client';

import React, { useState, useMemo } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { INITIAL_SUGGESTED_USE_CASES, INITIAL_SUGGESTED_TAGS } from '@/lib/resource-types';
import { PageHeader } from '@/components/ui/SectionLabel';
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  BookOpen,
  X,
  Archive,
  Heart,
  Plus
} from 'lucide-react';

const TYPE_FILTER_BUTTONS = [
  { id: 'all', label: 'ALL' },
  { id: 'ai_tool', label: 'AI TOOLS' },
  { id: 'web_app', label: 'WEB APPS' },
  { id: 'developer_tool', label: 'DEV TOOLS' },
  { id: 'github', label: 'GITHUB' },
  { id: 'pdf', label: 'PDFS' },
  { id: 'document', label: 'DOCS' },
  { id: 'website', label: 'WEBSITES' },
  { id: 'video', label: 'VIDEOS' },
];

export default function LibraryPage() {
  const { resources, isLoading, openSaveModal, cleanAllDuplicates } = useResora();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedUseCase, setSelectedUseCase] = useState('all');
  const [filterFavoriteOnly, setFilterFavoriteOnly] = useState(false);
  const [filterArchivedOnly, setFilterArchivedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'recently_opened' | 'alphabetical' | 'recently_updated'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;

  // Debounce search input by 200ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (filterArchivedOnly) {
        if (!res.is_archived) return false;
      } else {
        if (res.is_archived) return false;
      }

      if (filterFavoriteOnly && !res.is_favorite) return false;
      if (selectedType !== 'all' && res.resource_type !== selectedType) return false;

      if (selectedTag !== 'all') {
        const cleanTag = selectedTag.toLowerCase();
        if (!res.tags?.some((t) => t.toLowerCase() === cleanTag)) return false;
      }

      if (selectedUseCase !== 'all') {
        const cleanUc = selectedUseCase.toLowerCase();
        if (!res.use_cases?.some((u) => u.toLowerCase() === cleanUc)) return false;
      }

      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description ? res.description.toLowerCase().includes(q) : false;
        const matchesDomain = res.domain.toLowerCase().includes(q);
        const matchesTags = res.tags ? res.tags.some((t) => t.toLowerCase().includes(q)) : false;
        const matchesUc = res.use_cases ? res.use_cases.some((u) => u.toLowerCase().includes(q)) : false;
        if (!matchesTitle && !matchesDesc && !matchesDomain && !matchesTags && !matchesUc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'recently_opened') {
        const timeA = a.last_opened_at ? new Date(a.last_opened_at).getTime() : 0;
        const timeB = b.last_opened_at ? new Date(b.last_opened_at).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'recently_updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [
    resources,
    debouncedSearch,
    selectedType,
    selectedTag,
    selectedUseCase,
    filterFavoriteOnly,
    filterArchivedOnly,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredResources.length / PAGE_SIZE) || 1;
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredResources.slice(start, start + PAGE_SIZE);
  }, [filteredResources, currentPage]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Capture CTA */}
      <PageHeader
        eyebrow="RESEARCH ARCHIVE"
        eyebrowColor="yellow"
        eyebrowIcon={<span className="w-2 h-2 rounded-full bg-black inline-block" />}
        title="RESEARCH LIBRARY."
        description={`${filteredResources.length} ${filteredResources.length === 1 ? 'resource' : 'resources'} indexed across websites, documents, and tools.`}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={async () => {
                await cleanAllDuplicates();
              }}
              className="btn-neo flex items-center gap-2 px-4 py-3 bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black uppercase text-xs md:text-sm tracking-wider border-2 border-black shadow-[3px_3px_0px_#000]"
              title="Merge and eliminate duplicate URLs across library"
            >
              <span>CLEAN DUPLICATES</span>
            </button>
            <button
              onClick={openSaveModal}
              className="btn-neo flex items-center gap-2 px-5 py-3 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-2 border-black shadow-[3px_3px_0px_#000]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ CAPTURE NEW</span>
            </button>
          </div>
        }
      />

      {/* Search Bar & View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          <input
            type="text"
            placeholder="Search resources by title, domain, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-black text-black font-normal text-xs sm:text-sm placeholder-black/50 focus:bg-[#FFFDF5] focus:outline-none shadow-[2px_2px_0px_#000]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode & Sort Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 bg-white border-2 border-black text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="recently_opened">Recently Opened</option>
            <option value="recently_updated">Recently Updated</option>
          </select>

          <div className="flex border-2 border-black bg-white shadow-[2px_2px_0px_#000]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-[#FFD93D] text-black font-black' : 'text-black/60 hover:text-black'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors border-l-2 border-black ${
                viewMode === 'list' ? 'bg-[#FFD93D] text-black font-black' : 'text-black/60 hover:text-black'
              }`}
              title="List View"
            >
              <List className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {TYPE_FILTER_BUTTONS.map((btn) => {
          const isSelected = selectedType === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setSelectedType(btn.id)}
              className={`px-3 py-1.5 border-2 border-black font-bold uppercase transition-all whitespace-nowrap shadow-[2px_2px_0px_#000] ${
                isSelected
                  ? 'bg-[#FFD93D] text-black font-black -translate-y-0.5'
                  : 'bg-white text-black/80 hover:bg-[#FFFDF5]'
              }`}
            >
              {btn.label}
            </button>
          );
        })}

        <button
          onClick={() => setFilterFavoriteOnly(!filterFavoriteOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-bold uppercase whitespace-nowrap shadow-[2px_2px_0px_#000] ml-auto ${
            filterFavoriteOnly ? 'bg-[#FF6B6B] text-black font-black' : 'bg-white text-black hover:bg-[#FFFDF5]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${filterFavoriteOnly ? 'fill-black' : ''}`} />
          <span>Favorites</span>
        </button>
      </div>

      {/* Active Filter Tags */}
      {(selectedType !== 'all' || selectedTag !== 'all' || selectedUseCase !== 'all' || filterFavoriteOnly || filterArchivedOnly || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="font-mono text-[11px] text-black/60 font-bold uppercase">Active:</span>
          {selectedType !== 'all' && (
            <span className="px-2 py-0.5 bg-white border border-black text-[11px] font-bold">
              Type: {selectedType}
            </span>
          )}
          {filterFavoriteOnly && (
            <span className="px-2 py-0.5 bg-[#FF6B6B] border border-black text-[11px] font-bold">
              Favorites
            </span>
          )}
          {searchQuery && (
            <span className="px-2 py-0.5 bg-[#FFD93D] border border-black text-[11px] font-bold">
              Query: "{searchQuery}"
            </span>
          )}
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedTag('all');
              setSelectedUseCase('all');
              setFilterFavoriteOnly(false);
              setFilterArchivedOnly(false);
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-black underline hover:text-[#FF6B6B]"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Resources Render */}
      {isLoading ? (
        <ResourceSkeleton count={6} viewMode={viewMode} />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="NO MATCHING RESEARCH FOUND"
          description={
            debouncedSearch || selectedType !== 'all'
              ? 'Try broadening your search query or removing active filters.'
              : 'Your research archive is currently empty. Capture your first resource to build your personal intelligence layer.'
          }
          actionLabel="+ CAPTURE FIRST RESOURCE"
          onAction={openSaveModal}
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {paginatedResources.map((res) => (
            <ResourceCard key={res.id} resource={res} viewMode="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedResources.map((res) => (
            <ResourceCard key={res.id} resource={res} viewMode="grid" />
          ))}
        </div>
      )}

      {/* Neo-Brutalist Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 border-t-3 border-black flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs font-mono font-bold text-black">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredResources.length)} of {filteredResources.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="btn-neo px-3 py-1.5 bg-white border-2 border-black text-xs font-black uppercase text-black disabled:opacity-30 disabled:pointer-events-none hover:bg-[#FFD93D] shadow-[2px_2px_0px_#000]"
            >
              ← Prev
            </button>

            <span className="px-3 py-1.5 bg-[#FFD93D] border-2 border-black font-mono text-xs font-black text-black">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="btn-neo px-3 py-1.5 bg-white border-2 border-black text-xs font-black uppercase text-black disabled:opacity-30 disabled:pointer-events-none hover:bg-[#FFD93D] shadow-[2px_2px_0px_#000]"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
