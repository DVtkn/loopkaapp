import React, { useState, useEffect } from 'react';
import { X, CalendarHeart, Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics.ts';

interface SetStartDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartDate?: string;
  onSave: (dateStr: string) => void;
}

export const SetStartDateModal: React.FC<SetStartDateModalProps> = ({
  isOpen,
  onClose,
  currentStartDate,
  onSave,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(currentStartDate || new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, currentStartDate]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    if (!selectedDate) return;
    triggerHaptic('success');
    onSave(selectedDate);
    onClose();
  };

  const setPreset = (yearsAgo: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - yearsAgo);
    setSelectedDate(d.toISOString().split('T')[0]);
    triggerHaptic('light');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-[var(--surface-solid)] border border-[var(--divider)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text)] leading-tight">Дата начала отношений</h3>
              <p className="text-[11px] text-[var(--text-2)] mt-0.5">Для точного отсчёта дней вместе</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-2)]">Выберите памятную дату</label>
          <input
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-[var(--text)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all cursor-pointer"
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-[var(--text-3)]">Быстрый выбор:</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setPreset(1)}
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs text-[var(--text)] transition-all cursor-pointer"
            >
              1 год назад
            </button>
            <button
              type="button"
              onClick={() => setPreset(2)}
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs text-[var(--text)] transition-all cursor-pointer"
            >
              2 года назад
            </button>
            <button
              type="button"
              onClick={() => setPreset(3)}
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs text-[var(--text)] transition-all cursor-pointer"
            >
              3 года назад
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(todayStr);
                triggerHaptic('light');
              }}
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs text-[var(--text)] transition-all cursor-pointer"
            >
              Сегодня
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--divider)]">
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedDate}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Сохранить дату</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-semibold text-sm transition-all active:scale-98 cursor-pointer"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
