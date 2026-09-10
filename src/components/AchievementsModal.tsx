import React from 'react';
import { Award, CheckCircle2, Lock, X } from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { ColoredIcon } from './ColoredIcon';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { achievements, coupleProfile } = useCouple();

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--surface)] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[var(--divider)] space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-2)] text-amber-500 border border-[var(--divider)] flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[var(--text)] text-base">
                Достижения пары ({unlockedCount} из {achievements.length})
              </h3>
              <p className="text-xs text-[var(--text-2)]">
                {coupleProfile.partner1.name} & {coupleProfile.partner2.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-2)] hover:text-[var(--text)] rounded-full hover:bg-[var(--surface-2)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Badges */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all ${
                ach.unlocked
                  ? 'bg-[var(--surface-2)] border-[var(--accent)]/40 shadow-xs'
                  : 'bg-[var(--surface)] border-[var(--divider)] opacity-50'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  ach.unlocked
                    ? 'bg-amber-500/10 border border-amber-500/20 shadow-xs'
                    : 'bg-[var(--surface-2)] text-[var(--text-2)]'
                }`}
              >
                <ColoredIcon
                  name={ach.icon}
                  color={ach.unlocked ? 'gold' : 'slate'}
                  size="md"
                  className={ach.unlocked ? '' : 'opacity-40'}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text)]">
                    {ach.title}
                  </h4>
                  {ach.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Разблокировано
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--text-2)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full shrink-0">
                      <Lock className="w-3 h-3" />
                      Закрыто
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
