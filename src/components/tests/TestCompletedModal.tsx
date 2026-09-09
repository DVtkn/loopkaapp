import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { TestCategory } from '../../types.ts';
import { getTestMeta } from './testMeta.ts';

interface TestCompletedModalProps {
  test: TestCategory | null;
  isPaired: boolean;
  partnerName: string;
  onViewReport: () => void;
  onClose: () => void;
}

export const TestCompletedModal: React.FC<TestCompletedModalProps> = ({
  test,
  isPaired,
  partnerName,
  onViewReport,
  onClose,
}) => {
  if (!test) return null;

  const meta = getTestMeta(test);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[var(--surface)] rounded-[28px] max-w-md w-full p-6 sm:p-7 text-center space-y-4 shadow-2xl border border-[var(--divider)]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center mx-auto border border-[var(--accent)]/20">
            <Heart className="w-6 h-6 fill-[var(--accent)]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text)]">
              «{meta.emotionalTitle}» пройден!
            </h3>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              Ваши ответы бережно сохранены. Опыт союза увеличился на{' '}
              <strong className="text-[var(--accent)]">+150 XP</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-[var(--surface-2)] border border-[var(--divider)] rounded-2xl text-xs text-[var(--text)] font-medium leading-relaxed">
            {isPaired
              ? `Когда ${partnerName} завершит свои ответы, вы сможете открыть подробную карту совпадений.`
              : 'Свяжите аккаунты с партнёром, чтобы увидеть наложение результатов.'}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={onViewReport}
              className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
            >
              Посмотреть карту совместимости
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-transparent text-[var(--text-2)] hover:text-[var(--text)] font-semibold rounded-xl text-xs transition-all cursor-pointer"
            >
              Вернуться к списку
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
