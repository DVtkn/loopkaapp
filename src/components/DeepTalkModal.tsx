import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Heart,
  Lightbulb,
  MessageCircle,
  LayoutGrid,
  CreditCard,
} from 'lucide-react';
import { DEEP_TALK_CARDS } from '../data/gamificationData';
import { DeepTalkCard } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { useCouple } from '../context/CoupleContext';

interface DeepTalkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Extra rich deep talk cards to form an expansive library
const EXTENDED_CARDS: DeepTalkCard[] = [
  ...DEEP_TALK_CARDS,
  {
    id: 'card-9',
    category: 'intimacy',
    categoryLabel: 'Близость и чувства',
    categoryColor: 'from-rose-500 to-pink-500',
    question: 'Что я делаю такого, от чего ты чувствуешь себя в полной безопасности рядом со мной?',
    tip: 'Подумайте как о физической, так и об эмоциональной безопасности.',
  },
  {
    id: 'card-10',
    category: 'future',
    categoryLabel: 'Наше будущее',
    categoryColor: 'from-indigo-500 to-blue-500',
    question: 'Какой традицией мы обязательно должны обзавестись в нашей семье через год или два?',
    tip: 'Это может быть воскресный ритуал, совместный отпуск или уютный вечерний обычай.',
  },
  {
    id: 'card-11',
    category: 'memories',
    categoryLabel: 'Воспоминания',
    categoryColor: 'from-amber-500 to-orange-500',
    question: 'Вспомни момент, когда мы вместе преодолели трудность и это сделало нас сильнее.',
    tip: 'Обратите внимание на то, как вы поддержали друг друга тогда.',
  },
  {
    id: 'card-12',
    category: 'dreams',
    categoryLabel: 'Мечты и желания',
    categoryColor: 'from-purple-500 to-indigo-500',
    question: 'Если бы у нас был целый свободный месяц без работы и забот с неограниченным бюджетом, как бы мы его прожили?',
    tip: 'Не ограничивайте фантазию: какие страны, отели, вкусы или тишина?',
  },
  {
    id: 'card-13',
    category: 'fun',
    categoryLabel: 'Улыбки и юмор',
    categoryColor: 'from-emerald-500 to-teal-500',
    question: 'Какая моя забавная привычка умиляет тебя больше всего, даже если ты иногда шутишь по этому поводу?',
    tip: 'Ответьте с теплом и улыбкой — без сарказма.',
  },
  {
    id: 'card-14',
    category: 'intimacy',
    categoryLabel: 'Близость и чувства',
    categoryColor: 'from-rose-500 to-pink-500',
    question: 'За что ты больше всего благодарен(на) нашим отношениям прямо сегодня?',
    tip: 'Назовите хотя бы три конкретные вещи.',
  },
  {
    id: 'card-15',
    category: 'future',
    categoryLabel: 'Наше будущее',
    categoryColor: 'from-indigo-500 to-blue-500',
    question: 'Каким ты видишь наш идеальный совместный дом мечты через 10 лет?',
    tip: 'Опишите гостиную, террасу, звуки и вид из окна.',
  },
];

const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: 'Все темы', icon: '✦' },
  { key: 'intimacy', label: 'Близость', icon: '♡' },
  { key: 'future', label: 'Будущее', icon: '★' },
  { key: 'memories', label: 'Воспоминания', icon: '✧' },
  { key: 'dreams', label: 'Мечты', icon: '♥' },
  { key: 'fun', label: 'Юмор', icon: '☺' },
];

