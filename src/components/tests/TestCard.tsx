import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { TestCategory } from '../../types.ts';
import { getTestMeta } from './testMeta.ts';

interface TestCardProps {
  test: TestCategory;
  onClick: () => void;
  status: {
    state: string;
    label: string;
    sublabel: string;
    isComplete: boolean;
    actionText: string;
  };
}

export const TestCard: React.FC<TestCardProps> = ({ test, onClick, status }) => {
  const meta = getTestMeta(test);

  return (
    <div
      onClick={onClick}
      className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] hover:border-[var(--accent)]/40 transition-all cursor-pointer group space-y-3 shadow-2xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--accent)]">
              {meta.categoryIcon} {meta.categoryLabel}
            </span>
            <span className="text-[11px] text-[var(--text-3)]">•</span>
            <span className="text-[11px] text-[var(--text-2)] font-medium">
              {meta.estimatedMinutes} мин
            </span>
          </div>

          <h4 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
            {meta.emotionalTitle}
          </h4>

          <div className="text-xs text-[var(--text-3)] font-normal">{meta.tagline}</div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0 text-right">
          {status.state === 'BOTH_DONE' ? (
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{status.label}</span>
            </div>
          ) : status.state === 'WAITING_PARTNER' ? (
            <div className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-semibold">
              {status.label}
            </div>
          ) : status.state === 'PARTNER_READY' ? (
            <div className="px-2.5 py-1 rounded-full bg-[var(--surface-blush)] text-[var(--accent)] text-[11px] font-bold">
              {status.label}
            </div>
          ) : (
            <div className="text-[11px] text-[var(--text-3)] font-medium">{status.label}</div>
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--text-2)] leading-relaxed font-normal">
        {meta.discoveryText}
      </p>

      <div className="pt-2 border-t border-[var(--divider)] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[var(--text-3)]">{status.sublabel}</span>
        <span className="font-bold text-[var(--accent)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          <span>{status.actionText}</span>
        </span>
      </div>
    </div>
  );
};
