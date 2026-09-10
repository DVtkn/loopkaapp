import React, { useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Clock, BellRing, Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics.ts';

interface RadarChartCanvasProps {
  chartData: Array<{
    metric: string;
    partner1: number;
    partner2: number;
    average: number;
    fullMark: number;
  }>;
  viewMode: 'both' | 'partner1' | 'partner2';
  setViewMode: (mode: 'both' | 'partner1' | 'partner2') => void;
  p1Label: string;
  p2Label: string;
  p1HasData?: boolean;
  p2HasData?: boolean;
}

export const RadarChartCanvas: React.FC<RadarChartCanvasProps> = ({
  chartData,
  viewMode,
  setViewMode,
  p1Label,
  p2Label,
  p1HasData = true,
  p2HasData = true,
}) => {
  const isBothCompleted = p1HasData && p2HasData;
  const [reminded, setReminded] = useState(false);

  const handleRemindPartner = () => {
    triggerHaptic('success');
    setReminded(true);
    setTimeout(() => setReminded(false), 3000);
  };

  const renderEmptyState = (title: string, desc: string, showNotifyAction = false) => (
    <div className="w-full h-64 sm:h-72 flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
      <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center mb-3 border border-[var(--divider)] shadow-2xs">
        <Clock className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-[var(--text)] mb-1.5">{title}</h4>
      <p className="text-xs text-[var(--text-2)] max-w-[260px] leading-relaxed mb-4">
        {desc}
      </p>
      {showNotifyAction && (
        <button
          type="button"
          onClick={handleRemindPartner}
          disabled={reminded}
          className={`inline-flex items-center gap-1.5 px-4 py-2 transition-all rounded-xl text-xs font-bold border cursor-pointer shadow-2xs ${
            reminded
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-[var(--surface-blush)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white border-[var(--accent)]/20'
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
      )}
    </div>
  );

  return (
    <div className="space-y-4">
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

      {/* Radar Chart or Empty States */}
      {viewMode === 'both' && !isBothCompleted ? (
        renderEmptyState(
          'Ожидаем ответы партнёра ⏳',
          `Вы уже заполнили свои ответы. Как только ${!p1HasData ? p1Label : p2Label} пройдёт исследования, здесь появится ваша общая карта гармонии союза.`,
          true
        )
      ) : viewMode === 'partner1' && !p1HasData ? (
        renderEmptyState(
          'Нет данных',
          `${p1Label} ещё не прошел(ла) ни одного исследования.`
        )
      ) : viewMode === 'partner2' && !p2HasData ? (
        renderEmptyState(
          'Нет данных',
          `${p2Label} ещё не прошел(ла) ни одного исследования.`,
          true
        )
      ) : (
        <div className="w-full h-64 sm:h-72 relative flex items-center justify-center animate-fadeIn">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="var(--divider)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: 'var(--text)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />

              {(viewMode === 'both' || viewMode === 'partner1') && (
                <Radar
                  name={p1Label}
                  dataKey="partner1"
                  stroke="var(--text-2)"
                  strokeWidth={2}
                  fill="var(--text-2)"
                  fillOpacity={viewMode === 'partner1' ? 0.35 : 0.15}
                  isAnimationActive={true}
                />
              )}

              {(viewMode === 'both' || viewMode === 'partner2') && (
                <Radar
                  name={p2Label}
                  dataKey="partner2"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="var(--accent)"
                  fillOpacity={viewMode === 'partner2' ? 0.45 : 0.25}
                  isAnimationActive={true}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
