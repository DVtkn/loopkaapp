import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] border-dashed">
      <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-3 shadow-xs border border-[var(--divider)] text-[var(--text-2)]">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[var(--text)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-2)] max-w-xs mb-4 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
