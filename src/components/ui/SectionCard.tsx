import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface SectionCardProps {
  id?: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SectionCard({ id, title, icon, children, action, className = '', delay = 0 }: SectionCardProps) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.section
      id={id}
      aria-labelledby={id ? `\${id}-title` : undefined}
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : delay, ease: 'easeOut' }}
      className={`app-card p-4 sm:p-5 relative overflow-hidden \${className}`}
    >
      {(title || icon || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <div className="text-[var(--accent)]">{icon}</div>}
            {title && (
              <h2 id={id ? `\${id}-title` : undefined} className="text-sm sm:text-base font-semibold text-[var(--text)]">
                {title}
              </h2>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </motion.section>
  );
}
