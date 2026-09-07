import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Flame,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Share2,
  RefreshCw,
  Award,
  Calendar,
  Compass,
  ArrowRight,
  Download,
  Info,
  Layers,
  Star,
  Zap,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { calculateCoupleAnalysis, DeepCoupleAnalysis } from '../utils/psychologyEngine';
import { RelationshipRadar } from './RelationshipRadar';
import { CoupleRatingWidget } from './CoupleRatingWidget';

export const ReportView: React.FC<{
  onStartTest?: (testId: string) => void;
}> = ({ onStartTest }) => {
  const {
    coupleProfile,
    pulseHistory,
    tests,
    triggerConfetti,
    coupleXP,
    coupleLevelInfo,
    xpHistory,
    currentPartnerId,
  } = useCouple();

  const [activeSegment, setActiveSegment] = useState<'radar' | 'overview' | 'rating' | 'comparison' | 'roadmap'>('radar');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Compute live deep analysis based on scientifically grounded formulas
  const [analysis, setAnalysis] = useState<DeepCoupleAnalysis>(() =>
    calculateCoupleAnalysis(coupleProfile, pulseHistory, tests)
  );

  const handleRegenerateAIReport = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleData: {
            partner1: coupleProfile.partner1,
            partner2: coupleProfile.partner2,
            testsCompleted: coupleProfile.testsCompletedCount,
            pulse: pulseHistory[0],
          },
        }),
      });
      const data = await res.json();
      if (data.report && data.report.title) {
        setAnalysis((prev) => ({
          ...prev,
          archetypeTitle: data.report.title,
          summary: data.report.summary || prev.summary,
          strengths: data.report.strengths?.length
            ? data.report.strengths.map((s: string, idx: number) => ({
                title: `Суперсила ${idx + 1}`,
                description: s,
                icon: 'CheckCircle2',
                metricTag: 'Высокая синергия',
              }))
            : prev.strengths,
        }));
        triggerConfetti();
      }
    } catch (err) {
      console.warn('AI live report fallback to offline engine', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleShareReport = () => {
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        navigator.clipboard
          .writeText(
            `Психологический паспорт нашей пары в Loop:\nСинхронизация: ${analysis.compatibilityScore}%\nУровень: ${coupleLevelInfo.level} «${coupleLevelInfo.levelName}» (${coupleXP} XP)\nАрхетип: ${analysis.archetypeTitle}\n${analysis.summary}`
          )
          .catch(() => {});
      }
    } catch {
      // safe
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="space-y-4 pb-16 animate-fadeIn">
      {/* 1. Header Hero Card */}
      <div className="bg-[var(--surface)] text-[var(--text)] rounded-3xl p-5 sm:p-7 border border-[var(--divider)] shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-2)] text-[var(--accent)] text-xs font-bold border border-[var(--divider)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Синхронизация пары: {analysis.compatibilityScore}%</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-black border border-amber-500/20">
                <Award className="w-3.5 h-3.5" />
                <span>
                  Уровень {coupleLevelInfo.level} • {coupleXP} XP
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {analysis.archetypeTitle}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-2)] max-w-2xl leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShareReport}
              className="px-3 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--text)] hover:text-[var(--accent)] text-xs font-bold border border-[var(--divider)] transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedShare ? 'Скопировано!' : 'Поделиться'}</span>
            </button>

            <button
              id="refresh-ai-report-btn"
              onClick={handleRegenerateAIReport}
              disabled={isGeneratingAI}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAI ? 'Анализ...' : 'ИИ-аудит'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Segmented Bar */}
      <div className="flex bg-[var(--surface)] p-1 rounded-2xl border border-[var(--divider)] shadow-2xs gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSegment('radar')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSegment === 'radar'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Радар отношений (5 осей)
        </button>
        <button
          onClick={() => setActiveSegment('overview')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSegment === 'overview'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Суперсилы & Опоры
        </button>
        <button
          onClick={() => setActiveSegment('rating')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSegment === 'rating'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Рейтинг & XP пары
        </button>
        <button
          onClick={() => setActiveSegment('comparison')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSegment === 'comparison'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Сравнение партнёров
        </button>
        <button
          onClick={() => setActiveSegment('roadmap')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSegment === 'roadmap'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          План роста на 4 недели
        </button>
      </div>

      {/* 3. Segment View Content */}

      {/* SEGMENT 1: RECHARTS RELATIONSHIP RADAR */}
      {activeSegment === 'radar' && (
        <RelationshipRadar onStartTest={onStartTest} />
      )}

      {/* SEGMENT 2: OVERVIEW & STRENGTHS */}
      {activeSegment === 'overview' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Strengths Grid */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--divider)] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-sm text-[var(--text)]">
                Ключевые суперсилы и синергия союза
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {analysis.strengths.map((st, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[var(--surface-2)]/70 border border-[var(--divider)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text)]">{st.title}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {st.metricTag}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-2)] leading-relaxed">{st.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Zones */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--divider)] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm text-[var(--text)]">
                Точки роста и потенциал углубления
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {analysis.growthZones.map((gz, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[var(--surface-2)]/70 border border-[var(--divider)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text)]">{gz.title}</span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Точка роста
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-2)] leading-relaxed">{gz.description}</p>
                  {gz.antidote && (
                    <p className="text-[11px] text-[var(--accent)] font-semibold pt-1 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Антидот: {gz.antidote}</span>
                    </p>
                  )}
                  {gz.gottmanExercise && (
                    <p className="text-[10px] text-[var(--text-2)] italic">
                      Практика: {gz.gottmanExercise}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 3: RATING & XP GAMIFICATION */}
      {activeSegment === 'rating' && (
        <div className="space-y-4 animate-fadeIn">
          <CoupleRatingWidget />
        </div>
      )}

      {/* SEGMENT 4: PARTNER COMPARISON */}
      {activeSegment === 'comparison' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Partner 1 Card */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--divider)] shadow-xs space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--divider)]">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center">
                {coupleProfile.partner1.name[0]}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[var(--text)]">
                  {coupleProfile.partner1.name}
                </h3>
                <p className="text-xs text-[var(--text-2)]">
                  {analysis.partner1Profile.attachmentType}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[var(--text-2)]">
                  Главный язык любви:
                </span>
                <p className="font-bold text-[var(--text)]">
                  {analysis.partner1Profile.topLoveLanguage}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[var(--text-2)]">
                  Реакция на стресс:
                </span>
                <p className="font-bold text-[var(--text)]">
                  {analysis.partner1Profile.stressPattern}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[var(--text-2)]">
                  Ключевая потребность:
                </span>
                <p className="font-bold text-[var(--text)]">
                  {analysis.partner1Profile.coreNeed}
                </p>
              </div>
            </div>
          </div>

          {/* Partner 2 Card */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--divider)] shadow-xs space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--divider)]">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white font-extrabold text-lg flex items-center justify-center">
                {coupleProfile.partner2.name[0]}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[var(--text)]">
                  {coupleProfile.partner2.name}
                </h3>
                <p className="text-xs text-[var(--text-2)]">
                  {analysis.partner2Profile.attachmentType}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[var(--text-2)]">
                  Главный язык любви:
                </span>
                <p className="font-bold text-[var(--text)]">
                  {analysis.partner2Profile.topLoveLanguage}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[var(--text-2)]">
                  Реакция на стресс:
                </span>
                <p className="font-bold text-[var(--text)]">
                  {analysis.partner2Profile.stressPattern}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[var(--text-2)]">
                  Ключевая потребность:
                </span>
                <p className="font-bold text-[var(--text)]">
                  {analysis.partner2Profile.coreNeed}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 5: ROADMAP */}
      {activeSegment === 'roadmap' && (
        <div className="bg-[var(--surface)] rounded-2xl p-5 sm:p-6 border border-[var(--divider)] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--divider)]">
            <div className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[var(--text)]">
                Еженедельные микро-практики по Готтману
              </h3>
              <p className="text-xs text-[var(--text-2)]">
                Маленькие ежедневные шаги для долгосрочной гармонии
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.weeklyActionPlan.map((plan, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[var(--surface-2)]/60 border border-[var(--divider)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[var(--accent)] uppercase tracking-wide">
                    {plan.day}
                  </span>
                  <span className="text-[10px] text-[var(--text-2)] font-medium px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--divider)]">
                    {plan.duration}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[var(--text)]">{plan.title}</h4>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  {plan.instruction}
                </p>
                <p className="text-[10px] text-[var(--text-2)] italic pt-1">
                  Принцип: {plan.gottmanPrinciple}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
