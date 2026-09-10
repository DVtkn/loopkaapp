import React from 'react';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { TradeOffItem } from '../../types.ts';
import { triggerHaptic } from '../../utils/haptics.ts';

interface TradeOffQuestionProps {
  items: TradeOffItem[];
  maxPoints?: number;
  allocations: Record<string, number>;
  onChange: (allocations: Record<string, number>) => void;
}

export const TradeOffQuestion: React.FC<TradeOffQuestionProps> = ({
  items,
  maxPoints = 10,
  allocations,
  onChange,
}) => {
  const currentAllocations: Record<string, number> = {};
  items.forEach((item) => {
    currentAllocations[item.id] = allocations[item.id] || 0;
  });

  const totalUsed = Object.values(currentAllocations).reduce((sum, val) => sum + val, 0);
  const remaining = maxPoints - totalUsed;

  const handleIncrement = (itemId: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (remaining <= 0) {
      triggerHaptic('warning');
      return;
    }

    const currentVal = currentAllocations[itemId] || 0;
    const nextVal = currentVal + 1;
    const next = {
      ...currentAllocations,
      [itemId]: nextVal,
    };

    triggerHaptic('light');
    onChange(next);
  };

  const handleDecrement = (itemId: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const currentVal = currentAllocations[itemId] || 0;
    if (currentVal <= 0) return;

    const nextVal = currentVal - 1;
    const next = {
      ...currentAllocations,
      [itemId]: nextVal,
    };

    triggerHaptic('light');
    onChange(next);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Points pool header */}
      <div className="flex items-center justify-between p-3.5 bg-[var(--surface-2)] rounded-2xl border border-[var(--divider)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text)]">Распределение ресурса</div>
            <div className="text-[11px] text-[var(--text-2)]">Распределите ровно {maxPoints} баллов</div>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            remaining === 0
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs'
              : remaining < 0
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse'
          }`}
        >
          {remaining === 0 ? '✓ Готово (0)' : `Осталось: ${remaining}`}
        </div>
      </div>

      {/* Item rows */}
      <div className="space-y-2.5">
        {items.map((item) => {
          const val = currentAllocations[item.id] || 0;
          const pct = Math.min(100, Math.max(0, (val / maxPoints) * 100));

          return (
            <div
              key={item.id}
              className="p-3.5 sm:p-4 bg-[var(--surface-2)] rounded-2xl border border-[var(--divider)] transition-all space-y-2.5 relative"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-medium text-[var(--text)] leading-snug">
                  {item.label}
                </span>

                {/* Stepper container with high z-index and touch optimization */}
                <div className="flex items-center gap-2 shrink-0 relative z-10 pointer-events-auto touch-manipulation">
                  <button
                    type="button"
                    onClick={(e) => handleDecrement(item.id, e)}
                    disabled={val <= 0}
                    aria-label={`Уменьшить ${item.label}`}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-[var(--surface)] border border-[var(--divider)] hover:bg-[var(--surface-3)] active:scale-90 active:bg-[var(--surface-3)] disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center text-[var(--text)] transition-transform duration-75 cursor-pointer touch-manipulation select-none"
                  >
                    <Minus className="w-4 h-4 pointer-events-none" />
                  </button>

                  <span className="w-7 text-center font-bold text-sm sm:text-base text-[var(--text)] tabular-nums select-none">
                    {val}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleIncrement(item.id, e)}
                    disabled={remaining <= 0}
                    aria-label={`Увеличить ${item.label}`}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-[var(--surface)] border border-[var(--divider)] hover:bg-[var(--surface-3)] active:scale-90 active:bg-[var(--surface-3)] disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center text-[var(--text)] transition-transform duration-75 cursor-pointer touch-manipulation select-none"
                  >
                    <Plus className="w-4 h-4 pointer-events-none" />
                  </button>
                </div>
              </div>

              {/* Visual fill bar */}
              <div className="w-full bg-[var(--surface-3)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-full rounded-full transition-all duration-200"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
