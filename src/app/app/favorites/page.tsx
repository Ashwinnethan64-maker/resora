'use client';

import React from 'react';
import Link from 'next/link';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { resources, isLoading } = useResora();
  const favoriteResources = resources.filter((r) => r.is_favorite && !r.is_archived);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-6 border-b border-[#1c2132]">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Favorites
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
            {favoriteResources.length} items
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-400">
          Your bookmarked, mission-critical resources across all projects and research tracks.
        </p>
      </div>

      {/* Grid or Empty State */}
      {isLoading ? (
        <ResourceSkeleton count={4} />
      ) : favoriteResources.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your most valuable resources will appear here."
          description="Click the heart icon on any card in your library or inbox to pin it to your favorites."
          actionLabel="Explore your library"
          onAction={() => {}}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      )}
    </div>
  );
}
