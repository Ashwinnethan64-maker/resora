import React from 'react';

export function ResourceSkeleton({ count = 6, viewMode = 'grid' }: { count?: number; viewMode?: 'grid' | 'list' }) {
  const items = Array.from({ length: count });

  if (viewMode === 'list') {
    return (
      <div className="space-y-2.5">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-[#11131c] border border-[#1f2434] flex items-center justify-between gap-4 animate-pulse"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-[#1a1f2e]"></div>
              <div className="space-y-2 flex-1 max-w-md">
                <div className="h-3.5 bg-[#1f2638] rounded w-1/3"></div>
                <div className="h-2.5 bg-[#171c2a] rounded w-2/3"></div>
              </div>
            </div>
            <div className="h-4 bg-[#171c2a] rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-[#11131c] border border-[#1f2434] space-y-3 animate-pulse flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-[#1e2334] rounded w-24"></div>
              <div className="h-4 w-4 bg-[#1e2334] rounded"></div>
            </div>
            <div className="h-4 bg-[#232a3f] rounded w-3/4"></div>
            <div className="h-3 bg-[#171c2a] rounded w-full"></div>
            <div className="h-3 bg-[#171c2a] rounded w-4/5"></div>
            <div className="flex gap-2 pt-1">
              <div className="h-4 bg-[#1c2234] rounded w-12"></div>
              <div className="h-4 bg-[#1c2234] rounded w-16"></div>
            </div>
          </div>
          <div className="pt-3 border-t border-[#1a1f2e] flex items-center justify-between">
            <div className="h-3 bg-[#171c2a] rounded w-20"></div>
            <div className="h-3 bg-[#171c2a] rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
