"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Download,
  Settings,
  Activity,
  Sparkles,
  Save,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Map,
  FileText,
  HelpCircle,
  Zap,
  BarChart3,
  AlertTriangle,
  Layers,
  MessageSquare,
  PanelRightClose,
  Sun,
  Moon,
} from "lucide-react";

import type { Project, ProjectNode } from "@/types/project";
import type { AIStatus, ActivityEvent } from "@/types/ai";
import type { DiscoveryQuestion } from "@/types/discovery";

import { AICore } from "@/components/ai-core/AICore";
import { TechLabel } from "@/components/ui/TechLabel";
import { HudPanel } from "@/components/ui/HudPanel";
import { DiscoveryPanel } from "@/components/discovery/DiscoveryPanel";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";
import { NodeInspector } from "@/components/inspector/NodeInspector";
import { PRDView } from "@/components/prd/PRDView";
import { ProjectHealth } from "@/components/project/ProjectHealth";
import { NeedsAttention } from "@/components/project/NeedsAttention";
import { ActivityFeed } from "@/components/activity/ActivityFeed";

import { calculateProjectCompleteness } from "@/lib/discovery/completeness";
import { saveProject, exportProjectJSON } from "@/lib/persistence/storage";
import { cn } from "@/lib/utils";

type WorkspaceView = "discovery" | "graph" | "prd" | "overview";

interface WorkspaceShellProps {
  project: Project;
  onBack: () => void;
  onProjectChange?: (project: Project) => void;
}

