import React from 'react';
import { motion } from 'motion/react';

interface ActionRowProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ActionRow({ icon, title, subtitle, action, onClick, className = '' }: ActionRowProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] \${onClick ? 'cursor-pointer hover:bg-[var(--surface-3)] transition-colors active:scale-[0.98]' : ''} \${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
            {icon}
          </div>
        )}
        <div>
          <div className="text-sm font-semibold text-[var(--text)]">{title}</div>
          {subtitle && <div className="text-xs text-[var(--text-2)] font-medium mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
