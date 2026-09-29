"use client";

import React, { useState, useMemo } from "react";
import { Project, ProjectNode, ProjectAssumption, ProjectConflict } from "@/types/project";
import { PRDDocument, PRDSection } from "@/types/prd";
import { generatePRDDocument } from "@/lib/prd/generator";
import { cn } from "@/lib/utils";
import {
  FileText,
  Download,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  FileJson,
  ClipboardCopy,
  AlertCircle,
  HelpCircle,
  Info,
  BookOpen,
} from "lucide-react";

interface PRDViewProps {
  project: Project;
  className?: string;
}

function ExportBar({
  prd,
  project,
}: {
  prd: PRDDocument;
  project: Project;
}) {
  const [copied, setCopied] = useState(false);

  const markdownContent = useMemo(() => {
    return prd.sections
      .filter((s) => s.status !== "not_applicable")
      .map((s) => `# ${s.title}\n\n${s.content}`)
      .join("\n\n---\n\n");
  }, [prd.sections]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title || "PRD"}_PRD.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title || "PRD"}_project.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleCopyMarkdown}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded transition
                   bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Copied
          </>
        ) : (
          <>
            <ClipboardCopy className="w-3.5 h-3.5" />
            Copy PRD
          </>
        )}
      </button>

      <button
        onClick={handleDownloadMarkdown}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded transition
                   bg-slate-800/50 border-sky-500/20 text-slate-300 hover:text-sky-300 hover:border-sky-500/40"
      >
        <Download className="w-3.5 h-3.5" />
        Markdown
      </button>

      <button
        onClick={handleDownloadJSON}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded transition
                   bg-slate-800/50 border-sky-500/20 text-slate-300 hover:text-sky-300 hover:border-sky-500/40"
      >
        <FileJson className="w-3.5 h-3.5" />
        JSON
      </button>
    </div>
  );
}

function SectionRenderer({ section }: { section: PRDSection }) {
  const [expanded, setExpanded] = useState(section.status !== "not_applicable");

  const statusColors: Record<string, string> = {
    draft: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    reviewed: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    final: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    not_applicable: "text-slate-500 bg-slate-700/20 border-slate-700/30",
  };

  return (
    <div className="border-b border-sky-500/10 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-sky-500/5 transition"
      >
        <div className="flex items-center gap-2 min-w-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-sky-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-slate-100 truncate">
            {section.title}
          </span>
          <span
            className={cn(
              "text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border tracking-wider flex-shrink-0",
              statusColors[section.status] || statusColors.draft
            )}
          >
            {section.status.replace("_", " ")}
          </span>
        </div>
      </button>

      {expanded && section.status !== "not_applicable" && (
        <div className="px-5 pb-4 ml-5 text-sm text-slate-300 leading-relaxed prose-headings:text-slate-100 prose-headings:font-semibold whitespace-pre-wrap border-l border-sky-500/10 pl-4">
          {section.content || (
            <span className="text-slate-500 italic text-xs">
              No content generated for this section yet.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function PRDView({ project, className }: PRDViewProps) {
  const prd = useMemo(() => generatePRDDocument(project), [project]);

  const activeSections = prd.sections.filter((s) => s.status !== "not_applicable");
  const naSections = prd.sections.filter((s) => s.status === "not_applicable");

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sky-500/15 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-sky-400">
            PRD Document
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            v{prd.version} &middot; {activeSections.length} sections
          </span>
        </div>
        <ExportBar prd={prd} project={project} />
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {activeSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-10 h-10 text-sky-400/30 mb-3" />
            <p className="text-sm text-slate-400">
              Answer discovery questions to populate the PRD.
            </p>
          </div>
        ) : (
          <div>
            {activeSections.map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}

            {/* Collapsed N/A sections */}
            {naSections.length > 0 && (
              <div className="px-4 py-2 bg-slate-900/30 border-t border-sky-500/10">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  {naSections.length} sections not applicable to this project
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
