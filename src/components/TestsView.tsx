import React, { useState } from 'react';
import {
  ShieldCheck,
  Heart,
  Sparkles,
  Compass,
  GitBranch,
  Flame,
  CheckCircle2,
  Lock,
  Clock,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  Layers,
  Sparkle,
  CircleDot,
  Check,
  BookOpen,
  Atom,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { TestCategory, Question } from '../types';
import { ColoredIcon, IconColorTheme } from './ColoredIcon';

export const TestsView: React.FC = () => {
  const {
    currentPartnerId,
    coupleProfile,
    tests,
    submitTestAnswers,
    triggerConfetti,
    coupleXP,
    coupleLevelInfo,
  } = useCouple();

  const currentPartner = currentPartnerId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile.partner2 : coupleProfile.partner1;

  const [filterMethodology, setFilterMethodology] = useState<string>('all');
  const [activeTest, setActiveTest] = useState<TestCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [testJustFinished, setTestJustFinished] = useState<TestCategory | null>(null);

  const filteredTests = tests.filter((t) => {
    if (filterMethodology === 'all') return true;
    return t.methodology === filterMethodology;
  });

  const handleStartTest = (test: TestCategory) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTestJustFinished(null);
  };

  const handleSelectOption = (questionId: string, value: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (!activeTest) return;
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finished test!
      submitTestAnswers(activeTest.id, userAnswers);
      setTestJustFinished(activeTest);
      setActiveTest(null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const getIconMeta = (iconName: string, methodology: string): { icon: any; color: IconColorTheme } => {
    switch (iconName) {
      case 'ShieldHeart':
        return { icon: ShieldCheck, color: 'indigo' };
      case 'HeartHandshake':
        return { icon: Heart, color: 'rose' };
      case 'Flame':
        return { icon: Flame, color: 'coral' };
      case 'Sparkles':
        return { icon: Sparkles, color: 'gold' };
      case 'Compass':
        return { icon: Compass, color: 'teal' };
      case 'GitBranch':
        return { icon: GitBranch, color: 'purple' };
      default:
        return {
          icon: methodology === 'scientific' ? Atom : methodology === 'creative' ? Sparkles : Compass,
          color: methodology === 'scientific' ? 'indigo' : methodology === 'creative' ? 'amber' : 'purple',
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-[var(--divider)] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Библиотека психологических опросников</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text)]">
              Опросники глубины отношений
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-2)] max-w-2xl leading-relaxed">
              Научно-обоснованные методики (Готтман, Боулби, Чепмен) и глубинные сценарии. 
              Каждый пройденный опросник даёт +150 XP в рейтинг пары и обогащает совместную аналитику.
            </p>
          </div>

          {/* Level Progress Widget */}
          <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs shrink-0 sm:min-w-[240px] space-y-2">
            <div className="flex items-center justify-between font-bold text-[var(--text)]">
              <span>Рейтинг пары:</span>
              <span className="text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded-lg border border-[var(--divider)]">
                {coupleLevelInfo.levelName}
              </span>
            </div>
            <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, coupleLevelInfo.progressPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-2)] font-medium">
              <span>{coupleXP} XP накоплено</span>
              <span>
                {tests.filter((t) => (currentPartnerId === 'partner1' ? t.partner1Done : t.partner2Done)).length} из {tests.length} тестов
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] p-2.5 rounded-2xl border border-[var(--divider)] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            id="filter-all-tests"
            onClick={() => setFilterMethodology('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMethodology === 'all'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
            }`}
          >
            Все опросники ({tests.length})
          </button>
          <button
            id="filter-scientific-tests"
            onClick={() => setFilterMethodology('scientific')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMethodology === 'scientific'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Научные (Готтман, Боулби)</span>
          </button>
          <button
            id="filter-creative-tests"
            onClick={() => setFilterMethodology('creative')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMethodology === 'creative'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Креативные & Игровые</span>
          </button>
          <button
            id="filter-deep-tests"
            onClick={() => setFilterMethodology('deep')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMethodology === 'deep'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Глубинные сценарии</span>
          </button>
        </div>

        <div className="text-xs text-[var(--text-2)] hidden sm:block font-medium">
          Вы вошли как: <span className="font-bold text-[var(--text)]">{currentPartner.name}</span>
        </div>
      </div>

      {/* 3. Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => {
          const isLocked = test.levelRequired > coupleProfile.level;
          const partnerCompleted = currentPartnerId === 'partner1' ? test.partner1Done : test.partner2Done;
          const otherCompleted = currentPartnerId === 'partner1' ? test.partner2Done : test.partner1Done;
          const { icon: TestIcon, color: iconColor } = getIconMeta(test.iconName, test.methodology);

          return (
            <div
              key={test.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isLocked
                  ? 'bg-[var(--surface)] border-[var(--divider)] opacity-60'
                  : partnerCompleted
                  ? 'bg-[var(--surface)] border-emerald-500/30 shadow-xs'
                  : 'bg-[var(--surface)] border-[var(--divider)] hover:border-[var(--accent)]/40 shadow-xs'
              }`}
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <ColoredIcon
                      icon={TestIcon}
                      color={iconColor}
                      size="sm"
                    />
                    <span className="text-[10px] font-bold text-[var(--text-2)] uppercase tracking-wider">
                      {test.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-2)] bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--divider)] font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{test.estimatedMinutes} мин</span>
                  </div>
                </div>

                <h3 className="font-black text-[var(--text)] text-base mb-1">
                  {test.title}
                </h3>
                <p className="text-xs text-[var(--accent)] font-bold mb-2">
                  {test.subtitle}
                </p>
                <p className="text-xs text-[var(--text-2)] leading-relaxed line-clamp-3 mb-4">
                  {test.description}
                </p>
              </div>

              {/* Bottom info & actions */}
              <div className="pt-4 border-t border-[var(--divider)] space-y-3">
                {/* Partner status indicators */}
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${partnerCompleted ? 'bg-emerald-500' : 'bg-[var(--divider)]'}`} />
                    <span className="text-[var(--text-2)]">Вы:</span>
                    <span className={`font-bold ${partnerCompleted ? 'text-emerald-500' : 'text-[var(--text-2)]'}`}>
                      {partnerCompleted ? 'Пройден' : 'Не начат'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${otherCompleted ? 'bg-emerald-500' : 'bg-[var(--divider)]'}`} />
                    <span className="text-[var(--text-2)]">{otherPartner.name}:</span>
                    <span className={`font-bold ${otherCompleted ? 'text-emerald-500' : 'text-[var(--text-2)]'}`}>
                      {otherCompleted ? 'Пройден' : 'Не начат'}
                    </span>
                  </div>
                </div>

                {isLocked ? (
                  <div className="w-full py-2.5 px-3 rounded-xl bg-[var(--surface-2)] text-[var(--text-2)] text-xs font-bold flex items-center justify-center gap-2 border border-[var(--divider)]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Откроется на Уровне {test.levelRequired}</span>
                  </div>
                ) : (
                  <button
                    id={`start-test-${test.id}`}
                    onClick={() => handleStartTest(test)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      partnerCompleted
                        ? 'bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--divider)]'
                        : 'bg-[var(--accent)] hover:opacity-95 text-white shadow-sm'
                    }`}
                  >
                    <span>{partnerCompleted ? 'Пройти повторно' : 'Начать опросник (+150 XP)'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Active Test Runner Modal */}
      {activeTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-3xl max-w-2xl w-full shadow-2xl border border-[var(--divider)] overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--divider)] bg-[var(--surface-2)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide">
                  {activeTest.title}
                </span>
                <span className="text-xs font-bold text-[var(--text-2)]">
                  Вопрос {currentQuestionIndex + 1} из {activeTest.questions.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / activeTest.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              {(() => {
                const q: Question = activeTest.questions[currentQuestionIndex];
                const selectedVal = userAnswers[q.id];

                return (
                  <div className="space-y-6">
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] leading-snug">
                      {q.text}
                    </h2>

                    {q.isPrivate && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 text-xs flex items-center gap-2">
                        <Lock className="w-4 h-4 shrink-0" />
                        <span>Конфиденциальный вопрос: ответ виден только в виде обобщённого балла совместимости.</span>
                      </div>
                    )}

                    {/* Scale Type */}
                    {q.type === 'scale' && (
                      <div className="space-y-2.5">
                        {q.options.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.value)}
                            className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${
                              selectedVal === opt.value
                                ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)] font-bold text-[var(--text)]'
                                : 'border-[var(--divider)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)]'
                            }`}
                          >
                            <span>{opt.label}</span>
                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ml-2 ${
                              selectedVal === opt.value
                                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                : 'border-[var(--divider)] text-transparent'
                            }`}>
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Single Choice Type */}
                    {q.type === 'single' && (
                      <div className="space-y-3">
                        {q.options.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.value)}
                            className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${
                              selectedVal === opt.value
                                ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)] font-bold text-[var(--text)]'
                                : 'border-[var(--divider)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)]'
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              selectedVal === opt.value ? 'border-[var(--accent)]' : 'border-[var(--divider)]'
                            }`}>
                              {selectedVal === opt.value && (
                                <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                              )}
                            </div>
                            <span className="leading-relaxed">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-[var(--divider)] bg-[var(--surface-2)] flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-[var(--divider)] text-xs font-bold text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTest(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-2)] hover:text-[var(--text)]"
                >
                  Отложить
                </button>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!userAnswers[activeTest.questions[currentQuestionIndex].id]}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--accent)] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5"
                >
                  <span>
                    {currentQuestionIndex === activeTest.questions.length - 1
                      ? 'Завершить (+150 XP)'
                      : 'Далее'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Test Finished Modal */}
      {testJustFinished && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-[var(--divider)] animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-[var(--text)]">
              Опросник «{testJustFinished.title}» пройден!
            </h3>

            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              Отличная работа, {currentPartner.name}! Ваши ответы успешно добавлены в общий профиль пары. 
              Рейтинг пары вырос на <span className="font-bold text-[var(--accent)]">+150 XP</span>.
            </p>

            <div className="p-3.5 bg-[var(--surface-2)] border border-[var(--divider)] rounded-2xl text-xs text-[var(--text)] font-medium">
              Перейдите во вкладку «Карта & Отчёт», чтобы посмотреть наложение ваших результатов с ответами {otherPartner.name}.
            </div>

            <button
              onClick={() => setTestJustFinished(null)}
              className="w-full py-3 bg-[var(--accent)] hover:opacity-95 text-white font-bold rounded-2xl text-xs shadow-sm transition-all"
            >
              Отлично, продолжить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
