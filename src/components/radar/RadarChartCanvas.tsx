import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
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
}

export const RadarChartCanvas: React.FC<RadarChartCanvasProps> = ({
  chartData,
  viewMode,
  setViewMode,
  p1Label,
  p2Label,
}) => {
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

      {/* Radar Chart */}
      <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
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
    </div>
  );
};
