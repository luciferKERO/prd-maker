'use client';

import { useEffect, useRef } from 'react';
import {
  FolderPlus,
  HelpCircle,
  CheckCircle2,
  FileText,
  AlertTriangle,
  GitBranch,
  Lightbulb,
  Download,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Terminal,
} from 'lucide-react';
import type { ActivityEvent } from '@/types/ai';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  events: ActivityEvent[];
  className?: string;
  maxVisible?: number;
}

function getEventConfig(type: string) {
  switch (type) {
    case 'project_created':
      return {
        icon: FolderPlus,
        color: 'text-jarvis-cyan',
        bg: 'bg-jarvis-cyan/15',
        border: 'border-jarvis-cyan/30',
        label: 'PROJECT INIT',
      };
    case 'question_answered':
      return {
        icon: HelpCircle,
        color: 'text-jarvis-cyan',
        bg: 'bg-jarvis-cyan/15',
        border: 'border-jarvis-cyan/30',
        label: 'DISCOVERY',
      };
    case 'requirement_added':
      return {
        icon: CheckCircle2,
        color: 'text-jarvis-emerald',
        bg: 'bg-jarvis-emerald/15',
        border: 'border-jarvis-emerald/30',
        label: 'REQ CREATED',
      };
    case 'requirement_updated':
      return {
        icon: RefreshCw,
        color: 'text-jarvis-blue',
        bg: 'bg-jarvis-blue/15',
        border: 'border-jarvis-blue/30',
        label: 'REQ UPDATED',
      };
    case 'assumption_created':
      return {
        icon: Lightbulb,
        color: 'text-jarvis-amber',
        bg: 'bg-jarvis-amber/15',
        border: 'border-jarvis-amber/30',
        label: 'ASSUMPTION',
      };
    case 'assumption_confirmed':
      return {
        icon: CheckCircle2,
        color: 'text-jarvis-emerald',
        bg: 'bg-jarvis-emerald/15',
        border: 'border-jarvis-emerald/30',
        label: 'CONFIRMED',
      };
    case 'conflict_detected':
      return {
        icon: AlertTriangle,
        color: 'text-jarvis-rose',
        bg: 'bg-jarvis-rose/15',
        border: 'border-jarvis-rose/30',
        label: 'CONFLICT',
      };
    case 'dependency_added':
      return {
        icon: GitBranch,
        color: 'text-jarvis-violet',
        bg: 'bg-jarvis-violet/15',
        border: 'border-jarvis-violet/30',
        label: 'DEPENDENCY',
      };
    case 'prd_updated':
      return {
        icon: FileText,
        color: 'text-jarvis-cyan',
        bg: 'bg-jarvis-cyan/15',
        border: 'border-jarvis-cyan/30',
        label: 'PRD SYNC',
      };
    case 'export_completed':
      return {
        icon: Download,
        color: 'text-jarvis-emerald',
        bg: 'bg-jarvis-emerald/15',
        border: 'border-jarvis-emerald/30',
        label: 'EXPORT',
      };
    case 'error':
      return {
        icon: AlertCircle,
        color: 'text-jarvis-rose',
        bg: 'bg-jarvis-rose/15',
        border: 'border-jarvis-rose/30',
        label: 'SYSTEM ERROR',
      };
    default:
      return {
        icon: Sparkles,
        color: 'text-slate-300',
        bg: 'bg-slate-700/20',
        border: 'border-slate-700',
        label: 'SYSTEM LOG',
      };
  }
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ActivityFeed({
  events,
  className,
}: ActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest event when events update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div
      className={cn(
        'hud-panel p-3 rounded-lg border border-jarvis-border flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-jarvis-border/60">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-jarvis-cyan" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            System Activity Log
          </span>
        </div>
        <span className="font-mono text-[10px] text-jarvis-cyan/70 bg-jarvis-cyan/10 px-1.5 py-0.5 rounded border border-jarvis-cyan/20">
          LIVE FEED ({events.length})
        </span>
      </div>

      {/* Events List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-72 min-h-[160px]"
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-slate-500 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-slate-600 animate-ping mb-2" />
            <span>Awaiting system operations...</span>
          </div>
        ) : (
          events.map((event) => {
            const config = getEventConfig(event.type);
            const Icon = config.icon;
            return (
              <div
                key={event.id}
                className={cn(
                  'p-2 rounded border transition-all duration-200 flex items-start gap-2.5',
                  'bg-black/30 border-jarvis-border/50 hover:border-jarvis-border hover:bg-black/40'
                )}
              >
                {/* Event Icon */}
                <div
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center shrink-0 border mt-0.5',
                    config.bg,
                    config.border,
                    config.color
                  )}
                >
                  <Icon size={12} />
                </div>

                {/* Event Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        'text-[9px] font-mono uppercase tracking-wider font-semibold',
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-snug mt-0.5 break-words">
                    {event.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
