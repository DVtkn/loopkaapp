import React from 'react';
import {
  Heart,
  Sparkles,
  Flame,
  Coffee,
  Leaf,
  Sun,
  Moon,
  BatteryLow,
  Target,
  Shield,
  ShieldCheck,
  Trophy,
  Award,
  Crown,
  Utensils,
  Wine,
  Trees,
  Footprints,
  Film,
  Compass,
  Zap,
  Smile,
  Activity,
  Gift,
  Bot,
  MessageCircle,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  Lightbulb,
  PartyPopper,
  Bookmark,
  Users,
  User,
  HeartHandshake,
  Star,
  Layers,
  TrendingUp,
  MapPin,
} from 'lucide-react';

// Icon string map
export const ICON_NAME_MAP: Record<string, React.ElementType> = {
  Heart,
  Sparkles,
  Flame,
  Coffee,
  Leaf,
  Sun,
  Moon,
  BatteryLow,
  Target,
  Shield,
  ShieldCheck,
  Trophy,
  Award,
  Crown,
  Utensils,
  Wine,
  Trees,
  Footprints,
  Film,
  Compass,
  Zap,
  Smile,
  Activity,
  Gift,
  Bot,
  MessageCircle,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  Lightbulb,
  PartyPopper,
  Bookmark,
  Users,
  User,
  HeartHandshake,
  Star,
  Layers,
  TrendingUp,
  MapPin,
};

// ==========================================
// 1. Color Palettes for Icons
// ==========================================
export type IconColorTheme =
  | 'rose'
  | 'coral'
  | 'amber'
  | 'gold'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'fuchsia'
  | 'slate';

const COLOR_CLASSES: Record<IconColorTheme, { bg: string; text: string; ring: string; glow: string }> = {
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-500 dark:text-rose-400',
    ring: 'border-rose-500/20 dark:border-rose-500/30',
    glow: 'rgba(244, 63, 94, 0.25)',
  },
  coral: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/15',
    text: 'text-orange-500 dark:text-orange-400',
    ring: 'border-orange-500/20 dark:border-orange-500/30',
    glow: 'rgba(249, 115, 22, 0.25)',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-500 dark:text-amber-400',
    ring: 'border-amber-500/20 dark:border-amber-500/30',
    glow: 'rgba(245, 158, 11, 0.25)',
  },
  gold: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/15',
    text: 'text-yellow-600 dark:text-yellow-400',
    ring: 'border-yellow-500/20 dark:border-yellow-500/30',
    glow: 'rgba(234, 179, 8, 0.25)',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-500 dark:text-emerald-400',
    ring: 'border-emerald-500/20 dark:border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.25)',
  },
  teal: {
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
    text: 'text-teal-500 dark:text-teal-400',
    ring: 'border-teal-500/20 dark:border-teal-500/30',
    glow: 'rgba(20, 184, 166, 0.25)',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-500 dark:text-cyan-400',
    ring: 'border-cyan-500/20 dark:border-cyan-500/30',
    glow: 'rgba(6, 182, 212, 0.25)',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-500 dark:text-blue-400',
    ring: 'border-blue-500/20 dark:border-blue-500/30',
    glow: 'rgba(59, 130, 246, 0.25)',
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-500 dark:text-indigo-400',
    ring: 'border-indigo-500/20 dark:border-indigo-500/30',
    glow: 'rgba(99, 102, 241, 0.25)',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-500 dark:text-purple-400',
    ring: 'border-purple-500/20 dark:border-purple-500/30',
    glow: 'rgba(168, 85, 247, 0.25)',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/15',
    text: 'text-fuchsia-500 dark:text-fuchsia-400',
    ring: 'border-fuchsia-500/20 dark:border-fuchsia-500/30',
    glow: 'rgba(217, 70, 239, 0.25)',
  },
  slate: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-500 dark:text-slate-400',
    ring: 'border-slate-500/20 dark:border-slate-500/30',
    glow: 'rgba(100, 116, 139, 0.25)',
  },
};

// ==========================================
// 2. Moods & Definitions
// ==========================================
export interface MoodMeta {
  key: string;
  label: string;
  color: IconColorTheme;
  icon: React.ElementType;
}

