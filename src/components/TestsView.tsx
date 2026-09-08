import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  Compass,
  Flame,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Check,
  BookOpen,
  Atom,
  ShieldCheck,
  Quote,
  Layers,
  Sparkle,
  Award,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { TestCategory, Question } from '../types';
import { PageLayout } from './ui/PageLayout';
import { triggerHaptic } from '../utils/haptics';

// Emotional and thematic mapping for each test
interface TestEditorialMeta {
  emotionalTitle: string;
  categoryLabel: string;
  categoryKey: 'closeness' | 'communication' | 'values' | 'intimacy';
  categoryIcon: string;
  tagline: string;
  discoveryText: string;
  estimatedMinutes: number;
}

const TEST_META_MAP: Record<string, TestEditorialMeta> = {
  'TEST-S2': {
    emotionalTitle: 'Как вы чувствуете любовь?',
    categoryLabel: 'Близость',
    categoryKey: 'closeness',
    categoryIcon: '♡',
    tagline: '5 языков любви · Гэри Чепмен',
    discoveryText: 'Узнайте, через какие поступки и слова каждый из вас по-настоящему чувствует тепло и заботу.',
    estimatedMinutes: 6,
  },
  'TEST-S1': {
    emotionalTitle: 'Как вы строите эмоциональную близость?',
    categoryLabel: 'Близость',
    categoryKey: 'closeness',
    categoryIcon: '✦',
    tagline: 'Стили привязанности (ECR) · Джон Боулби',
    discoveryText: 'Поймите ваши естественные реакции на дистанцию и глубинные потребности в безопасности.',
    estimatedMinutes: 5,
  },
  'TEST-S3': {
    emotionalTitle: 'Как вы проходите разногласия?',
    categoryLabel: 'Общение',
    categoryKey: 'communication',
    categoryIcon: '✧',
    tagline: 'Паттерны диалога · Институт Готтмана',
    discoveryText: 'Откройте антидоты к спорам и сохраняйте бережное взаимопонимание в моменты напряжения.',
    estimatedMinutes: 7,
  },
  'TEST-C1': {
    emotionalTitle: 'Наш идеальный совместный день',
    categoryLabel: 'Ценности',
    categoryKey: 'values',
    categoryIcon: '★',
    tagline: 'Синхронизация биоритмов и отдыха',
    discoveryText: 'Смоделируйте утро, день и вечер мечты, чтобы наполнить совместные выходные вдохновением.',
    estimatedMinutes: 4,
  },
  'TEST-S4': {
    emotionalTitle: 'Баланс страсти и душевного тепла',
    categoryLabel: 'Интимность',
    categoryKey: 'intimacy',
    categoryIcon: '♥',
    tagline: 'Треугольник любви · Роберт Стернберг',
    discoveryText: 'Исследуйте живой баланс близости, физического притяжения и осознанных обязательств.',
    estimatedMinutes: 5,
  },
  'TEST-D1': {
    emotionalTitle: 'Семейные корни и сценарии',
    categoryLabel: 'Ценности',
    categoryKey: 'values',
    categoryIcon: '★',
    tagline: 'Родительские модели и привычки',
    discoveryText: 'Узнайте, как детский опыт формирует ваши взгляды на роли, традиции и правила в союзе.',
    estimatedMinutes: 8,
  },
};

const CATEGORIES = [
  { id: 'all', label: 'Все', icon: '✦' },
  { id: 'closeness', label: 'Близость', icon: '♡' },
  { id: 'communication', label: 'Общение', icon: '✧' },
  { id: 'values', label: 'Ценности', icon: '★' },
  { id: 'intimacy', label: 'Интимность', icon: '♥' },
];

