import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Sparkles,
  Flame,
  CheckCircle2,
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
  HeartHandshake,
  Mail,
  Pencil,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { DAILY_QUIZ_QUESTIONS } from '../data/gamificationData';
import { NavigationTab } from '../types';
import { PageLayout } from './ui/PageLayout';
import { RelationshipTemperature } from './RelationshipTemperature';
import {
  ColoredIcon,
  MoodBadge,
  LoveTapBadge,
  ColoredAvatar,
  MOOD_PRESETS,
  LOVE_TAP_PRESETS,
  getMoodMeta,
  getLoveTapMeta,
} from './ColoredIcon';

interface DashboardViewProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const {
    currentPartnerId,
    coupleProfile,
    daysTogether, formattedTimeTogether,
    challenges,
    toggleChallenge,
    smallCravings,
    addMoodStatus,    questionAnswer,
    answerQuestionOfDay,
    feedItems,
    addFeedItem,
    clearFeed,
    setUsSubTab,
    setDatesSubTab,
    currentUser,
    incomingRequests,
    acceptPairRequest,
    rejectPairRequest,
    loveTaps,
    sendLoveTap,
    dailyQuiz,
    submitDailyQuizAnswer,
    coupleXP,
    coupleLevelInfo,
    xpHistory,
    triggerConfetti,
  } = useCouple();

  const currentPartner = currentPartnerId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile.partner2 : coupleProfile.partner1;
  const isPaired = !!currentUser?.partnerLogin;

  // Mood selector state
  const [showMoodPicker, setShowMoodPicker] = useState<boolean>(false);
  const [showMoodInfo, setShowMoodInfo] = useState<boolean>(false);
  const [moodNote, setMoodNote] = useState<string>('');

  // Question of the Day input state
  const [showQuestionInput, setShowQuestionInput] = useState<boolean>(false);
  const [questionText, setQuestionText] = useState<string>('');

  // Quick Action Modal (Instagram / WhatsApp style reaction sheet)
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [quickActionText, setQuickActionText] = useState<string>('');

  const [lastTapped, setLastTapped] = useState<string | null>(null);

  const dailyQuestions = [
    "Что сегодня заставило тебя искренне улыбнуться?",
    "Какое событие дня ты бы хотел пережить снова?",
    "Что сегодня было самым сложным, и как ты с этим справился?",
    "Какая песня лучше всего описывает твой сегодняшний день?",
    "За что ты сегодня благодарен больше всего?",
    "Что нового ты узнал сегодня?",
    "О чем ты сегодня мечтал в свободную минутку?",
    "Какой комплимент ты бы сделал себе сегодня?",
    "Если бы сегодняшний день был фильмом, как бы он назывался?"
  ];
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const currentDailyQuestion = dailyQuestions[dayOfYear % dailyQuestions.length];

  const [pulseSent, setPulseSent] = useState<boolean>(false);

  const [customMoodLabel, setCustomMoodLabel] = useState<string>('Спокойствие');
  const [customMoodKey, setCustomMoodKey] = useState<string>('calm');

  const moodPresets = MOOD_PRESETS;
  const loveTapButtons = LOVE_TAP_PRESETS;

  const handleLoveTap = (tap: typeof loveTapButtons[0]) => {
    sendLoveTap(tap.type);
    setLastTapped(tap.label);
    setTimeout(() => setLastTapped(null), 2500);
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
      titlePrefix = 'оценил(а) ваш поступок';
      iconType = 'sparkle';
    } else if (activeQuickAction === 'tell') {
      titlePrefix = 'хочет рассказать';
      iconType = 'pin';
    }

    addFeedItem({
      author: currentPartnerId,
      type: iconType,
      title: `${currentPartner.name} ${titlePrefix}: «${quickActionText}»`,
      subtitle: 'Быстрое действие',
    });

    setQuickActionText('');
    setActiveQuickAction(null);
  };

  // Sync body modal state to hide bottom navigation and prevent layout overlap
  useEffect(() => {
    const isAnyModalOpen = !!(showMoodPicker || activeQuickAction);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('has-active-modal', isAnyModalOpen);
      document.body.classList.toggle('modal-open', isAnyModalOpen);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('has-active-modal', 'modal-open');
      }
    };
  }, [showMoodPicker, activeQuickAction]);

  const activeChallenge = challenges.find((c) => !c.partner1Completed || !c.partner2Completed) || challenges[0];

  const todayStr = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const formattedDate = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  return (
    <PageLayout hideHeader>
      
      {/* 1. Nav Large Greeting Header with subtle parallax float */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between pt-1 gap-3"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)] truncate">
            Привет, {currentPartner.name}
          </h1>
          <p className="text-sm text-[var(--text-2)] font-normal mt-0.5 truncate">
            {formattedDate} • {isPaired ? `Вместе ${formattedTimeTogether}` : `@${currentUser?.login}`}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('chat')}
          className="w-11 h-11 shrink-0 rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center border border-[var(--divider)] hover:opacity-85 transition-opacity shadow-xs"
          title="Спросить ИИ-психолога"
        >
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Unpaired Banner / Notification */}
      {!isPaired && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/[0.06] via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
              {incomingRequests.length > 0 ? (
                <ColoredAvatar avatar={incomingRequests[0].fromAvatar || 'heart'} size="md" />
              ) : (
                <Heart className="w-6 h-6 fill-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-semibold text-[var(--text)] tracking-tight">
                  {incomingRequests.length > 0
                    ? `Запрос на объединение в пару!`
                    : 'Подключите вашего партнёра'}
                </h4>
                {incomingRequests.length > 0 && (
                  <span className="text-xs bg-[var(--accent)] text-white font-semibold px-2 py-0.5 rounded-full shadow-xs">
                    Новый
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-2)] break-words leading-relaxed mt-1 font-normal">
                {incomingRequests.length > 0
                  ? `@${incomingRequests[0].fromLogin} (${incomingRequests[0].fromName}) приглашает вас стать парой`
                  : `Ваш логин: @${currentUser?.login}. Введите логин партнёра в кабинете.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end relative z-10">
            {incomingRequests.length > 0 ? (
              <>
              <button
                  onClick={() => acceptPairRequest(incomingRequests[0].fromLogin)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl apple-btn-primary text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Принять</span>
                </button>
                <button
                  onClick={() => rejectPairRequest(incomingRequests[0].fromLogin)}
                  className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm font-medium text-[var(--text-2)] hover:text-red-500 hover:bg-red-500/10 transition-colors shadow-2xs"
                >
                  Отклонить
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('profile')}
                className="px-4 py-2.5 rounded-xl apple-btn-primary text-sm font-semibold flex-shrink-0"
              >
                В кабинет
              </button>
            )}
          </div>
        </motion.div>
      )}

      
        {/* 2. Top Row Metric Cards: Streak, Mood & Partner Status */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0"
      >
        {/* Streak Card */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="app-card-interactive p-4 flex flex-col items-center text-center justify-center relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--accent-2)]/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-8 h-8 rounded-full bg-[var(--accent-2)]/15 text-[var(--accent-2)] mb-1.5 flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5 fill-[var(--accent-2)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--text)] leading-tight tracking-tight">
            {isPaired ? Math.max(1, daysTogether) : 1}
          </div>
          <div className="text-xs sm:text-sm text-[var(--text-2)] font-normal mt-0.5">
            {isPaired ? 'дней вместе' : 'день в Loop'}
          </div>
        </motion.div>

        {/* My Mood Card */}
        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={() => setShowMoodPicker(true)}
          className="app-card-interactive p-4 flex flex-col items-center text-center justify-center group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-16 h-16 bg-[var(--accent)]/10 rounded-full blur-xl pointer-events-none" />
          <div className="mb-1.5 group-hover:scale-110 transition-transform">
            <MoodBadge
              mood={currentUser?.currentMood?.emoji || currentPartner.currentMood?.emoji || 'calm'}
              showLabel={false}
              size="lg"
            />
          </div>
          <div className="text-sm text-[var(--text)] font-medium mt-1 max-w-[130px] truncate">
            {currentUser?.currentMood?.label || currentPartner.currentMood?.label || 'Спокойствие'}
          </div>
          <span className="text-xs text-[var(--accent)] font-semibold mt-0.5 group-hover:underline flex items-center justify-center gap-1">
            <span>Моё настроение</span>
            <Pencil className="w-2.5 h-2.5 text-[var(--accent)]" />
          </span>
        </motion.button>

        {/* Partner Mood Card (Visible on all screens) */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="app-card col-span-2 sm:col-span-1 p-4 flex flex-col items-center text-center justify-center relative overflow-hidden"
        >
          <div className="mb-1.5">
            <MoodBadge
              mood={otherPartner.currentMood?.emoji || 'sparkle'}
              showLabel={false}
              size="lg"
            />
          </div>
          <div className="text-sm text-[var(--text)] font-medium mt-1 max-w-[130px] truncate">
            {otherPartner.currentMood?.label || 'Вдохновение'}
          </div>
          <span className="text-xs text-emerald-500 font-semibold mt-0.5 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {otherPartner.name}
          </span>
        </motion.div>
      </motion.div>

      {/* 4. Couple Feed (Лента пары) */}
      <motion.div
        initial={{ opacity: 0, y: 22, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: "-30px", amount: 0.1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between mb-2.5 px-1">
          <p className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">
            Лента пары
          </p>
          <div className="flex items-center gap-3">
            {feedItems.length > 0 && (
              <button
                type="button"
                onClick={clearFeed}
                className="text-xs font-medium text-[var(--text-2)] hover:text-red-500 transition-colors"
                title="Очистить ленту"
              >
                Очистить
              </button>
            )}
            <button
              onClick={() => {
                setUsSubTab('passport');
                setActiveTab('us');
              }}
              className="text-xs sm:text-sm font-medium text-[var(--accent)] hover:underline flex items-center gap-0.5"
            >
              <span>Вся история</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="app-card divide-y divide-[var(--divider)] overflow-hidden">
          {feedItems.length > 0 ? (
            feedItems.slice(0, 4).map((item) => (
              <div key={item.id} className="p-3.5 flex items-start gap-3 hover:bg-[var(--surface-2)]/60 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-[var(--divider)]">
                  {item.type === 'photo' && item.imageUrl ? (
                    <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt="memory" className="w-full h-full object-cover" />
                    </div>
                  ) : item.type === 'sparkle' ? (
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  ) : item.type === 'heart' ? (
                    <Heart className="w-4 h-4 text-[var(--accent-2)] fill-[var(--accent-2)]" />
                  ) : (
                    <Pin className="w-4 h-4 text-[var(--accent-3)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-[var(--text)] leading-snug">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--text-2)] font-normal">{item.subtitle}</span>
                    <span className="text-xs text-[var(--text-2)]">•</span>
                    <span className="text-xs text-[var(--text-2)] font-normal">{item.timeAgo}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <div className="w-11 h-11 mx-auto mb-2 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-2)] border border-[var(--divider)]">
                <Sparkles className="w-5 h-5 text-[var(--accent)] opacity-60" />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">Лента пары пока пуста</p>
              <p className="text-xs text-[var(--text-2)] mt-0.5 max-w-xs mx-auto font-normal">
                Здесь будут появляться ответы на вопрос дня, быстрые реакции и чекины вашей пары
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 3. FAST ACTIONS & REACTIONS */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="app-card p-4 sm:p-5 space-y-4 shrink-0 min-h-fit"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[var(--accent-2)] fill-[var(--accent-2)]" />
            <span className="text-sm sm:text-base font-semibold text-[var(--text)]">
              Быстрые действия
            </span>
          </div>
          {lastTapped ? (
            <span className="text-xs font-semibold text-emerald-500 animate-fadeIn flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Отправлено «{lastTapped}»
            </span>
          ) : (
            <span className="text-xs font-normal text-[var(--text-2)]">
              Проявить внимание
            </span>
          )}
        </div>

        {/* Action Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveQuickAction('felt')}
            className="flex-none flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap rounded-full bg-[var(--surface-2)] border border-[var(--divider)] shadow-xs text-xs sm:text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] transition-all cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-[var(--accent-2)] fill-[var(--accent-2)]" />
            <span>Я почувствовал(а)</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveQuickAction('appreciated')}
            className="flex-none flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap rounded-full bg-[var(--surface-2)] border border-[var(--divider)] shadow-xs text-xs sm:text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Я оценил(а)</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveQuickAction('tell')}
            className="flex-none flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap rounded-full bg-[var(--surface-2)] border border-[var(--divider)] shadow-xs text-xs sm:text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] transition-all cursor-pointer"
          >
            <Pin className="w-3.5 h-3.5 text-[var(--accent-3)]" />
            <span>Хочу рассказать</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setUsSubTab('book');
              setActiveTab('us');
            }}
            className="flex-none flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap rounded-full bg-[var(--surface-2)] border border-[var(--divider)] shadow-xs text-xs sm:text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] transition-all cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            <span>Книга заботы</span>
          </motion.button>
        </div>

        <div className="h-px bg-[var(--divider)] w-full" />

        {/* Grid of 6 interactive affection buttons with custom colored icons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {loveTapButtons.map((tap) => (
            <motion.button
              key={tap.type}
              type="button"
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleLoveTap(tap)}
              className="py-3 px-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--accent)]/15 hover:border-[var(--accent)]/40 border border-[var(--divider)] flex flex-col items-center justify-center gap-1.5 transition-all group shadow-xs hover:shadow-sm cursor-pointer"
            >
              <ColoredIcon icon={tap.icon} color={tap.color} size="md" />
              <span className="text-xs font-normal text-[var(--text)] group-hover:text-[var(--accent)] transition-colors text-center w-full truncate">
                {tap.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      
        {/* 4. DAILY COUPLE QUIZ: Игра дня «Кто из нас двоих...» */}
      {(() => {
        const isPartner1 = currentPartnerId === 'partner1';
        const myQuizAnswer = isPartner1 ? dailyQuiz?.partner1Answer : dailyQuiz?.partner2Answer;
        const partnerQuizAnswer = isPartner1 ? dailyQuiz?.partner2Answer : dailyQuiz?.partner1Answer;
        const bothAnswered = !!(dailyQuiz?.partner1Answer && dailyQuiz?.partner2Answer);
        const quizQuestion = dailyQuiz?.question || (DAILY_QUIZ_QUESTIONS && DAILY_QUIZ_QUESTIONS.length > 0 ? DAILY_QUIZ_QUESTIONS[0].question : 'Кто из нас двоих скорее сделает первый шаг к примирению?');

        const getAnswerText = (ans?: 'me' | 'partner' | 'both', answeringPartnerIs1 = isPartner1) => {
          if (!ans) return '';
          if (ans === 'both') return 'Оба одинаково';
          if (answeringPartnerIs1) {
            return ans === 'me' ? coupleProfile.partner1.name : coupleProfile.partner2.name;
          } else {
            return ans === 'me' ? coupleProfile.partner2.name : coupleProfile.partner1.name;
          }
        };

        return (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="app-card p-5 space-y-3.5 relative shrink-0 min-h-fit overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                  Игра дня «Кто из нас двоих...»
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20 shadow-2xs shrink-0">
                +50 XP
              </span>
            </div>

            <p className="text-base sm:text-lg font-semibold text-[var(--text)] leading-snug">
              {quizQuestion}
            </p>

            {bothAnswered ? (
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className="text-[var(--text-2)]">{currentPartner.name}:</span>
                  <span className="text-[var(--accent)] font-semibold">
                    {getAnswerText(myQuizAnswer, isPartner1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className="text-[var(--text-2)]">{otherPartner.name}:</span>
                  <span className="text-[var(--accent)] font-semibold">
                    {getAnswerText(partnerQuizAnswer, !isPartner1)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[var(--divider)] text-center">
                  <span className="text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5">
                    {dailyQuiz?.isMatch ? (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-emerald-500">Совпадение! Вы отлично чувствуете друг друга</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="text-rose-500">Разные взгляды делают вас уникальной парой!</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ) : myQuizAnswer ? (
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[var(--text-2)]">Ваш выбор:</span>
                  <span className="text-[var(--accent)] font-semibold">
                    {myQuizAnswer === 'me' ? 'Я' : myQuizAnswer === 'partner' ? otherPartner.name : 'Оба одинаково'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-[var(--divider)]">
                  <p className="text-xs text-[var(--text-2)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Ожидаем ответ {otherPartner.name}...</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      submitDailyQuizAnswer(myQuizAnswer === 'me' ? 'partner' : myQuizAnswer === 'partner' ? 'both' : 'me');
                    }}
                    className="text-xs text-[var(--accent)] hover:underline font-semibold cursor-pointer py-1 px-2 -mr-2"
                  >
                    Изменить
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {partnerQuizAnswer && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{otherPartner.name} уже сделал{otherPartner.gender === 'female' ? 'а' : ''} свой выбор! Ваш черёд:</span>
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => submitDailyQuizAnswer('me')}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--accent)] hover:text-white border border-[var(--divider)] text-xs sm:text-sm font-semibold text-[var(--text)] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    <span>Я</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => submitDailyQuizAnswer('partner')}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--accent)] hover:text-white border border-[var(--divider)] text-xs sm:text-sm font-semibold text-[var(--text)] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{otherPartner.name}</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => submitDailyQuizAnswer('both')}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--accent)] hover:text-white border border-[var(--divider)] text-xs sm:text-sm font-semibold text-[var(--text)] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">Оба</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* 5. GAMIFICATION & FEATURES QUICK LAUNCH HUB */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="shrink-0"
      >
        <div className="flex items-center justify-between mb-2.5 px-1">
          <p className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">
            Любимые форматы
          </p>
          <span className="text-xs text-[var(--text-2)] font-normal">Для сближения и уюта</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Date Generator */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setDatesSubTab('invite');
              setActiveTab('dates');
            }}
            className="app-card-interactive p-3.5 flex flex-col items-center text-center gap-1.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">Свидания</span>
            <span className="text-xs text-[var(--text-2)] font-normal">Генератор идей</span>
          </motion.button>

          {/* Gamification / Gamified gamest */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setDatesSubTab('games');
              setActiveTab('dates');
            }}
            className="app-card-interactive p-3.5 flex flex-col items-center text-center gap-1.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] flex items-center justify-center group-hover:scale-115 transition-transform shadow-2xs">
              <Smile className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">Игры</span>
            <span className="text-xs text-[var(--text-2)] font-normal">Правда или Действие</span>
          </motion.button>

          {/* Couple Tests */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setUsSubTab('tests');
              setActiveTab('us');
            }}
            className="app-card-interactive p-3.5 flex flex-col items-center text-center gap-1.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center group-hover:scale-115 transition-transform shadow-2xs">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">Тесты пары</span>
            <span className="text-xs text-[var(--text-2)] font-normal">Проверить совместимость</span>
          </motion.button>

          {/* Couple Challenges */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setUsSubTab('challenges');
              setActiveTab('us');
            }}
            className="app-card-interactive p-3.5 flex flex-col items-center text-center gap-1.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center group-hover:scale-115 transition-transform shadow-2xs">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">Испытания недели</span>
            <span className="text-xs text-[var(--text-2)] font-normal">Парные квесты</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 6. Question of the Day Card */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="app-card p-5 relative overflow-hidden shrink-0 min-h-fit"
      >
        <div className="absolute top-0 left-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            Вопрос дня
          </span>
          <span className="text-xs text-[var(--text-2)]">Обновляется в 00:00</span>
        </div>

        <p className="text-base sm:text-lg font-semibold text-[var(--text)] leading-snug mb-3.5">
          {currentDailyQuestion}
        </p>

        {questionAnswer ? (
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] mb-3">
            <p className="text-xs font-medium text-[var(--text-2)] mb-1">Ваш ответ:</p>
            <p className="text-sm sm:text-base font-normal text-[var(--text)]">«{questionAnswer}»</p>
          </div>
        ) : showQuestionInput ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (questionText.trim()) {
                answerQuestionOfDay(questionText.trim());
                setShowQuestionInput(false);
                setQuestionText('');
              }
            }}
            className="space-y-2.5 mb-3"
          >
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Напишите пару тёплых слов..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm sm:text-base text-[var(--text)] placeholder:text-[var(--text-2)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl apple-btn-primary text-sm font-semibold"
              >
                Сохранить ответ
              </button>
              <button
                type="button"
                onClick={() => setShowQuestionInput(false)}
                className="px-3 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-2)] font-medium text-sm border border-[var(--divider)]"
              >
                Отмена
              </button>
            </div>
          </form>
        ) : null}

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowQuestionInput(true)}
            className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              questionAnswer
                ? 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--divider)] hover:bg-[var(--surface-3)]'
                : 'apple-btn-primary'
            }`}
          >
            {questionAnswer ? 'Изменить ответ' : 'Ответить'}
          </button>
        </div>
      </motion.div>

      

      {/* MODAL 1: Mood Picker Bottom Sheet (Instagram / iOS Style) */}
      {showMoodPicker && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center">
          {/* Backdrop overlay */}
          <div 
            onClick={() => {
              setShowMoodPicker(false);
              setShowMoodInfo(false);
            }} 
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fadeIn" 
          />

          {/* Bottom Sheet Card */}
          <div className="relative z-10 w-full max-w-lg bg-[var(--surface-solid)] rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 border border-[var(--divider)] shadow-2xl space-y-0 max-h-[90vh] flex flex-col pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] animate-slideUp">
            {/* Top Drag Handle (Mobile Sheet indicator) */}
            <div className="w-10 h-1 rounded-full bg-[var(--divider)] mx-auto sm:hidden mb-3 shrink-0" />
            
            <div className="flex items-center justify-between shrink-0 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text)]">Моё настроение</h3>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMoodInfo((prev) => !prev)}
                    className="w-5 h-5 whitespace-nowrap rounded-full bg-[var(--surface-2)] border border-[var(--divider)] text-[var(--text-2)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 flex items-center justify-center transition-colors"
                    title="О функции «Моё настроение»"
                    aria-label="Информация о настроении"
                  >
                    <Info className="w-3.2 h-3.2" />
                  </button>
                  {showMoodInfo && (
                    <div className="absolute right-0 sm:left-0 top-8 z-30 w-[260px] sm:w-72 p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xl text-xs sm:text-sm text-[var(--text)] space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between font-semibold text-[var(--accent)]">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>О функции настроения</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowMoodInfo(false)}
                          className="text-[var(--text-2)] hover:text-[var(--text)] p-0.5 rounded-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[var(--text-2)] leading-relaxed font-normal">
                        Партнёр мгновенно увидит ваше актуальное настроение и тёплую заметку на главном экране в реальном времени. Это помогает чувствовать друг друга и проявлять заботу.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMoodPicker(false);
                  setShowMoodInfo(false);
                }}
                className="w-11 h-11 whitespace-nowrap rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center active:scale-95 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomMoodSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4">
                {/* Presets Grid with custom colored icons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {moodPresets.map((preset) => {
                    const isSelected = customMoodKey === preset.key;
                    return (
                      <button
                        type="button"
                        key={preset.key}
                        onClick={() => {
                          setCustomMoodKey(preset.key);
                          setCustomMoodLabel(preset.label);
                        }}
                        className={`p-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-start gap-2 transition-all border cursor-pointer ${
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
                        <span className="truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Mood Label Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMoodLabel}
                    onChange={(e) => setCustomMoodLabel(e.target.value)}
                    placeholder="Название состояния (например: Заряжен на свершения)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm sm:text-base text-[var(--text)] font-medium placeholder:text-[var(--text-2)]/60 focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Empty spacious note input with intuitive placeholder */}
                <div className="relative">
                  <input
                    type="text"
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    placeholder="Напишите пару слов о вашем дне или чувствах..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm sm:text-base text-[var(--text)] font-normal placeholder:text-[var(--text-2)]/60 focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[var(--divider)] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoodPicker(false);
                    setShowMoodInfo(false);
                  }}
                  className="px-4 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-medium text-sm transition-all active:scale-98"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!customMoodLabel.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF453A] to-[#FF2D55] text-white font-semibold text-sm shadow-md hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Сохранить и поделиться</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Instagram-Style Quick Action Reaction Sheet */}
      {activeQuickAction && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setActiveQuickAction(null)} 
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fadeIn" 
          />

          {/* Bottom Sheet Card */}
          <div className="relative z-10 w-full max-w-lg bg-[var(--surface-solid)] rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 border border-[var(--divider)] shadow-2xl space-y-0 max-h-[90vh] flex flex-col pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] animate-slideUp">
            {/* Top Drag Handle (Instagram Sheet indicator) */}
            <div className="w-10 h-1 rounded-full bg-[var(--divider)] mx-auto sm:hidden mb-3 shrink-0" />
            
            <div className="flex items-center justify-between shrink-0 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] flex items-center justify-center shadow-2xs">
                  {activeQuickAction === 'felt' && <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />}
                  {activeQuickAction === 'appreciated' && <Sparkles className="w-4 h-4 text-amber-500" />}
                  {activeQuickAction === 'tell' && <Pin className="w-4 h-4 text-blue-500" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] leading-snug">
                    {activeQuickAction === 'felt'
                      ? 'Я почувствовал(а)'
                      : activeQuickAction === 'appreciated'
                      ? 'Я оценил(а)'
                      : 'Хочу рассказать'}
                  </h3>
                  <p className="text-xs text-[var(--text-2)] font-normal">
                    {activeQuickAction === 'felt'
                      ? 'Бережно опишите эмоцию без критики'
                      : activeQuickAction === 'appreciated'
                      ? 'Поблагодарите за заботу или внимание'
                      : 'Поделитесь важной мыслью для пары'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuickAction(null)}
                className="w-11 h-11 whitespace-nowrap rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center active:scale-95 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendQuickAction} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
                <div className="relative">
                  <textarea
                    value={quickActionText}
                    onChange={(e) => setQuickActionText(e.target.value)}
                    rows={3}
                    placeholder={
                      activeQuickAction === 'felt'
                        ? 'Например: Мне было так тепло, когда ты обнял(а) меня утром...'
                        : activeQuickAction === 'appreciated'
                        ? 'Например: Спасибо за вкусный ужин и твою заботу обо мне сегодня!'
                        : 'Например: Давай сегодня вечером поговорим о нашей поездке...'
                    }
                    className="w-full p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm sm:text-base text-[var(--text)] placeholder:text-[var(--text-2)]/60 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[var(--divider)] shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveQuickAction(null)}
                  className="px-4 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-medium text-sm transition-all active:scale-98"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!quickActionText.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF453A] to-[#FF2D55] text-white font-semibold text-sm shadow-md hover:opacity-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Отправить в ленту пары</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
