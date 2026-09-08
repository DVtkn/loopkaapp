import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  Flame,
  CheckCircle2,
  SmilePlus,
  Calendar,
  Send,
  MessageSquare,
  Gift,
  ChevronRight,
  Smile,
  Activity,
  Pin,
  Clock,
  ThumbsUp,
  X,
  Share2,
  Compass,
  MessageCircle,
  HelpCircle,
  Trophy,
  Coffee,
  Sparkle,
  Info,
  Award,
  User,
  UserPlus,
  HeartHandshake,
  Mail,
  Pencil,
  Camera,
  Image as ImageIcon,
  Quote,
  Sun,
  Moon,
  MoreHorizontal,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { NavigationTab } from '../types';
import { PageLayout } from './ui/PageLayout';
import { ScheduleModal } from './ScheduleModal';
import { triggerHaptic } from '../utils/haptics';
import { calculateCoupleAnalysis } from '../utils/psychologyEngine';
import {
  ColoredIcon,
  MoodBadge,
  ColoredAvatar,
  MOOD_PRESETS,
  LOVE_TAP_PRESETS,
} from './ColoredIcon';

// Helper: Format mood timestamp with user-friendly strings
function formatMoodTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 2) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;

    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Сегодня в ${time}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return `Вчера в ${time}`;

    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

// Helper: Format days together into "X год Y месяцев Z дней вместе" with precise Russian pluralization
function formatRussianPlural(n: number, one: string, two: string, five: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return two;
  return five;
}

