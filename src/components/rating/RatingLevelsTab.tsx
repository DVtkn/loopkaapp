import React from 'react';
import { Sparkles, Heart, ShieldCheck, Flame, Crown, Trophy, CheckCircle2, Check } from 'lucide-react';
import { COUPLE_LEVELS } from '../../utils/rankingEngine.ts';
import { ColoredIcon } from '../ColoredIcon.tsx';

interface RatingLevelsTabProps {
  currentLevel: number;
  totalXP: number;
}

export const RatingLevelsTab: React.FC<RatingLevelsTabProps> = ({
  currentLevel,
  totalXP,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text)]">Шкала рангов и преимуществ</h3>
        <span className="text-xs text-[var(--text-secondary)]">Уровни 1 — 6</span>
      </div>

      <div className="space-y-3">
        {COUPLE_LEVELS.map((lvl) => {
          const isCurrent = currentLevel === lvl.level;
          const isReached = totalXP >= lvl.minXP;

          return (
            <div
              key={lvl.level}
              className={`p-4 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-xs'
                  : isReached
                  ? 'bg-[var(--surface-hover)] border-[var(--divider)] opacity-90'
                  : 'bg-[var(--surface-hover)]/50 border-[var(--divider)] opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ColoredIcon
                    icon={
                      lvl.level === 1
                        ? Sparkles
                        : lvl.level === 2
                        ? Heart
                        : lvl.level === 3
                        ? ShieldCheck
                        : lvl.level === 4
                        ? Flame
                        : lvl.level === 5
                        ? Crown
                        : Trophy
                    }
                    color={lvl.color}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text)]">
                        Уровень {lvl.level}: {lvl.name}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--accent)] text-white">
                          Текущий
                        </span>
                      )}
                      {isReached && !isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{lvl.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[140px]">
                  <span className="text-xs font-bold text-[var(--text)]">
                    {lvl.minXP} — {lvl.maxXP} XP
                  </span>
                </div>
              </div>

              {/* Perks list */}
              <div className="mt-3 pt-2.5 border-t border-[var(--divider)] flex flex-wrap gap-2">
                {lvl.perks.map((perk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--divider)] flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-[var(--accent)]" />
                    <span>{perk}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
