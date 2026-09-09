import React from 'react';
import { X, Sparkles, MessageCircle } from 'lucide-react';
import { ColoredAvatar, MoodBadge } from '../ColoredIcon.tsx';

export function formatMoodTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 2) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;

    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Сегодня в ${time}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return `Вчера в ${time}`;

    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export function getMoodBriefDescription(moodKeyOrLabel?: string): string {
  const s = (moodKeyOrLabel || '').toLowerCase();
  if (s.includes('предвкуш') || s.includes('inspire') || s.includes('вдохнов')) {
    return 'Ждёт ярких совместных моментов и тёплых встреч';
  }
  if (s.includes('calm') || s.includes('спокой')) {
    return 'В гармонии и душевном равновесии. Ценит уют и тишину';
  }
  if (s.includes('tender') || s.includes('нежн') || s.includes('люб')) {
    return 'Полна нежности к вам. Отличный момент для тёплых слов';
  }
  if (s.includes('cozy') || s.includes('уют')) {
    return 'Настроение для домашнего уюта, чая и неспешного общения';
  }
  if (s.includes('tired') || s.includes('устал')) {
    return 'Упадок сил после дня. Будет рада заботе и отдыху';
  }
  if (s.includes('energy') || s.includes('энерг') || s.includes('радост') || s.includes('счаст')) {
    return 'На подъёме и полна энергии, готова делиться позитивом';
  }
  if (s.includes('romance') || s.includes('романт')) {
    return 'Романтичное настроение для объятий и совместного вечера';
  }
  if (s.includes('focus') || s.includes('мотив')) {
    return 'Сфокусирован(а) на целях и делах, ценит понимание';
  }
  return 'Делится своими чувствами, чтобы быть ближе к вам';
}

interface PartnerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  safeOtherPartner: any;
  partnerStatusInfo: {
    isOnline: boolean;
    statusText: string;
    badgeText: string;
  };
  onSendSpecificTap: (tapType: string, customNote: string, label: string) => Promise<void>;
  onOpenChat: () => void;
}

export const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  safeOtherPartner,
  partnerStatusInfo,
  onSendSpecificTap,
  onOpenChat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[var(--surface-solid)] border border-[var(--divider)] rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <ColoredAvatar avatar={safeOtherPartner.avatar || 'sparkles'} name={partnerName} size="md" />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[var(--surface-solid)] ${
                  partnerStatusInfo.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <span>{partnerName}</span>
                {safeOtherPartner.login && (
                  <span className="text-xs text-[var(--text-2)] font-normal">@{safeOtherPartner.login}</span>
                )}
              </h3>
              <div className="text-xs text-[var(--text-2)] flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    partnerStatusInfo.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                <span>{partnerStatusInfo.statusText}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current State */}
        <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--accent)]">Текущее настроение</span>
            {safeOtherPartner.currentMood?.updatedAt && (
              <span className="text-xs text-[var(--text-2)] font-normal">
                {formatMoodTime(safeOtherPartner.currentMood.updatedAt)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3.5">
            <MoodBadge
              mood={safeOtherPartner.currentMood?.emoji || safeOtherPartner.currentMood?.label || 'inspire'}
              showLabel={false}
              size="lg"
            />
            <div>
              <div className="text-lg font-bold text-[var(--text)] leading-tight">
                {safeOtherPartner.currentMood?.label || 'В предвкушении'}
              </div>
              <div className="text-xs text-[var(--text-2)] mt-0.5">
                {partnerStatusInfo.isOnline ? 'Активно делится состоянием' : 'Последнее обновление'}
              </div>
            </div>
          </div>

          {safeOtherPartner.currentMood?.note?.trim() && (
            <div className="p-3 rounded-xl bg-[var(--surface-solid)] border border-[var(--divider)]">
              <div className="text-[11px] font-medium text-[var(--text-2)] mb-0.5">Слова партнёра:</div>
              <p className="text-sm italic text-[var(--text)] font-medium leading-relaxed">
                «{safeOtherPartner.currentMood.note.trim()}»
              </p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-[var(--surface-blush)] border border-[var(--surface-blush-border)]">
            <div className="text-[11px] font-bold text-[var(--accent)] mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Взгляд психолога Совы</span>
            </div>
            <p className="text-xs text-[var(--text)] leading-relaxed font-normal">
              {getMoodBriefDescription(
                safeOtherPartner.currentMood?.label || safeOtherPartner.currentMood?.emoji || 'inspire'
              )}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[var(--text-2)] px-1">Быстрое внимание</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSendSpecificTap('thinking', 'Думаю о тебе прямо сейчас ✨', 'Думаю о тебе')}
              className="p-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-left"
            >
              <span className="text-base">💭</span>
              <span>Думаю о тебе</span>
            </button>
            <button
              type="button"
              onClick={() => onSendSpecificTap('miss', 'Очень скучаю по тебе 💌', 'Скучаю')}
              className="p-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-left"
            >
              <span className="text-base">🥺</span>
              <span>Скучаю</span>
            </button>
            <button
              type="button"
              onClick={() => onSendSpecificTap('proud', 'Горжусь тобой и твоими успехами! 🌟', 'Горжусь тобой')}
              className="p-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-left"
            >
              <span className="text-base">🏆</span>
              <span>Горжусь тобой</span>
            </button>
            <button
              type="button"
              onClick={() => onSendSpecificTap('grateful', 'Спасибо тебе за то, что ты есть! ❤️', 'Ценю тебя')}
              className="p-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-left"
            >
              <span className="text-base">❤️</span>
              <span>Ценю тебя</span>
            </button>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--divider)]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Написать в чат</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-semibold text-sm transition-all active:scale-98 cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
