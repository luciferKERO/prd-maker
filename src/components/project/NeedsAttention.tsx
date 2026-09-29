'use client';

import { useMemo } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Clock,
  ShieldAlert,
  MessageSquareWarning,
  ChevronRight,
} from 'lucide-react';
import type { Project } from '@/types/project';
import { cn } from '@/lib/utils';

interface NeedsAttentionProps {
  project: Project;
  onItemClick?: (item: AttentionItem) => void;
  className?: string;
}

export interface AttentionItem {
  id: string;
  section: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  type: 'question' | 'assumption' | 'conflict' | 'decision' | 'optional';
}

const sectionConfig: Record<
  string,
  { label: string; icon: typeof AlertTriangle; borderColor: string; tagBg: string; tagText: string }
> = {
  CRITICAL: {
    label: 'PERTANYAAN KRITIS',
    icon: ShieldAlert,
    borderColor: 'border-l-jarvis-rose',
    tagBg: 'bg-jarvis-rose/15',
    tagText: 'text-jarvis-rose',
  },
  NEEDS_CLARIFICATION: {
    label: 'PERLU KLARIFIKASI',
    icon: HelpCircle,
    borderColor: 'border-l-jarvis-amber',
    tagBg: 'bg-jarvis-amber/15',
    tagText: 'text-jarvis-amber',
  },
  CONFLICT: {
    label: 'KONFLIK ARSITEKTUR',
    icon: AlertTriangle,
    borderColor: 'border-l-jarvis-rose',
    tagBg: 'bg-jarvis-rose/15',
    tagText: 'text-jarvis-rose',
  },
  DEFERRED: {
    label: 'KEPUTUSAN DITUNDA',
    icon: Clock,
    borderColor: 'border-l-jarvis-violet',
    tagBg: 'bg-jarvis-violet/15',
    tagText: 'text-jarvis-violet',
  },
  OPTIONAL: {
    label: 'ITEM OPSIONAL',
    icon: MessageSquareWarning,
    borderColor: 'border-l-slate-500',
    tagBg: 'bg-slate-700/30',
    tagText: 'text-slate-400',
  },
};

const priorityBadge: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'bg-jarvis-rose/20', text: 'text-jarvis-rose' },
  high: { bg: 'bg-jarvis-amber/20', text: 'text-jarvis-amber' },
  medium: { bg: 'bg-jarvis-cyan/20', text: 'text-jarvis-cyan' },
  low: { bg: 'bg-slate-700/40', text: 'text-slate-400' },
};

export function NeedsAttention({
  project,
  onItemClick,
  className,
}: NeedsAttentionProps) {
  const groupedItems = useMemo(() => {
    const groups: Record<string, AttentionItem[]> = {
      CRITICAL: [],
      NEEDS_CLARIFICATION: [],
      CONFLICT: [],
      DEFERRED: [],
      OPTIONAL: [],
    };

    // Critical & high priority pending questions
    for (const q of project.questions || []) {
      if (q.status !== 'pending') continue;
      if (q.priority === 'critical' || (q.priority === 'high' && q.blocking)) {
        groups.CRITICAL.push({
          id: q.id,
          section: 'CRITICAL',
          priority: q.priority as 'critical' | 'high',
          description: q.title,
          type: 'question',
        });
      } else if (q.priority === 'optional' || q.priority === 'low') {
        groups.OPTIONAL.push({
          id: q.id,
          section: 'OPTIONAL',
          priority: q.priority as 'low',
          description: q.title,
          type: 'optional',
        });
      }
    }

    // Assumptions needing clarification
    for (const a of project.assumptions || []) {
      if (a.status === 'needs_clarification' || a.status === 'inferred' || a.status === 'assumed') {
        groups.NEEDS_CLARIFICATION.push({
          id: a.id,
          section: 'NEEDS_CLARIFICATION',
          priority: a.status === 'needs_clarification' ? 'high' : 'medium',
          description: a.statement,
          type: 'assumption',
        });
      }
    }

    // Unresolved conflicts
    for (const c of project.conflicts || []) {
      if (c.status !== 'resolved') {
        groups.CONFLICT.push({
          id: c.id,
          section: 'CONFLICT',
          priority: 'critical',
          description: c.description,
          type: 'conflict',
        });
      }
    }

    // Deferred decisions
    for (const d of project.decisions || []) {
      if (d.status === 'proposed') {
        groups.DEFERRED.push({
          id: d.id,
          section: 'DEFERRED',
          priority: 'medium',
          description: d.title,
          type: 'decision',
        });
      }
    }

    // Deferred questions
    for (const q of project.questions || []) {
      if (q.status === 'deferred') {
        groups.DEFERRED.push({
          id: q.id,
          section: 'DEFERRED',
          priority: 'medium',
          description: q.title,
          type: 'question',
        });
      }
    }

    return groups;
  }, [project]);

  const totalItems = Object.values(groupedItems).reduce((sum, arr) => sum + arr.length, 0);
  const sectionsWithItems = Object.entries(groupedItems).filter(([, items]) => items.length > 0);

  return (
    <div
      className={cn(
        'hud-panel p-3 rounded-lg border border-jarvis-border space-y-3',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-jarvis-border/60">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-jarvis-amber" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-100">
            Needs Attention
          </span>
        </div>
        <span
          className={cn(
            'font-mono text-[10px] px-1.5 py-0.5 rounded border',
            totalItems > 0
              ? 'bg-jarvis-amber/15 border-jarvis-amber/30 text-jarvis-amber'
              : 'bg-jarvis-emerald/15 border-jarvis-emerald/30 text-jarvis-emerald'
          )}
        >
          {totalItems > 0 ? `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}` : 'ALL CLEAR'}
        </span>
      </div>

      {/* Sections */}
      {totalItems === 0 ? (
        <div className="py-6 text-center font-mono text-xs text-slate-400 space-y-1">
          <div className="w-8 h-8 rounded-full bg-jarvis-emerald/10 border border-jarvis-emerald/30 flex items-center justify-center mx-auto mb-2">
            <span className="text-jarvis-emerald text-lg">✓</span>
          </div>
          <p>No outstanding issues. Architecture is clean.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {sectionsWithItems.map(([sectionKey, items]) => {
            const config = sectionConfig[sectionKey];
            const Icon = config.icon;
            return (
              <div key={sectionKey} className="space-y-1.5">
                {/* Section Header */}
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className={config.tagText} />
                  <span
                    className={cn(
                      'text-[10px] font-mono font-semibold uppercase tracking-wider',
                      config.tagText
                    )}
                  >
                    {config.label} ({items.length})
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {items.map((item) => {
                    const badge = priorityBadge[item.priority] || priorityBadge.medium;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onItemClick && onItemClick(item)}
                        className={cn(
                          'w-full text-left p-2 rounded border-l-2 border border-jarvis-border/50 bg-black/30 hover:bg-black/50 transition-all duration-150 flex items-center justify-between gap-2 group',
                          config.borderColor,
                          onItemClick ? 'cursor-pointer' : 'cursor-default'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0',
                              badge.bg,
                              badge.text
                            )}
                          >
                            {item.priority}
                          </span>
                          <span className="text-xs text-slate-200 truncate">
                            {item.description}
                          </span>
                        </div>
                        <ChevronRight
                          size={12}
                          className="text-slate-500 group-hover:text-slate-200 shrink-0 transition-colors"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
