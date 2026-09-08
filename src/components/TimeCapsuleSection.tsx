import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Unlock,
  Sparkles,
  Plus,
  Clock,
  Calendar,
  Heart,
  Send,
  X,
  FileText,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { TimeCapsule } from '../types';
import { triggerHaptic } from '../utils/haptics';

const CATEGORY_MAP: Record<TimeCapsule['category'], { label: string; icon: string; color: string }> = {
  promise: { label: 'Обещание', icon: '🤝', color: 'text-indigo-500 bg-indigo-500/10' },
  memory: { label: 'Воспоминание', icon: '📸', color: 'text-amber-500 bg-amber-500/10' },
  wish: { label: 'Желание', icon: '✨', color: 'text-pink-500 bg-pink-500/10' },
  letter: { label: 'Письмо любви', icon: '💌', color: 'text-rose-500 bg-rose-500/10' },
};

export const TimeCapsuleSection: React.FC = () => {
  const { timeCapsules, addTimeCapsule, openTimeCapsule, currentUser, coupleProfile, triggerConfetti } = useCouple();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [readingCapsule, setReadingCapsule] = useState<TimeCapsule | null>(null);

  // Form states
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [unlockDate, setUnlockDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<TimeCapsule['category']>('letter');

  const today = new Date().toISOString().split('T')[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    triggerHaptic('success');
    addTimeCapsule(title.trim(), content.trim(), unlockDate, category);
    setTitle('');
    setContent('');
    setShowCreateModal(false);
  };

  const handleOpenCapsule = (capsule: TimeCapsule) => {
    triggerHaptic('success');
    if (!capsule.isOpened) {
      openTimeCapsule(capsule.id);
    }
    setReadingCapsule(capsule);
  };

  const setPresetDate = (months: number) => {
    triggerHaptic('selection');
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setUnlockDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">
      {/* Header & CTA */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[var(--text)]">Капсулы времени</h3>
          <p className="text-xs text-[var(--text-2)]">
            Послания и обещания, запечатанные до важной даты в будущем
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setShowCreateModal(true);
          }}
          className="px-3.5 py-2 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Запечатать</span>
        </button>
      </div>

      {/* Capsules List */}
      {timeCapsules.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[var(--surface-2)] border border-[var(--divider)] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text)]">Пока нет запечатанных капсул</h4>
            <p className="text-xs text-[var(--text-2)] mt-1 max-w-sm mx-auto">
              Напишите послание, признание или обещание вашей половинке и запечатайте его до годовщины или особенного дня.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-[var(--surface)] text-xs font-semibold text-[var(--accent)] border border-[var(--divider)] hover:border-[var(--accent)] transition-colors cursor-pointer"
          >
            Создать первую капсулу
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {timeCapsules.map((capsule) => {
            const cat = CATEGORY_MAP[capsule.category] || CATEGORY_MAP.letter;
            const isReadyToUnlock = capsule.unlockDate <= today;
            const isUnlocked = capsule.isOpened;

            return (
              <div
                key={capsule.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                  isUnlocked
                    ? 'bg-[var(--surface)] border-emerald-500/30 shadow-xs'
                    : isReadyToUnlock
                    ? 'bg-amber-500/5 border-amber-500/30 shadow-xs'
                    : 'bg-[var(--surface-2)] border-[var(--divider)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cat.color}`}>
                    {cat.icon} {cat.label}
                  </span>

                  <span className="text-[11px] font-medium text-[var(--text-3)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {capsule.unlockDate}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[var(--text)] leading-snug">
                  {capsule.title}
                </h4>

                <p className="text-xs text-[var(--text-2)] mt-1">
                  Автор: <span className="font-semibold text-[var(--text)]">{capsule.authorName}</span>
                </p>

                {/* Status and Action */}
                <div className="mt-4 pt-3 border-t border-[var(--divider)] flex items-center justify-between gap-2">
                  {isUnlocked ? (
                    <>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Распаковано
                      </span>
                      <button
                        onClick={() => handleOpenCapsule(capsule)}
                        className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--text)] border border-[var(--divider)] transition-colors cursor-pointer"
                      >
                        Перечитать
                      </button>
                    </>
                  ) : isReadyToUnlock ? (
                    <>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Готова к открытию!
                      </span>
                      <button
                        onClick={() => handleOpenCapsule(capsule)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Распаковать ✨
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-[var(--text-3)] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Запечатано
                      </span>
                      <span className="text-[11px] text-[var(--text-3)]">
                        Откроется {capsule.unlockDate}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Capsule */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--surface)] text-[var(--text)] rounded-3xl border border-[var(--divider)] p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)]">Запечатать капсулу</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-[var(--text-3)] hover:text-[var(--text)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-2)] block mb-1">
                    Тема или повод
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Письмо на нашу годовщину"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] placeholder-[var(--text-3)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-2)] block mb-1">
                    Категория послания
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(CATEGORY_MAP) as TimeCapsule['category'][]).map((catKey) => {
                      const item = CATEGORY_MAP[catKey];
                      const isSelected = category === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setCategory(catKey)}
                          className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--surface-blush)] text-[var(--accent)] border-[var(--accent)]/40 font-bold'
                              : 'bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--divider)]'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-2)] block mb-1">
                    Текст послания (скрыт до дня распаковки)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Напишите всё, что вы чувствуете прямо сейчас..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] placeholder-[var(--text-3)] focus:outline-hidden focus:border-[var(--accent)] resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[var(--text-2)]">
                      Дата распаковки
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPresetDate(1)}
                        className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        +1 мес
                      </button>
                      <span className="text-[var(--text-3)]">•</span>
                      <button
                        type="button"
                        onClick={() => setPresetDate(6)}
                        className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        +6 мес
                      </button>
                      <span className="text-[var(--text-3)]">•</span>
                      <button
                        type="button"
                        onClick={() => setPresetDate(12)}
                        className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        +1 год
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    required
                    min={today}
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--divider)] text-xs font-semibold text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    Запечатать капсулу
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Read Capsule */}
      <AnimatePresence>
        {readingCapsule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--surface)] text-[var(--text)] rounded-3xl border border-[var(--divider)] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text)]">{readingCapsule.title}</h3>
                    <p className="text-xs text-[var(--text-2)]">
                      От {readingCapsule.authorName} • Запечатано {readingCapsule.createdAt.split('T')[0]}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReadingCapsule(null)}
                  className="p-1.5 text-[var(--text-3)] hover:text-[var(--text)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)]">
                <p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                  {readingCapsule.content}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setReadingCapsule(null)}
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
