'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HudPanelProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function HudPanel({
  title,
  className,
  children,
  collapsible = false,
  defaultOpen = true,
}: HudPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('hud-panel rounded-md', className)}>
      {/* Extra corner markers (top-right, bottom-left) */}
      <span className="absolute top-0 right-0 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-jarvis-cyan pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-jarvis-cyan pointer-events-none" />

      {title && (
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2 border-b border-jarvis-border',
            collapsible && 'cursor-pointer select-none'
          )}
          onClick={() => collapsible && setOpen(!open)}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-jarvis-cyan">
            {title}
          </span>
          {collapsible && (
            <span className="text-jarvis-cyan/60">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          )}
        </div>
      )}

      {(!collapsible || open) && (
        <div className="p-3">{children}</div>
      )}
    </div>
  );
}
