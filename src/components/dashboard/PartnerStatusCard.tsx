import React from 'react';
import { ChevronRight, UserPlus } from 'lucide-react';
import { ColoredAvatar } from '../ColoredIcon.tsx';

export function formatRussianPlural(n: number, one: string, two: string, five: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return two;
  return five;
}

export function formatDaysTogetherDetailed(startDateStr?: string): string {
  try {
    const start = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 482 * 24 * 60 * 60 * 1000);
    const now = new Date();
    if (isNaN(start.getTime()) || now < start) return '1 день вместе';

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${formatRussianPlural(years, 'год', 'года', 'лет')}`);
    }
    if (months > 0) {
      parts.push(`${months} ${formatRussianPlural(months, 'месяц', 'месяца', 'месяцев')}`);
    }
    if (days > 0 || parts.length === 0) {
      parts.push(`${days} ${formatRussianPlural(days, 'день', 'дня', 'дней')}`);
    }

    return `${parts.join(' ')} вместе`;
  } catch {
    return '482 дня вместе';
  }
}

export function getPartnerStatusDetails(partner: {
  name?: string;
  lastActiveAt?: string;
  gender?: string;
  login?: string;
}): {
  isOnline: boolean;
  statusText: string;
  badgeText: string;
} {
  if (!partner.lastActiveAt) {
    return {
      isOnline: true,
      statusText: 'В сети',
      badgeText: 'В сети',
    };
  }

  try {
    const last = new Date(partner.lastActiveAt);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - last.getTime());
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const isFemale = partner.gender === 'female';

    if (diffSecs < 60) {
      return {
        isOnline: true,
        statusText: 'В сети',
        badgeText: 'В сети',
      };
    }

    if (diffMins < 60) {
      const displayMins = Math.max(1, diffMins);
      return {
        isOnline: false,
        statusText: `${isFemale ? 'Была' : 'Был'} ${displayMins} мин назад`,
        badgeText: `${displayMins}м назад`,
      };
    }

    const isToday = last.toDateString() === now.toDateString();
    const time = last.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return {
        isOnline: false,
        statusText: `${isFemale ? 'Была' : 'Был'} сегодня в ${time}`,
        badgeText: time,
      };
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (last.toDateString() === yesterday.toDateString()) {
      return {
        isOnline: false,
        statusText: `${isFemale ? 'Была' : 'Был'} вчера в ${time}`,
        badgeText: 'Вчера',
      };
    }

    return {
      isOnline: false,
      statusText: 'Был(а) недавно',
      badgeText: 'На связи',
    };
  } catch {
    return {
      isOnline: true,
      statusText: 'На связи в Loop',
      badgeText: 'В сети',
    };
  }
}

interface PartnerStatusCardProps {
  isPaired: boolean;
  partnerName: string;
  safeOtherPartner: any;
  partnerStatusInfo: {
    isOnline: boolean;
    statusText: string;
    badgeText: string;
  };
  coupleStartDate?: string;
  onOpenDetails: () => void;
  onGoToProfile: () => void;
}

export const PartnerStatusCard: React.FC<PartnerStatusCardProps> = ({
  isPaired,
  partnerName,
  safeOtherPartner,
  partnerStatusInfo,
  coupleStartDate,
  onOpenDetails,
  onGoToProfile,
}) => {
  if (!isPaired) {
    return (
      <section
        id="block-1-partner-status-empty"
        onClick={onGoToProfile}
        className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--divider)] shadow-xs flex items-center justify-between gap-3 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)] cursor-pointer group select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="font-bold text-sm sm:text-base text-[var(--text)] leading-tight">Пара не создана</div>
            <div className="text-xs sm:text-sm text-[var(--text-2)] font-medium">
              Свяжите аккаунты, чтобы объединить тесты и аналитику
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5 shrink-0" />
      </section>
    );
  }

  return (
    <section
      id="block-1-partner-status"
      onClick={onOpenDetails}
      className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs flex items-center justify-between gap-3 transition-all hover:border-[var(--accent)]/40 cursor-pointer group select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Partner Avatar with Online Indicator */}
        <div className="relative shrink-0">
          <ColoredAvatar avatar={safeOtherPartner.avatar || 'heart'} name={partnerName} size="md" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[var(--surface-solid)] ${
              partnerStatusInfo.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
            }`}
          />
        </div>

        {/* Partner Name, Online Status, Mood & Days Together */}
        <div className="min-w-0 flex-1 space-y-0.5">
          {/* Line 1: Name + Online Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm sm:text-base text-[var(--text)] leading-tight">{partnerName}</span>
            <span className="text-[var(--text-3)] text-xs font-normal">•</span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-2)] font-medium">
              <span
                className={`w-1.5 h-1.5 rounded-full ${partnerStatusInfo.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`}
              />
              <span className={partnerStatusInfo.isOnline ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>
                {partnerStatusInfo.statusText}
              </span>
            </span>
          </div>

          {/* Line 2: Mood */}
          <div className="text-xs text-[var(--text-2)] flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[var(--accent)] font-semibold">Настроение:</span>
            <span className="text-[var(--text)] font-medium">
              {safeOtherPartner.currentMood?.label || 'Спокойствие'}
            </span>
          </div>

          {/* Line 3: Days Together */}
          <div className="text-[11px] sm:text-xs text-[var(--text-2)] flex items-center gap-1.5 font-normal">
            <span className="text-[var(--text)] font-medium">{formatDaysTogetherDetailed(coupleStartDate)}</span>
          </div>
        </div>
      </div>

      {/* Tap Affordance */}
      <div className="flex items-center gap-1 text-xs font-semibold text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors shrink-0">
        <span className="hidden sm:inline">Подробнее</span>
        <ChevronRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5" />
      </div>
    </section>
  );
};
