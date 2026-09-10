import React from 'react';
import { Sparkles } from 'lucide-react';
import {
  ICON_NAME_MAP,
  IconColorTheme,
  COLOR_CLASSES,
  MoodMeta,
  MOOD_PRESETS,
  getMoodMeta,
  LoveTapMeta,
  LOVE_TAP_PRESETS,
  getLoveTapMeta,
  DateCategoryMeta,
  DATE_CATEGORIES,
  getDateCategoryMeta,
  AvatarProfileMeta,
  AVATAR_PROFILES,
  getAvatarProfileMeta,
} from '../design-tokens/icons.ts';

// Re-export design tokens for backwards compatibility
export {
  ICON_NAME_MAP,
  COLOR_CLASSES,
  MOOD_PRESETS,
  getMoodMeta,
  LOVE_TAP_PRESETS,
  getLoveTapMeta,
  DATE_CATEGORIES,
  getDateCategoryMeta,
  AVATAR_PROFILES,
  getAvatarProfileMeta,
};
export type { IconColorTheme, MoodMeta, LoveTapMeta, DateCategoryMeta, AvatarProfileMeta };

export interface ColoredIconProps {
  icon?: React.ElementType;
  name?: string;
  color?: IconColorTheme;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'subtle' | 'solid' | 'ghost' | 'glow' | 'ios';
  className?: string;
  iconClassName?: string;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6 rounded-lg', icon: 'w-3.5 h-3.5' },
  sm: { box: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4' },
  md: { box: 'w-11 h-11 rounded-2xl', icon: 'w-5 h-5' },
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

  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 transition-transform ${sizeCfg.box} text-white shadow-xs ${className}`}
      style={{
        background: `linear-gradient(135deg, ${pal.from}, ${pal.to})`,
        boxShadow: `inset 0 1px 1.5px rgba(255,255,255,0.45), 0 3px 10px ${pal.glow}`,
      }}
    >
      <IconComponent className={`${sizeCfg.icon} text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] ${iconClassName}`} />
    </div>
  );
};

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
      : 'w-11 h-11';

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
