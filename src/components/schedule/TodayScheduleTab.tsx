import React from 'react';
import { Clock, Plus, Sparkles, Coffee, Lock, Heart, Edit2, Trash2 } from 'lucide-react';
import { ScheduleEvent, PlanCategory, PartnerId } from '../../types.ts';
import { CATEGORY_CONFIG, formatDuration, FreeGap } from './scheduleUtils.ts';

interface TodayScheduleTabProps {
  todayStr: string;
  todayEvents: ScheduleEvent[];
  todayGaps: FreeGap[];
  todayTimelineItems: Array<
    | { type: 'event'; event: ScheduleEvent; sortKey: string }
    | { type: 'gap'; gap: FreeGap; sortKey: string }
  >;
  currentPartnerId: PartnerId;
  partnerName: string;
  myEmoji: string;
  partnerEmoji: string;
  onOpenAddForm: (defaultDate?: string, defaultStart?: string, defaultEnd?: string, defaultCat?: PlanCategory) => void;
  onOpenEditForm: (event: ScheduleEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const TodayScheduleTab: React.FC<TodayScheduleTabProps> = ({
  todayStr,
  todayEvents,
  todayGaps,
  todayTimelineItems,
  currentPartnerId,
  partnerName,
  myEmoji,
  partnerEmoji,
  onOpenAddForm,
  onOpenEditForm,
  onDeleteEvent,
}) => {
  return (
    <div className="space-y-3">
      {/* Summary banner */}
      <div className="p-3 rounded-2xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text)]">
              {todayEvents.length > 0
                ? `Сегодня: ${todayEvents.length} ${
                    todayEvents.length === 1 ? 'событие' : todayEvents.length < 5 ? 'события' : 'событий'
                  }`
                : 'Сегодня событий нет'}
            </p>
            <p className="text-[11px] text-[var(--text-2)]">
              {todayGaps.length > 0
                ? `${todayGaps.length} ${
                    todayGaps.length === 1 ? 'свободное окно' : 'свободных окна'
                  } для общения`
                : 'Плотный график'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenAddForm(todayStr)}
          className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Событие</span>
        </button>
      </div>

      {/* Timeline list */}
      {todayTimelineItems.length === 0 ? (
        <div className="py-12 text-center space-y-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] p-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text)]">Весь день свободен у обоих!</h4>
            <p className="text-xs text-[var(--text-2)] mt-1 max-w-xs mx-auto">
              09:00 – 22:00 • Никаких пересечений и занятости. Отличная возможность провести время вместе.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenAddForm(todayStr)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Запланировать дела
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {todayTimelineItems.map((item, idx) => {
            if (item.type === 'gap') {
              const gap = item.gap;
              return (
                <div
                  key={`gap-${idx}-${gap.startTime}`}
                  className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          Оба свободны
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-md">
                          {formatDuration(gap.durationMinutes)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-2)]">
                        {gap.startTime} – {gap.endTime} • Время созвониться или встретиться
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAddForm(todayStr, gap.startTime, gap.endTime, 'date')}
                    className="px-2 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    + Занять
                  </button>
                </div>
              );
            }

            // Event Card
            const ev = item.event;
            const isCreatedByMe = ev.creatorId === currentPartnerId;
            const isMaskedForMe = ev.isPrivate && !isCreatedByMe;
            const catConfig = CATEGORY_CONFIG[ev.category || 'work'] || CATEGORY_CONFIG.work;
            const CatIcon = catConfig.icon;

            return (
              <div
                key={ev.id}
                className={`p-3 rounded-xl border transition-all ${
                  ev.isDate
                    ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/25'
                    : 'bg-[var(--surface)] border-[var(--divider)] hover:border-sky-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-lg ${catConfig.bgClass} ${catConfig.textClass} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      {isMaskedForMe ? (
                        <Lock className="w-4 h-4 text-[var(--text-3)]" />
                      ) : (
                        <CatIcon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-[var(--text)] leading-snug">
                          {isMaskedForMe ? 'Занято (личное расписание)' : ev.title}
                        </p>

                        <span className="text-[10px] font-semibold text-[var(--text-2)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <span>{isCreatedByMe ? myEmoji : partnerEmoji}</span>
                          <span>{isCreatedByMe ? 'Вы' : partnerName}</span>
                        </span>

                        {ev.isDate && (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Heart className="w-2.5 h-2.5 fill-rose-500" />
                            Свидание
                          </span>
                        )}

                        {ev.isPrivate && (
                          <span className="text-[10px] font-medium text-[var(--text-3)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Личное
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-2)] flex-wrap">
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          {ev.startTime}
                          {ev.endTime ? ` – ${ev.endTime}` : ''}
                        </span>
                        {!isMaskedForMe && ev.note && (
                          <span className="text-[var(--text-3)] line-clamp-1">• {ev.note}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isCreatedByMe && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenEditForm(ev)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-2)] text-[var(--text-2)] hover:text-sky-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Редактировать"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEvent(ev.id)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-2)] text-[var(--text-2)] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