function formatDaysTogetherDetailed(startDateStr?: string): string {
  try {
    const start = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 482 * 24 * 60 * 60 * 1000);
    const now = new Date();
    if (isNaN(start.getTime()) || now < start) return '1 день вместе';

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${formatRussianPlural(years, 'год', 'года', 'лет')}`);
    }
    if (months > 0) {
      parts.push(`${months} ${formatRussianPlural(months, 'месяц', 'месяца', 'месяцев')}`);
    }
    if (days > 0 || parts.length === 0) {
      parts.push(`${days} ${formatRussianPlural(days, 'день', 'дня', 'дней')}`);
    }

    return `${parts.join(' ')} вместе`;
  } catch {
    return '482 дня вместе';
  }
}

// Helper: Concise empathetic psychological description for mood states
function getMoodBriefDescription(moodKeyOrLabel?: string): string {
  const s = (moodKeyOrLabel || '').toLowerCase();
  if (s.includes('предвкуш') || s.includes('inspire') || s.includes('вдохнов')) {
    return 'Ждёт ярких совместных моментов и тёплых встреч';
  }
  if (s.includes('calm') || s.includes('спокой')) {
    return 'В гармонии и душевном равновесии. Ценит уют и тишину';
  }
  if (s.includes('tender') || s.includes('нежн') || s.includes('люб')) {
    return 'Полна нежности к вам. Отличный момент для тёплых слов';
  }
  if (s.includes('cozy') || s.includes('уют')) {
    return 'Настроение для домашнего уюта, чая и неспешного общения';
  }
  if (s.includes('tired') || s.includes('устал')) {
    return 'Упадок сил после дня. Будет рада заботе и отдыху';
  }
  if (s.includes('energy') || s.includes('энерг') || s.includes('радост') || s.includes('счаст')) {
    return 'На подъёме и полна энергии, готова делиться позитивом';
  }
  if (s.includes('romance') || s.includes('романт')) {
    return 'Романтичное настроение для объятий и совместного вечера';
  }
  if (s.includes('focus') || s.includes('мотив')) {
    return 'Сфокусирован(а) на целях и делах, ценит понимание';
  }
  return 'Делится своими чувствами, чтобы быть ближе к вам';
}

// Helper: Calculate real presence and activity status of partner
function getPartnerStatusDetails(
  partner: { name?: string; lastActiveAt?: string; gender?: string; login?: string }
): {
  isOnline: boolean;
  statusText: string;
  badgeText: string;
} {
  if (!partner.lastActiveAt) {
    return {
      isOnline: true,
      statusText: 'В сети',
      badgeText: 'В сети',
    };
  }

  try {
    const last = new Date(partner.lastActiveAt);
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const isFemale = partner.gender === 'female';

    if (diffMins < 15) {
      return {
        isOnline: true,
        statusText: 'В сети сейчас',
        badgeText: 'В сети',
      };
    }

    if (diffMins < 60) {
      return {
        isOnline: false,
        statusText: `${isFemale ? 'Была' : 'Был'} ${diffMins} мин назад`,
        badgeText: `${diffMins}м назад`,
      };
    }

    const isToday = last.toDateString() === now.toDateString();
    const time = last.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return {
        isOnline: false,
        statusText: `${isFemale ? 'Была' : 'Был'} сегодня в ${time}`,
        badgeText: time,
      };
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (last.toDateString() === yesterday.toDateString()) {
      return {
        isOnline: false,
        statusText: `${isFemale ? 'Была' : 'Был'} вчера в ${time}`,
        badgeText: 'Вчера',
      };
    }

    return {
      isOnline: false,
      statusText: 'Был(а) недавно',
      badgeText: 'На связи',
    };
  } catch {
    return {
      isOnline: true,
      statusText: 'На связи в Loop',
      badgeText: 'В сети',
    };
  }
}

interface DashboardViewProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const {
    currentPartnerId,
    coupleProfile,
    daysTogether,
    formattedTimeTogether,
    challenges,
    toggleChallenge,
    smallCravings,
    addMoodStatus,
    questionAnswer,
    answerQuestionOfDay,
    feedItems,
    addFeedItem,
    clearFeed,
    tests,
    dateInvites,
    scheduleEvents,
    setUsSubTab,
    setDatesSubTab,
    currentUser,
    incomingRequests,
    acceptPairRequest,
    loveTaps,
    sendLoveTap,
    sendTouchAction,
    triggerConfetti,
    xpHistory,
    pulseHistory,
    moodHistory,
  } = useCouple();

  const currentPartner = currentPartnerId === 'partner1' ? coupleProfile?.partner1 : coupleProfile?.partner2;
  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile?.partner2 : coupleProfile?.partner1;
  const isPaired = !!currentUser?.partnerLogin;

  // Safe fallback to guarantee partner status always renders
  const safeOtherPartner = otherPartner || {
    id: currentPartnerId === 'partner1' ? 'partner2' : 'partner1',
    name: 'Анна',
    avatar: 'heart',
    login: 'anna',
    loveLanguage: 'Слова поощрения',
    attachmentStyle: 'Надёжный',
    currentMood: {
      emoji: 'calm',
      label: 'Спокойствие',
      note: '',
      updatedAt: new Date().toISOString(),
    },
  };

  const partnerName =
    (safeOtherPartner.name && safeOtherPartner.name !== 'Партнёр не подключён')
      ? safeOtherPartner.name
      : (currentUser?.partnerLogin || safeOtherPartner.login || 'Анна');

  const partnerStatusInfo = getPartnerStatusDetails({
    name: partnerName,
    lastActiveAt: safeOtherPartner.lastActiveAt,
    gender: safeOtherPartner.gender,
    login: safeOtherPartner.login,
  });

  // Calculate live compatibility score
  const coupleAnalysis = useMemo(() => {
    try {
      return calculateCoupleAnalysis(coupleProfile, pulseHistory || [], tests || []);
    } catch {
      return null;
    }
  }, [coupleProfile, pulseHistory, tests]);

  const hasCompatibilityData = !!(coupleAnalysis?.hasData && coupleAnalysis.compatibilityScore > 0);
  const compatibilityPercent = hasCompatibilityData ? coupleAnalysis.compatibilityScore : 0;
  const compatibilityStatus = hasCompatibilityData
    ? compatibilityPercent >= 85
      ? 'Высокая'
      : compatibilityPercent >= 70
      ? 'Тёплая'
      : 'Развитие'
    : 'Пройти тест';

  // Calculate continuous activity streak (days in a row) strictly based on real activity
  const streakDaysCount = useMemo(() => {
    const datesWithActivity = new Set<string>();
    const todayStr = new Date().toISOString().split('T')[0];

    // Real recorded activity timestamps
    (xpHistory || []).forEach((e) => {
      const entryTime = e.timestamp || (e as any).createdAt;
      if (entryTime) datesWithActivity.add(entryTime.split('T')[0]);
    });
    (pulseHistory || []).forEach((p) => {
      if (p.date) datesWithActivity.add(p.date.split('T')[0]);
    });
    (moodHistory || []).forEach((m) => {
      if (m.date) datesWithActivity.add(m.date.split('T')[0]);
    });
    (loveTaps || []).forEach((t) => {
      if (t.createdAt) datesWithActivity.add(t.createdAt.split('T')[0]);
    });
    (feedItems || []).forEach((f) => {
      const fTime = (f as any).createdAt || (f as any).timestamp;
      if (fTime) datesWithActivity.add(fTime.split('T')[0]);
    });

    // Today is an active day because the user is currently interacting with the app
    datesWithActivity.add(todayStr);

    let streak = 0;
    const cur = new Date();
    while (true) {
      const dStr = cur.toISOString().split('T')[0];
      if (datesWithActivity.has(dStr)) {
        streak++;
        cur.setDate(cur.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  }, [xpHistory, pulseHistory, moodHistory, loveTaps, feedItems]);

  // Quick transitions row
  const quickShortcuts = [
    {
      id: 'date-idea',
      title: 'Идея свидания',
      subtitle: 'Колесо идей',
      icon: Compass,
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      color: 'text-rose-500 dark:text-rose-400',
      onClick: () => {
        triggerHaptic('light');
        setDatesSubTab('wheel');
        setActiveTab('dates');
      },
    },
    {
      id: 'deep-talk',
      title: 'Deep Talk',
      subtitle: 'Вопрос для двоих',
      icon: MessageSquare,
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      color: 'text-indigo-500 dark:text-indigo-400',
      onClick: () => {
        triggerHaptic('light');
        setActiveTab('deeptalk');
      },
    },
    {
      id: 'time-capsule',
      title: 'Капсула времени',
      subtitle: 'Письмо в будущее',
      icon: Mail,
      bg: 'bg-teal-500/10 dark:bg-teal-500/20',
      color: 'text-teal-600 dark:text-teal-400',
      onClick: () => {
        triggerHaptic('light');
        setUsSubTab('capsule');
        setActiveTab('us');
      },
    },
  ];

  // Find nearest upcoming scheduled date if any
  const upcomingDate = (dateInvites || []).find(
    (d) => !d.completed && !d.review && (d.status === 'CONFIRMED' || d.status === 'PROPOSED' || d.status === 'PENDING')
  );

  // Mood selector state
  const [showMoodPicker, setShowMoodPicker] = useState<boolean>(false);
  const [showMoodInfo, setShowMoodInfo] = useState<boolean>(false);
  const [moodNote, setMoodNote] = useState<string>('');
  const [customMoodLabel, setCustomMoodLabel] = useState<string>('Спокойствие');
  const [customMoodKey, setCustomMoodKey] = useState<string>('calm');

  // Question of the Day modal state
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [isEditingQuestionAnswer, setIsEditingQuestionAnswer] = useState<boolean>(false);
  const [userQuestionAnswer, setUserQuestionAnswer] = useState<string>('');

  // Quick Action Modal
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [quickActionText, setQuickActionText] = useState<string>('');

  // Interaction feedback states
  const [quickHugSent, setQuickHugSent] = useState<boolean>(false);
  const [showPartnerDetailModal, setShowPartnerDetailModal] = useState<boolean>(false);
  const [tapSentMessage, setTapSentMessage] = useState<string | null>(null);

  // Schedule planner modal state
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  const todayDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayScheduleEvents = useMemo(() => {
    return (scheduleEvents || []).filter((ev) => !ev.deleted && ev.date === todayDateStr);
  }, [scheduleEvents, todayDateStr]);

  const scheduleSummary = useMemo(() => {
    if (todayScheduleEvents.length === 0) {
      return {
        badge: 'Свободно',
        badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
        title: 'Наши планы',
        subtitle: 'Вечер свободен у обоих',
      };
    }

    const n = todayScheduleEvents.length;
    const mod10 = n % 10;
    const mod100 = n % 100;
    let plural = 'событий';
    if (mod100 < 11 || mod100 > 14) {
      if (mod10 === 1) plural = 'событие';
      else if (mod10 >= 2 && mod10 <= 4) plural = 'события';
    }

    const hasEvening = todayScheduleEvents.some((e) => {
      const startMin = e.startTime.split(':').map(Number);
      const endMin = (e.endTime || '').split(':').map(Number);
      return (startMin[0] >= 18) || (endMin[0] > 18);
    });

    return {
      badge: `${n} ${plural}`,
      badgeClass: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
      title: 'Наши планы',
      subtitle: hasEvening ? `Сегодня: ${n} ${plural}` : `Сегодня: ${n} ${plural} • Вечер свободен`,
    };
  }, [todayScheduleEvents]);

  // Onboarding hint for long-press gesture discovery (shown once for 3s, saved to localStorage)
  const [showLongPressHint, setShowLongPressHint] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('loop_seen_hug_longpress_hint') !== 'true';
    } catch {
      return false;
    }
  });

  // Soft pulse animation (scale 1 -> 1.03 -> 1, 600ms x 2 = 1200ms) on first visit
  const [isFirstVisitPulse, setIsFirstVisitPulse] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('loop_seen_hug_longpress_hint') !== 'true';
    } catch {
      return false;
    }
  });

  const dismissLongPressHint = () => {
    setShowLongPressHint(false);
    setIsFirstVisitPulse(false);
    try {
      localStorage.setItem('loop_seen_hug_longpress_hint', 'true');
    } catch {}
  };

  useEffect(() => {
    if (!showLongPressHint) return;

    // Immediately mark as seen so future visits never show it
    try {
      localStorage.setItem('loop_seen_hug_longpress_hint', 'true');
    } catch {}

    // Auto-dismiss tooltip after 3 seconds
    const hideTooltipTimer = setTimeout(() => {
      setShowLongPressHint(false);
    }, 3000);

    // End pulse animation after 1200ms (two 600ms cycles)
    const pulseTimer = setTimeout(() => {
      setIsFirstVisitPulse(false);
    }, 1200);

    return () => {
      clearTimeout(hideTooltipTimer);
      clearTimeout(pulseTimer);
    };
  }, [showLongPressHint]);

  // Emotional signals for long-press contextual menu (5 distinct signals with pastel backgrounds)
  const EMOTIONAL_SIGNALS = [
    {
      id: 'hug',
      label: 'Обнять',
      icon: Heart,
      bg: 'bg-rose-500/15 dark:bg-rose-500/25',
      color: 'text-rose-500 dark:text-rose-400',
      action: () => handleQuickHug(),
    },
    {
      id: 'thinking',
      label: 'Думаю о тебе',
      icon: Sparkles,
      bg: 'bg-amber-500/15 dark:bg-amber-500/25',
      color: 'text-amber-500 dark:text-amber-400',
      action: () => handleSendSpecificTap('thinking', 'Думаю о тебе прямо сейчас ✨', 'Думаю о тебе'),
    },
    {
      id: 'miss',
      label: 'Скучаю',
      icon: Mail,
      bg: 'bg-pink-500/15 dark:bg-pink-500/25',
      color: 'text-pink-500 dark:text-pink-400',
      action: () => handleSendSpecificTap('miss', 'Очень скучаю по тебе 💌', 'Скучаю'),
    },
    {
      id: 'kiss',
      label: 'Поцелуй',
      icon: Flame,
      bg: 'bg-red-500/15 dark:bg-red-500/25',
      color: 'text-red-500 dark:text-red-400',
      action: () => handleSendSpecificTap('kiss', 'Отправлен нежный поцелуй 💋', 'Поцелуй'),
    },
    {
      id: 'grateful',
      label: 'Ценю тебя',
      icon: ThumbsUp,
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
      color: 'text-emerald-600 dark:text-emerald-400',
      action: () => handleSendSpecificTap('grateful', 'Спасибо тебе за то, что ты есть! ❤️', 'Ценю тебя'),
    },
  ];

  // Long-press state management for the "Обнять" CTA (~380ms)
  const [showRadialMenu, setShowRadialMenu] = useState<boolean>(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);
  const pointerStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    dismissLongPressHint();
    isLongPressTriggeredRef.current = false;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      // Лёгкий haptic-тик в момент, когда обычный тап "перерастает" в long-press (~380мс)
      triggerHaptic('light');
      setShowRadialMenu(true);
    }, 380);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartPosRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartPosRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartPosRef.current.y);
    // If pointer moves significantly (e.g. scrolling), cancel long-press
    if ((dx > 15 || dy > 15) && !isLongPressTriggeredRef.current) {
      clearLongPress();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    clearLongPress();
    dismissLongPressHint();
    // Only execute single-tap default "Обнять" if long press was NOT triggered
    if (!isLongPressTriggeredRef.current) {
      handleQuickHug(e);
    }
    pointerStartPosRef.current = null;
  };

  const handlePointerCancel = () => {
    clearLongPress();
    pointerStartPosRef.current = null;
  };

  const handleSelectSignal = (sig: typeof EMOTIONAL_SIGNALS[0]) => {
    setShowRadialMenu(false);
    dismissLongPressHint();
    triggerHaptic('success'); // более выраженный отклик при выборе конкретного действия
    sig.action();
  };

  const dailyQuestions = [
    "Что сегодня заставило тебя искренне улыбнуться?",
    "Какое наше общее воспоминание согревает тебя больше всего?",
    "Если бы мы могли прямо сейчас оказаться в любой точке мира, куда бы мы поехали?",
    "Какой поступок партнёра за последнюю неделю вызвал у тебя благодарность?",
    "Какая песня лучше всего описывает наше настроение сегодня?",
    "Что нового о себе или обо мне ты понял(а) за последнее время?",
    "О чем приятном ты сегодня мечтал(а) в течение дня?",
    "Какой маленький знак заботы сделал бы твой вечер идеальным?",
    "Какое наше будущее событие ты ждёшь с наибольшим нетерпением?"
  ];
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const currentDailyQuestion = dailyQuestions[dayOfYear % dailyQuestions.length];

  const testsCompleted = (tests || []).filter(t => t.partner1Done || t.partner2Done).length;
  const confirmedDatesCount = (dateInvites || []).filter(d => d.status === 'CONFIRMED' || d.status === 'COMPLETED').length;
  const feedCount = (feedItems || []).length;

  const handleQuickHug = async (e?: React.MouseEvent | React.PointerEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic('success');
    const res = await sendTouchAction('hug', {
      title: `${currentUser?.name || currentPartner?.name} обнял(а) вас ❤️`,
      subtitle: 'Крепкое и тёплое объятие',
    });
    if (res.throttled) {
      setTapSentMessage('Уже отправлено ✨');
    } else {
      setQuickHugSent(true);
      setTapSentMessage(null);
    }
    setTimeout(() => {
      setQuickHugSent(false);
      setTapSentMessage(null);
    }, 2800);
  };

  const handleSendSpecificTap = async (tapType: string, customNote: string, label: string) => {
    triggerHaptic('success');
    const res = await sendTouchAction(tapType, {
      customNote,
      title: `${currentUser?.name || currentPartner?.name}: ${label}`,
      subtitle: customNote,
    });
    if (res.throttled) {
      setTapSentMessage('Уже отправлено ✨');
    } else {
      setTapSentMessage(`Отправлено: ${label}! ✨`);
    }
    setTimeout(() => {
      setTapSentMessage(null);
    }, 2500);
  };

  const handleCustomMoodSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customMoodLabel.trim()) return;
    addMoodStatus(customMoodKey, customMoodLabel, 7, moodNote);
    addFeedItem({
      author: currentPartnerId,
      type: 'sparkle',
      title: `${currentPartner?.name} обновил(а) настроение: ${customMoodLabel}`,
      subtitle: moodNote || 'Новый статус',
    });
    setShowMoodPicker(false);
    setMoodNote('');
    triggerConfetti();
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestionAnswer.trim()) return;
    answerQuestionOfDay(userQuestionAnswer.trim());
    addFeedItem({
      author: currentPartnerId,
      type: 'heart',
      title: `${currentPartner?.name} ответил(а) на вопрос дня: «${userQuestionAnswer.trim()}»`,
      subtitle: 'Вопрос дня',
    });
    setShowQuestionModal(false);
    setIsEditingQuestionAnswer(false);
    triggerConfetti();
  };

  const handleSendQuickAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickActionText.trim() || !activeQuickAction) return;

    let titlePrefix = 'отправил(а) сообщение';
    let iconType: any = 'sparkle';

    if (activeQuickAction === 'felt') {
      titlePrefix = 'поделился(ась) чувством';
      iconType = 'heart';
    } else if (activeQuickAction === 'appreciated') {
      titlePrefix = 'поблагодарил(а)';
      iconType = 'sparkle';
    } else if (activeQuickAction === 'tell') {
      titlePrefix = 'хочет рассказать';
      iconType = 'pin';
    }

    addFeedItem({
      author: currentPartnerId,
      type: iconType,
      title: `${currentPartner?.name} ${titlePrefix}: «${quickActionText}»`,
      subtitle: 'Быстрое внимание',
    });

    setQuickActionText('');
    setActiveQuickAction(null);
    triggerConfetti();
  };

  return (
    <PageLayout hideHeader>
      <div className="space-y-4 sm:space-y-5 pb-8 sm:pb-12">
        
        {/* ============================================================ */}
        {/* 1. БЛОК 1: СТАТУС ПАРТНЁРА (ОНЛАЙН + НАСТРОЕНИЕ + ДНИ ВМЕСТЕ) */}
        {/* КРИТИЧНО: ВСЕГДА САМЫЙ ПЕРВЫЙ БЛОК НА ЭКРАНЕ "СЕГОДНЯ" */}
        {/* ============================================================ */}
        {isPaired ? (
          <section
            id="block-1-partner-status"
            onClick={() => setShowPartnerDetailModal(true)}
            className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs flex items-center justify-between gap-3 transition-all hover:border-[var(--accent)]/40 cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Partner Avatar with Online Indicator */}
              <div className="relative shrink-0">
                <ColoredAvatar
                  avatar={safeOtherPartner.avatar || 'heart'}
                  name={partnerName}
                  size="md"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[var(--surface-solid)] ${
                    partnerStatusInfo.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                  }`}
                />
              </div>

              {/* Partner Name, Online Status, Mood & Days Together (3 lines) */}
              <div className="min-w-0 flex-1 space-y-0.5">
                {/* Line 1: Name + Online Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-[var(--text)] leading-tight">
                    {partnerName}
                  </span>
                  <span className="text-[var(--text-3)] text-xs font-normal">•</span>
                  <span className="flex items-center gap-1.5 text-xs text-[var(--text-2)] font-medium">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        partnerStatusInfo.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
                      }`}
                    />
                    <span className={partnerStatusInfo.isOnline ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>
                      {partnerStatusInfo.statusText}
                    </span>
                  </span>
                </div>

                {/* Line 2: Mood */}
                <div className="text-xs text-[var(--text-2)] flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[var(--accent)] font-semibold">Настроение:</span>
                  <span className="text-[var(--text)] font-medium">
                    {safeOtherPartner.currentMood?.label || 'Спокойствие'}
                  </span>
                </div>

                {/* Line 3: Days Together */}
                <div className="text-[11px] sm:text-xs text-[var(--text-2)] flex items-center gap-1.5 font-normal">
                  <span className="text-[var(--text)] font-medium">
                    {formatDaysTogetherDetailed(coupleProfile?.startDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tap Affordance */}
            <div className="flex items-center gap-1 text-xs font-semibold text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors shrink-0">
              <span className="hidden sm:inline">Подробнее</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5" />
            </div>
          </section>
        ) : (
          <section
            id="block-1-partner-status-empty"
            onClick={() => setActiveTab('profile')}
            className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--divider)] shadow-xs flex items-center justify-between gap-3 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)] cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="font-bold text-sm sm:text-base text-[var(--text)] leading-tight">
                  Пара не создана
                </div>
                <div className="text-xs sm:text-sm text-[var(--text-2)] font-medium">
                  Свяжите аккаунты, чтобы объединить тесты и аналитику
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5 shrink-0" />
          </section>
        )}

        {/* ============================================================ */}
        {/* 2. БЛОК 2: ПРЕВЬЮ СОВМЕСТИМОСТИ + СТРИК АКТИВНОСТИ ПАРЫ */}
        {/* Комбинированный компактный блок в одну строку (лимит ≤ 7 зон) */}
        {/* ============================================================ */}
        <section id="block-2-compatibility-and-streak" className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Превью совместимости */}
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('light');
              if (hasCompatibilityData) {
                setUsSubTab('passport');
                setActiveTab('us');
              } else {
                setActiveTab('tests');
              }
            }}
            className="p-3 sm:p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] hover:border-[var(--accent)]/40 shadow-xs flex items-center justify-between gap-2 transition-all cursor-pointer text-left group select-none"
            title={hasCompatibilityData ? "Перейти в Паспорт пары" : "Пройти первый тест для расчёта совместимости"}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight flex items-center gap-1">
                  <span>{hasCompatibilityData ? `${compatibilityPercent}%` : '—'}</span>
                  <span className="text-[10px] text-[var(--text-3)] font-normal hidden sm:inline">
                    {hasCompatibilityData ? '• Паспорт' : '• Тесты'}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-2)] font-medium leading-snug mt-0.5 whitespace-nowrap">
                  {hasCompatibilityData ? compatibilityStatus : 'Пройти тест'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-3)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0" />
          </motion.button>

          {/* Стрик активности пары */}
          <motion.div
            whileHover={{ y: -1 }}
            className="p-3 sm:p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs flex items-center gap-2 sm:gap-2.5 transition-all text-left select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight flex items-center gap-1">
                <span>{streakDaysCount} {formatRussianPlural(streakDaysCount, 'день', 'дня', 'дней')}</span>
              </div>
              <div className="text-[11px] text-[var(--text-2)] font-medium leading-snug mt-0.5 whitespace-nowrap">
                подряд на связи
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============================================================ */}
        {/* 3. БЛОК 3: РЯД БЫСТРЫХ ПЕРЕХОДОВ (ИДЕЯ СВИДАНИЯ, DEEP TALK, КАПСУЛА) */}
        {/* ============================================================ */}
        <section id="block-3-quick-shortcuts" className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {quickShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={item.onClick}
                className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] hover:border-[var(--accent)]/40 shadow-xs flex flex-col items-center text-center gap-2 transition-all cursor-pointer group select-none"
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center transition-transform group-hover:scale-105 shrink-0`}>
                  <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div className="w-full min-w-0">
                  <div className="text-xs font-bold text-[var(--text)] leading-tight line-clamp-2">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-[var(--text-3)] font-medium mt-0.5 truncate hidden xs:block">
                    {item.subtitle}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </section>

        {/* ============================================================ */}
        {/* 4. БЛОК 4: КНОПКА "ОБНЯТЬ" (С LONG-PRESS МЕНЮ ЭМОЦИОНАЛЬНЫХ СИГНАЛОВ) */}
        {/* ============================================================ */}
        {isPaired && (
        <section id="block-4-hug-cta" className="relative">
          {/* Long-Press Context Menu (iOS Reactions Style) */}
          <AnimatePresence>
            {showRadialMenu && (
              <>
                {/* Backdrop Dismiss */}
                <div
                  id="hug-menu-backdrop"
                  className="fixed inset-0 z-40 bg-black/25 backdrop-blur-2xs animate-fadeIn"
                  onClick={() => setShowRadialMenu(false)}
                />

                {/* Floating Reactions Bar */}
                <motion.div
                  id="hug-longpress-menu"
                  initial={{ opacity: 0, scale: 0.85, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className="absolute bottom-full mb-3.5 left-1/2 -translate-x-1/2 z-50 p-2 sm:p-2.5 rounded-3xl bg-[var(--surface-solid)] border border-[var(--divider)] shadow-2xl flex items-center justify-center gap-1.5 sm:gap-2 max-w-[calc(100vw-24px)] select-none"
                >
                  {/* Subtle arrow pointing down towards button */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 rotate-45 bg-[var(--surface-solid)] border-r border-b border-[var(--divider)]" />

                  {EMOTIONAL_SIGNALS.map((sig) => {
                    const Icon = sig.icon;
                    return (
                      <button
                        key={sig.id}
                        id={`signal-btn-${sig.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSignal(sig);
                        }}
                        className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-2xl hover:bg-[var(--surface-2)] active:scale-90 transition-all cursor-pointer group shrink-0 min-w-[58px] sm:min-w-[64px]"
                      >
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${sig.bg} ${sig.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-[var(--text)] whitespace-nowrap text-center leading-none">
                          {sig.label}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            id="main-hug-cta"
            animate={
              isFirstVisitPulse
                ? { scale: [1, 1.03, 1, 1.03, 1] }
                : { scale: 1 }
            }
            transition={
              isFirstVisitPulse
                ? { duration: 1.2, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut' }
                : { type: 'spring', stiffness: 400, damping: 25 }
            }
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerCancel}
            onPointerCancel={handlePointerCancel}
            onClick={(e) => {
              if (isLongPressTriggeredRef.current) {
                e.preventDefault();
                return;
              }
              if (e.detail === 0) {
                handleQuickHug(e);
                dismissLongPressHint();
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowRadialMenu(true);
              dismissLongPressHint();
              triggerHaptic('light');
            }}
            className={`w-full py-4 sm:py-4.5 px-6 rounded-full flex items-center justify-between gap-4 cursor-pointer relative overflow-hidden transition-all duration-300 select-none ${
              quickHugSent
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'hug-btn-primary'
            }`}
            title="Тап — обнять. Удержание (~380мс) или три точки — выбор знака внимания"
          >
            <div className="flex items-center gap-3.5 relative z-10 min-w-0">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-inner shrink-0 text-white transition-all ${
                quickHugSent ? 'bg-white/25' : 'bg-white/20 animate-heartbeat'
              }`}>
                {quickHugSent ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <Heart className="w-5 h-5 fill-white text-white" />
                )}
              </div>
              <div className="text-left min-w-0">
                <div className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  {quickHugSent ? 'Объятие доставлено!' : 'Обнять'}
                </div>
                <div className="text-xs font-medium text-white/90 leading-tight mt-0.5 truncate">
                  {quickHugSent
                    ? `${partnerName} чувствует ваше тепло прямо сейчас ❤️`
                    : `Отправить нежное прикосновение для ${partnerName}`}
                </div>
              </div>
            </div>

            {quickHugSent ? (
              <div className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Доставлено</span>
              </div>
            ) : (
              <div
                id="hug-options-trigger"
                role="button"
                tabIndex={0}
                title="Выбрать другой знак внимания"
                aria-label="Выбрать другой знак внимания"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissLongPressHint();
                  triggerHaptic('light');
                  setShowRadialMenu(true);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    dismissLongPressHint();
                    triggerHaptic('light');
                    setShowRadialMenu(true);
                  }
                }}
                className="relative z-20 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-white transition-all cursor-pointer shrink-0 backdrop-blur-xs shadow-2xs group/more"
              >
                <MoreHorizontal className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white group-hover/more:scale-110 transition-transform" />
              </div>
            )}
          </motion.button>

          {/* Onboarding hint with tail for long-press gesture discovery */}
          <AnimatePresence>
            {showLongPressHint && !showRadialMenu && (
              <motion.div
                id="hug-longpress-tooltip"
                initial={{ opacity: 0, y: 6, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.94 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute bottom-full mb-3.5 left-1/2 -translate-x-1/2 z-30 px-3.5 py-2 rounded-2xl bg-[var(--surface-solid)] border border-[var(--divider)] shadow-xl flex items-center gap-2 text-xs font-semibold text-[var(--text)] whitespace-nowrap select-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 animate-pulse" />
                <span>Зажмите, чтобы выбрать другой знак внимания</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissLongPressHint();
                  }}
                  className="ml-1 text-[var(--text-3)] hover:text-[var(--text)] p-0.5 rounded-full transition-colors cursor-pointer"
                  title="Понятно"
                >
                  <X className="w-3 h-3" />
                </button>
                {/* Хвостик, указывающий вниз на кнопку "Обнять" */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 rotate-45 bg-[var(--surface-solid)] border-r border-b border-[var(--divider)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Toast */}
          <AnimatePresence>
            {(quickHugSent || tapSentMessage) && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-[var(--surface-solid)] border border-[var(--accent)]/30 text-[var(--accent)] font-bold text-xs shadow-lg flex items-center gap-1.5 pointer-events-none"
              >
                <Heart className="w-3.5 h-3.5 fill-[var(--accent)]" />
                <span>{tapSentMessage || `Объятие передано ${partnerName} ❤️`}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        )}
        {/* ============================================================ */}
        {/* 4. DAILY QUESTION COMPACT TEASER (THOUGHTFUL CONNECTION) */}
        {/* ============================================================ */}
        <section
          onClick={() => {
            setUserQuestionAnswer(questionAnswer || '');
            setShowQuestionModal(true);
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs hover:border-[var(--accent)]/40 flex items-center justify-between gap-3 transition-all cursor-pointer group select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Quote className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight">
                  Вопрос дня
                </h3>
                {questionAnswer ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Отвечено</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-semibold text-[var(--accent)] bg-[var(--surface-blush)] px-2 py-0.5 rounded-full">
                    Новый
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-2)] mt-0.5 truncate italic">
                «{currentDailyQuestion}»
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors shrink-0">
            <span className="hidden sm:inline">{questionAnswer ? 'Посмотреть' : 'Ответить'}</span>
            <ChevronRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5" />
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. COUPLE EVENTS TODAY (RECENT ACTIONS / EMPTY-STATE) */}
        {/* ============================================================ */}
        <section className="space-y-2">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                  {isPaired ? 'События пары сегодня' : 'События сегодня'}
                </h4>
              </div>
              <span className="text-[11px] text-[var(--text-3)] font-medium">
                {feedItems.length > 0 ? (feedItems[0].timeAgo || 'Недавно') : 'Сегодня'}
              </span>
            </div>

            {feedItems.length > 0 ? (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-4 h-4 fill-[var(--accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--text)] leading-snug">
                    {feedItems[0].title}
                  </p>
                  <p className="text-[11px] text-[var(--text-2)] mt-0.5 line-clamp-2">
                    {feedItems[0].subtitle}
                  </p>
                </div>
              </div>
            ) : questionAnswer ? (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)]">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--text)] leading-snug">
                    Ответ на вопрос дня сохранён
                  </p>
                  <p className="text-[11px] text-[var(--text-2)] mt-0.5 line-clamp-2 italic">
                    «{questionAnswer}»
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-[var(--text-2)]">
                <Sparkles className="w-4 h-4 text-[var(--text-3)] shrink-0" />
                <span className="text-xs font-normal">Сегодня пока без общих событий</span>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5.5 OUR PLANS STAT-TILE (SCHEDULE SYNCHRONIZATION ENTRY) */}
        {/* ============================================================ */}
        <section
          onClick={() => {
            triggerHaptic('light');
            setShowScheduleModal(true);
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs hover:border-sky-500/40 flex items-center justify-between gap-3 transition-all cursor-pointer group select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight">
                  {scheduleSummary.title}
                </h4>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${scheduleSummary.badgeClass}`}>
                  {scheduleSummary.badge}
                </span>
              </div>
              <p className="text-xs text-[var(--text-2)] mt-0.5 line-clamp-1">
                {scheduleSummary.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-[var(--text-2)] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors shrink-0">
            <span className="hidden sm:inline">Открыть</span>
            <ChevronRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. NEXT PLANNED DATE / EVENT (SHOWN ONLY IF SCHEDULED) */}
        {/* ============================================================ */}
        {upcomingDate && (
          <section
            onClick={() => {
              setDatesSubTab('history');
              setActiveTab('dates');
            }}
            className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs hover:border-[var(--accent)]/40 flex items-center justify-between gap-3 transition-all cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-500 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight">
                    Ближайшее свидание
                  </h4>
                  <span className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
                    {upcomingDate.status === 'CONFIRMED' ? 'Подтверждено' : 'Запланировано'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-2)] mt-0.5 truncate">
                  {upcomingDate.chosenDate ? `${upcomingDate.chosenDate}${upcomingDate.chosenTime ? ` в ${upcomingDate.chosenTime}` : ''} • ` : ''}
                  {upcomingDate.chosenLocation || upcomingDate.invitationNote || 'Особенный вечер для двоих'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors shrink-0">
              <span className="hidden sm:inline">Открыть</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5" />
            </div>
          </section>
        )}
      </div>
      {/* ============================================================ */}
      {/* MODAL 0: Daily Question Modal (Warm, Focused, Non-Intrusive) */}
      {/* ============================================================ */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center">
          <div 
            onClick={() => {
              setShowQuestionModal(false);
              setIsEditingQuestionAnswer(false);
            }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn" 
          />

          <div className="relative z-10 w-full max-w-lg bg-[var(--surface-solid)] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 border border-[var(--divider)] shadow-2xl space-y-4 max-h-[90vh] flex flex-col pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] animate-slideUp">
            <div className="w-10 h-1 rounded-full bg-[var(--divider)] mx-auto sm:hidden mb-1 shrink-0" />
            
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center">
                  <Quote className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text)] leading-tight">Вопрос дня</h3>
                  <p className="text-xs text-[var(--text-2)]">Для душевного сближения и диалога</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowQuestionModal(false);
                  setIsEditingQuestionAnswer(false);
                }}
                className="w-9 h-9 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Question Text Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)]">
              <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Сегодняшний вопрос</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-[var(--text)] leading-relaxed italic">
                «{currentDailyQuestion}»
              </p>
            </div>

            {/* Answer Display or Form */}
            {questionAnswer && !isEditingQuestionAnswer ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ваш ответ сохранён:</span>
                    </span>
                    <span className="text-[11px] text-[var(--text-3)] font-medium">Виден партнёру</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text)] leading-relaxed pt-1">
                    «{questionAnswer}»
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserQuestionAnswer(questionAnswer);
                      setIsEditingQuestionAnswer(true);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text)] font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-[var(--accent)]" />
                    <span>Изменить ответ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="px-5 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    Готово
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAnswerSubmit} className="space-y-3.5">
                <textarea
                  value={userQuestionAnswer}
                  onChange={(e) => setUserQuestionAnswer(e.target.value)}
                  placeholder="Напишите искренний ответ для вашего партнёра..."
                  rows={4}
                  autoFocus
                  className="w-full p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] resize-none"
                />
                <div className="flex gap-2 pt-1 border-t border-[var(--divider)]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionModal(false);
                      setIsEditingQuestionAnswer(false);
                    }}
                    className="px-4 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-semibold text-sm transition-all active:scale-98 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={!userQuestionAnswer.trim()}
                    className="flex-1 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Поделиться с партнёром</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: Mood Picker Bottom Sheet (Warm, Clean, Intimate) */}
      {/* ============================================================ */}
      {showMoodPicker && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center">
          <div 
            onClick={() => {
              setShowMoodPicker(false);
              setShowMoodInfo(false);
            }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn" 
          />

          <div className="relative z-10 w-full max-w-lg bg-[var(--surface-solid)] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 border border-[var(--divider)] shadow-2xl space-y-0 max-h-[90vh] flex flex-col pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] animate-slideUp">
            <div className="w-10 h-1 rounded-full bg-[var(--divider)] mx-auto sm:hidden mb-3 shrink-0" />
            
            <div className="flex items-center justify-between shrink-0 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center">
                  <SmilePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text)] leading-tight">Моё настроение</h3>
                  <p className="text-xs text-[var(--text-2)]">Партнёр увидит ваше актуальное состояние</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMoodPicker(false);
                  setShowMoodInfo(false);
                }}
                className="w-9 h-9 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomMoodSubmit} className="flex flex-col flex-1 overflow-hidden space-y-3.5">
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {/* Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MOOD_PRESETS.map((preset) => {
                    const isSelected = customMoodKey === preset.key;
                    return (
                      <button
                        type="button"
                        key={preset.key}
                        onClick={() => {
                          setCustomMoodKey(preset.key);
                          setCustomMoodLabel(preset.label);
                        }}
                        className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-start gap-2 transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs scale-[1.02]'
                            : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--divider)] hover:border-[var(--accent)]/40'
                        }`}
                      >
                        <ColoredIcon
                          icon={preset.icon}
                          color={preset.color}
                          size="sm"
                        />
                        <span className="leading-tight text-left truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Label Input */}
                <input
                  type="text"
                  value={customMoodLabel}
                  onChange={(e) => setCustomMoodLabel(e.target.value)}
                  placeholder="Название состояния (например: Заряжен на романтику)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] font-medium placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)]"
                />

                {/* Optional Note Input */}
                <input
                  type="text"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="Пара тёплых слов о вашем дне или чувствах..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] font-normal placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[var(--divider)] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMoodPicker(false)}
                  className="px-4 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-semibold text-sm transition-all active:scale-98 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!customMoodLabel.trim()}
                  className="flex-1 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Сохранить настроение</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ============================================================ */}
      {/* MODAL 2: Quick Reaction / Message Bottom Sheet */}
      {/* ============================================================ */}
      {activeQuickAction && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center">
          <div 
            onClick={() => setActiveQuickAction(null)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn" 
          />

          <div className="relative z-10 w-full max-w-lg bg-[var(--surface-solid)] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 border border-[var(--divider)] shadow-2xl space-y-0 max-h-[90vh] flex flex-col pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] animate-slideUp">
            <div className="w-10 h-1 rounded-full bg-[var(--divider)] mx-auto sm:hidden mb-3 shrink-0" />
            
            <div className="flex items-center justify-between shrink-0 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text)] leading-tight">
                    {activeQuickAction === 'felt'
                      ? 'Я почувствовал(а)'
                      : activeQuickAction === 'appreciated'
                      ? 'Я ценю и благодарю'
                      : 'Хочу рассказать'}
                  </h3>
                  <p className="text-xs text-[var(--text-2)]">
                    {activeQuickAction === 'felt'
                      ? 'Бережно опишите эмоцию без критики'
                      : 'Отправьте тёплый знак внимания'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuickAction(null)}
                className="w-9 h-9 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendQuickAction} className="flex flex-col flex-1 space-y-3.5">
              <textarea
                value={quickActionText}
                onChange={(e) => setQuickActionText(e.target.value)}
                rows={3}
                placeholder={
                  activeQuickAction === 'felt'
                    ? 'Например: Мне было очень тепло, когда ты обнял(а) меня утром...'
                    : activeQuickAction === 'appreciated'
                    ? 'Например: Спасибо за твою заботу и вкусный завтрак сегодня!'
                    : 'Например: Давай сегодня вечером вместе посмотрим фильм...'
                }
                className="w-full p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] resize-none"
                autoFocus
              />

              <div className="flex items-center gap-2 pt-2 border-t border-[var(--divider)] shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveQuickAction(null)}
                  className="px-4 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-semibold text-sm transition-all active:scale-98 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!quickActionText.trim()}
                  className="flex-1 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Отправить в ленту пары</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ============================================================ */}
      {/* MODAL 3: Partner Detail & Intimate Connection Sheet */}
      {/* ============================================================ */}
      {showPartnerDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[var(--surface-solid)] border border-[var(--divider)] rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <ColoredAvatar
                    avatar={safeOtherPartner.avatar || 'sparkles'}
                    name={partnerName}
                    size="md"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[var(--surface-solid)] ${
                      partnerStatusInfo.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                    <span>{partnerName}</span>
                    {safeOtherPartner.login && (
                      <span className="text-xs text-[var(--text-2)] font-normal">
                        @{safeOtherPartner.login}
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-[var(--text-2)] flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        partnerStatusInfo.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <span>{partnerStatusInfo.statusText}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPartnerDetailModal(false)}
                className="w-9 h-9 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current State */}
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                  Текущее настроение
                </span>
                {safeOtherPartner.currentMood?.updatedAt && (
                  <span className="text-xs text-[var(--text-2)] font-normal">
                    {formatMoodTime(safeOtherPartner.currentMood.updatedAt)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3.5">
                <MoodBadge
                  mood={safeOtherPartner.currentMood?.emoji || safeOtherPartner.currentMood?.label || 'inspire'}
                  showLabel={false}
                  size="lg"
                />
                <div>
                  <div className="text-lg font-bold text-[var(--text)] leading-tight">
                    {safeOtherPartner.currentMood?.label || 'В предвкушении'}
                  </div>
                  <div className="text-xs text-[var(--text-2)] mt-0.5">
                    {partnerStatusInfo.isOnline ? 'Активно делится состоянием' : 'Последнее обновление'}
                  </div>
                </div>
              </div>

              {safeOtherPartner.currentMood?.note?.trim() && (
                <div className="p-3 rounded-xl bg-[var(--surface-solid)] border border-[var(--divider)]">
                  <div className="text-[11px] font-medium text-[var(--text-2)] mb-0.5">
                    Слова партнёра:
                  </div>
                  <p className="text-sm italic text-[var(--text)] font-medium leading-relaxed">
                    «{safeOtherPartner.currentMood.note.trim()}»
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[var(--surface-blush)] border border-[var(--surface-blush-border)]">
                <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Взгляд психолога Совы</span>
                </div>
                <p className="text-xs text-[var(--text)] leading-relaxed font-normal">
                  {getMoodBriefDescription(
                    safeOtherPartner.currentMood?.label || safeOtherPartner.currentMood?.emoji || 'inspire'
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--text-2)] uppercase tracking-wider px-1">
                Быстрое внимание
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSendSpecificTap('thinking', 'Думаю о тебе прямо сейчас ✨', 'Думаю о тебе')}
                  className="p-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-left"
                >
                  <span className="text-base">💭</span>
                  <span className="truncate">Думаю о тебе</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendSpecificTap('miss', 'Очень скучаю по тебе 💌', 'Скучаю')}
                  className="p-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-left"
                >
                  <span className="text-base">🥺</span>
                  <span className="truncate">Скучаю</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendSpecificTap('proud', 'Горжусь тобой и твоими успехами! 🌟', 'Горжусь тобой')}
                  className="p-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-left"
                >
                  <span className="text-base">🏆</span>
                  <span className="truncate">Горжусь тобой</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendSpecificTap('grateful', 'Спасибо тебе за то, что ты есть! ❤️', 'Ценю тебя')}
                  className="p-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-left"
                >
                  <span className="text-base">❤️</span>
                  <span className="truncate">Ценю тебя</span>
                </button>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--divider)]">
              <button
                type="button"
                onClick={() => {
                  setShowPartnerDetailModal(false);
                  setActiveTab('chat');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Написать в чат</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPartnerDetailModal(false)}
                className="px-4 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-semibold text-sm transition-all active:scale-98 cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Planner Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onOpenDateWheel={() => {
          setShowScheduleModal(false);
          setDatesSubTab('wheel');
          setActiveTab('dates');
        }}
      />

    </PageLayout>
  );
};
