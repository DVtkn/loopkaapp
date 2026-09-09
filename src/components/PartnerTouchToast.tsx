import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Flame, ThumbsUp, MessageCircle, Gift, X } from 'lucide-react';
import { TouchNotificationData } from '../types';

interface PartnerTouchToastProps {
  touch: TouchNotificationData | null;
  onDismiss: () => void;
  onSendBack?: () => void;
}

export const PartnerTouchToast: React.FC<PartnerTouchToastProps> = ({
  touch,
  onDismiss,
  onSendBack,
}) => {
  if (!touch) return null;

  const renderIcon = () => {
    switch (touch.actionType) {
      case 'hug':
        return <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />;
      case 'thinking':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'miss':
        return <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />;
      case 'kiss':
        return <Flame className="w-5 h-5 fill-red-500 text-red-500" />;
      case 'appreciated':
      case 'grateful':
        return <ThumbsUp className="w-5 h-5 text-emerald-500" />;
      case 'talk':
        return <MessageCircle className="w-5 h-5 text-indigo-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-[var(--accent)]" />;
    }
  };

  const getBgColor = () => {
    switch (touch.actionType) {
      case 'hug':
        return 'bg-rose-500/15 border-rose-500/30';
      case 'thinking':
        return 'bg-amber-500/15 border-amber-500/30';
      case 'miss':
        return 'bg-pink-500/15 border-pink-500/30';
      case 'kiss':
        return 'bg-red-500/15 border-red-500/30';
      case 'appreciated':
      case 'grateful':
        return 'bg-emerald-500/15 border-emerald-500/30';
      default:
        return 'bg-[var(--surface-blush)] border-[var(--accent)]/30';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0, scale: 0.94 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -40, opacity: 0, scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-[250] w-[calc(100%-2rem)] max-w-sm sm:max-w-md pointer-events-auto"
      >
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--divider)] shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-[var(--text)] transition-all"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-10 h-10 rounded-xl ${getBgColor()} flex items-center justify-center shrink-0 border transition-transform`}>
              {renderIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight">
                  {touch.title}
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-2)] mt-0.5 font-normal">
                {touch.customNote || touch.subtitle || 'Только что • Нежное внимание'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onSendBack && (
              <button
                type="button"
                onClick={onSendBack}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[11px] font-bold hover:bg-[var(--accent-hover)] transition-all active:scale-95 cursor-pointer"
              >
                Ответить ❤️
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Закрыть уведомление"
              className="w-7 h-7 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
