import React from 'react';

export function ResourceSkeleton({ count = 6, viewMode = 'grid' }: { count?: number; viewMode?: 'grid' | 'list' }) {
  const items = Array.from({ length: count });

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-none bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between gap-4 animate-pulse"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-none bg-[#FFD93D] border-2 border-black"></div>
              <div className="space-y-2 flex-1 max-w-md">
                <div className="h-4 bg-black/20 rounded-none w-1/3 border border-black"></div>
                <div className="h-3 bg-black/10 rounded-none w-2/3"></div>
              </div>
            </div>
            <div className="h-5 bg-[#C4B5FD] rounded-none w-24 border border-black"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-none bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-4 animate-pulse flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-[#FFD93D] border border-black rounded-none w-24"></div>
              <div className="h-5 w-5 bg-black/20 border border-black rounded-none"></div>
            </div>
            <div className="h-6 bg-black/20 rounded-none w-3/4 border border-black"></div>
            <div className="h-3.5 bg-black/10 rounded-none w-full"></div>
            <div className="h-3.5 bg-black/10 rounded-none w-4/5"></div>
            <div className="flex gap-2 pt-2">
              <div className="h-5 bg-[#C4B5FD] border border-black rounded-none w-14"></div>
              <div className="h-5 bg-[#FF6B6B] border border-black rounded-none w-20"></div>
            </div>
          </div>
          <div className="pt-3 border-t-2 border-black flex items-center justify-between">
            <div className="h-4 bg-black/10 rounded-none w-24"></div>
            <div className="h-4 bg-black/20 rounded-none w-14"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

