import React, { useState, useMemo } from 'react';
import { ChevronRight, Activity } from 'lucide-react';
import { useCouple } from '../context/CoupleContext.tsx';
import { TestCategory } from '../types.ts';
import { PageLayout } from './ui/PageLayout.tsx';
import { ReportView } from './ReportView.tsx';
import { triggerHaptic } from '../utils/haptics.ts';
import { calculateCoupleAnalysis } from '../utils/psychologyEngine.ts';
import { CATEGORIES, getTestMeta } from './tests/testMeta.ts';
import { TestCard } from './tests/TestCard.tsx';
import { TestFeaturedCard } from './tests/TestFeaturedCard.tsx';
import { TestRunnerModal } from './tests/TestRunnerModal.tsx';
import { TestCompletedModal } from './tests/TestCompletedModal.tsx';

export const TestsView: React.FC<{ initialMode?: 'catalog' | 'report' }> = ({
  initialMode = 'catalog',
}) => {
  const {
    currentPartnerId,
    coupleProfile,
    tests,
    pulseHistory,
    submitTestAnswers,
    triggerConfetti,
    setActiveTab,
    currentUser,
  } = useCouple();

  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile.partner2 : coupleProfile.partner1;
  const isPaired = !!currentUser?.partnerLogin;

  const analysis = useMemo(() => {
    return calculateCoupleAnalysis(coupleProfile, pulseHistory, tests);
  }, [coupleProfile, pulseHistory, tests]);

  const [subMode, setSubMode] = useState<'catalog' | 'report'>(initialMode);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTest, setActiveTest] = useState<TestCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [testJustFinished, setTestJustFinished] = useState<TestCategory | null>(null);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      if (activeCategory === 'all') return true;
      const meta = getTestMeta(t);
      return meta.categoryKey === activeCategory;
    });
  }, [tests, activeCategory]);

  const featuredTest = useMemo(() => {
    const loveLanguages = tests.find((t) => t.id === 'TEST-S2');
    const myDone = (t: TestCategory) => (currentPartnerId === 'partner1' ? t.partner1Done : t.partner2Done);
    if (loveLanguages && !myDone(loveLanguages)) {
      return loveLanguages;
    }
    const firstUncompleted = tests.find((t) => !myDone(t));
    return firstUncompleted || loveLanguages || tests[0];
  }, [tests, currentPartnerId]);

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

  const getTestCompletionStatus = (test: TestCategory) => {
    const p1Done = test.partner1Done;
    const p2Done = test.partner2Done;
    const myDone = currentPartnerId === 'partner1' ? p1Done : p2Done;
    const partnerDone = currentPartnerId === 'partner1' ? p2Done : p1Done;

    if (myDone && partnerDone) {
      return {
        state: 'BOTH_DONE',
        label: 'Оба завершили',
        sublabel: 'Смотреть инсайты',
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
      const passedVerb = otherPartner.gender === 'male' ? 'уже прошёл' : otherPartner.gender === 'female' ? 'уже прошла' : 'уже прошёл(ла)';
      return {
        state: 'PARTNER_READY',
        label: isPaired ? `${otherPartner.name} ${passedVerb}` : 'Партнёр прошёл',
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
    <PageLayout
      title={subMode === 'report' ? 'Радар и ИИ-отчёт' : 'Исследования пары'}
      subtitle={
        subMode === 'report'
          ? 'Карта гармонии и психологический профиль союза'
          : 'Тесты и радар гармонии союза'
      }
      onBack={
        subMode === 'report'
          ? () => setSubMode('catalog')
          : () => setActiveTab('us')
      }
    >
      <div className="space-y-5 pb-8">
        {subMode === 'report' ? (
          <ReportView
            hideHeader
            onStartTest={(testId) => {
              setSubMode('catalog');
              const target = tests.find((x) => x.id === testId);
              if (target) handleStartTest(target);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Radar Banner Teaser */}
            <div
              onClick={() => {
                triggerHaptic('selection');
                setSubMode('report');
              }}
              className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] hover:border-[var(--accent)]/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                    Радар гармонии пары: {analysis.hasData && analysis.compatibilityScore > 0 ? `${analysis.compatibilityScore}%` : 'Калибровка'}
                  </div>
                  <div className="text-xs text-[var(--text-2)] mt-0.5">
                    {analysis.hasData && analysis.compatibilityScore > 0
                      ? 'Анализ 5 сфер отношений, суперсилы и ИИ-отчёт'
                      : 'Пройдите опросники, чтобы открыть радар и ИИ-отчёт'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] shrink-0">
                <span>Смотреть</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Editorial Header */}
            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-bold text-[var(--accent)]">Исследования пары</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                Узнайте друг друга глубже
              </h1>
              <p className="text-sm text-[var(--text-2)] font-normal leading-relaxed pt-0.5 max-w-lg">
                Короткие вопросы для двоих — чтобы понять скрытые потребности, языки заботы и точки душевного сближения.
              </p>
            </div>

            {/* Category Switcher */}
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

            {/* Featured Test Spotlight */}
            {featuredTest && activeCategory === 'all' && (
              <TestFeaturedCard featuredTest={featuredTest} onStartTest={handleStartTest} />
            )}

            {/* Tests List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-[var(--text-2)]">
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
                {filteredTests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    onClick={() => handleStartTest(test)}
                    status={getTestCompletionStatus(test)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Runner Modal */}
      <TestRunnerModal
        activeTest={activeTest}
        currentQuestionIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        onSelectOption={handleSelectOption}
        onNextQuestion={handleNextQuestion}
        onPrevQuestion={handlePrevQuestion}
        onClose={() => setActiveTest(null)}
      />

      {/* Test Completed Modal */}
      <TestCompletedModal
        test={testJustFinished}
        isPaired={isPaired}
        partnerName={otherPartner.name}
        onViewReport={() => {
          setTestJustFinished(null);
          setSubMode('report');
        }}
        onClose={() => setTestJustFinished(null)}
      />
    </PageLayout>
  );
};
