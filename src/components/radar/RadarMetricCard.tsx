import React from 'react';
import { ChevronRight, Info, CheckCircle2, ChevronDown, HelpCircle } from 'lucide-react';
import { MetricDetail } from './radarUtils.ts';
import { triggerHaptic } from '../../utils/haptics.ts';

interface RadarMetricCardProps {
  metric: MetricDetail;
  isSelected: boolean;
  onToggleSelect: () => void;
  onStartTest?: (testId: string) => void;
}

export const RadarMetricCard: React.FC<RadarMetricCardProps> = ({
  metric,
  isSelected,
  onToggleSelect,
  onStartTest,
}) => {
  const Icon = metric.icon;

  const getStatusBadge = (score: number) => {
    if (score >= 75) {
      return {
        label: 'Высокая синхронность',
        className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        detail: 'Общие ориентиры и схожие реакции, создающие ощущение надёжного взаимопонимания.',
      };
    }
    if (score >= 50) {
      return {
        label: 'Взаимодополняемость / Зона роста',
        className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
        detail: 'Различия в реакциях и потребностях, которые обогащают пару при осознанном диалоге.',
      };
    }
    return {
      label: 'Точка внимания',
      className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
      detail: 'Разные ожидания и паттерны, требующие бережного проговаривания без критики.',
    };
  };

  const status = metric.avgScore > 0 ? getStatusBadge(metric.avgScore) : null;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all bg-[var(--surface)] shadow-2xs space-y-3 ${
        isSelected
          ? 'border-[var(--accent)]/40 ring-1 ring-[var(--accent)]/20'
          : 'border-[var(--divider)] hover:border-[var(--divider)]'
      }`}
    >
      {/* Clickable Header */}
      <div
        onClick={() => {
          triggerHaptic('light');
          onToggleSelect();
        }}
        className="flex items-start justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/15">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text)]">{metric.name}</h4>
            <span className="text-[11px] text-[var(--text-3)]">{metric.relatedTestTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          {metric.avgScore > 0 ? (
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-[var(--accent)]">{metric.avgScore}%</span>
              {status && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${status.className}`}>
                  {status.label}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-[var(--text-3)] font-medium">Не пройден</span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[var(--text-3)] transition-transform duration-200 ${
              isSelected ? 'rotate-180 text-[var(--accent)]' : ''
            }`}
          />
        </div>
      </div>

      {/* Progress bar if completed */}
      {metric.avgScore > 0 && (
        <div className="space-y-1.5">
          <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--accent)] h-full rounded-full transition-all duration-500"
              style={{ width: `${metric.avgScore}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--text-3)] font-medium">
            <span>Индекс синхронизации взглядов</span>
            <span className="font-bold text-[var(--text-2)]">{metric.avgScore}%</span>
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--text-2)] leading-relaxed font-normal">{metric.description}</p>

      {/* Inline Accordion Details */}
      {isSelected && (
        <div className="pt-3 border-t border-[var(--divider)] space-y-2.5 animate-fadeIn">
          {metric.avgScore > 0 && status && (
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-1 text-xs">
              <div className="font-bold text-[var(--text)] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Что это значит</span>
              </div>
              <p className="text-[var(--text-2)] leading-relaxed text-[11px]">
                {status.detail}
              </p>
            </div>
          )}
          
          <div className="p-3 rounded-xl bg-[var(--surface-2)] space-y-1 text-xs">
            <div className="font-bold text-[var(--accent)] flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Взгляд психолога</span>
            </div>
            <p className="text-[var(--text-2)] leading-relaxed text-[11px]">{metric.insight}</p>
          </div>
          
          <div className="p-3 rounded-xl bg-[var(--surface-2)] space-y-1 text-xs">
            <div className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Совет для пары</span>
            </div>
            <p className="text-[var(--text-2)] leading-relaxed text-[11px]">{metric.gottmanTip}</p>
          </div>
          
          {onStartTest && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onStartTest(metric.relatedTestId);
              }}
              className="w-full py-2.5 mt-1 bg-[var(--surface-blush)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Исследовать «{metric.relatedTestTitle}»</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
