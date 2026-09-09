import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, AlertCircle, Heart, Lock, Eye } from 'lucide-react';
import { PlanCategory } from '../../types.ts';
import { CATEGORY_CONFIG } from './scheduleUtils.ts';
import { triggerHaptic } from '../../utils/haptics.ts';

interface ScheduleEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEventId: string | null;
  formTitle: string;
  setFormTitle: (val: string) => void;
  formDate: string;
  setFormDate: (val: string) => void;
  formStartTime: string;
  setFormStartTime: (val: string) => void;
  formEndTime: string;
  setFormEndTime: (val: string) => void;
  formCategory: PlanCategory;
  setFormCategory: (val: PlanCategory) => void;
  formIsPrivate: boolean;
  setFormIsPrivate: (val: boolean) => void;
  formNote: string;
  setFormNote: (val: string) => void;
  formError: string | null;
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
}

export const ScheduleEventFormModal: React.FC<ScheduleEventFormModalProps> = ({
  isOpen,
  onClose,
  editingEventId,
  formTitle,
  setFormTitle,
  formDate,
  setFormDate,
  formStartTime,
  setFormStartTime,
  formEndTime,
  setFormEndTime,
  formCategory,
  setFormCategory,
  formIsPrivate,
  setFormIsPrivate,
  formNote,
  setFormNote,
  formError,
  onSave,
  onDelete,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 270 }}
          className="absolute inset-0 bg-[var(--surface)] z-20 flex flex-col"
        >
          {/* Form Header */}
          <div className="px-5 py-3.5 border-b border-[var(--divider)] flex items-center justify-between shrink-0 bg-[var(--surface)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[var(--text)]">
                {editingEventId ? 'Редактировать событие' : 'Новое событие в расписании'}
              </h4>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={onSave} className="flex-1 overflow-y-auto p-5 space-y-4">
            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text)]">Название события</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Например: Работа / Созвон, Спортзал, Ужин"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] placeholder-[var(--text-3)] focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Date & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text)]">Дата</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text)]">Начало</label>
                <input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text)]">Окончание</label>
                <input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text)]">Категория</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(Object.keys(CATEGORY_CONFIG) as PlanCategory[]).map((catKey) => {
                  const cfg = CATEGORY_CONFIG[catKey];
                  const Icon = cfg.icon;
                  const isSelected = formCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setFormCategory(catKey);
                      }}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
                          : 'bg-[var(--surface-2)] border-[var(--divider)] text-[var(--text-2)] hover:text-[var(--text)]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg ${cfg.bgClass} ${cfg.textClass} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="line-clamp-1">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              {formCategory === 'date' && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 mt-1">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                  <span>
                    Это свидание появится в блоке «Ближайшее свидание» на главном экране.
                  </span>
                </div>
              )}
            </div>

            {/* Privacy Flag */}
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--surface)] text-[var(--text-2)] flex items-center justify-center">
                    {formIsPrivate ? (
                      <Lock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-sky-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text)]">
                      {formIsPrivate ? 'Личное событие' : 'Открытое событие'}
                    </p>
                    <p className="text-[11px] text-[var(--text-2)]">
                      {formIsPrivate
                        ? 'Партнёр видит только занятое время без названия'
                        : 'Партнёр видит все детали'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setFormIsPrivate(!formIsPrivate);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    formIsPrivate ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                      formIsPrivate ? 'translate-x-5' : 'translate-x-0.5'
                    } top-0.5 absolute`}
                  />
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text)]">Заметка (необязательно)</label>
              <textarea
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="Место, ссылка или короткая памятка"
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] placeholder-[var(--text-3)] focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                {editingEventId ? 'Сохранить изменения' : 'Добавить событие'}
              </button>

              {editingEventId && (
                <button
                  type="button"
                  onClick={() => onDelete(editingEventId)}
                  className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  Удалить
                </button>
              )}
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