export const MOOD_PRESETS: MoodMeta[] = [
  { key: 'calm', label: 'Спокойствие', color: 'emerald', icon: Leaf },
  { key: 'inspire', label: 'Вдохновение', color: 'indigo', icon: Sparkles },
  { key: 'tender', label: 'Нежность', color: 'rose', icon: Heart },
  { key: 'cozy', label: 'Уют', color: 'amber', icon: Coffee },
  { key: 'tired', label: 'Усталость', color: 'slate', icon: BatteryLow },
  { key: 'energy', label: 'Энергия', color: 'coral', icon: Flame },
  { key: 'romance', label: 'Романтика', color: 'fuchsia', icon: HeartHandshake },
  { key: 'focus', label: 'Мотивация', color: 'blue', icon: Target },
];

export function getMoodMeta(keyOrEmojiOrLabel?: string): MoodMeta {
  if (!keyOrEmojiOrLabel) return MOOD_PRESETS[0];
  const s = keyOrEmojiOrLabel.toLowerCase();

  if (s.includes('calm') || s.includes('спокой') || s.includes('🌿') || s.includes('тиш') || s.includes('мир')) {
    return MOOD_PRESETS[0];
  }
  if (s.includes('inspire') || s.includes('вдохнов') || s.includes('✨') || s.includes('творч')) {
    return MOOD_PRESETS[1];
  }
  if (s.includes('tender') || s.includes('нежн') || s.includes('💕') || s.includes('люб')) {
    return MOOD_PRESETS[2];
  }
  if (s.includes('cozy') || s.includes('уют') || s.includes('☕') || s.includes('тепл') || s.includes('дом')) {
    return MOOD_PRESETS[3];
  }
  if (s.includes('tired') || s.includes('устал') || s.includes('🔋') || s.includes('сон') || s.includes('отдых')) {
    return MOOD_PRESETS[4];
  }
  if (s.includes('energy') || s.includes('энерг') || s.includes('🔥') || s.includes('драйв') || s.includes('огонь')) {
    return MOOD_PRESETS[5];
  }
  if (s.includes('romance') || s.includes('романт') || s.includes('🥰') || s.includes('страст')) {
    return MOOD_PRESETS[6];
  }
  if (s.includes('focus') || s.includes('мотив') || s.includes('🎯') || s.includes('цель') || s.includes('план')) {
    return MOOD_PRESETS[7];
  }

  return MOOD_PRESETS[0];
}

// ==========================================
// 3. Love Taps Definitions
// ==========================================
export interface LoveTapMeta {
  type: 'thinking' | 'miss' | 'support' | 'proud' | 'grateful' | 'talk';
  label: string;
  color: IconColorTheme;
  icon: React.ElementType;
}

export const LOVE_TAP_PRESETS: LoveTapMeta[] = [
  { type: 'thinking', label: 'Думаю о тебе', color: 'amber', icon: Lightbulb },
  { type: 'miss', label: 'Скучаю', color: 'blue', icon: Clock },
  { type: 'support', label: 'Нужна поддержка', color: 'rose', icon: HeartHandshake },
  { type: 'proud', label: 'Горжусь тобой', color: 'indigo', icon: Award },
  { type: 'grateful', label: 'Ценю тебя', color: 'emerald', icon: Heart },
  { type: 'talk', label: 'Хочу поговорить', color: 'purple', icon: MessageCircle },
];

export function getLoveTapMeta(typeOrEmoji: string): LoveTapMeta {
  const found = LOVE_TAP_PRESETS.find((t) => t.type === typeOrEmoji);
  if (found) return found;
  const s = (typeOrEmoji || '').toLowerCase();
  if (s.includes('think') || s.includes('дум')) return LOVE_TAP_PRESETS[0];
  if (s.includes('miss') || s.includes('скуч')) return LOVE_TAP_PRESETS[1];
  if (s.includes('support') || s.includes('подд')) return LOVE_TAP_PRESETS[2];
  if (s.includes('proud') || s.includes('горж')) return LOVE_TAP_PRESETS[3];
  if (s.includes('grate') || s.includes('цен') || s.includes('благ')) return LOVE_TAP_PRESETS[4];
  if (s.includes('talk') || s.includes('говор')) return LOVE_TAP_PRESETS[5];
  return LOVE_TAP_PRESETS[0];
}

