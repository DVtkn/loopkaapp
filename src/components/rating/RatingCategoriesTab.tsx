import React from 'react';
import { ShieldCheck, Wine, Zap, Heart, Target, ChevronRight } from 'lucide-react';
import { ColoredIcon } from '../ColoredIcon.tsx';

interface RatingCategoriesTabProps {
  categories: any[];
  onNavigateToTests?: () => void;
  onNavigateToDates?: () => void;
}

export const RatingCategoriesTab: React.FC<RatingCategoriesTabProps> = ({
  categories,
  onNavigateToTests,
  onNavigateToDates,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text)]">Источники формирования рейтинга</h3>
        <span className="text-xs text-[var(--text-secondary)]">5 ключевых сфер</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--divider)] flex flex-col justify-between gap-3 hover:border-[var(--accent)]/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <ColoredIcon
                  icon={
                    cat.key === 'tests'
                      ? ShieldCheck
                      : cat.key === 'dates'
                      ? Wine
                      : cat.key === 'reactions'
                      ? Zap
                      : cat.key === 'care'
                      ? Heart
                      : Target
                  }
                  color={cat.color}
                  size="md"
                />
                <div>
                  <h4 className="text-xs font-bold text-[var(--text)]">{cat.title}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">{cat.subtitle}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[var(--text)]">
                +{cat.points} <span className="text-[10px] text-[var(--text-secondary)]">XP</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--divider)]">
              <span>{cat.xpPerAction}</span>
              {cat.key === 'tests' && onNavigateToTests && (
                <button
                  onClick={onNavigateToTests}
                  className="text-[var(--accent)] font-bold hover:underline inline-flex items-center gap-0.5"
                >
                  Пройти <ChevronRight className="w-3 h-3" />
                </button>
              )}
              {cat.key === 'dates' && onNavigateToDates && (
                <button
                  onClick={onNavigateToDates}
                  className="text-[var(--accent)] font-bold hover:underline inline-flex items-center gap-0.5"
                >
                  Свидания <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
