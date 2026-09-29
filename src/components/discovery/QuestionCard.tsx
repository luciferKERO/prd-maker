'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  Clock,
  SkipForward,
  Send,
  Sparkles,
  Info,
  Check,
  X,
  Edit3,
} from 'lucide-react';
import type {
  DiscoveryQuestion,
  QuestionPriority,
  QuestionOption,
} from '@/types/discovery';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: DiscoveryQuestion;
  onAnswer: (questionId: string, answer: unknown) => void;
  onSkip: (questionId: string) => void;
  onDefer: (questionId: string) => void;
}

const priorityBadgeStyles: Record<QuestionPriority, { bg: string; border: string; text: string; label: string }> = {
  critical: {
    bg: 'bg-jarvis-rose/10',
    border: 'border-jarvis-rose/40',
    text: 'text-jarvis-rose',
    label: 'CRITICAL',
  },
  high: {
    bg: 'bg-jarvis-amber/10',
    border: 'border-jarvis-amber/40',
    text: 'text-jarvis-amber',
    label: 'HIGH PRIORITY',
  },
  medium: {
    bg: 'bg-jarvis-cyan/10',
    border: 'border-jarvis-cyan/40',
    text: 'text-jarvis-cyan',
    label: 'MEDIUM',
  },
  low: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    label: 'LOW',
  },
  optional: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    label: 'OPTIONAL',
  },
};

