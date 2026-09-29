"use client";

import { useState, useEffect, useRef } from "react";
import { Zap, Sparkles, Terminal, Activity, ArrowRight, Clock, Trash2 } from "lucide-react";
import { AICore } from "@/components/ai-core/AICore";
import { TechLabel } from "@/components/ui/TechLabel";
import { WorkspaceShell } from "@/components/command-center/WorkspaceShell";
import { DiscoveryEngine } from "@/lib/discovery/engine";
import { saveProject, listProjects, loadProject, deleteProject } from "@/lib/persistence/storage";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types/project";

const EXAMPLE_PROMPTS = [
  "A Roblox underwater exploration game with Atlantis theme",
  "An AI-powered video editor with automated captions",
  "A student task management web application with study timer",
  "A branching visual novel with multiple endings and inventory",
  "A productivity SaaS platform with team collaboration and billing",
];

// Lightweight particle canvas
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(render);
    };
    render();
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70"
    />
  );
}

export default function ActivationScreen() {
  const [prompt, setPrompt] = useState("");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Array<{ id: string; title: string; updatedAt: number }>>([]);

  useEffect(() => {
    setSavedProjects(listProjects());
  }, []);

  const handleInitialize = () => {
    if (!prompt.trim() || isInitializing) return;
    setIsInitializing(true);

    const initialProject: Project = {
      id: `proj_${Date.now()}`,
      title: prompt.slice(0, 45) + (prompt.length > 45 ? "..." : ""),
      description: prompt,
      domain: "general",
      platforms: ["Web"],
      status: "discovery",
      nodes: [],
      edges: [],
      questions: [],
      decisions: [],
      assumptions: [],
      conflicts: [],
      risks: [],
      requirements: [],
      revisions: [
        {
          id: `rev_${Date.now()}`,
          version: 1,
          timestamp: Date.now(),
          description: "Project initialized from activation prompt",
          changes: ["Initial creation"],
        },
      ],
      metadata: {
        domain: "general",
        platforms: ["Web"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      completeness: 10,
    };

    const engine = new DiscoveryEngine(initialProject);
    const { project: processedProject } = engine.processIdea(prompt);

    setTimeout(() => {
      saveProject(processedProject.id, processedProject);
      setActiveProject(processedProject);
      setIsInitializing(false);
      setSavedProjects(listProjects());
    }, 600);
  };

  const handleLoadProject = (id: string) => {
    const loaded = loadProject(id) as Project | null;
    if (loaded) setActiveProject(loaded);
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteProject(id);
    setSavedProjects(listProjects());
  };

  if (activeProject) {
    return (
      <WorkspaceShell
        project={activeProject}
        onBack={() => {
          setActiveProject(null);
          setSavedProjects(listProjects());
        }}
      />
    );
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 bg-[#060813] text-slate-100 overflow-hidden select-none">
      <ParticleBackground />

      {/* Top HUD */}
      <header className="z-10 w-full max-w-6xl flex items-center justify-between py-2 border-b border-sky-500/20">
        <div className="flex items-center space-x-2">
          <Terminal size={16} className="text-sky-400" />
          <span className="font-mono text-xs tracking-widest text-slate-400">
            PRD ARCHITECT // V1.0
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <TechLabel text="NEURAL ENGINE: READY" variant="success" size="xs" />
          <TechLabel text="LOCAL-FIRST SECURE" variant="info" size="xs" />
        </div>
      </header>

      {/* Center Hero */}
      <div className="z-10 flex flex-col items-center justify-center my-auto w-full max-w-2xl text-center space-y-6">
        <div className="my-2">
          <AICore
            status={isInitializing ? "analyzing" : "idle"}
            size="lg"
            customLabel={isInitializing ? "INITIALIZING ARCHITECTURE..." : "PRD ARCHITECT — ONLINE"}
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-sky-400 via-sky-200 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            PRD ARCHITECT
          </h1>
          <p className="font-mono text-xs sm:text-sm tracking-[0.2em] text-slate-400 uppercase">
            AUTONOMOUS AI PRODUCT DISCOVERY SYSTEM
          </p>
        </div>

        {/* Prompt */}
        <div className="w-full space-y-4">
          <div className="relative group">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleInitialize();
                }
              }}
              placeholder="Describe what you want to build..."
              className="w-full bg-slate-900/80 backdrop-blur-md border border-sky-500/20 group-hover:border-sky-500/40 focus:border-sky-400 text-slate-100 placeholder-slate-500 rounded-lg p-4 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all shadow-inner resize-none"
            />
            <span className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-sky-400 pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-sky-400 pointer-events-none" />
          </div>

          <button
            onClick={handleInitialize}
            disabled={!prompt.trim() || isInitializing}
            className={`w-full py-3.5 px-6 rounded-lg font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center space-x-2 border ${
              prompt.trim() && !isInitializing
                ? "bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.25)] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] cursor-pointer"
                : "bg-slate-900/40 text-slate-500 border-slate-800 cursor-not-allowed"
            }`}
          >
            {isInitializing ? (
              <>
                <Activity size={16} className="animate-spin text-sky-400" />
                <span>ANALYZING PROJECT ARCHITECTURE...</span>
              </>
            ) : (
              <>
                <Zap size={16} className="text-sky-400" />
                <span>INITIALIZE PROJECT</span>
                <ArrowRight size={14} className="text-sky-400 ml-1" />
              </>
            )}
          </button>
        </div>

        {/* Example Chips */}
        <div className="w-full flex flex-col items-center space-y-2">
          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Quick Archetypes
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-xs bg-slate-900/60 hover:bg-sky-500/10 border border-sky-500/15 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 px-3 py-1.5 rounded-full transition-all font-sans"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Projects */}
        {savedProjects.length > 0 && (
          <div className="w-full pt-4 border-t border-sky-500/10">
            <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block mb-2">
              Recent Projects ({savedProjects.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {savedProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleLoadProject(p.id)}
                  className="p-2.5 bg-slate-900/50 hover:bg-sky-500/10 border border-sky-500/15 hover:border-sky-500/30 rounded text-left cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs text-slate-200 font-medium truncate group-hover:text-sky-300">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDate(p.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(e, p.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="z-10 w-full max-w-6xl flex items-center justify-between py-2 border-t border-sky-500/15 text-[11px] font-mono text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYSTEM READY</span>
        </div>
        <span>SPECIFICATION ENGINE V1.0</span>
      </footer>
    </main>
  );
}
