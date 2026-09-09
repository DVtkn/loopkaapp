import React from 'react';
import { Plus, Coffee, Trash2 } from 'lucide-react';
import { ScheduleEvent, PartnerId } from '../../types.ts';
import { formatDuration, FreeGap } from './scheduleUtils.ts';
import { triggerHaptic } from '../../utils/haptics.ts';

export interface WeekDayInfo {
  dateKey: string;
  dayOfWeek: string;
  dayNum: number;
  monthStr: string;
  isToday: boolean;
  eventsCount: number;
  busynessLevel: 'free' | 'partial' | 'busy';
  busynessLabel: string;
  events: ScheduleEvent[];
}

interface WeekScheduleTabProps {
  weekDays: WeekDayInfo[];
  selectedDateForWeek: string;
  setSelectedDateForWeek: (val: string) => void;
  selectedDayInWeek: WeekDayInfo;
  selectedDayTimelineItems: Array<
    | { type: 'event'; event: ScheduleEvent; sortKey: string }
    | { type: 'gap'; gap: FreeGap; sortKey: string }
  >;
  currentPartnerId: PartnerId;
  myEmoji: string;
  partnerEmoji: string;
  onOpenAddForm: (date: string) => void;
  onDeleteEvent: (id: string) => void;
}

export const WeekScheduleTab: React.FC<WeekScheduleTabProps> = ({
  weekDays,
  selectedDateForWeek,
  setSelectedDateForWeek,
  selectedDayInWeek,
  selectedDayTimelineItems,
  currentPartnerId,
  myEmoji,
  partnerEmoji,
  onOpenAddForm,
  onDeleteEvent,
}) => {
  return (
    <div className="space-y-3">
      {/* 7-day compact interactive strip */}
      <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)]">
        {weekDays.map((d) => {
          const isSelected = d.dateKey === selectedDateForWeek;
          return (
            <button
              key={d.dateKey}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedDateForWeek(d.dateKey);
              }}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-3)]'
              }`}
            >
              <span
                className={`text-[10px] font-semibold ${
                  isSelected ? 'text-sky-100' : 'text-[var(--text-2)]'
                }`}
              >
                {d.dayOfWeek}
              </span>
              <span className="text-sm font-bold mt-0.5">{d.dayNum}</span>

              {/* Busyness bar indicator */}
              <div className="w-3 h-1 rounded-full mt-1.5 transition-colors overflow-hidden">
                {d.eventsCount === 0 ? (
                  <div className="w-full h-full bg-emerald-500/70" />
                ) : d.eventsCount < 3 ? (
                  <div className="w-full h-full bg-sky-400" />
                ) : (
                  <div className="w-full h-full bg-amber-500" />
                )}
              </div>

              {d.isToday && (
                <div
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    isSelected ? 'bg-white' : 'bg-sky-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Details */}
      <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--divider)] pb-2.5">
          <div>
            <h4 className="text-xs font-bold text-[var(--text)]">
              {selectedDayInWeek.isToday ? 'Сегодня, ' : ''}
              {selectedDayInWeek.dayNum} {selectedDayInWeek.monthStr} ({selectedDayInWeek.dayOfWeek})
            </h4>
            <p className="text-[11px] text-[var(--text-2)]">
              Занятость: {selectedDayInWeek.busynessLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenAddForm(selectedDayInWeek.dateKey)}
            className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить
          </button>
        </div>

        {selectedDayTimelineItems.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              День полностью свободен у обоих
            </p>
            <p className="text-[11px] text-[var(--text-3)] max-w-xs mx-auto">
              Можно договориться о свидании или совместной поездке
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayTimelineItems.map((item, idx) => {
              if (item.type === 'gap') {
                return (
                  <div
                    key={`gap-w-${idx}`}
                    className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>
                        Окно: {item.gap.startTime} – {item.gap.endTime}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      {formatDuration(item.gap.durationMinutes)}
                    </span>
                  </div>
                );
              }

              const ev = item.event;
              const isCreatedByMe = ev.creatorId === currentPartnerId;
              const isMasked = ev.isPrivate && !isCreatedByMe;

              return (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--divider)] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">
                      {ev.startTime}
                    </span>
                    <span className="text-[var(--text)] font-medium line-clamp-1">
                      {isMasked ? 'Занято (личное)' : ev.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-semibold text-[var(--text-3)]">
                      {isCreatedByMe ? myEmoji : partnerEmoji}
                    </span>
                    {isCreatedByMe && (
                      <button
                        type="button"
                        onClick={() => onDeleteEvent(ev.id)}
                        className="text-[var(--text-3)] hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
