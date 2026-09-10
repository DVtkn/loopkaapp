import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface RatingChartTabProps {
  timelineData: any[];
  p1Name: string;
  p2Name: string;
}

export const RatingChartTab: React.FC<RatingChartTabProps> = ({
  timelineData,
  p1Name,
  p2Name,
}) => {
  const [chartMetric, setChartMetric] = useState<'total' | 'partners' | 'categories'>('total');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">Накопительный прогресс рейтинга</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            График отражает динамику активности пары по неделям
          </p>
        </div>

        {/* Chart Metric Selector */}
        <div className="flex items-center gap-1 bg-[var(--surface-hover)] p-1 rounded-xl border border-[var(--divider)]">
          {[
            { id: 'total', label: 'Общий XP' },
            { id: 'partners', label: 'По партнёрам' },
            { id: 'categories', label: 'По сферам' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setChartMetric(m.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                chartMetric === m.id
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMetric === 'total' ? (
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalXpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ff2d55" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--divider)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: 'var(--text)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Общий XP"
                stroke="#ff2d55"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#totalXpGrad)"
              />
            </AreaChart>
          ) : chartMetric === 'partners' ? (
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="p1Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff2d55" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="p2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--divider)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="p1" name={p1Name} stroke="#ff2d55" strokeWidth={2} fill="url(#p1Grad)" />
              <Area type="monotone" dataKey="p2" name={p2Name} stroke="#6366f1" strokeWidth={2} fill="url(#p2Grad)" />
            </AreaChart>
          ) : (
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--divider)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              />
              <Legend />
              <Bar dataKey="tests" name="Тесты" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dates" name="Свидания" fill="#ff2d55" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reactions" name="Касания" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="care" name="Забота" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