export function WorkspaceShell({ project: initialProject, onBack, onProjectChange }: WorkspaceShellProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeView, setActiveView] = useState<WorkspaceView>("discovery");
  const [aiStatus, setAiStatus] = useState<AIStatus>("idle");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [saved, setSaved] = useState(true);
  const [title, setTitle] = useState(project.title || "Untitled Project");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([
    {
      id: "evt_init",
      type: "project_created",
      message: `Project "${project.title}" initialized`,
      timestamp: Date.now(),
    },
  ]);

  // Save project on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProject(project.id, project);
      setSaved(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [project]);

  // Completeness calculation
  const completeness = useMemo(
    () => calculateProjectCompleteness(project),
    [project]
  );

  // Add activity event
  const addEvent = useCallback((type: string, message: string, metadata?: Record<string, unknown>) => {
    setActivityEvents((prev) => [
      ...prev.slice(-49),
      {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type,
        message,
        timestamp: Date.now(),
        metadata,
      },
    ]);
  }, []);

  // Project update handler
  const handleProjectUpdate = useCallback(
    (updated: Project) => {
      const withCompleteness = {
        ...updated,
        completeness: calculateProjectCompleteness(updated).overall,
        metadata: { ...updated.metadata, updatedAt: Date.now() },
      };
      setProject(withCompleteness);
      setSaved(false);
      onProjectChange?.(withCompleteness);
    },
    [onProjectChange]
  );

  // Node update handler
  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Partial<ProjectNode>) => {
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, ...updates } : n
      );
      handleProjectUpdate({ ...project, nodes: updatedNodes });
      addEvent("requirement_updated", `Updated node: ${updates.title || nodeId}`);
    },
    [project, handleProjectUpdate, addEvent]
  );

  // Select a node and open inspector
  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      setShowInspector(true);
    }
  }, []);

  // Title save
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== project.title) {
      handleProjectUpdate({ ...project, title: title.trim() });
      addEvent("requirement_updated", `Project title changed to "${title.trim()}"`);
    }
  };

  // Export handlers
  const handleExportJSON = () => {
    const blob = new Blob([exportProjectJSON(project)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title || "PRD"}_project.json`;
    a.click();
    URL.revokeObjectURL(url);
    addEvent("export_completed", "Project exported as JSON");
  };

  // Selected node object
  const selectedNode = useMemo(
    () => (selectedNodeId ? project.nodes.find((n) => n.id === selectedNodeId) || null : null),
    [selectedNodeId, project.nodes]
  );

  // View tabs
  const viewTabs: { key: WorkspaceView; label: string; icon: React.ReactNode }[] = [
    { key: "discovery", label: "Discovery", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: "graph", label: "Graph", icon: <Map className="w-3.5 h-3.5" /> },
    { key: "prd", label: "PRD", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "overview", label: "Overview", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#060813] text-slate-100 overflow-hidden">
      {/* ─── Top Command Bar ─── */}
      <header className="h-12 border-b border-sky-500/20 bg-slate-950/90 backdrop-blur-xl px-3 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Nav & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono border border-sky-500/20 text-slate-400 hover:text-sky-300 hover:border-sky-500/40 hover:bg-sky-500/10 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXIT</span>
          </button>

          <div className="h-4 w-px bg-sky-500/20" />

          <span className="text-xs font-mono text-sky-400 font-semibold tracking-widest hidden md:block">
            PRD ARCHITECT
          </span>

          <span className="text-slate-600 text-xs hidden md:block">/</span>

          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
              autoFocus
              className="bg-slate-900 border border-sky-400 text-xs font-mono px-2 py-0.5 rounded text-white focus:outline-none w-48"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-mono text-slate-200 hover:text-sky-300 transition truncate max-w-[200px]"
              title="Click to edit"
            >
              {title}
            </button>
          )}
        </div>

        {/* Center: View Tabs */}
        <div className="hidden md:flex items-center bg-slate-900/60 rounded-lg border border-sky-500/15 p-0.5">
          {viewTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-md transition",
                activeView === tab.key
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-2">
          {/* Completeness */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono">
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400 transition-all duration-700"
                style={{ width: `${completeness.overall}%` }}
              />
            </div>
            <span className="text-slate-400">{Math.round(completeness.overall)}%</span>
          </div>

          {/* Save status */}
          <div className="flex items-center gap-1 text-xs font-mono">
            {saved ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Save className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            )}
          </div>

          {/* Domain badge */}
          <TechLabel text={project.domain || "GENERAL"} variant="info" size="xs" />

          {/* Export */}
          <button
            onClick={handleExportJSON}
            className="p-1.5 rounded border border-sky-500/20 text-slate-400 hover:text-sky-300 hover:border-sky-500/40 hover:bg-sky-500/10 transition"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ─── Mobile View Tabs ─── */}
      <div className="md:hidden flex items-center gap-1 px-2 py-1.5 border-b border-sky-500/15 bg-slate-950/70 overflow-x-auto">
        {viewTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded whitespace-nowrap transition",
              activeView === tab.key
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "text-slate-500 border border-transparent"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left: AI Core + Activity (Discovery view) or Outline (other views) ── */}
        <div className="hidden lg:flex flex-col w-72 border-r border-sky-500/15 bg-slate-950/40 flex-shrink-0 overflow-hidden">
          {/* AI Core */}
          <div className="flex flex-col items-center py-4 border-b border-sky-500/10 flex-shrink-0">
            <AICore status={aiStatus} size="sm" />
          </div>

          {/* Project Health */}
          <div className="border-b border-sky-500/10 overflow-y-auto max-h-[260px]">
            <HudPanel title="PROJECT HEALTH" collapsible defaultOpen className="border-0 rounded-none">
              <ProjectHealth project={project} completeness={completeness} />
            </HudPanel>
          </div>

          {/* Activity Feed */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <HudPanel title="SYSTEM ACTIVITY" collapsible defaultOpen className="border-0 rounded-none h-full">
              <ActivityFeed events={activityEvents} />
            </HudPanel>
          </div>
        </div>

        {/* ── Center: Main View Area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Discovery View */}
          {activeView === "discovery" && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-4xl mx-auto w-full">
                <DiscoveryPanel
                  project={project}
                  onProjectUpdate={(updated) => {
                    handleProjectUpdate(updated);
                    addEvent("question_answered", "Discovery round updated");
                  }}
                  aiStatus={aiStatus}
                  onAIStatusChange={setAiStatus}
                />
              </div>
            </div>
          )}

          {/* Graph View */}
          {activeView === "graph" && (
            <div className="flex-1 flex overflow-hidden">
              <KnowledgeGraph
                project={project}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectNode}
                className="flex-1"
              />
              {/* Inspector Sidebar */}
              {showInspector && selectedNode && (
                <NodeInspector
                  node={selectedNode}
                  project={project}
                  onClose={() => {
                    setShowInspector(false);
                    setSelectedNodeId(null);
                  }}
                  onUpdateNode={handleUpdateNode}
                  onSelectNode={(id) => handleSelectNode(id)}
                />
              )}
            </div>
          )}

          {/* PRD View */}
          {activeView === "prd" && (
            <PRDView project={project} className="flex-1" />
          )}

          {/* Overview View */}
          {activeView === "overview" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Summary Header */}
                <div className="hud-panel rounded-xl p-6">
                  <div className="flex items-start gap-6">
                    <AICore status={aiStatus} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-slate-100">
                        {project.title}
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        {project.description || "No description yet. Answer discovery questions to build your project specification."}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <TechLabel text={project.domain || "UNKNOWN"} variant="info" size="xs" />
                        <TechLabel
                          text={`${project.nodes.length} NODES`}
                          variant="default"
                          size="xs"
                        />
                        <TechLabel
                          text={`${project.edges.length} EDGES`}
                          variant="default"
                          size="xs"
                        />
                        <TechLabel
                          text={`${Math.round(completeness.overall)}% COMPLETE`}
                          variant={
                            completeness.overall > 80
                              ? "success"
                              : completeness.overall > 50
                                ? "warning"
                                : "error"
                          }
                          size="xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health & Attention Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HudPanel title="SPECIFICATION COVERAGE" className="rounded-xl">
                    <ProjectHealth project={project} completeness={completeness} />
                  </HudPanel>
                  <HudPanel title="NEEDS ATTENTION" className="rounded-xl">
                    <NeedsAttention project={project} />
                  </HudPanel>
                </div>

                {/* Requirements Summary */}
                <HudPanel title="REQUIREMENTS" className="rounded-xl" collapsible defaultOpen>
                  {project.requirements.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center italic">
                      Requirements will appear as you answer discovery questions.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {project.requirements.map((req) => (
                        <div
                          key={req.id}
                          className="p-3 bg-slate-900/40 rounded border border-sky-500/10 hover:border-sky-500/25 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm text-slate-200 font-medium">
                              {req.title}
                            </span>
                            <TechLabel
                              text={req.priority}
                              variant={
                                req.priority === "critical"
                                  ? "error"
                                  : req.priority === "high"
                                    ? "warning"
                                    : "default"
                              }
                              size="xs"
                            />
                          </div>
                          {req.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {req.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </HudPanel>

                {/* Activity Log */}
                <HudPanel title="RECENT ACTIVITY" className="rounded-xl" collapsible defaultOpen>
                  <ActivityFeed events={activityEvents} />
                </HudPanel>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Needs Attention + Info (desktop only, toggleable) ── */}
        {showRightPanel && activeView !== "graph" && (
          <div className="hidden xl:flex flex-col w-72 border-l border-sky-500/15 bg-slate-950/40 flex-shrink-0 overflow-hidden">
            <HudPanel title="NEEDS ATTENTION" collapsible defaultOpen className="border-0 rounded-none overflow-y-auto max-h-[50%]">
              <NeedsAttention project={project} />
            </HudPanel>

            <div className="border-t border-sky-500/10 flex-1 overflow-y-auto">
              <HudPanel title="PROJECT INFO" collapsible defaultOpen className="border-0 rounded-none">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Domain</span>
                    <span className="text-slate-200 font-mono uppercase">{project.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nodes</span>
                    <span className="text-slate-200 font-mono">{project.nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Edges</span>
                    <span className="text-slate-200 font-mono">{project.edges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Questions</span>
                    <span className="text-slate-200 font-mono">{project.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assumptions</span>
                    <span className="text-slate-200 font-mono">{project.assumptions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Conflicts</span>
                    <span className="text-slate-200 font-mono">{project.conflicts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requirements</span>
                    <span className="text-slate-200 font-mono">{project.requirements.length}</span>
                  </div>
                </div>
              </HudPanel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