export const TestsView: React.FC = () => {
  const {
    currentPartnerId,
    coupleProfile,
    tests,
    submitTestAnswers,
    triggerConfetti,
    setActiveTab,
    currentUser,
  } = useCouple();

  const currentPartner = currentPartnerId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile.partner2 : coupleProfile.partner1;
  const isPaired = !!currentUser?.partnerLogin;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTest, setActiveTest] = useState<TestCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [testJustFinished, setTestJustFinished] = useState<TestCategory | null>(null);

  // Helper for meta
  const getTestMeta = (test: TestCategory): TestEditorialMeta => {
    return (
      TEST_META_MAP[test.id] || {
        emotionalTitle: test.title,
        categoryLabel: test.methodology === 'scientific' ? 'Близость' : 'Ценности',
        categoryKey: test.methodology === 'scientific' ? 'closeness' : 'values',
        categoryIcon: '✦',
        tagline: `${test.subtitle || test.title} · ${test.estimatedMinutes || 5} мин`,
        discoveryText: test.description || 'Пройдите тест вместе, чтобы лучше понимать друг друга.',
        estimatedMinutes: test.estimatedMinutes || 5,
      }
    );
  };

  // Filtered tests list
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      if (activeCategory === 'all') return true;
      const meta = getTestMeta(t);
      return meta.categoryKey === activeCategory;
    });
  }, [tests, activeCategory]);

  // Featured Test: Priority on "5 языков любви" or first uncompleted test
  const featuredTest = useMemo(() => {
    const loveLanguages = tests.find((t) => t.id === 'TEST-S2');
    const myDone = (t: TestCategory) => (currentPartnerId === 'partner1' ? t.partner1Done : t.partner2Done);
    
    // If 5 love languages is not done, make it featured
    if (loveLanguages && !myDone(loveLanguages)) {
      return loveLanguages;
    }
    // Else find first uncompleted
    const firstUncompleted = tests.find((t) => !myDone(t));
    return firstUncompleted || loveLanguages || tests[0];
  }, [tests, currentPartnerId]);

  // Handler to start test
  const handleStartTest = (test: TestCategory) => {
    triggerHaptic('selection');
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTestJustFinished(null);
  };

  const handleSelectOption = (questionId: string, value: any) => {
    triggerHaptic('light');
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (!activeTest) return;
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      triggerHaptic('selection');
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      triggerHaptic('success');
      submitTestAnswers(activeTest.id, userAnswers);
      setTestJustFinished(activeTest);
      setActiveTest(null);
      triggerConfetti();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      triggerHaptic('light');
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Status helper for a test
  const getTestCompletionStatus = (test: TestCategory) => {
    const p1Done = test.partner1Done;
    const p2Done = test.partner2Done;
    const myDone = currentPartnerId === 'partner1' ? p1Done : p2Done;
    const partnerDone = currentPartnerId === 'partner1' ? p2Done : p1Done;

    if (myDone && partnerDone) {
      return {
        state: 'BOTH_DONE',
        label: 'Совпадение 92%',
        sublabel: 'Оба прошли',
        isComplete: true,
        actionText: 'Результаты →',
      };
    }
    if (myDone && !partnerDone) {
      return {
        state: 'WAITING_PARTNER',
        label: 'Вы прошли',
        sublabel: isPaired ? `Ждём ${otherPartner.name}` : 'Ждём партнёра',
        isComplete: false,
        actionText: 'Ответы →',
      };
    }
    if (!myDone && partnerDone) {
      return {
        state: 'PARTNER_READY',
        label: isPaired ? `${otherPartner.name} уже прошла` : 'Партнёр прошёл',
        sublabel: 'Пройдите для сравнения',
        isComplete: false,
        actionText: 'Пройти →',
      };
    }
    return {
      state: 'NOT_STARTED',
      label: 'Ещё не проходили',
      sublabel: `${test.estimatedMinutes || 5} минут`,
      isComplete: false,
      actionText: 'Пройти →',
    };
  };

  return (
    <PageLayout hideHeader>
      <div className="space-y-6 pb-8">
        
        {/* ============================================================ */}
        {/* 1. EDITORIAL HEADER & INTRO */}
        {/* ============================================================ */}
        <div className="space-y-1 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
            Исследования пары
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Узнайте друг друга глубже
          </h1>
          <p className="text-sm text-[var(--text-2)] font-normal leading-relaxed pt-0.5 max-w-lg">
            Короткие вопросы для двоих — чтобы понять скрытые потребности, языки заботы и точки душевного сближения.
          </p>
        </div>

        {/* ============================================================ */}
        {/* 2. CATEGORY SWITCHER (Horizontal scrollable, refined) */}
        {/* ============================================================ */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveCategory(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--surface-blush)] text-[var(--accent)] border border-[var(--accent)]/30 font-bold shadow-2xs'
                    : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] border border-[var(--divider)]'
                }`}
              >
                <span className="text-[11px] opacity-70">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 3. FEATURED TEST (Warm, editorial spotlight, NOT a screaming banner) */}
        {/* ============================================================ */}
        {featuredTest && activeCategory === 'all' && (
          <div className="p-6 sm:p-7 rounded-[28px] bg-[var(--surface)] border border-[var(--divider)] relative overflow-hidden space-y-4 shadow-2xs">
            {/* Soft Ambient Warmth */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--accent)]/5 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1">
                  <span>Рекомендуем начать</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight leading-snug">
                  {getTestMeta(featuredTest).emotionalTitle}
                </h2>
                <div className="text-xs text-[var(--text-2)] font-medium">
                  {getTestMeta(featuredTest).tagline}
                </div>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                <Heart className="w-5 h-5 fill-[var(--accent)]" />
              </div>
            </div>

            <p className="relative z-10 text-xs sm:text-sm text-[var(--text-2)] font-normal leading-relaxed">
              {getTestMeta(featuredTest).discoveryText}
            </p>

            <div className="relative z-10 pt-2 flex items-center justify-between gap-3 border-t border-[var(--divider)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-2)]">
                <Clock className="w-3.5 h-3.5 text-[var(--text-3)]" />
                <span>{getTestMeta(featuredTest).estimatedMinutes} минут для двоих</span>
              </div>

              <button
                type="button"
                onClick={() => handleStartTest(featuredTest)}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <span>Пройти вместе</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. COMPACT TEST LIST (Clean, discoverable, lightweight) */}
        {/* ============================================================ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
              Все исследования ({filteredTests.length})
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Карта совместимости</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredTests.map((test) => {
              const meta = getTestMeta(test);
              const status = getTestCompletionStatus(test);

              return (
                <div
                  key={test.id}
                  onClick={() => handleStartTest(test)}
                  className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] hover:border-[var(--accent)]/40 transition-all cursor-pointer group space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[var(--accent)]">
                          {meta.categoryIcon} {meta.categoryLabel}
                        </span>
                        <span className="text-[11px] text-[var(--text-3)]">•</span>
                        <span className="text-[11px] text-[var(--text-2)] font-medium">
                          {meta.estimatedMinutes} мин
                        </span>
                      </div>
                      
                      <h4 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                        {meta.emotionalTitle}
                      </h4>
                      
                      <div className="text-xs text-[var(--text-3)] font-normal">
                        {meta.tagline}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 text-right">
                      {status.state === 'BOTH_DONE' ? (
                        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{status.label}</span>
                        </div>
                      ) : status.state === 'WAITING_PARTNER' ? (
                        <div className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-semibold">
                          {status.label}
                        </div>
                      ) : status.state === 'PARTNER_READY' ? (
                        <div className="px-2.5 py-1 rounded-full bg-[var(--surface-blush)] text-[var(--accent)] text-[11px] font-bold">
                          {status.label}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[var(--text-3)] font-medium">
                          {status.label}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-2)] leading-relaxed font-normal">
                    {meta.discoveryText}
                  </p>

                  <div className="pt-2 border-t border-[var(--divider)] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[var(--text-3)]">
                      {status.sublabel}
                    </span>
                    <span className="font-bold text-[var(--accent)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>{status.actionText}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 5. ACTIVE TEST RUNNER MODAL (Clean, intimate, distraction-free) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {activeTest && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--surface)] rounded-[28px] max-w-xl w-full shadow-2xl border border-[var(--divider)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-[var(--divider)] bg-[var(--surface)]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide">
                    {getTestMeta(activeTest).emotionalTitle}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-2)]">
                    Вопрос {currentQuestionIndex + 1} из {activeTest.questions.length}
                  </span>
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--accent)] h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / activeTest.questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Content */}
              <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
                {(() => {
                  const q: Question = activeTest.questions[currentQuestionIndex];
                  const selectedVal = userAnswers[q.id];

                  return (
                    <div className="space-y-5">
                      <h2 className="text-base sm:text-lg font-bold text-[var(--text)] leading-relaxed">
                        {q.text}
                      </h2>

                      {q.isPrivate && (
                        <div className="p-3 bg-[var(--surface-blush)] border border-[var(--accent)]/20 rounded-2xl text-[var(--accent)] text-xs flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>Конфиденциальный вопрос: партнёр увидит только общий балл совместимости.</span>
                        </div>
                      )}

                      {/* Scale Question Type */}
                      {q.type === 'scale' && (
                        <div className="space-y-2">
                          {q.options.map((opt) => {
                            const isSelected = selectedVal === opt.value;
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => handleSelectOption(q.id, opt.value)}
                                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'border-[var(--accent)] bg-[var(--surface-blush)] font-bold text-[var(--text)] shadow-2xs'
                                    : 'border-[var(--divider)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)]'
                                }`}
                              >
                                <span>{opt.label}</span>
                                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ml-2 ${
                                  isSelected
                                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                    : 'border-[var(--divider)] text-transparent'
                                }`}>
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Single Choice Question Type */}
                      {q.type === 'single' && (
                        <div className="space-y-2.5">
                          {q.options.map((opt) => {
                            const isSelected = selectedVal === opt.value;
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => handleSelectOption(q.id, opt.value)}
                                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'border-[var(--accent)] bg-[var(--surface-blush)] font-bold text-[var(--text)] shadow-2xs'
                                    : 'border-[var(--divider)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)]'
                                }`}
                              >
                                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-[var(--accent)]' : 'border-[var(--divider)]'
                                }`}>
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                                  )}
                                </div>
                                <span className="leading-relaxed">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 sm:p-5 border-t border-[var(--divider)] bg-[var(--surface)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Назад</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTest(null)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
                  >
                    Отложить
                  </button>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={!userAnswers[activeTest.questions[currentQuestionIndex].id]}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>
                      {currentQuestionIndex === activeTest.questions.length - 1
                        ? 'Завершить (+150 XP)'
                        : 'Далее'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 6. TEST COMPLETED MODAL (Warm gratitude & XP celebration) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {testJustFinished && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--surface)] rounded-[28px] max-w-md w-full p-6 sm:p-7 text-center space-y-4 shadow-2xl border border-[var(--divider)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center mx-auto border border-[var(--accent)]/20">
                <Heart className="w-6 h-6 fill-[var(--accent)]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text)]">
                  «{getTestMeta(testJustFinished).emotionalTitle}» пройден!
                </h3>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  Ваши ответы бережно сохранены. Опыт союза увеличился на <strong className="text-[var(--accent)]">+150 XP</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--surface-2)] border border-[var(--divider)] rounded-2xl text-xs text-[var(--text)] font-medium leading-relaxed">
                {isPaired
                  ? `Когда ${otherPartner.name} завершит свои ответы, вы сможете открыть подробную карту совпадений.`
                  : 'Свяжите аккаунты с партнёром, чтобы увидеть наложение результатов.'}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTestJustFinished(null);
                    setActiveTab('report');
                  }}
                  className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                >
                  Посмотреть карту совместимости
                </button>
                <button
                  type="button"
                  onClick={() => setTestJustFinished(null)}
                  className="w-full py-2.5 bg-transparent text-[var(--text-2)] hover:text-[var(--text)] font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Вернуться к списку
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};
