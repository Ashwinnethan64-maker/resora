'use client';

import React from 'react';
import Link from 'next/link';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/SectionLabel';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { resources, isLoading } = useResora();
  const favoriteResources = resources.filter((r) => r.is_favorite && !r.is_archived);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <PageHeader
        eyebrow="BOOKMARKED ASSETS"
        eyebrowColor="coral"
        eyebrowIcon={<Heart className="w-3 h-3 fill-black stroke-black" />}
        title="MISSION-CRITICAL FAVORITES."
        description="Your prioritized, high-conviction research resources accessible across all projects and intelligence queries."
        actions={
          <div className="p-3.5 bg-[#FFD93D] border-2 border-black shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-mono font-black uppercase text-black block">PINNED ASSETS</span>
            <span className="text-2xl font-black text-black">{favoriteResources.length} ITEMS</span>
          </div>
        }
      />

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
