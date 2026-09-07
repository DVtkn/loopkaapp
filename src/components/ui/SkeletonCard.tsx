import React from 'react';

export function SkeletonCard() {
  return (
    <div className="app-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 whitespace-nowrap rounded-full bg-[var(--surface-2)]" />
        <div className="w-32 h-4 whitespace-nowrap rounded-full bg-[var(--surface-2)]" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 whitespace-nowrap rounded-full bg-[var(--surface-2)]" />
        <div className="w-5/6 h-3 whitespace-nowrap rounded-full bg-[var(--surface-2)]" />
        <div className="w-4/6 h-3 whitespace-nowrap rounded-full bg-[var(--surface-2)]" />
      </div>
      <div className="pt-2 flex gap-2">
        <div className="w-24 h-8 rounded-xl bg-[var(--surface-2)]" />
        <div className="w-24 h-8 rounded-xl bg-[var(--surface-2)]" />
      </div>
    </div>
  );
}
