'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ArrowLeft, Bookmark } from 'lucide-react';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { collections, resources } = useResora();
  const collectionId = params.id as string;

  const collection = collections.find((c) => c.id === collectionId) || collections[0];

  if (!collection) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 text-center">
        <h2 className="text-xl font-bold text-slate-200">Collection not found</h2>
        <Link href="/app/collections" className="text-xs text-indigo-400">Back to Collections</Link>
      </div>
    );
  }

  const linkedResources = resources.filter(
    (r) => !r.is_archived && collection.resource_ids?.includes(r.id)
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collections</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {collection.topic || 'Collection'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          {collection.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          {collection.description}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-2 border-t border-[#1c2132]">
          <span>{linkedResources.length} items in collection</span>
          <span>•</span>
          <span>Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Curated Resources
        </h2>
        {linkedResources.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-[#23293c] text-center text-xs text-slate-400">
            No resources added to this collection yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {linkedResources.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