export function QuestionCard({
  question,
  onAnswer,
  onSkip,
  onDefer,
}: QuestionCardProps) {
  const [currentValue, setCurrentValue] = useState<unknown>(
    question.answer ?? (question.questionType === 'multiple_choice' ? [] : '')
  );
  const [customText, setCustomText] = useState<string>('');
  const [isEditingConfirm, setIsEditingConfirm] = useState(false);

  // Sync state whenever question changes
  useEffect(() => {
    if (question.answer !== undefined) {
      setCurrentValue(question.answer);
    } else {
      switch (question.questionType) {
        case 'multiple_choice':
          setCurrentValue([]);
          break;
        case 'boolean':
          setCurrentValue(null);
          break;
        case 'slider':
          setCurrentValue(50);
          break;
        case 'number':
          setCurrentValue('');
          break;
        case 'confirmation':
          setCurrentValue(null);
          break;
        default:
          setCurrentValue('');
          break;
      }
    }
    setIsEditingConfirm(false);
    setCustomText('');
  }, [question.id, question.questionType, question.answer]);

  const priorityStyle = priorityBadgeStyles[question.priority] || priorityBadgeStyles.medium;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentValue === null || currentValue === undefined || currentValue === '') {
      return;
    }
    if (Array.isArray(currentValue) && currentValue.length === 0) {
      return;
    }
    onAnswer(question.id, currentValue);
  };

  const handleSingleSelect = (optionId: string) => {
    setCurrentValue(optionId);
  };

  const handleMultiSelect = (optionId: string) => {
    const selected = Array.isArray(currentValue) ? [...(currentValue as string[])] : [];
    const index = selected.indexOf(optionId);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(optionId);
    }
    setCurrentValue(selected);
  };

  const isSubmitDisabled =
    currentValue === null ||
    currentValue === undefined ||
    currentValue === '' ||
    (Array.isArray(currentValue) && currentValue.length === 0);

  return (
    <div
      key={question.id}
      className={cn(
        'hud-panel p-5 rounded-lg transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-3 duration-300',
        'border border-jarvis-border hover:border-jarvis-borderGlow'
      )}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-jarvis-border/60">
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <span
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider border flex items-center gap-1',
              priorityStyle.bg,
              priorityStyle.border,
              priorityStyle.text
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {priorityStyle.label}
          </span>

          {/* Category Tag */}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-jarvis-cyan/10 border border-jarvis-cyan/30 text-jarvis-cyan">
            {question.category || 'General'}
          </span>

          {question.blocking && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-jarvis-rose/20 text-jarvis-rose border border-jarvis-rose/40">
              BLOCKING
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono text-jarvis-cyan/60 flex items-center gap-1">
          <Sparkles size={12} className="text-jarvis-cyan" />
          TYPE: {question.questionType.toUpperCase()}
        </span>
      </div>

      {/* Question Title & Description */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-100 leading-snug tracking-wide">
          {question.title}
        </h3>
        {question.description && (
          <p className="mt-1.5 text-xs text-slate-300/80 leading-relaxed font-sans">
            {question.description}
          </p>
        )}
      </div>

      {/* Context / Reason Box */}
      {question.reason && (
        <div className="mb-5 flex items-start gap-2.5 p-2.5 rounded bg-jarvis-cyan/5 border border-jarvis-cyan/20 text-slate-300">
          <Info size={14} className="text-jarvis-cyan shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-mono uppercase font-bold text-jarvis-cyan mr-1">Context:</span>
            {question.reason}
          </div>
        </div>
      )}

      {/* Input Renderers Based on questionType */}
      <div className="mb-6 space-y-3">
        {/* 1. Single Choice */}
        {question.questionType === 'single_choice' && (
          <div className="grid grid-cols-1 gap-2.5">
            {question.options && question.options.length > 0 ? (
              question.options.map((opt: QuestionOption) => {
                const isSelected = currentValue === opt.id || currentValue === opt.label;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSingleSelect(opt.id)}
                    className={cn(
                      'w-full text-left p-3 rounded border transition-all duration-200 flex items-start justify-between group',
                      isSelected
                        ? 'bg-jarvis-cyan/15 border-jarvis-cyan text-white shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                        : 'bg-black/30 border-jarvis-border/70 hover:border-jarvis-cyan/60 hover:bg-jarvis-cyan/5 text-slate-200'
                    )}
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2 font-medium text-xs md:text-sm">
                        <span
                          className={cn(
                            'w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors',
                            isSelected
                              ? 'border-jarvis-cyan bg-jarvis-cyan'
                              : 'border-slate-500 group-hover:border-jarvis-cyan'
                          )}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                      {opt.description && (
                        <p className="mt-1 text-[11px] text-slate-400 font-sans ml-5.5">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 font-mono italic">No options provided.</p>
            )}
          </div>
        )}

        {/* 2. Multiple Choice */}
        {question.questionType === 'multiple_choice' && (
          <div className="grid grid-cols-1 gap-2.5">
            {question.options && question.options.length > 0 ? (
              question.options.map((opt: QuestionOption) => {
                const selectedArr = Array.isArray(currentValue) ? (currentValue as string[]) : [];
                const isSelected = selectedArr.includes(opt.id) || selectedArr.includes(opt.label);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleMultiSelect(opt.id)}
                    className={cn(
                      'w-full text-left p-3 rounded border transition-all duration-200 flex items-start justify-between group',
                      isSelected
                        ? 'bg-jarvis-cyan/15 border-jarvis-cyan text-white shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                        : 'bg-black/30 border-jarvis-border/70 hover:border-jarvis-cyan/60 hover:bg-jarvis-cyan/5 text-slate-200'
                    )}
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2 font-medium text-xs md:text-sm">
                        <span
                          className={cn(
                            'w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors',
                            isSelected
                              ? 'border-jarvis-cyan bg-jarvis-cyan text-black'
                              : 'border-slate-500 group-hover:border-jarvis-cyan'
                          )}
                        >
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                      {opt.description && (
                        <p className="mt-1 text-[11px] text-slate-400 font-sans ml-5.5">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 font-mono italic">No options provided.</p>
            )}
          </div>
        )}

        {/* 3. Text Input */}
        {question.questionType === 'text' && (
          <div className="space-y-1">
            <textarea
              rows={3}
              value={typeof currentValue === 'string' ? currentValue : ''}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="Type your answer or requirements here..."
              className="w-full px-3 py-2.5 rounded bg-black/40 border border-jarvis-border focus:border-jarvis-cyan focus:ring-1 focus:ring-jarvis-cyan text-slate-100 placeholder:text-slate-500 text-xs font-sans outline-none resize-y transition-colors"
            />
          </div>
        )}

        {/* 4. Number Input */}
        {question.questionType === 'number' && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={typeof currentValue === 'number' || typeof currentValue === 'string' ? (currentValue as string | number) : ''}
              onChange={(e) => setCurrentValue(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-44 px-3 py-2 rounded bg-black/40 border border-jarvis-border focus:border-jarvis-cyan focus:ring-1 focus:ring-jarvis-cyan text-slate-100 text-sm font-mono outline-none"
            />
          </div>
        )}

        {/* 5. Boolean Input */}
        {question.questionType === 'boolean' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCurrentValue(true)}
              className={cn(
                'py-3 px-4 rounded border font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all',
                currentValue === true
                  ? 'bg-jarvis-emerald/20 border-jarvis-emerald text-jarvis-emerald shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                  : 'bg-black/30 border-jarvis-border hover:border-jarvis-emerald/60 text-slate-300'
              )}
            >
              <Check size={16} />
              YES / AFFIRMATIVE
            </button>
            <button
              type="button"
              onClick={() => setCurrentValue(false)}
              className={cn(
                'py-3 px-4 rounded border font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all',
                currentValue === false
                  ? 'bg-jarvis-rose/20 border-jarvis-rose text-jarvis-rose shadow-[0_0_14px_rgba(244,63,94,0.3)]'
                  : 'bg-black/30 border-jarvis-border hover:border-jarvis-rose/60 text-slate-300'
              )}
            >
              <X size={16} />
              NO / NEGATIVE
            </button>
          </div>
        )}

        {/* 6. Slider Input */}
        {question.questionType === 'slider' && (
          <div className="space-y-3 p-3 bg-black/20 rounded border border-jarvis-border/40">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Min: 0</span>
              <span className="text-jarvis-cyan font-bold text-sm bg-jarvis-cyan/10 px-2 py-0.5 rounded border border-jarvis-cyan/30">
                {typeof currentValue === 'number' ? currentValue : 50}
              </span>
              <span className="text-slate-400">Max: 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={typeof currentValue === 'number' ? currentValue : 50}
              onChange={(e) => setCurrentValue(Number(e.target.value))}
              className="w-full accent-jarvis-cyan cursor-pointer bg-slate-700 h-1.5 rounded-lg"
            />
          </div>
        )}

        {/* 7. Confirmation Input */}
        {question.questionType === 'confirmation' && (
          <div className="space-y-3">
            {!isEditingConfirm ? (
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentValue('confirmed');
                    onAnswer(question.id, 'confirmed');
                  }}
                  className={cn(
                    'py-2.5 px-3 rounded border font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all',
                    currentValue === 'confirmed'
                      ? 'bg-jarvis-emerald/20 border-jarvis-emerald text-jarvis-emerald'
                      : 'bg-black/30 border-jarvis-border hover:border-jarvis-emerald/60 text-slate-300'
                  )}
                >
                  <CheckCircle2 size={14} className="text-jarvis-emerald" />
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingConfirm(true)}
                  className="py-2.5 px-3 rounded border border-jarvis-border hover:border-jarvis-amber/60 bg-black/30 text-slate-300 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit3 size={14} className="text-jarvis-amber" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentValue('rejected');
                    onAnswer(question.id, 'rejected');
                  }}
                  className={cn(
                    'py-2.5 px-3 rounded border font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all',
                    currentValue === 'rejected'
                      ? 'bg-jarvis-rose/20 border-jarvis-rose text-jarvis-rose'
                      : 'bg-black/30 border-jarvis-border hover:border-jarvis-rose/60 text-slate-300'
                  )}
                >
                  <X size={14} className="text-jarvis-rose" />
                  Reject
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Specify correction or amendment..."
                  className="w-full px-3 py-2 rounded bg-black/40 border border-jarvis-amber focus:border-jarvis-amber text-slate-100 text-xs font-sans outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingConfirm(false)}
                    className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (customText.trim()) {
                        onAnswer(question.id, { action: 'edited', customText: customText.trim() });
                      }
                    }}
                    disabled={!customText.trim()}
                    className="px-3 py-1 rounded bg-jarvis-amber/20 border border-jarvis-amber text-jarvis-amber text-xs font-mono uppercase disabled:opacity-40"
                  >
                    Submit Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback for ranking or other types */}
        {question.questionType === 'ranking' && (
          <div className="space-y-1">
            <input
              type="text"
              value={typeof currentValue === 'string' ? currentValue : ''}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="Enter rank order (comma-separated)..."
              className="w-full px-3 py-2 rounded bg-black/40 border border-jarvis-border focus:border-jarvis-cyan text-slate-100 text-xs font-sans outline-none"
            />
          </div>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-jarvis-border/60">
        <div className="flex items-center gap-2">
          {/* Skip Button */}
          <button
            type="button"
            onClick={() => onSkip(question.id)}
            className="px-2.5 py-1.5 rounded text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent hover:border-slate-700 transition-colors flex items-center gap-1"
          >
            <SkipForward size={12} />
            Skip
          </button>

          {/* Defer Button */}
          <button
            type="button"
            onClick={() => onDefer(question.id)}
            className="px-2.5 py-1.5 rounded text-[11px] font-mono text-slate-400 hover:text-jarvis-amber hover:bg-jarvis-amber/10 border border-transparent hover:border-jarvis-amber/30 transition-colors flex items-center gap-1"
          >
            <Clock size={12} />
            Decide Later
          </button>
        </div>

        {/* Submit Button */}
        {question.questionType !== 'confirmation' && (
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitDisabled}
            className={cn(
              'px-4 py-1.5 rounded text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all',
              isSubmitDisabled
                ? 'opacity-40 cursor-not-allowed bg-slate-800 border border-slate-700 text-slate-500'
                : 'bg-jarvis-cyan text-black hover:bg-jarvis-cyan/90 shadow-[0_0_12px_rgba(56,189,248,0.4)] active:scale-95'
            )}
          >
            Submit Answer
            <Send size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
