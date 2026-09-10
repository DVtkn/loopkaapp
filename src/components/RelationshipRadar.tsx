import React, { useState, useMemo } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { useCouple } from '../context/CoupleContext.tsx';
import { triggerHaptic } from '../utils/haptics.ts';
import { calculateRadarMetrics, MetricDetail } from './radar/radarUtils.ts';
import { RadarChartCanvas } from './radar/RadarChartCanvas.tsx';
import { RadarMetricCard } from './radar/RadarMetricCard.tsx';

export type { MetricDetail };

interface RelationshipRadarProps {
  compact?: boolean;
  className?: string;
  onStartTest?: (testId: string) => void;
}

export const RelationshipRadar: React.FC<RelationshipRadarProps> = ({
  className = '',
  onStartTest,
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

  const [viewMode, setViewMode] = useState<'both' | 'partner1' | 'partner2'>('both');
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);

  const p1 = coupleProfile.partner1;
  const p2 = coupleProfile.partner2;
  const p1Label = p1.name || 'Партнёр 1';
const p2Label = p2.name || 'Партнёр 2';

  const metricsData = useMemo(() => {
    const data = calculateRadarMetrics({
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
    
    const partner1Completed = tests.filter(t => t.partner1Done).length;
    const partner2Completed = tests.filter(t => t.partner2Done).length;
    
    console.log('[Analytics State]:', { 
      partner1Completed, 
      partner2Completed, 
      rawScores: data 
    });
    
    return data;
  }, [coupleProfile, pulseHistory, tests, challenges, smallCravings, moodHistory, dateInvites, loveTaps, dailyQuiz]);

  const hasAnyData = useMemo(() => {
    return metricsData.some((m) => m.avgScore > 0);
  }, [metricsData]);

  const overallScore = useMemo(() => {
    const validScores = metricsData.map((m) => m.avgScore).filter((s) => s > 0);
    if (!validScores.length) return 0;
    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  }, [metricsData]);

  const chartData = useMemo(() => {
    return metricsData.map((m) => ({
      metric: m.shortName,
      partner1: m.p1Score > 0 ? m.p1Score : hasAnyData ? 20 : 0,
      partner2: m.p2Score > 0 ? m.p2Score : hasAnyData ? 20 : 0,
      average: m.avgScore > 0 ? m.avgScore : hasAnyData ? 20 : 0,
      fullMark: 100,
    }));
  }, [metricsData, hasAnyData]);

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Radar Card Container */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-[var(--surface)] border border-[var(--divider)] shadow-2xs space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[var(--accent)]">5 сфер союза</span>
            <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">Баланс отношений</h3>
          </div>

          {hasAnyData && (
            <div className="px-3 py-1 rounded-full bg-[var(--surface-blush)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20 shadow-2xs">
              {overallScore}% совпадение
            </div>
          )}
        </div>

        {!hasAnyData ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                <Heart className="w-4 h-4 fill-[var(--accent)]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text)]">Карта совместимости формируется</h4>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  Пройдите исследования пары — и здесь откроется наглядная карта ваших сильных сторон и сфер сближения.
                </p>
              </div>
            </div>

            {onStartTest && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  onStartTest('TEST-S2');
                }}
                className="w-full py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-3)] text-[var(--text)] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-[var(--divider)] shadow-2xs cursor-pointer active:scale-98"
              >
                <span>Пройти первое исследование</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <RadarChartCanvas
            chartData={chartData}
            viewMode={viewMode}
            setViewMode={setViewMode}
            p1Label={p1Label}
            p2Label={p2Label}
            p1HasData={metricsData.some((m) => m.p1Score > 0)}
            p2HasData={metricsData.some((m) => m.p2Score > 0)}
          />
        )}
      </div>

      {/* 2. The 5 Key Spheres Breakdown */}
      <div className="space-y-3">
        <div className="px-1 text-xs font-bold text-[var(--text-2)]">Подробный разбор сфер</div>

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
  );
};
