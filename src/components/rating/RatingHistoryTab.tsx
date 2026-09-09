import React from 'react';
import { ShieldCheck, Wine, Zap, Heart, Target } from 'lucide-react';
import { ColoredIcon } from '../ColoredIcon.tsx';

interface RatingHistoryTabProps {
  xpHistory?: any[];
}

export const RatingHistoryTab: React.FC<RatingHistoryTabProps> = ({ xpHistory }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text)]">История активности пары</h3>
        <span className="text-xs text-[var(--text-secondary)]">Последние действия</span>
      </div>

      {xpHistory && xpHistory.length > 0 ? (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {xpHistory.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--divider)] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ColoredIcon
                  icon={
                    item.category === 'test'
                      ? ShieldCheck
                      : item.category === 'date'
                      ? Wine
                      : item.category === 'tap'
                      ? Zap
                      : item.category === 'mood'
                      ? Heart
                      : Target
                  }
                  color={
                    item.category === 'test'
                      ? 'indigo'
                      : item.category === 'date'
                      ? 'rose'
                      : item.category === 'tap'
                      ? 'gold'
                      : item.category === 'mood'
                      ? 'emerald'
                      : 'coral'
                  }
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text)]">{item.reason}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    {new Date(item.timestamp).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[var(--accent)] flex-shrink-0">
                +{item.points} XP
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-[var(--surface-hover)] border border-[var(--divider)] text-xs text-[var(--text-secondary)]">
          Каждое ваше совместное действие будет отображаться здесь с начислением XP!
        </div>
      )}
    </div>
  );
};