// ==========================================
// 4. Date Categories Definitions
// ==========================================
export interface DateCategoryMeta {
  id: string;
  label: string;
  color: IconColorTheme;
  icon: React.ElementType;
}

export const DATE_CATEGORIES: DateCategoryMeta[] = [
  { id: 'restaurant', label: 'Ресторан', color: 'rose', icon: Utensils },
  { id: 'cafe', label: 'Кофейня', color: 'amber', icon: Coffee },
  { id: 'park', label: 'Парк / Прогулка', color: 'emerald', icon: Trees },
  { id: 'cinema', label: 'Кино / Театр', color: 'purple', icon: Film },
  { id: 'outdoor', label: 'Крыша / Панорама', color: 'blue', icon: Compass },
  { id: 'spa', label: 'СПА / Релакс', color: 'teal', icon: Sparkles },
  { id: 'other', label: 'Особенное', color: 'indigo', icon: Star },
];

export function getDateCategoryMeta(id?: string): DateCategoryMeta {
  const found = DATE_CATEGORIES.find((c) => c.id === id);
  return found || DATE_CATEGORIES[0];
}

// ==========================================
// 5. Avatar Profiles (No Emojis)
// ==========================================
export interface AvatarProfileMeta {
  id: string;
  label: string;
  color: IconColorTheme;
  icon: React.ElementType;
}

export const AVATAR_PROFILES: AvatarProfileMeta[] = [
  { id: 'heart', label: 'Сердце', color: 'rose', icon: Heart },
  { id: 'sparkles', label: 'Сияние', color: 'gold', icon: Sparkles },
  { id: 'leaf', label: 'Гармония', color: 'emerald', icon: Leaf },
  { id: 'flame', label: 'Огонь', color: 'coral', icon: Flame },
  { id: 'star', label: 'Звезда', color: 'indigo', icon: Star },
  { id: 'crown', label: 'Лидер', color: 'amber', icon: Crown },
  { id: 'sun', label: 'Солнце', color: 'gold', icon: Sun },
  { id: 'moon', label: 'Луна', color: 'purple', icon: Moon },
  { id: 'compass', label: 'Искатель', color: 'blue', icon: Compass },
  { id: 'shield', label: 'Опора', color: 'teal', icon: ShieldCheck },
];

export function getAvatarProfileMeta(avatarIdOrEmoji?: string): AvatarProfileMeta {
  if (!avatarIdOrEmoji) return AVATAR_PROFILES[0];
  const found = AVATAR_PROFILES.find((a) => a.id === avatarIdOrEmoji);
  if (found) return found;

  const s = avatarIdOrEmoji.toLowerCase();
  if (s.includes('🌿') || s.includes('leaf')) return AVATAR_PROFILES[2];
  if (s.includes('✨') || s.includes('spark')) return AVATAR_PROFILES[1];
  if (s.includes('🦊') || s.includes('flame') || s.includes('🔥')) return AVATAR_PROFILES[3];
  if (s.includes('🦁') || s.includes('sun') || s.includes('☀️')) return AVATAR_PROFILES[6];
  if (s.includes('🌸') || s.includes('heart') || s.includes('❤️') || s.includes('💕')) return AVATAR_PROFILES[0];
  if (s.includes('👑') || s.includes('crown')) return AVATAR_PROFILES[5];
  if (s.includes('💫') || s.includes('star')) return AVATAR_PROFILES[4];
  if (s.includes('🐱') || s.includes('moon') || s.includes('🌙')) return AVATAR_PROFILES[7];
  if (s.includes('☕') || s.includes('coffee')) return AVATAR_PROFILES[8];

  return AVATAR_PROFILES[0];
}

