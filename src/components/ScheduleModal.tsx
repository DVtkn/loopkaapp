import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Plus, X, CalendarDays, Moon } from 'lucide-react';
import { useCouple } from '../context/CoupleContext.tsx';
import { ScheduleEvent, PlanCategory } from '../types.ts';
import { triggerHaptic } from '../utils/haptics.ts';
import {
  FreeGap,
  timeToMinutes,
  minutesToTime,
  computeFreeGaps,
} from './schedule/scheduleUtils.ts';
import { ScheduleEventFormModal } from './schedule/ScheduleEventFormModal.tsx';
import { TodayScheduleTab } from './schedule/TodayScheduleTab.tsx';
import { WeekScheduleTab, WeekDayInfo } from './schedule/WeekScheduleTab.tsx';
import { EveningDateTab } from './schedule/EveningDateTab.tsx';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDateWheel?: () => void;
}

type ScheduleTab = 'today' | 'week' | 'evening';

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

  const isPartner1 = currentPartnerId === 'partner1';
  const myPartnerObj = isPartner1 ? coupleProfile?.partner1 : coupleProfile?.partner2;
  const otherPartnerObj = isPartner1 ? coupleProfile?.partner2 : coupleProfile?.partner1;

  const partnerName = otherPartnerObj?.name || (currentUser?.partnerLogin ? `@${currentUser.partnerLogin}` : 'Партнёр');
  const myEmoji = currentUser?.avatarEmoji || myPartnerObj?.avatar || '🦊';
  const partnerEmoji = otherPartnerObj?.avatar || '🐱';

  const handleOpenAddForm = (
    defaultDate = todayStr,
    defaultStart = '14:00',
    defaultEnd = '15:00',
    defaultCat: PlanCategory = 'work'
  ) => {
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

  const todayEvents = useMemo(() => {
    return scheduleEvents
      .filter((ev) => !ev.deleted && ev.date === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [scheduleEvents, todayStr]);

  const todayGaps = useMemo(() => {
    return computeFreeGaps(todayEvents, '09:00', '22:00');
  }, [todayEvents]);

  const todayTimelineItems = useMemo(() => {
    type TimelineItem =
      | { type: 'event'; event: ScheduleEvent; sortKey: string }
      | { type: 'gap'; gap: FreeGap; sortKey: string };

    const items: TimelineItem[] = [];
    todayEvents.forEach((ev) => items.push({ type: 'event', event: ev, sortKey: ev.startTime }));
    todayGaps.forEach((g) => items.push({ type: 'gap', gap: g, sortKey: g.startTime }));
    return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [todayEvents, todayGaps]);

  const weekDays = useMemo(() => {
    const list: WeekDayInfo[] = [];
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

  const selectedDayInWeek = useMemo(() => {
    return weekDays.find((d) => d.dateKey === selectedDateForWeek) || weekDays[0];
  }, [weekDays, selectedDateForWeek]);

  const selectedDayGaps = useMemo(() => {
    return computeFreeGaps(selectedDayInWeek.events, '09:00', '22:00');
  }, [selectedDayInWeek]);

  const selectedDayTimelineItems = useMemo(() => {
    type TimelineItem =
      | { type: 'event'; event: ScheduleEvent; sortKey: string }
      | { type: 'gap'; gap: FreeGap; sortKey: string };

    const items: TimelineItem[] = [];
    selectedDayInWeek.events.forEach((ev) => items.push({ type: 'event', event: ev, sortKey: ev.startTime }));
    selectedDayGaps.forEach((g) => items.push({ type: 'gap', gap: g, sortKey: g.startTime }));
    return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [selectedDayInWeek, selectedDayGaps]);

  const eveningEvents = useMemo(() => {
    return todayEvents.filter((ev) => {
      const startMin = timeToMinutes(ev.startTime);
      const endMin = ev.endTime ? timeToMinutes(ev.endTime) : startMin + 60;
      return endMin > 18 * 60;
    });
  }, [todayEvents]);

  const eveningFreeSummary = useMemo(() => {
    if (eveningEvents.length === 0) {
      return {
        isEntirelyFree: true,
        freeFrom: '18:00',
        text: 'Весь вечер после 18:00 свободен у обоих!',
      };
    }
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

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] bg-[var(--surface)] border border-[var(--divider)] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
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
            {activeTab === 'today' && (
              <TodayScheduleTab
                todayStr={todayStr}
                todayEvents={todayEvents}
                todayGaps={todayGaps}
                todayTimelineItems={todayTimelineItems}
                currentPartnerId={currentPartnerId}
                partnerName={partnerName}
                myEmoji={myEmoji}
                partnerEmoji={partnerEmoji}
                onOpenAddForm={handleOpenAddForm}
                onOpenEditForm={handleOpenEditForm}
                onDeleteEvent={handleDeleteEvent}
              />
            )}

            {activeTab === 'week' && (
              <WeekScheduleTab
                weekDays={weekDays}
                selectedDateForWeek={selectedDateForWeek}
                setSelectedDateForWeek={setSelectedDateForWeek}
                selectedDayInWeek={selectedDayInWeek}
                selectedDayTimelineItems={selectedDayTimelineItems}
                currentPartnerId={currentPartnerId}
                myEmoji={myEmoji}
                partnerEmoji={partnerEmoji}
                onOpenAddForm={handleOpenAddForm}
                onDeleteEvent={handleDeleteEvent}
              />
            )}

            {activeTab === 'evening' && (
              <EveningDateTab
                todayStr={todayStr}
                eveningEvents={eveningEvents}
                eveningFreeSummary={eveningFreeSummary}
                currentPartnerId={currentPartnerId}
                partnerName={partnerName}
                onOpenDateWheel={onOpenDateWheel}
                onOpenAddForm={(d, s, e, cat) => handleOpenAddForm(d, s, e, (cat as PlanCategory) || 'date')}
              />
            )}
          </div>

          {/* Sub-modal Form */}
          <ScheduleEventFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            editingEventId={editingEventId}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formDate={formDate}
            setFormDate={setFormDate}
            formStartTime={formStartTime}
            setFormStartTime={setFormStartTime}
            formEndTime={formEndTime}
            setFormEndTime={setFormEndTime}
            formCategory={formCategory}
            setFormCategory={setFormCategory}
            formIsPrivate={formIsPrivate}
            setFormIsPrivate={setFormIsPrivate}
            formNote={formNote}
            setFormNote={setFormNote}
            formError={formError}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
