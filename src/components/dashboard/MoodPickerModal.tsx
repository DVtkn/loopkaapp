import React, { useState } from 'react';
import { SmilePlus, X, Sparkles } from 'lucide-react';
import { ColoredIcon, MOOD_PRESETS } from '../ColoredIcon.tsx';

interface MoodPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMood: (key: string, label: string, note: string) => void;
}

export const MoodPickerModal: React.FC<MoodPickerModalProps> = ({ isOpen, onClose, onSubmitMood }) => {
  const [customMoodKey, setCustomMoodKey] = useState<string>('calm');
  const [customMoodLabel, setCustomMoodLabel] = useState<string>('Спокойствие');
  const [moodNote, setMoodNote] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customMoodLabel.trim()) return;
    onSubmitMood(customMoodKey, customMoodLabel.trim(), moodNote.trim());
    setMoodNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn" />

      <div className="relative z-10 w-full max-w-lg bg-[var(--surface-solid)] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 border border-[var(--divider)] shadow-2xl space-y-0 max-h-[90vh] flex flex-col pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] animate-slideUp">
        <div className="w-10 h-1 rounded-full bg-[var(--divider)] mx-auto sm:hidden mb-3 shrink-0" />

        <div className="flex items-center justify-between shrink-0 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center">
              <SmilePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text)] leading-tight">Моё настроение</h3>
              <p className="text-xs text-[var(--text-2)]">Партнёр увидит ваше актуальное состояние</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden space-y-3.5">
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_PRESETS.map((preset) => {
                const isSelected = customMoodKey === preset.key;
                return (
                  <button
                    type="button"
                    key={preset.key}
                    onClick={() => {
                      setCustomMoodKey(preset.key);
                      setCustomMoodLabel(preset.label);
                    }}
                    className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-start gap-2 transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs scale-[1.02]'
                        : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--divider)] hover:border-[var(--accent)]/40'
                    }`}
                  >
                    <ColoredIcon icon={preset.icon} color={preset.color} size="sm" />
                    <span className="leading-tight text-left">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Label Input */}
            <input
              type="text"
              value={customMoodLabel}
              onChange={(e) => setCustomMoodLabel(e.target.value)}
              placeholder="Название состояния (например: Заряжен на романтику)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] font-medium placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)]"
            />

            {/* Optional Note Input */}
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Пара тёплых слов о вашем дне или чувствах..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] font-normal placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex gap-2 pt-3 border-t border-[var(--divider)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-semibold text-sm transition-all active:scale-98 cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!customMoodLabel.trim()}
              className="flex-1 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Сохранить настроение</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
