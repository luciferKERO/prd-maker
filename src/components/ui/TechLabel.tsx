'use client';

import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'border-jarvis-cyan/30 text-jarvis-cyan shadow-[0_0_6px_rgba(56,189,248,0.15)]',
  success: 'border-jarvis-emerald/30 text-jarvis-emerald shadow-[0_0_6px_rgba(16,185,129,0.15)]',
  warning: 'border-jarvis-amber/30 text-jarvis-amber shadow-[0_0_6px_rgba(245,158,11,0.15)]',
  error: 'border-jarvis-rose/30 text-jarvis-rose shadow-[0_0_6px_rgba(244,63,94,0.15)]',
  info: 'border-jarvis-blue/30 text-jarvis-blue shadow-[0_0_6px_rgba(59,130,246,0.15)]',
} as const;

const sizeStyles = {
  xs: 'text-[9px] px-1.5 py-0.5 tracking-[0.15em]',
  sm: 'text-[10px] px-2 py-0.5 tracking-[0.12em]',
} as const;

interface TechLabelProps {
  text: string;
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  className?: string;
}

export function TechLabel({ text, variant = 'default', size = 'xs', className }: TechLabelProps) {
  return (
    <span
      className={cn(
        'inline-block font-mono uppercase border rounded-sm select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {text}
    </span>
  );
}
