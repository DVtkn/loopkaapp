import React, { useState, useMemo } from 'react';
import { Heart, ArrowRight, Layers, ChevronDown, CheckCircle2, AlertTriangle, Sparkles, BellRing, Check } from 'lucide-react';
import { useCouple } from '../context/CoupleContext.tsx';
import { triggerHaptic } from '../utils/haptics.ts';
import { calculateRadarMetrics, MetricDetail, PSYCH_24_SCALES_CONFIG, getStatusLabel } from './radar/radarUtils.ts';
import { RadarChartCanvas } from './radar/RadarChartCanvas.tsx';
import { RadarMetricCard } from './radar/RadarMetricCard.tsx';

export type { MetricDetail };

interface RelationshipRadarProps {
  compact?: boolean;
  className?: string;
  onStartTest?: (testId: string) => void;
  initialViewMode?: 'both' | 'partner1' | 'partner2' | 'me' | 'partner';
  activeTab?: 'both' | 'partner1' | 'partner2' | 'me' | 'partner';
}

export const RelationshipRadar: React.FC<RelationshipRadarProps> = ({
  className = '',
  onStartTest,
  initialViewMode,
  activeTab,
}) => {
  const {
    coupleProfile,
    pulseHistory,
    tests,
    challenges,
    smallCravings,
    moodHistory,
    dateInvites,
    loveTaps,
    dailyQuiz,
  } = useCouple();

  const getResolvedMode = (): 'both' | 'partner1' | 'partner2' => {
    const raw = activeTab || initialViewMode;
    if (raw === 'partner' || raw === 'partner2') return 'partner2';
    if (raw === 'me' || raw === 'partner1') return 'partner1';
    return 'both';
  };

  const [viewMode, setViewMode] = useState<'both' | 'partner1' | 'partner2'>(getResolvedMode());

  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);
  const [show24Scales, setShow24Scales] = useState<boolean>(false);
  const [reminded, setReminded] = useState(false);

  const handleRemindPartner = () => {
    triggerHaptic('success');
    setReminded(true);
    setTimeout(() => setReminded(false), 3000);
  };

  const p1 = coupleProfile.partner1;
  const p2 = coupleProfile.partner2;
  const p1Label = p1.name || 'Партнёр 1';
  const p2Label = p2.name || 'Партнёр 2';

  const metricsData = useMemo(() => {
    return calculateRadarMetrics({
      coupleProfile,
      pulseHistory,
      tests,
      challenges,
      smallCravings,
      moodHistory,
      dateInvites,
      loveTaps,
      dailyQuiz,
    });
  }, [coupleProfile, pulseHistory, tests, challenges, smallCravings, moodHistory, dateInvites, loveTaps, dailyQuiz]);

  const p1HasData = useMemo(() => metricsData.some((m) => m.p1Score > 0), [metricsData]);
  const p2HasData = useMemo(() => metricsData.some((m) => m.p2Score > 0), [metricsData]);
  const isBothCompleted = p1HasData && p2HasData;
  const hasAnyData = p1HasData || p2HasData;

  const overallScore = useMemo(() => {
    if (!isBothCompleted) return 0;
    const validScores = metricsData.map((m) => m.avgScore).filter((s) => s > 0);
    if (!validScores.length) return 0;
    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  }, [metricsData, isBothCompleted]);

  // Lead spheres & calculated Archetype
  const sortedSpheres = useMemo(() => {
    return [...metricsData].sort((a, b) => b.avgScore - a.avgScore);
  }, [metricsData]);

  const topTwoSpheres = useMemo(() => {
    return sortedSpheres.slice(0, 2);
  }, [sortedSpheres]);

  const synergyPoints = useMemo(() => {
    return sortedSpheres.filter((s) => s.avgScore >= 75);
  }, [sortedSpheres]);

  const growthZones = useMemo(() => {
    return sortedSpheres.filter((s) => s.avgScore > 0 && s.avgScore < 75);
  }, [sortedSpheres]);

  const coupleArchetype = useMemo(() => {
    if (!isBothCompleted) return null;
    const s1 = topTwoSpheres[0]?.key;
    const s2 = topTwoSpheres[1]?.key;

    if ((s1 === 'trust' && s2 === 'closeness') || (s1 === 'closeness' && s2 === 'trust')) {
      return {
        title: 'Надёжная гавань & Душевная глубина',
        subtitle: 'Высокое базовое доверие, психологическая безопасность и взаимная забота',
      };
    }
    if ((s1 === 'trust' && s2 === 'values') || (s1 === 'values' && s2 === 'trust')) {
      return {
        title: 'Надёжная гавань & Общий горизонт',
        subtitle: 'Сплочённый союз с общими ценностями, долгосрочными целями и взаимной верностью',
      };
    }
    if ((s1 === 'intimacy' && s2 === 'closeness') || (s1 === 'closeness' && s2 === 'intimacy')) {
      return {
        title: 'Романтическое созвучие & Страсть',
        subtitle: 'Глубокая чувственная гармония, открытость желаниям и взаимное влечение',
      };
    }
    if ((s1 === 'communication' && s2 === 'trust') || (s1 === 'trust' && s2 === 'communication')) {
      return {
        title: 'Осознанный диалог & Безопасное пространство',
        subtitle: 'Умение бережно разрешать разногласия и создавать поддерживающую среду',
      };
    }
    if ((s1 === 'lifestyle' && s2 === 'values') || (s1 === 'values' && s2 === 'lifestyle')) {
      return {
        title: 'Архитекторы общего будущего',
        subtitle: 'Слаженный быт, финансовая прозрачность и высокая жизнестойкость',
      };
    }
    return {
      title: `${topTwoSpheres[0]?.name || 'Гармония'} & ${topTwoSpheres[1]?.name || 'Взаимопонимание'}`,
      subtitle: 'Устойчивый союз с уникальным сочетанием сильных сторон и точек синергии',
    };
  }, [isBothCompleted, topTwoSpheres]);

  const chartData = useMemo(() => {
    return metricsData.map((m) => ({
      metric: m.shortName,
      partner1: m.p1Score > 0 ? m.p1Score : 0,
      partner2: m.p2Score > 0 ? m.p2Score : 0,
      average: m.avgScore > 0 ? m.avgScore : 0,
      fullMark: 100,
    }));
  }, [metricsData]);

  // Group 24 scales by vector for individual breakdown
  const scalesByVector = useMemo(() => {
    const map = new Map<string, { vectorKey: string; vectorName: string; scales: typeof PSYCH_24_SCALES_CONFIG }>();
    PSYCH_24_SCALES_CONFIG.forEach((scale) => {
      if (!map.has(scale.vectorKey)) {
        map.set(scale.vectorKey, { vectorKey: scale.vectorKey, vectorName: scale.vectorName, scales: [] });
      }
      map.get(scale.vectorKey)!.scales.push(scale);
    });
    return Array.from(map.values());
  }, []);

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Radar Card Container with Header and Tab Switcher */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-[var(--surface)] border border-[var(--divider)] shadow-2xs space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[var(--accent)]">Аналитика союза • 6 сфер</span>
            <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">Радар гармонии союза</h3>
          </div>

          {viewMode === 'both' && isBothCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-blush)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{overallScore}% {getStatusLabel(overallScore)}</span>
            </div>
          )}
          {viewMode === 'both' && !isBothCompleted && hasAnyData && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 shadow-2xs">
              <span>Калибровка</span>
            </div>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center justify-center gap-1 p-1 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)] max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('both');
            }}
            className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'both'
                ? 'bg-[var(--surface)] text-[var(--accent)] font-bold shadow-2xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            Вместе
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('partner1');
            }}
            className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'partner1'
                ? 'bg-[var(--surface)] text-[var(--accent)] font-bold shadow-2xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {p1Label}
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('partner2');
            }}
            className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'partner2'
                ? 'bg-[var(--surface)] text-[var(--accent)] font-bold shadow-2xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {p2Label}
          </button>
        </div>

        {/* TAB 1: ВМЕСТЕ */}
        {viewMode === 'both' && (
          <>
            {!isBothCompleted ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[var(--surface)] rounded-3xl border border-neutral-100 dark:border-[var(--divider)] shadow-2xs space-y-3 animate-fadeIn mt-2">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 text-xl shadow-2xs">
                  ⏳
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-neutral-800 dark:text-[var(--text)]">
                    Ожидаем ответы партнёра ⏳
                  </h3>
                  <p className="text-xs text-neutral-400 dark:text-[var(--text-3)] max-w-xs mx-auto leading-relaxed">
                    Вы уже заполнили свои ответы. Как только {p2Label} пройдёт исследования, здесь появится ваша общая карта гармонии союза и разбор 6 сфер.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemindPartner}
                  disabled={reminded}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-2xs ${
                    reminded
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/25'
                  }`}
                >
                  {reminded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Напоминание отправлено!</span>
                    </>
                  ) : (
                    <>
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Напомнить партнёру</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <RadarChartCanvas
                chartData={chartData}
                viewMode="both"
                p1Label={p1Label}
                p2Label={p2Label}
                p1HasData={p1HasData}
                p2HasData={p2HasData}
              />
            )}
          </>
        )}

        {/* TAB 2: PARTNER 1 (DMITRY) */}
        {viewMode === 'partner1' && (
          <>
            {!p1HasData ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[var(--surface)] rounded-3xl border border-neutral-100 dark:border-[var(--divider)] shadow-2xs space-y-3 animate-fadeIn mt-2">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 text-xl shadow-2xs">
                  ⏳
                </div>
                <h3 className="text-base font-semibold text-neutral-800 dark:text-[var(--text)]">
                  Нет данных
                </h3>
                <p className="text-xs text-neutral-400 dark:text-[var(--text-3)] max-w-xs mx-auto leading-relaxed">
                  Исследования ещё не пройдены. {p1Label} ещё не заполнил(а) психологические опросники.
                </p>
                {onStartTest && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      onStartTest('TEST-S1');
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    <span>Пройти первое исследование</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <RadarChartCanvas
                chartData={chartData}
                viewMode="partner1"
                p1Label={p1Label}
                p2Label={p2Label}
                p1HasData={p1HasData}
                p2HasData={false}
              />
            )}
          </>
        )}

        {/* TAB 3: PARTNER 2 (ANNA) */}
        {viewMode === 'partner2' && (
          <>
            {!p2HasData ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[var(--surface)] rounded-3xl border border-neutral-100 dark:border-[var(--divider)] mt-2 shadow-2xs animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 mb-3 text-xl">
                  ⏳
                </div>
                <h3 className="text-base font-semibold text-neutral-800 dark:text-[var(--text)]">
                  Нет данных
                </h3>
                <p className="text-xs text-neutral-400 dark:text-[var(--text-3)] mt-1 max-w-xs leading-relaxed">
                  Исследования ещё не пройдены. {p2Label} ещё не заполнил(а) психологические опросники. Как только партнёр пройдёт их, здесь появится его персональный профиль.
                </p>
                <button
                  type="button"
                  onClick={handleRemindPartner}
                  disabled={reminded}
                  className={`mt-4 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-2xs ${
                    reminded
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/25'
                  }`}
                >
                  {reminded ? 'Напоминание отправлено!' : 'Напомнить партнёру'}
                </button>
              </div>
            ) : (
              <RadarChartCanvas
                chartData={chartData}
                viewMode="partner2"
                p1Label={p1Label}
                p2Label={p2Label}
                p1HasData={false}
                p2HasData={p2HasData}
              />
            )}
          </>
        )}
      </div>

      {/* 2. TAB CONTENT: TOGETHER TAB (ONLY WHEN BOTH COMPLETED) */}
      {viewMode === 'both' && isBothCompleted && (
        <div className="space-y-5 animate-fadeIn">
          {/* Couple Archetype */}
          {coupleArchetype && (
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-2xs space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[var(--accent)]">Психологический архетип союза</span>
                <h4 className="text-base font-bold text-[var(--text)]">{coupleArchetype.title}</h4>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">{coupleArchetype.subtitle}</p>
              </div>

              {/* Synergy Badges */}
              {synergyPoints.length > 0 && (
                <div className="pt-2 border-t border-[var(--divider)] space-y-2">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Точки взаимной синергии (Резонанс ≥ 75%)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {synergyPoints.map((s) => (
                      <div
                        key={s.key}
                        className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-[var(--text)]">{s.name}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.avgScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Growth Zones */}
              {growthZones.length > 0 && (
                <div className="pt-2 border-t border-[var(--divider)] space-y-2">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Зоны совместного развития и внимания</span>
                  </span>
                  <div className="space-y-2">
                    {growthZones.map((g) => (
                      <div
                        key={g.key}
                        className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text)]">{g.name}</span>
                          <span className="font-bold text-[var(--accent)]">{g.avgScore}%</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-2)] leading-relaxed">{g.gottmanTip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed 6 Spheres Breakdown (EXCLUSIVELY in Together tab when ready) */}
          <div className="space-y-3">
            <div className="px-1 text-xs font-bold text-[var(--text-2)]">Подробный разбор 6 сфер союза</div>

            <div className="space-y-2.5">
              {metricsData.map((m) => (
                <RadarMetricCard
                  key={m.key}
                  metric={m}
                  isSelected={selectedMetricKey === m.key}
                  onToggleSelect={() => setSelectedMetricKey(selectedMetricKey === m.key ? null : m.key)}
                  onStartTest={onStartTest}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: INDIVIDUAL PARTNER 1 (DMITRY) */}
      {viewMode === 'partner1' && p1HasData && (
        <div className="space-y-3 animate-fadeIn">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShow24Scales(!show24Scales);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--divider)] text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--accent)]" />
              <span>24 первичные шкалы личности (6 векторов)</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[var(--text-3)] transition-transform duration-200 ${show24Scales ? 'rotate-180 text-[var(--accent)]' : ''}`} />
          </button>

          {show24Scales && (
            <div className="space-y-4 animate-fadeIn">
              {scalesByVector.map((vec, idx) => {
                const vectorMetric = metricsData.find((m) => m.key === vec.vectorKey);
                const p1Score = vectorMetric?.p1Score || 0;

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[var(--accent)]">{vec.vectorName}</h4>
                      {p1Score > 0 && (
                        <span className="text-[11px] font-bold text-[var(--text-2)]">{p1Score}%</span>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {vec.scales.map((scale) => {
                        return (
                          <div key={scale.id} className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[var(--text)]">{scale.name}</span>
                              <span className="text-[10px] font-bold text-[var(--accent)]">
                                {p1Score > 0 ? `${p1Score}% • ${getStatusLabel(p1Score)}` : 'Не пройден'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-3)] leading-relaxed">{scale.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: INDIVIDUAL PARTNER 2 (ANNA) - WHEN COMPLETED */}
      {viewMode === 'partner2' && p2HasData && (
        <div className="space-y-3 animate-fadeIn">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShow24Scales(!show24Scales);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--divider)] text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--accent)]" />
              <span>24 первичные шкалы личности (6 векторов)</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[var(--text-3)] transition-transform duration-200 ${show24Scales ? 'rotate-180 text-[var(--accent)]' : ''}`} />
          </button>

          {show24Scales && (
            <div className="space-y-4 animate-fadeIn">
              {scalesByVector.map((vec, idx) => {
                const vectorMetric = metricsData.find((m) => m.key === vec.vectorKey);
                const p2Score = vectorMetric?.p2Score || 0;

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[var(--accent)]">{vec.vectorName}</h4>
                      {p2Score > 0 && (
                        <span className="text-[11px] font-bold text-[var(--text-2)]">{p2Score}%</span>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {vec.scales.map((scale) => {
                        return (
                          <div key={scale.id} className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[var(--text)]">{scale.name}</span>
                              <span className="text-[10px] font-bold text-[var(--accent)]">
                                {p2Score > 0 ? `${p2Score}% • ${getStatusLabel(p2Score)}` : 'Не пройден'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-3)] leading-relaxed">{scale.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

