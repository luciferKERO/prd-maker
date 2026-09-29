'use client';

import { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  Zap,
  Layers,
  ArrowRight,
  ListFilter,
  Check,
} from 'lucide-react';
import type { Project } from '@/types/project';
import type { AIStatus } from '@/types/ai';
import type { DiscoveryQuestion } from '@/types/discovery';
import { LocalAIProvider } from '@/lib/ai/provider';
import { DiscoveryEngine } from '@/lib/discovery/engine';
import { QuestionCard } from '@/components/discovery/QuestionCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { cn } from '@/lib/utils';

interface DiscoveryPanelProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
  aiStatus: AIStatus;
  onAIStatusChange: (status: AIStatus) => void;
  onGeneratePRD?: () => void;
  onReviewQuestions?: () => void;
}

export function DiscoveryPanel({
  project,
  onProjectUpdate,
  aiStatus,
  onAIStatusChange,
  onGeneratePRD,
  onReviewQuestions,
}: DiscoveryPanelProps) {
  const [initialIdea, setInitialIdea] = useState(project.description || '');
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'answered' | 'deferred'>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Discovery engine instance for queries
  const engine = useMemo(() => new DiscoveryEngine(project), [project]);
  const completeness = useMemo(() => engine.calculateCompleteness(), [engine]);
  const isComplete = useMemo(() => engine.isDiscoveryComplete() || project.status === 'complete', [engine, project.status]);

  // Questions categorization
  const answeredQuestions = useMemo(
    () => (project.questions || []).filter((q) => q.status === 'answered'),
    [project.questions]
  );
  const deferredQuestions = useMemo(
    () => (project.questions || []).filter((q) => q.status === 'deferred'),
    [project.questions]
  );
  const pendingQuestions = useMemo(
    () => (project.questions || []).filter((q) => q.status === 'pending'),
    [project.questions]
  );

  // Active question logic: explicit activeQuestionId or first available
  const activeQuestion = useMemo(() => {
    if (project.activeQuestionId) {
      const found = (project.questions || []).find(
        (q) => q.id === project.activeQuestionId && q.status === 'pending'
      );
      if (found) return found;
    }
    const nextList = engine.getNextQuestions(1);
    return nextList[0] || pendingQuestions[0] || null;
  }, [project.activeQuestionId, project.questions, engine, pendingQuestions]);

  // Estimate round number (every 3-4 answered questions ~ 1 round)
  const currentRound = Math.max(1, Math.floor(answeredQuestions.length / 3) + 1);

  // Initial Idea Submission
  const handleInitialIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialIdea.trim() || isSubmittingIdea) return;

    setIsSubmittingIdea(true);
    onAIStatusChange('analyzing');

    try {
      const provider = new LocalAIProvider();
      const response = await provider.analyzeIdea(initialIdea.trim(), project);

      const firstQuestion = response.questions?.[0];
      const updatedProject: Project = {
        ...project,
        title: project.title === 'Untitled Project' ? initialIdea.slice(0, 40) : project.title,
        description: initialIdea.trim(),
        domain: response.nodeUpdates?.find((n) => n.type === 'project')?.category || project.domain || 'web_app',
        nodes: (response.nodeUpdates as any) || project.nodes || [],
        edges: response.edgeUpdates || project.edges || [],
        questions: response.questions || [],
        assumptions: response.assumptionUpdates || project.assumptions || [],
        conflicts: response.conflictUpdates || project.conflicts || [],
        completeness: response.analysis.completeness || 15,
        activeQuestionId: firstQuestion?.id,
        status: 'discovery',
      };

      onProjectUpdate(updatedProject);
      onAIStatusChange(firstQuestion ? 'asking' : 'complete');
    } catch (err) {
      console.error('Failed to analyze initial idea:', err);
      onAIStatusChange('error');
    } finally {
      setIsSubmittingIdea(false);
    }
  };

  // Handle Question Answer
  const handleAnswerQuestion = async (questionId: string, answer: unknown) => {
    onAIStatusChange('analyzing');

    try {
      const provider = new LocalAIProvider();
      const response = await provider.analyzeAnswer(questionId, answer, project);

      const nextEngine = new DiscoveryEngine(response.nodeUpdates ? { ...project, nodes: response.nodeUpdates as any } : project);
      const nextQuestions = nextEngine.getNextQuestions(3);
      const isDone = nextEngine.isDiscoveryComplete() || (nextQuestions.length === 0 && pendingQuestions.length <= 1);

      // Find next active question
      const remainingPending = (response.questions || project.questions || []).filter(
        (q) => q.id !== questionId && q.status === 'pending'
      );
      const nextActive = nextQuestions.find((q) => q.id !== questionId) || remainingPending[0];

      const updatedProject: Project = {
        ...project,
        questions: (project.questions || []).map((q) => {
          if (q.id === questionId) {
            return {
              ...q,
              status: 'answered',
              answer,
              answeredAt: Date.now(),
            };
          }
          return q;
        }),
        nodes: (response.nodeUpdates as any) || project.nodes,
        edges: response.edgeUpdates || project.edges,
        assumptions: response.assumptionUpdates || project.assumptions,
        conflicts: response.conflictUpdates || project.conflicts,
        completeness: response.analysis.completeness,
        activeQuestionId: nextActive?.id,
        status: isDone ? 'review' : 'discovery',
      };

      // Append any newly generated questions if not already in list
      if (response.questions && response.questions.length > 0) {
        const existingIds = new Set(updatedProject.questions.map((q) => q.id));
        for (const newQ of response.questions) {
          if (!existingIds.has(newQ.id)) {
            updatedProject.questions.push(newQ);
          }
        }
      }

      onProjectUpdate(updatedProject);
      onAIStatusChange(isDone ? 'complete' : 'asking');
    } catch (err) {
      console.error('Failed to process answer:', err);
      onAIStatusChange('error');
    }
  };

  // Handle Skip
  const handleSkipQuestion = (questionId: string) => {
    const remaining = pendingQuestions.filter((q) => q.id !== questionId);
    const nextQ = remaining[0];

    const updatedProject: Project = {
      ...project,
      questions: (project.questions || []).map((q) =>
        q.id === questionId ? { ...q, status: 'skipped', answeredAt: Date.now() } : q
      ),
      activeQuestionId: nextQ?.id,
    };
    onProjectUpdate(updatedProject);
  };

  // Handle Defer / Decide Later
  const handleDeferQuestion = (questionId: string) => {
    const targetQ = (project.questions || []).find((q) => q.id === questionId);
    const remaining = pendingQuestions.filter((q) => q.id !== questionId);
    const nextQ = remaining[0];

    const updatedProject: Project = {
      ...project,
      questions: (project.questions || []).map((q) =>
        q.id === questionId ? { ...q, status: 'deferred', answeredAt: Date.now() } : q
      ),
      activeQuestionId: nextQ?.id,
    };

    // Also record as a deferred decision if not already present
    if (targetQ && !updatedProject.decisions.some((d) => d.id === `dec_deferred_${targetQ.id}`)) {
      updatedProject.decisions.push({
        id: `dec_deferred_${targetQ.id}`,
        title: `Deferred: ${targetQ.title}`,
        description: targetQ.description || targetQ.reason || 'Decision deferred by user during discovery.',
        status: 'proposed',
        options: targetQ.options?.map((o) => o.label) || ['Yes', 'No'],
        relatedNodeIds: targetQ.relatedNodeIds || [],
      });
    }

    onProjectUpdate(updatedProject);
  };

  // Handle Custom Follow-up / Refinement
  const handleRefinementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    onAIStatusChange('analyzing');
    setIsRefining(true);

    try {
      const provider = new LocalAIProvider();
      const resp = await provider.analyzeIdea(
        `Refinement & Deepening: ${customPrompt.trim()}\nExisting Domain: ${project.domain}`,
        project
      );

      const updatedProject: Project = {
        ...project,
        nodes: (resp.nodeUpdates as any) || project.nodes,
        edges: resp.edgeUpdates || project.edges,
        questions: [...(project.questions || []), ...(resp.questions || [])],
        completeness: Math.min(100, Math.max(project.completeness, resp.analysis.completeness)),
        status: 'discovery',
      };
      setCustomPrompt('');
      setIsRefining(false);
      onProjectUpdate(updatedProject);
      onAIStatusChange('asking');
    } catch (err) {
      console.error('Refinement failed:', err);
      setIsRefining(false);
      onAIStatusChange('error');
    }
  };

  // Filtered History
  const historyList = useMemo(() => {
    if (historyFilter === 'answered') return answeredQuestions;
    if (historyFilter === 'deferred') return deferredQuestions;
    return (project.questions || []).filter((q) => q.status === 'answered' || q.status === 'deferred');
  }, [historyFilter, answeredQuestions, deferredQuestions, project.questions]);

  // If no questions exist yet and no nodes, show Initial Idea Prompter
  const isInitialState = (!project.questions || project.questions.length === 0) && (!project.nodes || project.nodes.length <= 1);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header HUD Bar */}
      <div className="hud-panel p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 border border-jarvis-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-jarvis-cyan/10 border border-jarvis-cyan/30 flex items-center justify-center text-jarvis-cyan shadow-[0_0_10px_rgba(56,189,248,0.2)]">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
                Interactive Discovery Matrix
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-jarvis-cyan/15 text-jarvis-cyan border border-jarvis-cyan/30">
                {project.domain ? project.domain.replace('_', ' ') : 'System Init'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Autonomous requirements elicitation & architecture refinement
            </p>
          </div>
        </div>

        {/* Round & Completeness Tracker */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              Phase / Round
            </span>
            <span className="text-sm font-mono font-bold text-jarvis-cyan">
              ROUND 0{currentRound}
            </span>
          </div>

          <div className="h-8 w-px bg-jarvis-border/60" />

          <div className="flex items-center gap-2.5">
            <ProgressRing
              value={completeness.overall}
              size={42}
              strokeWidth={3.5}
            />
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                Spec Health
              </span>
              <span className="text-xs font-mono font-semibold text-slate-200">
                {answeredQuestions.length} answered / {project.questions?.length || 0} total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 gap-4 overflow-y-auto pr-1">
        {/* State 1: Initial Idea Submission */}
        {isInitialState && (
          <div className="hud-panel p-6 rounded-lg border border-jarvis-cyan/30 bg-jarvis-card/80 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-full bg-jarvis-cyan/15 border border-jarvis-cyan/40 flex items-center justify-center text-jarvis-cyan animate-pulse">
              <Zap size={28} />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wide">
                Initialize System Architecture
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Describe the application, game, or tool you wish to architect. JARVIS will synthesize initial requirement nodes and formulate adaptive discovery questions.
              </p>
            </div>

            <form onSubmit={handleInitialIdeaSubmit} className="w-full max-w-xl space-y-3">
              <textarea
                rows={4}
                value={initialIdea}
                onChange={(e) => setInitialIdea(e.target.value)}
                placeholder="Example: A real-time multiplayer card battler built with Godot 4 and Nakama backend, featuring deck building, ranked matchmaking, and cosmetics store..."
                className="w-full p-3.5 rounded-lg bg-black/50 border border-jarvis-border focus:border-jarvis-cyan focus:ring-1 focus:ring-jarvis-cyan text-slate-100 placeholder:text-slate-500 text-xs font-sans outline-none leading-relaxed transition-all"
              />

              <button
                type="submit"
                disabled={!initialIdea.trim() || isSubmittingIdea}
                className={cn(
                  'w-full py-2.5 px-4 rounded-md font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all',
                  !initialIdea.trim() || isSubmittingIdea
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
                    : 'bg-jarvis-cyan text-black hover:bg-jarvis-cyan/90 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                )}
              >
                {isSubmittingIdea ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Analyzing Architecture & Nodes...
                  </>
                ) : (
                  <>
                    Begin Discovery Process
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* State 2: Active Question Focus */}
        {!isInitialState && activeQuestion && !isComplete && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-[11px] font-mono text-jarvis-cyan">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-jarvis-cyan animate-ping" />
                ACTIVE FOCUS QUESTION
              </span>
              <span>
                QUEUE: {pendingQuestions.length} REMAINING
              </span>
            </div>

            <QuestionCard
              question={activeQuestion}
              onAnswer={handleAnswerQuestion}
              onSkip={handleSkipQuestion}
              onDefer={handleDeferQuestion}
            />
          </div>
        )}

        {/* State 3: Discovery Complete Banner */}
        {!isInitialState && isComplete && (
          <div className="hud-panel p-6 rounded-lg border border-jarvis-emerald/40 bg-jarvis-emerald/5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-jarvis-emerald/20 border border-jarvis-emerald/50 flex items-center justify-center text-jarvis-emerald shrink-0">
                <CheckCircle size={26} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-mono font-bold text-jarvis-emerald uppercase tracking-wider">
                    Specification Discovery Complete
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-jarvis-emerald/20 text-jarvis-emerald border border-jarvis-emerald/40">
                    {completeness.overall}% READY
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  All critical architectural questions, domain dependencies, and risk models have been resolved. The knowledge graph is sufficiently populated to generate the full Product Requirement Document (PRD).
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={onGeneratePRD}
                className="p-3 rounded-md bg-jarvis-emerald text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-jarvis-emerald/90 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all"
              >
                <FileText size={15} />
                Generate PRD Document
              </button>

              <button
                type="button"
                onClick={() => setIsRefining(true)}
                className="p-3 rounded-md bg-black/40 border border-jarvis-cyan/50 text-jarvis-cyan font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-jarvis-cyan/10 transition-all"
              >
                <RotateCcw size={15} />
                Continue Refining
              </button>

              <button
                type="button"
                onClick={onReviewQuestions}
                className="p-3 rounded-md bg-black/40 border border-jarvis-border text-slate-300 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:border-slate-400 transition-all"
              >
                <ListFilter size={15} />
                Review Open Items
              </button>
            </div>
          </div>
        )}

        {/* Refinement Query Form (if user clicks Continue Refining or wants to inject new constraints) */}
        {!isInitialState && (isRefining || isComplete) && (
          <form onSubmit={handleRefinementSubmit} className="hud-panel p-4 rounded-lg border border-jarvis-cyan/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-jarvis-cyan">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} />
                INJECT ARCHITECTURAL CONSTRAINTS OR SUB-SYSTEMS
              </span>
              {isRefining && (
                <button
                  type="button"
                  onClick={() => setIsRefining(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Close
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Add offline caching with IndexedDB and enterprise OAuth2 support..."
                className="flex-1 px-3 py-2 rounded bg-black/50 border border-jarvis-border focus:border-jarvis-cyan text-xs text-slate-100 outline-none"
              />
              <button
                type="submit"
                disabled={!customPrompt.trim()}
                className="px-4 py-2 rounded bg-jarvis-cyan/20 border border-jarvis-cyan text-jarvis-cyan font-mono text-xs uppercase hover:bg-jarvis-cyan hover:text-black transition-colors disabled:opacity-40"
              >
                Elicit Nodes
              </button>
            </div>
          </form>
        )}

        {/* Answered Questions & History Accordion */}
        {!isInitialState && historyList.length > 0 && (
          <div className="hud-panel p-4 rounded-lg border border-jarvis-border space-y-3">
            <div className="flex items-center justify-between border-b border-jarvis-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-jarvis-cyan" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Decision & Elicitation Trail ({historyList.length})
                </h4>
              </div>

              {/* History Filter Tabs */}
              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-jarvis-border">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-mono transition-colors',
                    historyFilter === 'all'
                      ? 'bg-jarvis-cyan/20 text-jarvis-cyan font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  All ({answeredQuestions.length + deferredQuestions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('answered')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-mono transition-colors',
                    historyFilter === 'answered'
                      ? 'bg-jarvis-cyan/20 text-jarvis-cyan font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  Answered ({answeredQuestions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('deferred')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-mono transition-colors',
                    historyFilter === 'deferred'
                      ? 'bg-jarvis-cyan/20 text-jarvis-cyan font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  Deferred ({deferredQuestions.length})
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {historyList.map((item: DiscoveryQuestion) => {
                const isExpanded = expandedHistoryId === item.id;
                const isDeferred = item.status === 'deferred';
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded border transition-all duration-200',
                      isDeferred
                        ? 'border-jarvis-amber/30 bg-jarvis-amber/5'
                        : 'border-jarvis-border/60 bg-black/30 hover:border-jarvis-border'
                    )}
                  >
                    <div
                      onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                      className="p-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isDeferred ? (
                          <Clock size={14} className="text-jarvis-amber shrink-0" />
                        ) : (
                          <Check size={14} className="text-jarvis-emerald shrink-0" />
                        )}
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-jarvis-cyan/10 text-jarvis-cyan shrink-0">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.answer !== undefined && (
                          <span className="text-[11px] font-mono text-slate-400 max-w-[120px] truncate hidden sm:inline">
                            {typeof item.answer === 'object'
                              ? JSON.stringify(item.answer)
                              : String(item.answer)}
                          </span>
                        )}
                        <span className="text-slate-500">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-jarvis-border/40 text-xs space-y-2 bg-black/20">
                        {item.description && (
                          <p className="text-slate-400 text-[11px]">{item.description}</p>
                        )}
                        <div className="p-2 rounded bg-black/40 border border-jarvis-border/60">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-jarvis-cyan block mb-1">
                            Recorded Value:
                          </span>
                          <p className="font-mono text-xs text-slate-200 break-words">
                            {typeof item.answer === 'object'
                              ? JSON.stringify(item.answer, null, 2)
                              : String(item.answer ?? '(Deferred / No answer)')}
                          </p>
                        </div>
                        {isDeferred && (
                          <button
                            type="button"
                            onClick={() => {
                              // Re-activate this question
                              const updatedProject: Project = {
                                ...project,
                                questions: (project.questions || []).map((q) =>
                                  q.id === item.id ? { ...q, status: 'pending' } : q
                                ),
                                activeQuestionId: item.id,
                              };
                              onProjectUpdate(updatedProject);
                            }}
                            className="mt-1 px-2.5 py-1 rounded bg-jarvis-amber/20 border border-jarvis-amber text-jarvis-amber font-mono text-[10px] uppercase hover:bg-jarvis-amber/30"
                          >
                            Re-open For Answer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
