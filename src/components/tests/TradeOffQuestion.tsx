import React from 'react';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { TradeOffItem } from '../../types.ts';

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

  const handleStep = (itemId: string, delta: number) => {
    const currentVal = currentAllocations[itemId] || 0;
    const nextVal = currentVal + delta;
    if (nextVal < 0) return;
    if (delta > 0 && remaining <= 0) return;

    const next = {
      ...currentAllocations,
      [itemId]: nextVal,
    };
    onChange(next);
  };

  return (
    <div className="space-y-4">
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
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
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
          const pct = (val / maxPoints) * 100;

          return (
            <div
              key={item.id}
              className="p-3.5 sm:p-4 bg-[var(--surface-2)] rounded-2xl border border-[var(--divider)] transition-all hover:border-[var(--accent)]/30 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-medium text-[var(--text)] leading-snug">
                  {item.label}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStep(item.id, -1)}
                    disabled={val <= 0}
                    className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--divider)] hover:bg-[var(--surface-3)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[var(--text)] transition-all cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-6 text-center font-bold text-sm text-[var(--text)]">
                    {val}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleStep(item.id, 1)}
                    disabled={remaining <= 0}
                    className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--divider)] hover:bg-[var(--surface-3)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[var(--text)] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
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
