import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface RadarChartCanvasProps {
  chartData: Array<{
    metric: string;
    partner1: number;
    partner2: number;
    average: number;
    fullMark: number;
  }>;
  viewMode: 'both' | 'partner1' | 'partner2';
  p1Label: string;
  p2Label: string;
  p1HasData?: boolean;
  p2HasData?: boolean;
}

export const RadarChartCanvas: React.FC<RadarChartCanvasProps> = ({
  chartData,
  viewMode,
  p1Label,
  p2Label,
  p1HasData = true,
  p2HasData = true,
}) => {
  return (
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

          {(viewMode === 'both' || viewMode === 'partner1') && p1HasData && (
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

          {(viewMode === 'both' || viewMode === 'partner2') && p2HasData && (
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
  );
};

