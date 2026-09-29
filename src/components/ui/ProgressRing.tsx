'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 4,
  color,
  className,
  showLabel = true,
}: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  // Determine color from value if not explicitly set
  const resolvedColor =
    color ?? (value > 80 ? '#10b981' : value > 50 ? '#f59e0b' : '#f43f5e');

  useEffect(() => {
    // Animate from current to target
    const timer = requestAnimationFrame(() => setAnimatedValue(value));
    return () => cancelAnimationFrame(timer);
  }, [value]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(56, 189, 248, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute font-mono text-sm font-bold"
          style={{ color: resolvedColor }}
        >
          {Math.round(animatedValue)}%
        </span>
      )}
    </div>
  );
}
