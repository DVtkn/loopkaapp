import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { NavigationTab } from '../types';
import { PageLayout } from './ui/PageLayout';
import { triggerHaptic } from '../utils/haptics';
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
  isPaired: boolean,
  partner: { name?: string; lastActiveAt?: string; gender?: string; login?: string }
): {
  isOnline: boolean;
  statusText: string;
  badgeText: string;
} {
  if (!isPaired) {
    return {
      isOnline: false,
      statusText: 'Партнёр не подключён',
      badgeText: 'Ожидание',
    };
  }

  if (!partner.lastActiveAt) {
    return {
      isOnline: true,
      statusText: 'На связи в Loop',
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
    setUsSubTab,
    setDatesSubTab,
    currentUser,
    incomingRequests,
    acceptPairRequest,
    loveTaps,
    sendLoveTap,
    dailyQuiz,
    submitDailyQuizAnswer,
    triggerConfetti,
  } = useCouple();

  const currentPartner = currentPartnerId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile.partner2 : coupleProfile.partner1;
  const isPaired = !!currentUser?.partnerLogin;

  // Mood selector state
  const [showMoodPicker, setShowMoodPicker] = useState<boolean>(false);
  const [showMoodInfo, setShowMoodInfo] = useState<boolean>(false);
  const [moodNote, setMoodNote] = useState<string>('');
  const [customMoodLabel, setCustomMoodLabel] = useState<string>('Спокойствие');
  const [customMoodKey, setCustomMoodKey] = useState<string>('calm');

  // Question of the Day input state
  const [showQuestionInput, setShowQuestionInput] = useState<boolean>(false);
  const [userQuestionAnswer, setUserQuestionAnswer] = useState<string>('');

  // Quick Action Modal
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [quickActionText, setQuickActionText] = useState<string>('');

  // Interaction feedback states
  const [quickHugSent, setQuickHugSent] = useState<boolean>(false);
  const [showPartnerDetailModal, setShowPartnerDetailModal] = useState<boolean>(false);
  const [tapSentMessage, setTapSentMessage] = useState<string | null>(null);

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

  const partnerStatusInfo = getPartnerStatusDetails(isPaired, {
    name: otherPartner.name,
    lastActiveAt: otherPartner.lastActiveAt,
    gender: otherPartner.gender,
    login: otherPartner.login,
  });

  const testsCompleted = (tests || []).filter(t => t.partner1Done || t.partner2Done).length;
  const confirmedDatesCount = (dateInvites || []).filter(d => d.status === 'CONFIRMED' || d.status === 'COMPLETED').length;
  const feedCount = (feedItems || []).length;

  const handleQuickHug = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic('success');
    sendLoveTap('thinking', `Отправлено крепкое объятие для ${otherPartner.name || 'любимого человека'} ❤️`);
    setQuickHugSent(true);
    triggerConfetti();
    setTimeout(() => {
      setQuickHugSent(false);
    }, 2800);
  };

  const handleSendSpecificTap = (tapType: any, customNote: string, label: string) => {
    triggerHaptic('success');
    sendLoveTap(tapType, customNote);
    setTapSentMessage(`Отправлено: ${label}! ✨`);
    triggerConfetti();
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
      title: `${currentPartner.name} обновил(а) настроение: ${customMoodLabel}`,
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
      title: `${currentPartner.name} ответил(а) на вопрос дня: «${userQuestionAnswer.trim()}»`,
      subtitle: 'Вопрос дня',
    });
    setShowQuestionInput(false);
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
      title: `${currentPartner.name} ${titlePrefix}: «${quickActionText}»`,
      subtitle: 'Быстрое внимание',
    });

    setQuickActionText('');
    setActiveQuickAction(null);
    triggerConfetti();
  };

  const quickAttentionList = [
    {
      id: 'mood',
      label: 'Моё настроение',
      subtitle: currentUser?.currentMood?.label || 'Обновить',
      icon: SmilePlus,
      onClick: () => setShowMoodPicker(true),
    },
    {
      id: 'thinking',
      label: 'Думаю о тебе',
      subtitle: 'Мягкий сигнал',
      icon: Sparkles,
      onClick: () => handleSendSpecificTap('thinking', 'Думаю о тебе прямо сейчас ✨', 'Думаю о тебе'),
    },
    {
      id: 'miss',
      label: 'Скучаю по тебе',
      subtitle: 'Тёплый привет',
      icon: Heart,
      onClick: () => handleSendSpecificTap('miss', 'Очень скучаю по тебе 💌', 'Скучаю'),
    },
    {
      id: 'felt',
      label: 'Поделиться чувством',
      subtitle: 'Без повода',
      icon: HeartHandshake,
      onClick: () => setActiveQuickAction('felt'),
    },
    {
      id: 'appreciated',
      label: 'Поблагодарить',
      subtitle: 'За теплоту и заботу',
      icon: ThumbsUp,
      onClick: () => setActiveQuickAction('appreciated'),
    },
    {
      id: 'book',
      label: 'Книга заботы',
      subtitle: 'Хотелочки и вкусы',
      icon: Gift,
      onClick: () => {
        setUsSubTab('book');
        setActiveTab('us');
      },
    },
  ];

  return (
    <PageLayout hideHeader>
      <div className="space-y-6 pb-6">
        
        {/* ============================================================ */}
        {/* TODAY HERO — INTIMATE PRESENCE & CURRENT MOMENT */}
        {/* ============================================================ */}
        <section className="relative p-6 sm:p-7 rounded-[28px] bg-[var(--surface)] border border-[var(--divider)] shadow-xs space-y-4">
          {/* Subtle Ambient Warmth */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none" />

          {/* Top Row: Couple Header & Intimate Presence */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${partnerStatusInfo.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-[var(--accent)]'}`} />
                <span>Сегодня</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
                {isPaired ? `${currentPartner.name} & ${otherPartner.name}` : 'Вы и Ваш партнёр'}
              </h1>
              
              {/* Immediate Presence & Current Mood */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 text-xs text-[var(--text-2)] font-medium">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${partnerStatusInfo.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                  <span>{partnerStatusInfo.statusText}</span>
                </span>
                {isPaired && otherPartner.currentMood?.label && (
                  <>
                    <span className="text-[var(--divider)]">•</span>
                    <span>
                      Настроение {otherPartner.name}: <strong className="text-[var(--text)] font-semibold">{otherPartner.currentMood.label}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Overlapping Portraits with Intimate Connection */}
            <div 
              onClick={() => isPaired && setShowPartnerDetailModal(true)}
              className="relative flex items-center -space-x-3 cursor-pointer group shrink-0"
              title="Статус партнёра"
            >
              <div className="w-12 h-12 rounded-full ring-2 ring-[var(--surface-solid)] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center transition-transform group-hover:scale-105">
                <ColoredAvatar avatar={currentPartner.avatar || 'sparkles'} name={currentPartner.name} size="md" />
              </div>
              <div className="w-12 h-12 rounded-full ring-2 ring-[var(--surface-solid)] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center transition-transform group-hover:scale-105">
                <ColoredAvatar avatar={otherPartner.avatar || 'heart'} name={otherPartner.name} size="md" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center ring-2 ring-[var(--surface-solid)] text-[10px] shadow-xs">
                <Heart className="w-3 h-3 fill-white" />
              </div>
            </div>
          </div>

          {/* Pending Pairing Request Alert (if any) */}
          {!isPaired && incomingRequests.length > 0 && (
            <div className="relative z-10 mt-2 p-3.5 rounded-2xl bg-[var(--surface-blush)] border border-[var(--accent)]/30 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[var(--text)] truncate">
                    Запрос на пару от @{incomingRequests[0].fromLogin}
                  </p>
                  <p className="text-[11px] text-[var(--text-2)]">Подтвердите, чтобы объединить профили</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => acceptPairRequest(incomingRequests[0].fromLogin)}
                className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shrink-0 hover:bg-[var(--accent-hover)] active:scale-95 transition-all cursor-pointer"
              >
                Принять
              </button>
            </div>
          )}
        </section>


        {/* ============================================================ */}
        {/* SIGNATURE INTERACTION — TACTILE EMOTIONAL "ОБНЯТЬ" */}
        {/* ============================================================ */}
        <section className="relative">
          {isPaired ? (
            <motion.button
              type="button"
              id="main-hug-cta"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleQuickHug}
              className={`w-full py-4 sm:py-4.5 px-6 rounded-full flex items-center justify-between gap-4 cursor-pointer relative overflow-hidden transition-all duration-300 ${
                quickHugSent
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'hug-btn-primary'
              }`}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-inner shrink-0 text-white transition-all ${
                  quickHugSent ? 'bg-white/25' : 'bg-white/20 animate-heartbeat'
                }`}>
                  {quickHugSent ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <Heart className="w-5 h-5 fill-white text-white" />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                    {quickHugSent ? 'Объятие доставлено!' : 'Обнять'}
                  </div>
                  <div className="text-xs font-medium text-white/90 leading-tight mt-0.5">
                    {quickHugSent
                      ? `${otherPartner.name} чувствует ваше тепло прямо сейчас ❤️`
                      : `Отправить нежное прикосновение для ${otherPartner.name}`}
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{quickHugSent ? 'Доставлено' : 'В один тап'}</span>
              </div>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('profile')}
              className="w-full hug-btn-primary py-4 px-6 flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-white leading-tight">Пригласить партнёра</div>
                  <div className="text-xs text-white/80">Ваш логин: @{currentUser?.login}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </motion.button>
          )}

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
                <span>{tapSentMessage || `Объятие передано ${otherPartner.name} ❤️`}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>


        {/* ============================================================ */}
        {/* CORE EMOTIONAL BLOCK — "ВОПРОС ДНЯ" (CANONICAL NAME) */}
        {/* ============================================================ */}
        <section className="p-6 sm:p-7 rounded-[28px] bg-[var(--surface)] border border-[var(--divider)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center">
                <Quote className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] leading-tight">Вопрос дня</h2>
                <span className="text-[11px] text-[var(--text-2)]">Откройте сокровенное друг о друге</span>
              </div>
            </div>
            {questionAnswer && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Отвечено</span>
              </span>
            )}
          </div>

          <p className="text-lg sm:text-xl font-semibold text-[var(--text)] leading-relaxed italic">
            «{currentDailyQuestion}»
          </p>

          {/* User's Answer or Answer Input */}
          {questionAnswer ? (
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-1">
              <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                Ваш ответ:
              </div>
              <p className="text-sm font-medium text-[var(--text)] leading-relaxed">
                {questionAnswer}
              </p>
            </div>
          ) : showQuestionInput ? (
            <form onSubmit={handleAnswerSubmit} className="space-y-3 pt-1">
              <textarea
                value={userQuestionAnswer}
                onChange={(e) => setUserQuestionAnswer(e.target.value)}
                placeholder="Напишите искренний ответ для вашего партнёра..."
                rows={3}
                autoFocus
                className="w-full p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionInput(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!userQuestionAnswer.trim()}
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-xs hover:bg-[var(--accent-hover)] disabled:opacity-40 transition-all cursor-pointer"
                >
                  Поделиться с партнёром
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowQuestionInput(true)}
              className="w-full py-3 px-4 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs sm:text-sm font-semibold text-[var(--accent)] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Ответить на вопрос дня</span>
            </button>
          )}
        </section>


        {/* ============================================================ */}
        {/* QUICK EMOTIONAL TOUCHES — "ПРОЯВИТЬ ВНИМАНИЕ" */}
        {/* ============================================================ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">
              Проявить внимание
            </h3>
            <span className="text-xs text-[var(--text-2)]">Быстрые знаки заботы</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
            {quickAttentionList.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={item.onClick}
                  className="flex-none min-w-[130px] sm:min-w-[145px] p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] hover:border-[var(--accent)]/40 shadow-2xs flex flex-col items-start gap-2.5 transition-all snap-start cursor-pointer text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-blush)] border border-[var(--surface-blush-border)] text-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-105">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text)] leading-tight">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-[var(--text-2)] font-normal mt-0.5 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

      </div>


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
                    avatar={otherPartner.avatar || 'sparkles'}
                    name={otherPartner.name}
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
                    <span>{otherPartner.name || 'Партнёр'}</span>
                    {otherPartner.login && (
                      <span className="text-xs text-[var(--text-2)] font-normal">
                        @{otherPartner.login}
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
                {otherPartner.currentMood?.updatedAt && (
                  <span className="text-xs text-[var(--text-2)] font-normal">
                    {formatMoodTime(otherPartner.currentMood.updatedAt)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3.5">
                <MoodBadge
                  mood={otherPartner.currentMood?.emoji || otherPartner.currentMood?.label || 'inspire'}
                  showLabel={false}
                  size="lg"
                />
                <div>
                  <div className="text-lg font-bold text-[var(--text)] leading-tight">
                    {otherPartner.currentMood?.label || 'В предвкушении'}
                  </div>
                  <div className="text-xs text-[var(--text-2)] mt-0.5">
                    {partnerStatusInfo.isOnline ? 'Активно делится состоянием' : 'Последнее обновление'}
                  </div>
                </div>
              </div>

              {otherPartner.currentMood?.note?.trim() && (
                <div className="p-3 rounded-xl bg-[var(--surface-solid)] border border-[var(--divider)]">
                  <div className="text-[11px] font-medium text-[var(--text-2)] mb-0.5">
                    Слова партнёра:
                  </div>
                  <p className="text-sm italic text-[var(--text)] font-medium leading-relaxed">
                    «{otherPartner.currentMood.note.trim()}»
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
                    otherPartner.currentMood?.label || otherPartner.currentMood?.emoji || 'inspire'
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

    </PageLayout>
  );
};