// ==========================================
// 6. Reusable Colored Icon Component
// ==========================================
export interface ColoredIconProps {
  icon?: React.ElementType;
  name?: string;
  color?: IconColorTheme;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'subtle' | 'solid' | 'ghost' | 'glow';
  className?: string;
  iconClassName?: string;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6 rounded-lg', icon: 'w-3.5 h-3.5' },
  sm: { box: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4' },
  md: { box: 'w-10 h-10 rounded-2xl', icon: 'w-5 h-5' },
  lg: { box: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6' },
  xl: { box: 'w-16 h-16 rounded-3xl', icon: 'w-8 h-8' },
};

export const ColoredIcon: React.FC<ColoredIconProps> = ({
  icon,
  name,
  color = 'rose',
  size = 'md',
  variant = 'subtle',
  className = '',
  iconClassName = '',
}) => {
  const IconComponent = icon || (name ? ICON_NAME_MAP[name] : undefined) || Sparkles;
  const pal = COLOR_CLASSES[color] || COLOR_CLASSES.rose;
  const sizeCfg = SIZE_MAP[size] || SIZE_MAP.md;

  if (variant === 'ghost') {
    return (
      <span className={`inline-flex items-center justify-center ${pal.text} ${className}`}>
        <IconComponent className={`${sizeCfg.icon} ${iconClassName}`} />
      </span>
    );
  }

  if (variant === 'solid') {
    return (
      <div
        className={`inline-flex items-center justify-center flex-shrink-0 text-white shadow-xs ${sizeCfg.box} ${className}`}
        style={{
          background: `linear-gradient(135deg, var(--tw-gradient-stops, #ff2d55), #e11d48)`,
        }}
      >
        <IconComponent className={`${sizeCfg.icon} ${iconClassName}`} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 border transition-transform ${sizeCfg.box} ${pal.bg} ${pal.text} ${pal.ring} ${className}`}
    >
      <IconComponent className={`${sizeCfg.icon} ${iconClassName}`} />
    </div>
  );
};

// ==========================================
// 7. Component: MoodBadge
// ==========================================
export const MoodBadge: React.FC<{
  mood?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}> = ({ mood, size = 'sm', showLabel = false, className = '' }) => {
  const meta = getMoodMeta(mood);
  const Icon = meta.icon;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <ColoredIcon icon={Icon} color={meta.color} size={size} />
      {showLabel && <span className="text-xs font-semibold text-[var(--text)]">{meta.label}</span>}
    </div>
  );
};

// ==========================================
// 8. Component: LoveTapBadge
// ==========================================
export const LoveTapBadge: React.FC<{
  type: LoveTapMeta['type'] | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}> = ({ type, size = 'sm', showLabel = false, className = '' }) => {
  const meta = getLoveTapMeta(type);
  const Icon = meta.icon;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <ColoredIcon icon={Icon} color={meta.color} size={size} />
      {showLabel && <span className="text-xs font-semibold text-[var(--text)]">{meta.label}</span>}
    </div>
  );
};

// ==========================================
// 9. Component: CategoryBadge
// ==========================================
export const CategoryBadge: React.FC<{
  categoryId?: string;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}> = ({ categoryId, size = 'xs', showLabel = false, className = '' }) => {
  const meta = getDateCategoryMeta(categoryId);
  const Icon = meta.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <ColoredIcon icon={Icon} color={meta.color} size={size} />
      {showLabel && <span className="text-xs font-medium text-[var(--text-secondary)]">{meta.label}</span>}
    </div>
  );
};

// ==========================================
// 10. Component: ColoredAvatar
// ==========================================
export const ColoredAvatar: React.FC<{
  avatar?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ avatar, name = '', size = 'md', className = '' }) => {
  const meta = getAvatarProfileMeta(avatar);
  const Icon = meta.icon;
  const pal = COLOR_CLASSES[meta.color];

  const sizeBox =
    size === 'sm'
      ? 'w-8 h-8 rounded-xl text-xs'
      : size === 'md'
      ? 'w-11 h-11 rounded-2xl text-sm'
      : size === 'lg'
      ? 'w-14 h-14 rounded-2xl text-base'
      : 'w-20 h-20 rounded-3xl text-xl';

  const iconSize =
    size === 'sm'
      ? 'w-4 h-4'
      : size === 'md'
      ? 'w-5 h-5'
      : size === 'lg'
      ? 'w-7 h-7'
      : 'w-10 h-10';

  // If avatar is an external image URL, render image
  if (avatar && (avatar.startsWith('http') || avatar.startsWith('/'))) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeBox} object-cover border border-[var(--divider)] shadow-xs ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 border transition-transform shadow-xs ${sizeBox} ${pal.bg} ${pal.text} ${pal.ring} ${className}`}
    >
      <Icon className={iconSize} />
    </div>
  );
};
