'use client';

import {
  Activity,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  GitPullRequest,
  BarChart3,
} from 'lucide-react';
import type { Project } from '@/types/project';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { cn } from '@/lib/utils';

interface ProjectHealthProps {
  project: Project;
  completeness: {
    overall: number;
    categories: Record<string, { score: number; total: number; label: string }>;
  };
  onStatClick?: (statKey: string) => void;
  className?: string;
}

export function ProjectHealth({
  project,
  completeness,
  onStatClick,
  className,
}: ProjectHealthProps) {
  const overall = Math.min(100, Math.max(0, completeness.overall || 0));

  // Quick stats computation
  const criticalDecisionsCount = (project.decisions || []).length;
  const assumptionsCount = (project.assumptions || []).length;
  const activeConflictsCount = (project.conflicts || []).filter(
    (c) => c.status !== 'resolved'
  ).length;
  const openQuestionsCount = (project.questions || []).filter(
    (q) => q.status === 'pending'
  ).length;

  const getStatusColor = (val: number) => {
    if (val > 80) return 'text-jarvis-emerald';
    if (val >= 50) return 'text-jarvis-amber';
    return 'text-jarvis-rose';
  };

  const getBarColor = (val: number) => {
    if (val > 80) return 'bg-jarvis-emerald';
    if (val >= 50) return 'bg-jarvis-amber';
    return 'bg-jarvis-rose';
  };

  const statItems = [
    {
      key: 'questions',
      label: 'Open Questions',
      count: openQuestionsCount,
      icon: HelpCircle,
      color: openQuestionsCount > 0 ? 'text-jarvis-cyan' : 'text-slate-400',
      bg: 'bg-jarvis-cyan/10',
      border: 'border-jarvis-cyan/30',
    },
    {
      key: 'conflicts',
      label: 'Active Conflicts',
      count: activeConflictsCount,
      icon: AlertTriangle,
      color: activeConflictsCount > 0 ? 'text-jarvis-rose' : 'text-slate-400',
      bg: activeConflictsCount > 0 ? 'bg-jarvis-rose/10' : 'bg-slate-800/40',
      border: activeConflictsCount > 0 ? 'border-jarvis-rose/40' : 'border-slate-700',
    },
    {
      key: 'assumptions',
      label: 'Assumptions',
      count: assumptionsCount,
      icon: Lightbulb,
      color: assumptionsCount > 0 ? 'text-jarvis-amber' : 'text-slate-400',
      bg: 'bg-jarvis-amber/10',
      border: 'border-jarvis-amber/30',
    },
    {
      key: 'decisions',
      label: 'Decisions',
      count: criticalDecisionsCount,
      icon: GitPullRequest,
      color: criticalDecisionsCount > 0 ? 'text-jarvis-violet' : 'text-slate-400',
      bg: 'bg-jarvis-violet/10',
      border: 'border-jarvis-violet/30',
    },
  ];

  const categoryEntries = Object.entries(completeness.categories || {});

  return (
    <div
      className={cn(
        'hud-panel p-4 rounded-lg border border-jarvis-border space-y-4',
        className
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-jarvis-border/60">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-jarvis-cyan" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-100">
            Specification Health Index
          </h3>
        </div>
        <span
          className={cn(
            'text-[11px] font-mono font-bold px-2 py-0.5 rounded border',
            overall > 80
              ? 'bg-jarvis-emerald/10 border-jarvis-emerald/30 text-jarvis-emerald'
              : overall >= 50
              ? 'bg-jarvis-amber/10 border-jarvis-amber/30 text-jarvis-amber'
              : 'bg-jarvis-rose/10 border-jarvis-rose/30 text-jarvis-rose'
          )}
        >
          {overall > 80 ? 'READY FOR PRD' : overall >= 50 ? 'ELICITING' : 'INCOMPLETE'}
        </span>
      </div>

      {/* Main Radial Progress & Overview */}
      <div className="flex items-center gap-5 p-3 rounded-md bg-black/40 border border-jarvis-border/50">
        <div className="shrink-0 relative">
          <ProgressRing
            value={overall}
            size={88}
            strokeWidth={6}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Overall Readiness
          </span>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-2xl font-mono font-extrabold', getStatusColor(overall))}>
              {overall}%
            </span>
            <span className="text-xs text-slate-400 font-sans">completeness score</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-tight">
            {overall > 80
              ? 'Architecture and requirements fully structured.'
              : overall >= 50
              ? 'Moderate coverage. Core architecture partially resolved.'
              : 'Initial phase. Key architectural branches undefined.'}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => onStatClick && onStatClick(stat.key)}
              className={cn(
                'p-2.5 rounded border transition-all duration-200 text-left flex items-center justify-between group',
                stat.bg,
                stat.border,
                onStatClick ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'
              )}
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block group-hover:text-slate-200">
                  {stat.label}
                </span>
                <span className={cn('text-lg font-mono font-bold', stat.color)}>
                  {stat.count}
                </span>
              </div>
              <div className={cn('p-1.5 rounded-md bg-black/30 border border-white/5', stat.color)}>
                <Icon size={16} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Category Breakdown Bars */}
      {categoryEntries.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1 border-b border-jarvis-border/40">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <BarChart3 size={13} className="text-jarvis-cyan" />
              Domain Pillar Coverage
            </span>
            <span className="text-[10px]">{categoryEntries.length} Domains</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categoryEntries.map(([catKey, cat]) => {
              const catPct = Math.round((cat.score / Math.max(1, cat.total)) * 100);
              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 truncate max-w-[180px]">
                      {cat.label}
                    </span>
                    <span className={cn('font-semibold', getStatusColor(catPct))}>
                      {cat.score}/{cat.total} ({catPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', getBarColor(catPct))}
                      style={{ width: `${Math.min(100, Math.max(0, catPct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
