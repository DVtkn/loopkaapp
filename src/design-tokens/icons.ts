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

export const COLOR_CLASSES: Record<
  IconColorTheme,
  { bg: string; text: string; ring: string; glow: string; gradient: string; from: string; to: string }
> = {
  rose: {
    from: '#FF3B4E',
    to: '#FF5A6E',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-[#FF3B4E] dark:text-[#FF5A6E]',
    ring: 'border-rose-500/20 dark:border-rose-500/30',
    glow: 'rgba(255, 59, 78, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,59,78,0.25)] text-white',
  },
  coral: {
    from: '#FF3B4E',
    to: '#FF7582',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-[#FF3B4E] dark:text-[#FF7582]',
    ring: 'border-rose-500/20 dark:border-rose-500/30',
    glow: 'rgba(255, 59, 78, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,59,78,0.25)] text-white',
  },
  amber: {
    from: '#FF8A50',
    to: '#FFA364',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'border-amber-500/20 dark:border-amber-500/30',
    glow: 'rgba(255, 138, 80, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,138,80,0.25)] text-white',
  },
  gold: {
    from: '#FF9E40',
    to: '#FFB86B',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'border-amber-500/20 dark:border-amber-500/30',
    glow: 'rgba(255, 158, 64, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,158,64,0.25)] text-white',
  },
  emerald: {
    from: '#2FB86F',
    to: '#239358',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'border-emerald-500/20 dark:border-emerald-500/30',
    glow: 'rgba(47, 184, 111, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(47,184,111,0.25)] text-white',
  },
  teal: {
    from: '#2FB86F',
    to: '#20834E',
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
    text: 'text-teal-600 dark:text-teal-400',
    ring: 'border-teal-500/20 dark:border-teal-500/30',
    glow: 'rgba(47, 184, 111, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(47,184,111,0.25)] text-white',
  },
  cyan: {
    from: '#FF4D6D',
    to: '#C9184A',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-[#FF4D6D] dark:text-[#FF758F]',
    ring: 'border-rose-500/20 dark:border-rose-500/30',
    glow: 'rgba(255, 77, 109, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,77,109,0.25)] text-white',
  },
  blue: {
    from: '#FF4D6D',
    to: '#C9184A',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-[#FF4D6D] dark:text-[#FF758F]',
    ring: 'border-rose-500/20 dark:border-rose-500/30',
    glow: 'rgba(255, 77, 109, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,77,109,0.25)] text-white',
  },
  indigo: {
    from: '#E02A3C',
    to: '#FF4558',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-[#E02A3C] dark:text-[#FF5A6E]',
    ring: 'border-rose-500/20 dark:border-rose-500/30',
    glow: 'rgba(224, 42, 60, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(224,42,60,0.25)] text-white',
  },
  purple: {
    from: '#FF5E7E',
    to: '#E63956',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-[#FF5E7E] dark:text-[#FF758F]',
    ring: 'border-rose-500/20 dark:border-rose-500/30',
    glow: 'rgba(255, 94, 126, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,94,126,0.25)] text-white',
  },
  fuchsia: {
    from: '#FF5E7E',
    to: '#C9184A',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-[#FF5E7E] dark:text-[#FF758F]',
    ring: 'border-rose-500/20 dark:border-rose-500/30',
    glow: 'rgba(255, 94, 126, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,94,126,0.25)] text-white',
  },
  slate: {
    from: '#786F72',
    to: '#4A4346',
    bg: 'bg-stone-500/10 dark:bg-stone-500/15',
    text: 'text-stone-600 dark:text-stone-300',
    ring: 'border-stone-500/20 dark:border-stone-500/30',
    glow: 'rgba(120, 111, 114, 0.35)',
    gradient: 'shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_12px_rgba(120,111,114,0.25)] text-white',
  },
};

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
  if (s.includes('inspire') || s.includes('вдохнов') || s.includes('предвкуш') || s.includes('ожидан') || s.includes('✨') || s.includes('творч')) {
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
  if (s.includes('energy') || s.includes('энерг') || s.includes('радост') || s.includes('счаст') || s.includes('весел') || s.includes('🔥') || s.includes('драйв') || s.includes('огонь')) {
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

export interface LoveTapMeta {
  type: 'thinking' | 'miss' | 'support' | 'proud' | 'grateful' | 'talk';
  label: string;
  color: IconColorTheme;
  icon: React.ElementType;
}

export const LOVE_TAP_PRESETS: LoveTapMeta[] = [
  { type: 'thinking', label: 'Думаю', color: 'amber', icon: Lightbulb },
  { type: 'miss', label: 'Скучаю', color: 'blue', icon: Clock },
  { type: 'support', label: 'Поддержка', color: 'rose', icon: HeartHandshake },
  { type: 'proud', label: 'Горжусь', color: 'indigo', icon: Award },
  { type: 'grateful', label: 'Ценю', color: 'emerald', icon: Heart },
  { type: 'talk', label: 'Поговорить', color: 'purple', icon: MessageCircle },
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
