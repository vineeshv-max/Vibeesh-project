import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-[#14161f] p-3.5 rounded-xl border border-white/5 animate-pulse flex flex-col gap-3">
      <div className="w-full aspect-square bg-zinc-800/60 rounded-lg"></div>
      <div className="h-4 bg-zinc-800/80 rounded w-3/4"></div>
      <div className="h-3 bg-zinc-800/50 rounded w-1/2"></div>
    </div>
  );
};

export const SkeletonRow: React.FC = () => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-[#14161f]/40 rounded-lg border border-white/5 animate-pulse">
      <div className="w-6 h-4 bg-zinc-800/60 rounded"></div>
      <div className="w-12 h-12 bg-zinc-800/80 rounded-md shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-zinc-800/80 rounded w-1/3"></div>
        <div className="h-3 bg-zinc-800/50 rounded w-1/4"></div>
      </div>
      <div className="h-3 bg-zinc-800/40 rounded w-16 hidden md:block"></div>
      <div className="h-3 bg-zinc-800/40 rounded w-12"></div>
    </div>
  );
};
