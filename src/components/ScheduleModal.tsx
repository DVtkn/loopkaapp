import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Plus,
  X,
  Lock,
  Eye,
  Check,
  Trash2,
  Edit2,
  ChevronRight,
  Briefcase,
  Dumbbell,
  Heart,
  BookOpen,
  Home,
  Users,
  Coffee,
  Moon,
  Sparkles,
  AlertCircle,
  CalendarDays,
  Shield,
  Info,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { ScheduleEvent, PlanCategory, PartnerId } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDateWheel?: () => void;
}

type ScheduleTab = 'today' | 'week' | 'evening';

interface FreeGap {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

// Preset categories with icons and pastel color tokens
const CATEGORY_CONFIG: Record<
  PlanCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; bgClass: string; textClass: string }
> = {
  work: {
    label: 'Работа',
    icon: Briefcase,
    bgClass: 'bg-sky-500/10 dark:bg-sky-500/20',
    textClass: 'text-sky-600 dark:text-sky-400',
  },
  fitness: {
    label: 'Спорт / Фитнес',
    icon: Dumbbell,
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  study: {
    label: 'Учёба',
    icon: BookOpen,
    bgClass: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    textClass: 'text-indigo-600 dark:text-indigo-400',
  },
  date: {
    label: 'Свидание',
    icon: Heart,
    bgClass: 'bg-rose-500/10 dark:bg-rose-500/20',
    textClass: 'text-rose-600 dark:text-rose-400',
  },
  chores: {
    label: 'Быт / Дела',
    icon: Home,
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  personal: {
    label: 'Личное',
    icon: Shield,
    bgClass: 'bg-violet-500/10 dark:bg-violet-500/20',
    textClass: 'text-violet-600 dark:text-violet-400',
  },
  meeting: {
    label: 'Встреча',
    icon: Users,
    bgClass: 'bg-teal-500/10 dark:bg-teal-500/20',
    textClass: 'text-teal-600 dark:text-teal-400',
  },
  other: {
    label: 'Другое',
    icon: Sparkles,
    bgClass: 'bg-slate-500/10 dark:bg-slate-500/20',
    textClass: 'text-slate-600 dark:text-slate-400',
  },
};

// Helper to convert "HH:MM" to minutes from 00:00
function timeToMinutes(t: string): number {
  if (!t) return 0;
  const parts = t.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

// Helper to convert minutes to "HH:MM"
function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const mins = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Helper to format duration in Russian
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

// Compute free time gaps between events on a specific day
function computeFreeGaps(events: ScheduleEvent[], dayStart = '09:00', dayEnd = '22:00'): FreeGap[] {
  const startMin = timeToMinutes(dayStart);
  const endMin = timeToMinutes(dayEnd);

  // Normalize busy intervals
  const busyIntervals: { start: number; end: number }[] = [];
  for (const ev of events) {
    if (ev.deleted) continue;
    const s = timeToMinutes(ev.startTime);
    const e = ev.endTime ? timeToMinutes(ev.endTime) : s + 60;
    if (e > startMin && s < endMin) {
      busyIntervals.push({
        start: Math.max(startMin, s),
        end: Math.min(endMin, e),
      });
    }
  }

  // Sort and merge overlapping busy intervals
  busyIntervals.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const interval of busyIntervals) {
    if (merged.length === 0) {
      merged.push({ ...interval });
    } else {
      const prev = merged[merged.length - 1];
      if (interval.start <= prev.end) {
        prev.end = Math.max(prev.end, interval.end);
      } else {
        merged.push({ ...interval });
      }
    }
  }

  // Calculate gaps
  const gaps: FreeGap[] = [];
  let pointer = startMin;
  for (const b of merged) {
    if (b.start - pointer >= 30) {
      // Free gap of at least 30 minutes
      gaps.push({
        startTime: minutesToTime(pointer),
        endTime: minutesToTime(b.start),
        durationMinutes: b.start - pointer,
      });
    }
    pointer = Math.max(pointer, b.end);
  }

  if (endMin - pointer >= 30) {
    gaps.push({
      startTime: minutesToTime(pointer),
      endTime: minutesToTime(endMin),
      durationMinutes: endMin - pointer,
    });
  }

  return gaps;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onOpenDateWheel }) => {
  const {
    currentUser,
    currentPartnerId,
    coupleProfile,
    scheduleEvents = [],
    addScheduleEvent,
    updateScheduleEvent,
    deleteScheduleEvent,
  } = useCouple();

  const [activeTab, setActiveTab] = useState<ScheduleTab>('today');
  const [selectedDateForWeek, setSelectedDateForWeek] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Event Add/Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formStartTime, setFormStartTime] = useState('12:00');
  const [formEndTime, setFormEndTime] = useState('13:00');
  const [formCategory, setFormCategory] = useState<PlanCategory>('work');
  const [formIsPrivate, setFormIsPrivate] = useState(false);
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Partner names and avatars
  const isPartner1 = currentPartnerId === 'partner1';
  const myPartnerObj = isPartner1 ? coupleProfile?.partner1 : coupleProfile?.partner2;
  const otherPartnerObj = isPartner1 ? coupleProfile?.partner2 : coupleProfile?.partner1;

  const myName = currentUser?.name || myPartnerObj?.name || 'Вы';
  const partnerName = otherPartnerObj?.name || (currentUser?.partnerLogin ? `@${currentUser.partnerLogin}` : 'Партнёр');
  const myEmoji = currentUser?.avatarEmoji || myPartnerObj?.avatar || '🦊';
  const partnerEmoji = otherPartnerObj?.avatar || '🐱';

  // Helper to open Add Form prefilled
  const handleOpenAddForm = (defaultDate = todayStr, defaultStart = '14:00', defaultEnd = '15:00', defaultCat: PlanCategory = 'work') => {
    triggerHaptic('light');
    setEditingEventId(null);
    setFormTitle('');
    setFormDate(defaultDate);
    setFormStartTime(defaultStart);
    setFormEndTime(defaultEnd);
    setFormCategory(defaultCat);
    setFormIsPrivate(false);
    setFormNote('');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Helper to open Edit Form
  const handleOpenEditForm = (event: ScheduleEvent) => {
    triggerHaptic('light');
    setEditingEventId(event.id);
    setFormTitle(event.title);
    setFormDate(event.date);
    setFormStartTime(event.startTime);
    setFormEndTime(event.endTime || '');
    setFormCategory(event.category || 'work');
    setFormIsPrivate(Boolean(event.isPrivate));
    setFormNote(event.note || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Submit Event Form
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Укажите название события');
      return;
    }
    if (!formStartTime) {
      setFormError('Укажите время начала');
      return;
    }
    if (formEndTime && timeToMinutes(formEndTime) <= timeToMinutes(formStartTime)) {
      setFormError('Время окончания должно быть позже времени начала');
      return;
    }

    triggerHaptic('success');

    const resolvedEndTime = (formEndTime || '').trim() || minutesToTime(timeToMinutes(formStartTime) + 60);

    if (editingEventId) {
      await updateScheduleEvent(editingEventId, {
        title: formTitle.trim(),
        date: formDate,
        startTime: formStartTime,
        endTime: resolvedEndTime,
        category: formCategory,
        isPrivate: formIsPrivate,
        isDate: formCategory === 'date',
        note: formNote.trim() || undefined,
      });
    } else {
      await addScheduleEvent({
        creatorId: currentPartnerId,
        title: formTitle.trim(),
        date: formDate,
        startTime: formStartTime,
        endTime: resolvedEndTime,
        category: formCategory,
        isPrivate: formIsPrivate,
        isDate: formCategory === 'date',
        note: formNote.trim() || undefined,
      });
    }

    setIsFormOpen(false);
    setEditingEventId(null);
  };

  const handleDeleteEvent = async (id: string) => {
    triggerHaptic('warning');
    await deleteScheduleEvent(id);
    if (editingEventId === id) {
      setIsFormOpen(false);
      setEditingEventId(null);
    }
  };

  // Filter and sort today's events
  const todayEvents = useMemo(() => {
    return scheduleEvents
      .filter((ev) => !ev.deleted && ev.date === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [scheduleEvents, todayStr]);

  // Free gaps for today
  const todayGaps = useMemo(() => {
    return computeFreeGaps(todayEvents, '09:00', '22:00');
  }, [todayEvents]);

  // Combined timeline items for Today (events + free gaps)
  const todayTimelineItems = useMemo(() => {
    type TimelineItem =
      | { type: 'event'; event: ScheduleEvent; sortKey: string }
      | { type: 'gap'; gap: FreeGap; sortKey: string };

    const items: TimelineItem[] = [];

    todayEvents.forEach((ev) => {
      items.push({ type: 'event', event: ev, sortKey: ev.startTime });
    });

    todayGaps.forEach((g) => {
      items.push({ type: 'gap', gap: g, sortKey: g.startTime });
    });

    return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [todayEvents, todayGaps]);

  // 7-day week schedule generator
  const weekDays = useMemo(() => {
    const list = [];
    const now = new Date();
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayOfWeek = dayNames[d.getDay()];
      const dayNum = d.getDate();
      const monthStr = monthNames[d.getMonth()];

      const dayEvents = scheduleEvents.filter((ev) => !ev.deleted && ev.date === dateKey);
      const isToday = dateKey === todayStr;

      // Busyness level
      let busynessLevel: 'free' | 'partial' | 'busy' = 'free';
      let busynessLabel = 'Свободно';
      if (dayEvents.length >= 3) {
        busynessLevel = 'busy';
        busynessLabel = `${dayEvents.length} соб.`;
      } else if (dayEvents.length > 0) {
        busynessLevel = 'partial';
        busynessLabel = `${dayEvents.length} ${dayEvents.length === 1 ? 'событие' : 'события'}`;
      }

      list.push({
        dateKey,
        dayOfWeek,
        dayNum,
        monthStr,
        isToday,
        eventsCount: dayEvents.length,
        busynessLevel,
        busynessLabel,
        events: dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      });
    }
    return list;
  }, [scheduleEvents, todayStr]);

  // Events for the selected day in week view
  const selectedDayInWeek = useMemo(() => {
    return weekDays.find((d) => d.dateKey === selectedDateForWeek) || weekDays[0];
  }, [weekDays, selectedDateForWeek]);

  // Free gaps for selected day in week view
  const selectedDayGaps = useMemo(() => {
    return computeFreeGaps(selectedDayInWeek.events, '09:00', '22:00');
  }, [selectedDayInWeek]);

  // Combined timeline for selected day in week
  const selectedDayTimelineItems = useMemo(() => {
    type TimelineItem =
      | { type: 'event'; event: ScheduleEvent; sortKey: string }
      | { type: 'gap'; gap: FreeGap; sortKey: string };

    const items: TimelineItem[] = [];
    selectedDayInWeek.events.forEach((ev) => {
      items.push({ type: 'event', event: ev, sortKey: ev.startTime });
    });
    selectedDayGaps.forEach((g) => {
      items.push({ type: 'gap', gap: g, sortKey: g.startTime });
    });
    return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [selectedDayInWeek, selectedDayGaps]);

  // Evening slice: events scheduled after 18:00 today
  const eveningEvents = useMemo(() => {
    return todayEvents.filter((ev) => {
      const startMin = timeToMinutes(ev.startTime);
      const endMin = ev.endTime ? timeToMinutes(ev.endTime) : startMin + 60;
      return endMin > 18 * 60;
    });
  }, [todayEvents]);

  // Calculate free evening window
  const eveningFreeSummary = useMemo(() => {
    if (eveningEvents.length === 0) {
      return {
        isEntirelyFree: true,
        freeFrom: '18:00',
        text: 'Весь вечер после 18:00 свободен у обоих!',
      };
    }
    // Find latest end time among evening events
    let maxEnd = 18 * 60;
    eveningEvents.forEach((ev) => {
      const e = ev.endTime ? timeToMinutes(ev.endTime) : timeToMinutes(ev.startTime) + 60;
      if (e > maxEnd) maxEnd = e;
    });
    if (maxEnd < 22 * 60) {
      return {
        isEntirelyFree: false,
        freeFrom: minutesToTime(maxEnd),
        text: `Оба свободны после ${minutesToTime(maxEnd)}`,
      };
    }
    return {
      isEntirelyFree: false,
      freeFrom: null,
      text: 'Вечер плотно занят запланированными делами',
    };
  }, [eveningEvents]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Container: Bottom sheet on mobile, centered card on desktop */}
        <motion.div
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] bg-[var(--surface)] border border-[var(--divider)] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Mobile swipe bar indicator */}
          <div className="w-12 h-1.5 bg-[var(--divider)] rounded-full mx-auto mt-3 shrink-0 sm:hidden" />

          {/* Header */}
          <div className="px-5 pt-3 pb-3 sm:pt-5 sm:pb-4 border-b border-[var(--divider)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text)] leading-tight">
                  Наши планы
                </h3>
                <p className="text-[11px] sm:text-xs text-[var(--text-2)]">
                  Синхронизация расписания и свободного времени
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenAddForm()}
                className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 flex items-center justify-center transition-colors cursor-pointer"
                title="Добавить событие"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="px-5 pt-3 pb-2 shrink-0 bg-[var(--surface)]">
            <div className="grid grid-cols-3 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)]">
              {(
                [
                  { id: 'today', label: 'Сегодня', icon: Clock },
                  { id: 'week', label: 'Неделя', icon: CalendarDays },
                  { id: 'evening', label: 'Вечер', icon: Moon },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveTab(tab.id);
                    }}
                    className={`relative py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                      isActive
                        ? 'text-sky-600 dark:text-sky-300 shadow-xs'
                        : 'text-[var(--text-2)] hover:text-[var(--text)]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeScheduleTabPill"
                        className="absolute inset-0 bg-[var(--surface)] rounded-lg border border-[var(--divider)]"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1">
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
            {/* ============================================================ */}
            {/* TAB 1: СЕГОДНЯ (TODAY) */}
            {/* ============================================================ */}
            {activeTab === 'today' && (
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
                    onClick={() => handleOpenAddForm(todayStr)}
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
                      <h4 className="text-sm font-bold text-[var(--text)]">
                        Весь день свободен у обоих!
                      </h4>
                      <p className="text-xs text-[var(--text-2)] mt-1 max-w-xs mx-auto">
                        09:00 – 22:00 • Никаких пересечений и занятости. Отличная возможность провести время вместе.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAddForm(todayStr)}
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
                              onClick={() => handleOpenAddForm(todayStr, gap.startTime, gap.endTime, 'date')}
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
                              {/* Category Icon Badge */}
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

                                  {/* Creator avatar tag */}
                                  <span className="text-[10px] font-semibold text-[var(--text-2)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                    <span>{isCreatedByMe ? myEmoji : partnerEmoji}</span>
                                    <span>{isCreatedByMe ? 'Вы' : partnerName}</span>
                                  </span>

                                  {/* Date badge */}
                                  {ev.isDate && (
                                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                      <Heart className="w-2.5 h-2.5 fill-rose-500" />
                                      Свидание
                                    </span>
                                  )}

                                  {/* Privacy Indicator */}
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
                                    <span className="text-[var(--text-3)] line-clamp-1">
                                      • {ev.note}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions for creator */}
                            {isCreatedByMe && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditForm(ev)}
                                  className="w-7 h-7 rounded-lg bg-[var(--surface-2)] text-[var(--text-2)] hover:text-sky-600 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Редактировать"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(ev.id)}
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
            )}

            {/* ============================================================ */}
            {/* TAB 2: НЕДЕЛЯ (WEEK) */}
            {/* ============================================================ */}
            {activeTab === 'week' && (
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
                          className={`text-[10px] font-semibold uppercase ${
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
                        {selectedDayInWeek.dayNum} {selectedDayInWeek.monthStr} (
                        {selectedDayInWeek.dayOfWeek})
                      </h4>
                      <p className="text-[11px] text-[var(--text-2)]">
                        Занятость: {selectedDayInWeek.busynessLabel}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddForm(selectedDayInWeek.dateKey)}
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
                                <span>Окно: {item.gap.startTime} – {item.gap.endTime}</span>
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
                                  onClick={() => handleDeleteEvent(ev.id)}
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
            )}

            {/* ============================================================ */}
            {/* TAB 3: ВЕЧЕР (EVENING) */}
            {/* ============================================================ */}
            {activeTab === 'evening' && (
              <div className="space-y-3">
                {/* Evening Hero Focus */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-purple-500/10 border border-sky-500/25 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)]">
                        Вечерний срез (после 18:00)
                      </h4>
                      <p className="text-xs text-[var(--text-2)] mt-0.5">
                        {eveningFreeSummary.text}
                      </p>
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
                      <p className="text-xs font-bold text-[var(--text)]">
                        Планы на вечер сегодня:
                      </p>
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
                    onClick={() => handleOpenAddForm(todayStr, '19:00', '21:00', 'date')}
                    className="w-full py-2 px-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--divider)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-600" />
                    <span>Запланировать вечернее дело</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SUB-MODAL / SLIDE-IN FORM: Add or Edit Event */}
          {/* ============================================================ */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 270 }}
                className="absolute inset-0 bg-[var(--surface)] z-20 flex flex-col"
              >
                {/* Form Header */}
                <div className="px-5 py-3.5 border-b border-[var(--divider)] flex items-center justify-between shrink-0 bg-[var(--surface)]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-[var(--text)]">
                      {editingEventId ? 'Редактировать событие' : 'Новое событие в расписании'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="w-7 h-7 rounded-lg bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSaveEvent} className="flex-1 overflow-y-auto p-5 space-y-4">
                  {formError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text)]">Название события</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Например: Работа / Созвон, Спортзал, Ужин"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] placeholder-[var(--text-3)] focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Date & Times */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text)]">Дата</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text)]">Начало</label>
                      <input
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text)]">Окончание</label>
                      <input
                        type="time"
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text)]">Категория</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(Object.keys(CATEGORY_CONFIG) as PlanCategory[]).map((catKey) => {
                        const cfg = CATEGORY_CONFIG[catKey];
                        const Icon = cfg.icon;
                        const isSelected = formCategory === catKey;
                        return (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setFormCategory(catKey);
                            }}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
                                : 'bg-[var(--surface-2)] border-[var(--divider)] text-[var(--text-2)] hover:text-[var(--text)]'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-lg ${cfg.bgClass} ${cfg.textClass} flex items-center justify-center shrink-0`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="line-clamp-1">{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {formCategory === 'date' && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 mt-1">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                        <span>
                          Это свидание появится в блоке «Ближайшее свидание» на главном экране.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Privacy Flag */}
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[var(--surface)] text-[var(--text-2)] flex items-center justify-center">
                          {formIsPrivate ? <Lock className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-sky-500" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text)]">
                            {formIsPrivate ? 'Личное событие' : 'Открытое событие'}
                          </p>
                          <p className="text-[11px] text-[var(--text-2)]">
                            {formIsPrivate
                              ? 'Партнёр видит только занятое время без названия'
                              : 'Партнёр видит все детали'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setFormIsPrivate(!formIsPrivate);
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          formIsPrivate ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                            formIsPrivate ? 'translate-x-5' : 'translate-x-0.5'
                          } top-0.5 absolute`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text)]">
                      Заметка (необязательно)
                    </label>
                    <textarea
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      placeholder="Место, ссылка или короткая памятка"
                      rows={2}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] placeholder-[var(--text-3)] focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                    >
                      {editingEventId ? 'Сохранить изменения' : 'Добавить событие'}
                    </button>

                    {editingEventId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(editingEventId)}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
