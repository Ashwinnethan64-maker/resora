'use client';

import React from 'react';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';

export default function AppLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-100">
      <div className="h-14 w-72 bg-white border-3 border-black shadow-[4px_4px_0px_#000] flex items-center px-4">
        <div className="w-2.5 h-2.5 bg-[#FFD93D] border border-black animate-ping mr-2.5" />
        <span className="text-xs font-mono font-black uppercase text-black">LOADING WORKSPACE...</span>
      </div>
      <ResourceSkeleton count={6} />
    </div>
  );
}