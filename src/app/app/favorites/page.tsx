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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header: Neo-Brutalist Bookmarked Assets */}
      <div className="border-b-4 border-black pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6B6B] text-black border-2 border-black text-xs font-black uppercase tracking-wider mb-3 shadow-[3px_3px_0px_0px_#000] -rotate-1">
            <Heart className="w-3.5 h-3.5 fill-black" />
            BOOKMARKED ASSETS
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-black leading-none">
            MISSION-CRITICAL<br />
            FAVORITES.
          </h1>
          <p className="text-sm md:text-base font-bold text-black mt-3 max-w-xl">
            Your prioritized, high-conviction research resources accessible across all projects and intelligence queries.
          </p>
        </div>

        <div className="p-5 bg-[#FFD93D] border-4 border-black shadow-[6px_6px_0px_0px_#000] rotate-1">
          <span className="text-[10px] font-mono font-black uppercase text-black block">PINNED ASSETS</span>
          <span className="text-3xl font-black text-black">{favoriteResources.length} ITEMS</span>
        </div>
      </div>

      {/* Grid or Empty State */}
      {isLoading ? (
        <ResourceSkeleton count={4} />
      ) : favoriteResources.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="NO FAVORITE ASSETS PINNED YET"
          description="Click the heart icon on any card in your library or inbox to pin it to your favorites."
          actionLabel="EXPLORE YOUR LIBRARY"
          onAction={() => {}}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      )}
    </div>
  );
}
