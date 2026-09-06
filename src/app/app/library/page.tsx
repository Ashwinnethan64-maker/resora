'use client';

import React, { useState, useMemo } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { NeoSticker } from '@/components/brand/NeoSticker';
import { INITIAL_SUGGESTED_USE_CASES, INITIAL_SUGGESTED_TAGS } from '@/lib/resource-types';
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  BookOpen,
  X,
  Archive,
  Heart
} from 'lucide-react';

const TYPE_FILTER_BUTTONS = [
  { id: 'all', label: 'ALL', color: 'bg-black text-white' },
  { id: 'ai_tool', label: 'AI TOOLS', color: 'bg-[#FFD93D] text-black' },
  { id: 'github', label: 'GITHUB', color: 'bg-[#FF6B6B] text-black' },
  { id: 'pdf', label: 'PDFS', color: 'bg-[#C4B5FD] text-black' },
  { id: 'document', label: 'DOCS', color: 'bg-[#C4B5FD] text-black' },
  { id: 'website', label: 'WEBSITES', color: 'bg-white text-black' },
  { id: 'video', label: 'VIDEOS', color: 'bg-[#FF6B6B] text-black' },
];

export default function LibraryPage() {
  const { resources, isLoading, openSaveModal } = useResora();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedUseCase, setSelectedUseCase] = useState('all');
  const [filterFavoriteOnly, setFilterFavoriteOnly] = useState(false);
  const [filterArchivedOnly, setFilterArchivedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'recently_opened' | 'alphabetical' | 'recently_updated'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description ? res.description.toLowerCase().includes(q) : false;
        const matchesDomain = res.domain.toLowerCase().includes(q);
        const matchesTags = res.tags ? res.tags.some((t) => t.toLowerCase() === cleanTagQuery(q)) : false;
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
    searchQuery,
    selectedType,
    selectedTag,
    selectedUseCase,
    filterFavoriteOnly,
    filterArchivedOnly,
    sortBy,
  ]);

  function cleanTagQuery(q: string) {
    return q.replace(/^#/, '');
  }

  const hasActiveFilters =
    searchQuery ||
    selectedType !== 'all' ||
    selectedTag !== 'all' ||
    selectedUseCase !== 'all' ||
    filterFavoriteOnly ||
    filterArchivedOnly;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedTag('all');
    setSelectedUseCase('all');
    setFilterFavoriteOnly(false);
    setFilterArchivedOnly(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-100">
      
      {/* ============================================================ */}
      {/* HEADER: NEO-BRUTALIST RESEARCH ARCHIVE POSTER */}
      {/* ============================================================ */}
      <div className="border-b-4 border-black pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <NeoSticker color="violet" rotate="-1">
              RESEARCH ARCHIVE
            </NeoSticker>
            <NeoSticker color="yellow" rotate="2" size="sm">
              INDEX V2
            </NeoSticker>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black leading-[0.88]">
            RESEARCH<br />
            ARCHIVE.
          </h1>
          <p className="text-sm font-black text-black/70 mt-3 max-w-xl leading-relaxed">
            Everything you have captured, indexed, and synthesized. Structured for immediate operational retrieval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            <span className="text-[10px] font-mono font-black uppercase block text-black/60">INDEX COUNT</span>
            <span className="text-3xl font-black text-black leading-none">{filteredResources.length} ITEMS</span>
          </div>
          <button
            onClick={openSaveModal}
            className="btn-neo px-6 py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-black border-4 border-black font-black uppercase text-xs md:text-sm tracking-wider shadow-[6px_6px_0px_0px_#000]"
          >
            + CAPTURE NEW
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONTROLS: LARGE SEARCH BAR (FOCUS YELLOW) + STICKER FILTERS */}
      {/* ============================================================ */}
      <div className="space-y-4">
        
        {/* Search Bar + Sort & View Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* SEARCH BAR: White h-16 box, on focus turns yellow with 8px hard shadow */}
          <div className="relative flex-1 max-w-2xl">
            <Search className="w-6 h-6 text-black absolute left-4 top-1/2 -translate-y-1/2 stroke-[3]" />
            <input
              type="text"
              placeholder="SEARCH YOUR RESEARCH (TITLE, DOMAIN, TAG, USE CASE)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 pl-14 pr-12 rounded-none bg-white focus:bg-[#FFD93D] border-4 border-black text-black placeholder-black/50 text-xs md:text-sm font-black uppercase focus:outline-none shadow-[6px_6px_0px_0px_#000] focus:shadow-[8px_8px_0px_0px_#000] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black font-black hover:scale-110"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Sort & Mode Toggles */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            {/* Sort Select */}
            <div className="flex items-center gap-1.5 px-3.5 py-3 rounded-none bg-white border-4 border-black text-xs font-black text-black shadow-[4px_4px_0px_0px_#000]">
              <ArrowUpDown className="w-4 h-4 text-black stroke-[3]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-black uppercase tracking-wider text-black focus:outline-none cursor-pointer"
              >
                <option value="newest">NEWEST FIRST</option>
                <option value="oldest">OLDEST FIRST</option>
                <option value="recently_opened">RECENTLY OPENED</option>
                <option value="recently_updated">RECENTLY UPDATED</option>
                <option value="alphabetical">ALPHABETICAL</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border-4 border-black p-1 shadow-[4px_4px_0px_0px_#000]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-none transition-colors border-2 ${
                  viewMode === 'grid'
                    ? 'bg-black text-white border-black'
                    : 'text-black border-transparent hover:bg-[#FFFDF5]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-none transition-colors border-2 ${
                  viewMode === 'list'
                    ? 'bg-black text-white border-black'
                    : 'text-black border-transparent hover:bg-[#FFFDF5]'
                }`}
                title="List view"
              >
                <List className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY NEO-BRUTALIST TYPE FILTER BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {TYPE_FILTER_BUTTONS.map((btn) => {
            const isActive = selectedType === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setSelectedType(btn.id)}
                className={`btn-neo px-4 py-2 rounded-none border-4 border-black text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? `${btn.color} shadow-[4px_4px_0px_0px_#000] -rotate-1`
                    : 'bg-white text-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                {btn.label}
              </button>
            );
          })}

          {/* Favorites quick toggle */}
          <button
            onClick={() => setFilterFavoriteOnly(!filterFavoriteOnly)}
            className={`btn-neo flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-black uppercase tracking-wider border-4 border-black transition-all ${
              filterFavoriteOnly
                ? 'bg-[#FF6B6B] text-black shadow-[4px_4px_0px_0px_#000]'
                : 'bg-white text-black hover:bg-[#FFD93D]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${filterFavoriteOnly ? 'fill-black' : ''}`} />
            <span>FAVORITES</span>
          </button>

          {/* Archived view toggle */}
          <button
            onClick={() => setFilterArchivedOnly(!filterArchivedOnly)}
            className={`btn-neo flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-black uppercase tracking-wider border-4 border-black transition-all ${
              filterArchivedOnly
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_#000]'
                : 'bg-white text-black hover:bg-[#E0E0E0]'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>ARCHIVED</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3.5 py-2 rounded-none border-4 border-[#FF6B6B] bg-[#FF6B6B] text-black font-black uppercase text-xs tracking-wider transition-colors ml-auto shadow-[3px_3px_0px_0px_#000]"
            >
              RESET FILTERS ✕
            </button>
          )}
        </div>

        {/* Secondary Dropdowns: Tags & Use Cases */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3.5 py-2 rounded-none bg-white border-4 border-black text-xs font-black uppercase tracking-wider text-black focus:outline-none shadow-[3px_3px_0px_0px_#000]"
          >
            <option value="all">ALL TAGS</option>
            {INITIAL_SUGGESTED_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                #{tag.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={selectedUseCase}
            onChange={(e) => setSelectedUseCase(e.target.value)}
            className="px-3.5 py-2 rounded-none bg-white border-4 border-black text-xs font-black uppercase tracking-wider text-black focus:outline-none shadow-[3px_3px_0px_0px_#000]"
          >
            <option value="all">ALL USE CASES</option>
            {INITIAL_SUGGESTED_USE_CASES.map((uc) => (
              <option key={uc} value={uc}>
                {uc.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* ============================================================ */}
      {/* GRID OR LIST DISPLAY */}
      {/* ============================================================ */}
      {isLoading ? (
        <ResourceSkeleton count={6} viewMode={viewMode} />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={filterArchivedOnly ? 'NO ARCHIVED RESEARCH' : 'NO RESEARCH MATCHES CRITERIA'}
          description={
            filterArchivedOnly
              ? 'Archived resources will appear here when moved out of active index.'
              : 'Try broadening your query keywords or capture a new resource.'
          }
          actionLabel={filterArchivedOnly ? undefined : '+ CAPTURE FIRST RESOURCE'}
          onAction={openSaveModal}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
}
