import React from 'react';
import { Heart, Clock, ArrowRight } from 'lucide-react';
import { TestCategory } from '../../types.ts';
import { getTestMeta } from './testMeta.ts';

interface TestFeaturedCardProps {
  featuredTest: TestCategory;
  onStartTest: (test: TestCategory) => void;
}

export const TestFeaturedCard: React.FC<TestFeaturedCardProps> = ({
  featuredTest,
  onStartTest,
}) => {
  const meta = getTestMeta(featuredTest);

  return (
    <div className="p-6 sm:p-7 rounded-[28px] bg-[var(--surface)] border border-[var(--divider)] relative overflow-hidden space-y-4 shadow-2xs">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--accent)]/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[var(--accent)] flex items-center gap-1">
            <span>Рекомендуем начать</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight leading-snug">
            {meta.emotionalTitle}
          </h2>
          <div className="text-xs text-[var(--text-2)] font-medium">{meta.tagline}</div>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
          <Heart className="w-5 h-5 fill-[var(--accent)]" />
        </div>
      </div>

      <p className="relative z-10 text-xs sm:text-sm text-[var(--text-2)] font-normal leading-relaxed">
        {meta.discoveryText}
      </p>

      <div className="relative z-10 pt-2 flex items-center justify-between gap-3 border-t border-[var(--divider)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-2)]">
          <Clock className="w-3.5 h-3.5 text-[var(--text-3)]" />
          <span>{meta.estimatedMinutes} минут для двоих</span>
        </div>

        <button
          type="button"
          onClick={() => onStartTest(featuredTest)}
          className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
        >
          <span>Пройти вместе</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
