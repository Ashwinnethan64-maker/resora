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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div>
        <button
          onClick={() => router.back()}
          className="btn-neo inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD93D]"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[3px]" />
          <span>BACK TO COLLECTIONS</span>
        </button>
      </div>

      <div className="p-6 md:p-8 rounded-none bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-black bg-[#FFD93D] px-2.5 py-1 rounded-none border-2 border-black font-black uppercase shadow-[2px_2px_0px_0px_#000]">
            {collection.topic || 'Collection'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-black leading-none">
          {collection.name}
        </h1>
        <p className="text-xs sm:text-sm text-black font-medium max-w-2xl leading-relaxed">
          {collection.description}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono text-black pt-3 border-t-2 border-black">
          <span className="font-black bg-[#FFFDF5] px-2 py-0.5 border border-black">{linkedResources.length} ITEMS IN STACK</span>
          <span>•</span>
          <span className="font-bold">UPDATED {new Date(collection.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-black bg-[#C4B5FD] px-3 py-1 border-2 border-black w-max shadow-[2px_2px_0px_0px_#000]">
          CURATED RESOURCES
        </h2>
        {linkedResources.length === 0 ? (
          <div className="p-12 rounded-none border-4 border-black bg-white shadow-[6px_6px_0px_0px_#000] text-center text-xs md:text-sm text-black font-bold">
            No resources added to this collection yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {linkedResources.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
