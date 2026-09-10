import React from 'react';
import { Moon, Check, Sparkles, Plus } from 'lucide-react';
import { ScheduleEvent, PartnerId } from '../../types.ts';
import { triggerHaptic } from '../../utils/haptics.ts';

interface EveningDateTabProps {
  todayStr: string;
  eveningEvents: ScheduleEvent[];
  eveningFreeSummary: {
    isEntirelyFree: boolean;
    freeFrom: string | null;
    text: string;
  };
  currentPartnerId: PartnerId;
  partnerName: string;
  onOpenDateWheel?: () => void;
  onOpenAddForm: (defaultDate?: string, defaultStart?: string, defaultEnd?: string, defaultCat?: string) => void;
}

export const EveningDateTab: React.FC<EveningDateTabProps> = ({
  todayStr,
  eveningEvents,
  eveningFreeSummary,
  currentPartnerId,
  partnerName,
  onOpenDateWheel,
  onOpenAddForm,
}) => {
  return (
    <div className="space-y-3">
      {/* Evening Hero Focus */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-purple-500/10 border border-sky-500/25 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text)]">Вечерний срез (после 18:00)</h4>
            <p className="text-xs text-[var(--text-2)] mt-0.5">{eveningFreeSummary.text}</p>
          </div>
        </div>

        {/* Primary CTA: Offer date tonight */}
        {eveningEvents.length === 0 ? (
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--divider)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4" />
              <span>Идеальное время для свидания или романтического ужина</span>
            </div>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              Ни у кого из вас нет планов на вечер. Выберите идею в генераторе свиданий или запланируйте совместный вечер прямо сейчас.
            </p>

            {onOpenDateWheel && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenDateWheel();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Предложить провести вечер вместе (Колесо идей)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-bold text-[var(--text)]">Планы на вечер сегодня:</p>
            {eveningEvents.map((ev) => {
              const isCreatedByMe = ev.creatorId === currentPartnerId;
              const isMasked = ev.isPrivate && !isCreatedByMe;
              return (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--divider)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">
                      {ev.startTime}
                      {ev.endTime ? ` – ${ev.endTime}` : ''}
                    </span>
                    <span className="text-[var(--text)] font-medium line-clamp-1">
                      {isMasked ? 'Занято' : ev.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--text-2)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded-md">
                    {isCreatedByMe ? 'Вы' : partnerName}
                  </span>
                </div>
              );
            })}

            {eveningFreeSummary.freeFrom && onOpenDateWheel && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenDateWheel();
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold border border-sky-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Предложить встречу после {eveningFreeSummary.freeFrom}</span>
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => onOpenAddForm(todayStr, '19:00', '21:00', 'date')}
          className="w-full py-2 px-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--divider)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-sky-600" />
          <span>Запланировать вечернее дело</span>
        </button>
      </div>
    </div>
  );
};
