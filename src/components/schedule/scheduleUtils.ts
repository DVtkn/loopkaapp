import React from 'react';
import {
  Briefcase,
  Dumbbell,
  BookOpen,
  Heart,
  Home,
  Shield,
  Users,
  Sparkles,
} from 'lucide-react';
import { ScheduleEvent, PlanCategory } from '../../types.ts';

export interface FreeGap {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export const CATEGORY_CONFIG: Record<
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

export function timeToMinutes(t: string): number {
  if (!t) return 0;
  const parts = t.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const mins = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

export function computeFreeGaps(events: ScheduleEvent[], dayStart = '09:00', dayEnd = '22:00'): FreeGap[] {
  const startMin = timeToMinutes(dayStart);
  const endMin = timeToMinutes(dayEnd);

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

  const gaps: FreeGap[] = [];
  let pointer = startMin;
  for (const b of merged) {
    if (b.start - pointer >= 30) {
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