export const DeepTalkModal: React.FC<DeepTalkModalProps> = ({ isOpen, onClose }) => {
  const { triggerConfetti } = useCouple();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [copied, setCopied] = useState<boolean>(false);
  const [discussedIds, setDiscussedIds] = useState<Set<string>>(new Set());

  const filteredCards = useMemo(() => {
    if (selectedCategory === 'all') return EXTENDED_CARDS;
    return EXTENDED_CARDS.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  const activeCard = filteredCards[currentIndex % filteredCards.length] || filteredCards[0];

  const handleNext = () => {
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleRandom = () => {
    triggerHaptic('medium');
    const randomIdx = Math.floor(Math.random() * filteredCards.length);
    setCurrentIndex(randomIdx);
  };

  const handleCopy = () => {
    if (!activeCard) return;
    triggerHaptic('selection');
    navigator.clipboard?.writeText(activeCard.question);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkDiscussed = (id: string) => {
    triggerHaptic('success');
    triggerConfetti();
    setDiscussedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-[var(--surface)] text-[var(--text)] rounded-3xl border border-[var(--divider)] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--divider)] flex items-center justify-between gap-3 shrink-0 bg-[var(--surface-2)]/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[var(--text)]">
                Deep Talk • Карточки для двоих
              </h3>
              <p className="text-xs text-[var(--text-2)]">
                Библиотека глубоких вопросов для разговоров по душам
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                triggerHaptic('selection');
                setViewMode(viewMode === 'card' ? 'grid' : 'card');
              }}
              className="p-2 rounded-xl text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
              title={viewMode === 'card' ? 'Показать все списком' : 'Режим карточек'}
            >
              {viewMode === 'card' ? <LayoutGrid className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2.5 border-b border-[var(--divider)] bg-[var(--surface)] shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedCategory(cat.key);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--surface-blush)] text-[var(--accent)] border border-[var(--accent)]/30 font-bold shadow-2xs'
                    : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] border border-[var(--divider)]'
                }`}
              >
                <span className="text-[11px] opacity-70">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {viewMode === 'card' && activeCard ? (
            <div className="space-y-4">
              {/* Card Container */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 sm:p-6 rounded-3xl bg-[var(--surface-2)] border border-[var(--divider)] shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[260px]"
                >
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                      {activeCard.categoryLabel}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-3)]">
                      {(currentIndex % filteredCards.length) + 1} из {filteredCards.length}
                    </span>
                  </div>

                  {/* Question */}
                  <div className="my-auto py-2">
                    <p className="text-lg sm:text-xl font-bold text-[var(--text)] leading-relaxed">
                      «{activeCard.question}»
                    </p>
                  </div>

                  {/* Tip */}
                  {activeCard.tip && (
                    <div className="mt-4 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-[var(--text-2)] leading-relaxed">
                        <span className="font-semibold text-[var(--text)]">Подсказка: </span>
                        {activeCard.tip}
                      </p>
                    </div>
                  )}

                  {/* Discussed Badge */}
                  {discussedIds.has(activeCard.id) && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                      <Check className="w-4 h-4" />
                      <span>Обсудили в паре ✨</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handlePrev}
                  className="py-3 px-3 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] font-semibold text-xs text-[var(--text)] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Назад</span>
                </button>

                <button
                  onClick={handleRandom}
                  className="py-3 px-3 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] font-semibold text-xs text-[var(--text)] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Случайный вопрос"
                >
                  <Shuffle className="w-4 h-4 text-amber-500" />
                  <span>Случайно</span>
                </button>

                <button
                  onClick={handleNext}
                  className="py-3 px-3 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] font-semibold text-xs text-[var(--text)] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span>Дальше</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons: Copy & Discussed */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Скопировано!' : 'Скопировать вопрос'}</span>
                </button>

                <button
                  onClick={() => handleMarkDiscussed(activeCard.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    discussedIds.has(activeCard.id)
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)] border-[var(--divider)]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${discussedIds.has(activeCard.id) ? 'fill-emerald-500 text-emerald-500' : 'text-rose-500'}`} />
                  <span>{discussedIds.has(activeCard.id) ? 'Обсудили' : 'Отметить как обсуждённое'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="space-y-3">
              {filteredCards.map((card, idx) => {
                const isDiscussed = discussedIds.has(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      triggerHaptic('selection');
                      setCurrentIndex(idx);
                      setViewMode('card');
                    }}
                    className="p-4 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] hover:border-[var(--accent)]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-500">
                        {card.categoryLabel}
                      </span>
                      {isDiscussed && (
                        <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Обсудили
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                      «{card.question}»
                    </p>
                    {card.tip && (
                      <p className="text-xs text-[var(--text-3)] mt-1 line-clamp-1">
                        {card.tip}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
