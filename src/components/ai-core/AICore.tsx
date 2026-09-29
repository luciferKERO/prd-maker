'use client';

import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';
import { TechLabel } from '@/components/ui/TechLabel';

export type AICoreStatus =
  | 'idle'
  | 'listening'
  | 'analyzing'
  | 'thinking'
  | 'asking'
  | 'updating'
  | 'warning'
  | 'complete'
  | 'error';

interface AICoreProps {
  status?: AICoreStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  customLabel?: string;
}

const sizeConfig = {
  sm: {
    container: 'w-40 h-40',
    orb: 'w-10 h-10',
    svgSize: 160,
    fontSize: 'text-[7px]',
  },
  md: {
    container: 'w-60 h-60',
    orb: 'w-16 h-16',
    svgSize: 240,
    fontSize: 'text-[8px]',
  },
  lg: {
    container: 'w-80 h-80',
    orb: 'w-24 h-24',
    svgSize: 320,
    fontSize: 'text-[9px]',
  },
} as const;

const statusConfig: Record<
  AICoreStatus,
  {
    label: string;
    techVariant: 'default' | 'success' | 'warning' | 'error' | 'info';
    color: string;
    orbGlow: string;
    ringSpeedMultiplier: number;
    animateState: string;
  }
> = {
  idle: {
    label: 'PRD ARCHITECT — ONLINE',
    techVariant: 'default',
    color: '#38bdf8',
    orbGlow: 'rgba(56, 189, 248, 0.4)',
    ringSpeedMultiplier: 1,
    animateState: 'animate-pulse-slow',
  },
  listening: {
    label: 'AWAITING INPUT...',
    techVariant: 'info',
    color: '#38bdf8',
    orbGlow: 'rgba(56, 189, 248, 0.7)',
    ringSpeedMultiplier: 1.2,
    animateState: 'animate-pulse',
  },
  analyzing: {
    label: 'ANALYZING PROJECT...',
    techVariant: 'default',
    color: '#38bdf8',
    orbGlow: 'rgba(56, 189, 248, 0.8)',
    ringSpeedMultiplier: 2.5,
    animateState: 'animate-spin-slow',
  },
  thinking: {
    label: 'SYNTHESIZING KNOWLEDGE...',
    techVariant: 'info',
    color: '#14b8a6',
    orbGlow: 'rgba(20, 184, 166, 0.6)',
    ringSpeedMultiplier: 0.8,
    animateState: 'animate-pulse',
  },
  asking: {
    label: 'QUESTION PENDING',
    techVariant: 'default',
    color: '#38bdf8',
    orbGlow: 'rgba(56, 189, 248, 0.9)',
    ringSpeedMultiplier: 0.1,
    animateState: '',
  },
  updating: {
    label: 'UPDATING PRD GRAPH...',
    techVariant: 'info',
    color: '#8b5cf6',
    orbGlow: 'rgba(139, 92, 246, 0.7)',
    ringSpeedMultiplier: 1.8,
    animateState: 'animate-ping-slow',
  },
  warning: {
    label: 'CONFLICT DETECTED',
    techVariant: 'warning',
    color: '#f59e0b',
    orbGlow: 'rgba(245, 158, 11, 0.6)',
    ringSpeedMultiplier: 1.4,
    animateState: 'animate-pulse',
  },
  complete: {
    label: 'SPECIFICATION COMPLETE',
    techVariant: 'success',
    color: '#10b981',
    orbGlow: 'rgba(16, 185, 129, 0.6)',
    ringSpeedMultiplier: 0.2,
    animateState: '',
  },
  error: {
    label: 'SYSTEM ANOMALY',
    techVariant: 'error',
    color: '#f43f5e',
    orbGlow: 'rgba(244, 63, 94, 0.8)',
    ringSpeedMultiplier: 1.5,
    animateState: 'animate-bounce',
  },
};

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function AICore({
  status = 'idle',
  size = 'md',
  className,
  customLabel,
}: AICoreProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const cfg = statusConfig[status];
  const sz = sizeConfig[size];
  const half = sz.svgSize / 2;

  // Ring radii scaled to svgSize
  const r1 = half * 0.90; // outer ring
  const r2 = half * 0.72; // middle ring
  const r3 = half * 0.54; // inner ring
  const r4 = half * 0.36; // core boundary ring

  const speedMult = reducedMotion ? 0.001 : cfg.ringSpeedMultiplier;

  return (
    <div className={cn('flex flex-col items-center justify-center select-none', className)}>
      <div className={cn('relative flex items-center justify-center', sz.container)}>
        {/* Ambient background glow */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: cfg.color }}
        />

        {/* Outer Ripple effect for 'listening' or 'updating' status */}
        {(status === 'listening' || status === 'updating') && !reducedMotion && (
          <div
            className="absolute inset-4 rounded-full border border-jarvis-cyan/30 animate-ping-slow pointer-events-none"
            style={{ borderColor: cfg.color }}
          />
        )}

        {/* Central Pulsing Orb */}
        <div
          className={cn(
            'absolute rounded-full z-10 flex items-center justify-center transition-all duration-500',
            sz.orb,
            !reducedMotion && cfg.animateState
          )}
          style={{
            background: `radial-gradient(circle, ${cfg.color} 0%, rgba(6,8,19,0.85) 80%)`,
            boxShadow: `0 0 25px ${cfg.orbGlow}, inset 0 0 15px ${cfg.color}`,
            border: `1px solid ${cfg.color}80`,
          }}
        >
          {/* Inner core dot */}
          <div
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: cfg.color, color: cfg.color }}
          />
        </div>

        {/* SVG Concentric Rings & Nodes */}
        <svg
          width={sz.svgSize}
          height={sz.svgSize}
          viewBox={`0 0 ${sz.svgSize} ${sz.svgSize}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            {/* Glowing filter */}
            <filter id={`core-glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ring 1: Outer segmented ring with clockwise rotation */}
          <g
            style={{
              transformOrigin: `${half}px ${half}px`,
              animation: reducedMotion ? 'none' : `spin ${24 / speedMult}s linear infinite`,
            }}
          >
            <circle
              cx={half}
              cy={half}
              r={r1}
              fill="none"
              stroke={cfg.color}
              strokeWidth="1.2"
              strokeDasharray="4 8 20 6 35 12"
              strokeOpacity="0.45"
            />
            {/* Orbital dot 1 */}
            <circle
              cx={half + r1}
              cy={half}
              r="2.5"
              fill={cfg.color}
              filter={`url(#core-glow-${size})`}
            />
            <circle
              cx={half - r1}
              cy={half}
              r="1.8"
              fill={cfg.color}
              opacity="0.8"
            />
          </g>

          {/* Ring 2: Counter-clockwise middle ring */}
          <g
            style={{
              transformOrigin: `${half}px ${half}px`,
              animation: reducedMotion ? 'none' : `spin-rev ${18 / speedMult}s linear infinite`,
            }}
          >
            <circle
              cx={half}
              cy={half}
              r={r2}
              fill="none"
              stroke={cfg.color}
              strokeWidth="1"
              strokeDasharray="12 18 30 10 4 14"
              strokeOpacity="0.35"
            />
            {/* Orbital dot 2 */}
            <circle
              cx={half}
              cy={half - r2}
              r="2"
              fill={cfg.color}
              filter={`url(#core-glow-${size})`}
            />
          </g>

          {/* Ring 3: Fast clockwise inner ring */}
          <g
            style={{
              transformOrigin: `${half}px ${half}px`,
              animation: reducedMotion ? 'none' : `spin ${12 / speedMult}s linear infinite`,
            }}
          >
            <circle
              cx={half}
              cy={half}
              r={r3}
              fill="none"
              stroke={cfg.color}
              strokeWidth="1.2"
              strokeDasharray="18 6 6 6 45 10"
              strokeOpacity="0.5"
            />
            {/* Orbital dot 3 */}
            <circle
              cx={half + r3 * 0.707}
              cy={half + r3 * 0.707}
              r="2.2"
              fill={cfg.color}
              filter={`url(#core-glow-${size})`}
            />
          </g>

          {/* Ring 4: Innermost boundary ring with subtle tick marks */}
          <g
            style={{
              transformOrigin: `${half}px ${half}px`,
              animation: reducedMotion ? 'none' : `spin-rev ${30 / speedMult}s linear infinite`,
            }}
          >
            <circle
              cx={half}
              cy={half}
              r={r4}
              fill="none"
              stroke={cfg.color}
              strokeWidth="1"
              strokeDasharray="2 6"
              strokeOpacity="0.4"
            />
          </g>
        </svg>

        {/* Technical Labels placed on quadrant perimeter */}
        <div
          className={cn(
            'absolute font-mono tracking-widest text-jarvis-cyan/60 pointer-events-none uppercase',
            sz.fontSize,
            'top-1 left-1'
          )}
        >
          ANALYSIS
        </div>
        <div
          className={cn(
            'absolute font-mono tracking-widest text-jarvis-cyan/60 pointer-events-none uppercase',
            sz.fontSize,
            'top-1 right-1'
          )}
        >
          DISCOVERY
        </div>
        <div
          className={cn(
            'absolute font-mono tracking-widest text-jarvis-cyan/60 pointer-events-none uppercase',
            sz.fontSize,
            'bottom-1 left-1'
          )}
        >
          MAPPING
        </div>
        <div
          className={cn(
            'absolute font-mono tracking-widest text-jarvis-cyan/60 pointer-events-none uppercase',
            sz.fontSize,
            'bottom-1 right-1'
          )}
        >
          NEURAL
        </div>
      </div>

      {/* Status Label Display */}
      <div className="mt-4 flex items-center space-x-2">
        <TechLabel
          text={customLabel || cfg.label}
          variant={cfg.techVariant}
          size={size === 'lg' ? 'sm' : 'xs'}
        />
      </div>
    </div>
  );
}
