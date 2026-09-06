'use client';

import React, { useState, useMemo } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { RESOURCE_TYPE_CONFIGS, INITIAL_SUGGESTED_USE_CASES, INITIAL_SUGGESTED_TAGS } from '@/lib/resource-types';
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  BookOpen,
  X,
  Filter,
  Archive,
  Heart
} from 'lucide-react';

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

  // Multi-dimensional filtering logic
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Archive toggle
      if (filterArchivedOnly) {
        if (!res.is_archived) return false;
      } else {
        if (res.is_archived) return false;
      }

      // Favorite toggle
      if (filterFavoriteOnly && !res.is_favorite) return false;

      // Type filter
      if (selectedType !== 'all' && res.resource_type !== selectedType) return false;

      // Tag filter
      if (selectedTag !== 'all') {
        const cleanTag = selectedTag.toLowerCase();
        if (!res.tags?.some((t) => t.toLowerCase() === cleanTag)) return false;
      }

      // Use case filter
      if (selectedUseCase !== 'all') {
        const cleanUc = selectedUseCase.toLowerCase();
        if (!res.use_cases?.some((u) => u.toLowerCase() === cleanUc)) return false;
      }

      // Search query across title, description, domain, tags, and use cases
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
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
      // default: newest
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-6 border-b border-[#1c2132]">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Library
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#181c2c] text-slate-400 border border-[#262d42]">
            {filteredResources.length} {filteredResources.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-400">
          Everything you've saved, organized around how you use it.
        </p>
      </div>

      {/* Controls: Search, Sort, View Toggle */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, domain, tag, or use case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#121420] border border-[#212638] text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* Sorting */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#121420] border border-[#212638] text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-[#11131c]">Newest first</option>
                <option value="oldest" className="bg-[#11131c]">Oldest first</option>
                <option value="recently_opened" className="bg-[#11131c]">Recently opened</option>
                <option value="recently_updated" className="bg-[#11131c]">Recently updated</option>
                <option value="alphabetical" className="bg-[#11131c]">Alphabetical</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#121420] border border-[#212638]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns & Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Resource Types */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#121420] border border-[#212638] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all" className="bg-[#11131c]">All types</option>
            {Object.values(RESOURCE_TYPE_CONFIGS).map((cfg) => (
              <option key={cfg.id} value={cfg.id} className="bg-[#11131c]">
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Tags */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#121420] border border-[#212638] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all" className="bg-[#11131c]">All tags</option>
            {INITIAL_SUGGESTED_TAGS.map((tag) => (
              <option key={tag} value={tag} className="bg-[#11131c]">
                #{tag}
              </option>
            ))}
          </select>

          {/* Use Cases ("Why would I use this?") */}
          <select
            value={selectedUseCase}
            onChange={(e) => setSelectedUseCase(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#121420] border border-[#212638] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all" className="bg-[#11131c]">All use cases</option>
            {INITIAL_SUGGESTED_USE_CASES.map((uc) => (
              <option key={uc} value={uc} className="bg-[#11131c]">
                {uc}
              </option>
            ))}
          </select>

          {/* Favorites quick toggle */}
          <button
            onClick={() => setFilterFavoriteOnly(!filterFavoriteOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterFavoriteOnly
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-[#121420] text-slate-400 border-[#212638] hover:text-slate-200'
            }`}
          >
            <Heart className={`w-3 h-3 ${filterFavoriteOnly ? 'fill-rose-300' : ''}`} />
            <span>Favorites</span>
          </button>

          {/* Archived view toggle */}
          <button
            onClick={() => setFilterArchivedOnly(!filterArchivedOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterArchivedOnly
                ? 'bg-zinc-700/40 text-zinc-200 border-zinc-600'
                : 'bg-[#121420] text-slate-400 border-[#212638] hover:text-slate-200'
            }`}
          >
            <Archive className="w-3 h-3" />
            <span>Archived</span>
          </button>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-2 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Grid or List Display */}
      {isLoading ? (
        <ResourceSkeleton count={6} viewMode={viewMode} />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={filterArchivedOnly ? 'No archived resources.' : 'No resources match your filters.'}
          description={
            filterArchivedOnly
              ? 'Archived resources will appear here when you archive them from your library.'
              : 'Try broadening your search query or save a new research link.'
          }
          actionLabel={filterArchivedOnly ? undefined : '+ Save new resource'}
          onAction={openSaveModal}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
}
