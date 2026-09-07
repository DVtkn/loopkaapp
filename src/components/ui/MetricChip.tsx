import React from 'react';

interface MetricChipProps {
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success';
}

export function MetricChip({ label, value, icon, variant = 'secondary' }: MetricChipProps) {
  const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs border";
  
  let variantClasses = "";
  if (variant === 'primary') variantClasses = "bg-[var(--text)] text-[var(--bg)] border-[var(--text)]";
  else if (variant === 'secondary') variantClasses = "bg-[var(--surface-2)] text-[var(--text)] border-[var(--divider)]";
  else if (variant === 'accent') variantClasses = "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/20";
  else if (variant === 'success') variantClasses = "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";

  return (
    <div className={`\${baseClasses} \${variantClasses}`}>
      {icon}
      <span>{label}</span>
      {value !== undefined && <span className="opacity-80">{value}</span>}
    </div>
  );
}
