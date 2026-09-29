"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Project, ProjectNode, ProjectEdge } from "@/types/project";
import { TechLabel } from "@/components/ui/TechLabel";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

interface KnowledgeGraphProps {
  project: Project;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  className?: string;
}

// Node styling by type
const NODE_TYPE_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  project: { color: "#38bdf8", label: "Project", icon: "⬡" },
  goal: { color: "#818cf8", label: "Goal", icon: "🎯" },
  feature: { color: "#34d399", label: "Feature", icon: "✦" },
  requirement: { color: "#38bdf8", label: "Req", icon: "📋" },
  user_story: { color: "#60a5fa", label: "Story", icon: "👤" },
  system: { color: "#a78bfa", label: "System", icon: "⚙" },
  screen: { color: "#f472b6", label: "Screen", icon: "📱" },
  data_entity: { color: "#fbbf24", label: "Data", icon: "🗄" },
  integration: { color: "#fb923c", label: "Integration", icon: "🔌" },
  asset: { color: "#e879f9", label: "Asset", icon: "📦" },
  constraint: { color: "#f87171", label: "Constraint", icon: "🛑" },
  risk: { color: "#ef4444", label: "Risk", icon: "⚠" },
  decision: { color: "#2dd4bf", label: "Decision", icon: "⚖" },
  assumption: { color: "#f59e0b", label: "Assumption", icon: "💭" },
  contradiction: { color: "#f43f5e", label: "Conflict", icon: "⚡" },
  open_question: { color: "#38bdf8", label: "Question", icon: "❓" },
  deferred: { color: "#94a3b8", label: "Deferred", icon: "⏳" },
  milestone: { color: "#4ade80", label: "Milestone", icon: "🚩" },
  test_req: { color: "#a3e635", label: "Test", icon: "🧪" },
  deploy_req: { color: "#22d3ee", label: "Deploy", icon: "🚀" },
};

interface SimNode {
  id: string;
  data: ProjectNode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  degree: number;
}

interface SimEdge {
  id: string;
  source: SimNode;
  target: SimNode;
  relationship: string;
}

export function KnowledgeGraph({
  project,
  selectedNodeId,
  onSelectNode,
  className,
}: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Camera state
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SimNode | null>(null);

  // Simulation nodes & edges refs
  const simNodesRef = useRef<SimNode[]>([]);
  const simEdgesRef = useRef<SimEdge[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Connected node IDs for dependency highlighting
  const highlightedNodeIds = useMemo(() => {
    if (!selectedNodeId) return null;
    const ids = new Set<string>([selectedNodeId]);
    project.edges.forEach((e) => {
      if (e.source === selectedNodeId) ids.add(e.target);
      if (e.target === selectedNodeId) ids.add(e.source);
    });
    return ids;
  }, [selectedNodeId, project.edges]);

  // Unique node types available in this project
  const availableTypes = useMemo(() => {
    const types = new Set(project.nodes.map((n) => n.type));
    return Array.from(types);
  }, [project.nodes]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return project.nodes.filter((node) => {
      if (typeFilter !== "all" && node.type !== typeFilter) return false;
      if (statusFilter !== "all" && node.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          node.title.toLowerCase().includes(q) ||
          node.description?.toLowerCase().includes(q) ||
          node.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [project.nodes, typeFilter, statusFilter, searchQuery]);

  // Initialize or update simulation nodes
  useEffect(() => {
    const nodeMap = new Map<string, SimNode>();

    // Degree calculation
    const degrees: Record<string, number> = {};
    project.edges.forEach((e) => {
      degrees[e.source] = (degrees[e.source] || 0) + 1;
      degrees[e.target] = (degrees[e.target] || 0) + 1;
    });

    // Existing nodes position preservation
    const existingMap = new Map(simNodesRef.current.map((n) => [n.id, n]));

    const count = filteredNodes.length;
    const angleStep = (2 * Math.PI) / Math.max(1, count);

    const newSimNodes: SimNode[] = filteredNodes.map((node, i) => {
      const existing = existingMap.get(node.id);
      const degree = degrees[node.id] || 0;
      const radius = Math.max(14, Math.min(32, 14 + degree * 2.5));

      if (existing) {
        existing.data = node;
        existing.degree = degree;
        existing.radius = radius;
        nodeMap.set(node.id, existing);
        return existing;
      }

      // Arrange in radial orbits
      const distance = 120 + Math.sqrt(i) * 90;
      const x = Math.cos(angleStep * i) * distance + (Math.random() - 0.5) * 40;
      const y = Math.sin(angleStep * i) * distance + (Math.random() - 0.5) * 40;

      const simNode: SimNode = {
        id: node.id,
        data: node,
        x,
        y,
        vx: 0,
        vy: 0,
        radius,
        degree,
      };
      nodeMap.set(node.id, simNode);
      return simNode;
    });

    const newSimEdges: SimEdge[] = [];
    project.edges.forEach((e) => {
      const source = nodeMap.get(e.source);
      const target = nodeMap.get(e.target);
      if (source && target) {
        newSimEdges.push({
          id: e.id,
          source,
          target,
          relationship: e.relationship,
        });
      }
    });

    simNodesRef.current = newSimNodes;
    simEdgesRef.current = newSimEdges;
  }, [filteredNodes, project.edges]);

  // Canvas drawing & Physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Handle canvas resize
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.floor(rect.width * dpr);
      const targetHeight = Math.floor(rect.height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      const nodes = simNodesRef.current;
      const edges = simEdgesRef.current;
      const { x: camX, y: camY, zoom } = cameraRef.current;

      // --- Physics Step ---
      const N = nodes.length;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minRange = nodes[i].radius + nodes[j].radius + 60;
          if (dist < 400) {
            const force = (minRange * minRange) / (dist * dist * 3);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          }
        }
      }

      // Edge spring forces
      edges.forEach((e) => {
        const dx = e.target.x - e.source.x;
        const dy = e.target.y - e.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 140;
        const force = (dist - targetDist) * 0.02;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        e.source.vx += fx;
        e.source.vy += fy;
        e.target.vx -= fx;
        e.target.vy -= fy;
      });

      // Gravity towards center & friction
      nodes.forEach((n) => {
        n.vx -= n.x * 0.002;
        n.vy -= n.y * 0.002;
        n.vx *= 0.88;
        n.vy *= 0.88;
        if (n !== draggedNodeRef.current) {
          n.x += n.vx;
          n.y += n.vy;
        }
      });

      // --- Draw Canvas ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(rect.width / 2 + camX, rect.height / 2 + camY);
      ctx.scale(zoom, zoom);

      // 1. Draw Edges
      edges.forEach((e) => {
        const isHighlighted =
          !highlightedNodeIds ||
          (highlightedNodeIds.has(e.source.id) && highlightedNodeIds.has(e.target.id));
        const isDimmed = highlightedNodeIds && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(e.source.x, e.source.y);
        ctx.lineTo(e.target.x, e.target.y);

        if (e.relationship === "CONFLICTS_WITH") {
          ctx.strokeStyle = isDimmed ? "rgba(244, 63, 94, 0.15)" : "rgba(244, 63, 94, 0.8)";
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
        } else if (e.relationship === "DEPENDS_ON" || e.relationship === "REQUIRES") {
          ctx.strokeStyle = isDimmed ? "rgba(56, 189, 248, 0.1)" : "rgba(56, 189, 248, 0.6)";
          ctx.setLineDash([]);
          ctx.lineWidth = isHighlighted ? 2 : 1;
        } else {
          ctx.strokeStyle = isDimmed ? "rgba(148, 163, 184, 0.08)" : "rgba(148, 163, 184, 0.35)";
          ctx.setLineDash([]);
          ctx.lineWidth = 1;
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Relationship label if zoomed in
        if (zoom > 0.8 && !isDimmed) {
          const midX = (e.source.x + e.target.x) / 2;
          const midY = (e.source.y + e.target.y) / 2;
          ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
          ctx.font = "8px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(e.relationship.toLowerCase().replace("_", " "), midX, midY - 6);
        }
      });

      // 2. Draw Nodes
      nodes.forEach((n) => {
        const isSelected = n.id === selectedNodeId;
        const isHighlighted = !highlightedNodeIds || highlightedNodeIds.has(n.id);
        const isDimmed = highlightedNodeIds && !isHighlighted;

        const config = NODE_TYPE_CONFIG[n.data.type] || {
          color: "#38bdf8",
          label: n.data.type,
          icon: "●",
        };
        const color = config.color;

        // Outer glow
        if (isSelected || (isHighlighted && highlightedNodeIds)) {
          const glow = ctx.createRadialGradient(n.x, n.y, n.radius * 0.8, n.x, n.y, n.radius * 2.5);
          glow.addColorStop(0, color + "60");
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node Circle Body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDimmed ? "#0a1020" : isSelected ? "#0f172a" : "#0a0f1d";
        ctx.fill();

        ctx.strokeStyle = isDimmed ? color + "20" : isSelected ? "#ffffff" : color;
        ctx.lineWidth = isSelected ? 3 : isHighlighted ? 2 : 1;
        ctx.stroke();

        // Icon inside node
        ctx.fillStyle = isDimmed ? color + "30" : isSelected ? "#ffffff" : color;
        ctx.font = `${Math.round(n.radius * 0.9)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(config.icon, n.x, n.y + 1);

        // Node Title Label
        if (zoom > 0.4 || isSelected) {
          ctx.fillStyle = isDimmed ? "rgba(148, 163, 184, 0.3)" : isSelected ? "#ffffff" : "#e2e8f0";
          ctx.font = `${isSelected ? "bold " : ""}11px 'Inter', sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          const label = n.data.title.length > 22 ? n.data.title.slice(0, 20) + "…" : n.data.title;
          ctx.fillText(label, n.x, n.y + n.radius + 6);

          // Type subtitle
          if (zoom > 0.7 && !isDimmed) {
            ctx.fillStyle = color + "aa";
            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.fillText(config.label.toUpperCase(), n.x, n.y + n.radius + 20);
          }
        }
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedNodeId, highlightedNodeIds]);

  // Coordinate transforms
  const getMouseWorldPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const { x: camX, y: camY, zoom } = cameraRef.current;
    return {
      x: (clientX - rect.width / 2 - camX) / zoom,
      y: (clientY - rect.height / 2 - camY) / zoom,
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMouseWorldPos(e);
    const nodes = simNodesRef.current;

    // Check hit on nodes
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = n.x - pos.x;
      const dy = n.y - pos.y;
      if (Math.hypot(dx, dy) <= n.radius + 6) {
        draggedNodeRef.current = n;
        n.vx = 0;
        n.vy = 0;
        onSelectNode(n.id);
        return;
      }
    }

    // Otherwise pan canvas
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - cameraRef.current.x,
      y: e.clientY - cameraRef.current.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      const pos = getMouseWorldPos(e);
      draggedNodeRef.current.x = pos.x;
      draggedNodeRef.current.y = pos.y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      return;
    }

    if (isDraggingRef.current) {
      cameraRef.current.x = e.clientX - dragStartRef.current.x;
      cameraRef.current.y = e.clientY - dragStartRef.current.y;
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.max(0.15, Math.min(3.5, cameraRef.current.zoom * zoomFactor));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    cameraRef.current.x -= (mouseX - cameraRef.current.x) * (zoomFactor - 1);
    cameraRef.current.y -= (mouseY - cameraRef.current.y) * (zoomFactor - 1);
    cameraRef.current.zoom = newZoom;
  };

  const handleResetCamera = () => {
    cameraRef.current = { x: 0, y: 0, zoom: 1 };
  };

  const handleZoom = (direction: "in" | "out") => {
    const factor = direction === "in" ? 1.25 : 0.8;
    cameraRef.current.zoom = Math.max(0.15, Math.min(3.5, cameraRef.current.zoom * factor));
  };

  return (
    <div className={cn("relative w-full h-full bg-[#060813] overflow-hidden select-none", className)}>
      {/* Top Search & Filter HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-sky-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-sky-500/20 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 w-44 md:w-56"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 border backdrop-blur-md transition",
              showFilters
                ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                : "bg-slate-900/80 border-sky-500/20 text-slate-400 hover:text-slate-200"
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {(typeFilter !== "all" || statusFilter !== "all") && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
            )}
          </button>
        </div>

        {/* Node stats badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <TechLabel
            text={`${filteredNodes.length} NODES / ${project.edges.length} EDGES`}
            variant="info"
            size="xs"
          />
        </div>
      </div>

      {/* Expandable Filter Menu */}
      {showFilters && (
        <div className="absolute top-14 left-3 z-10 p-3 bg-slate-950/90 backdrop-blur-xl border border-sky-500/30 rounded-lg shadow-2xl space-y-3 w-64">
          <div>
            <label className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-1">
              Node Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-400"
            >
              <option value="all">All Types ({project.nodes.length})</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-400"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="inferred">Inferred</option>
              <option value="assumed">Assumed</option>
              <option value="conflicting">Conflicting</option>
              <option value="missing">Missing</option>
            </select>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setTypeFilter("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="text-[10px] text-slate-400 hover:text-sky-300 uppercase font-mono"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Floating Canvas Controls (Zoom / Pan / Reset) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 bg-slate-950/80 backdrop-blur-md border border-sky-500/20 p-1.5 rounded-lg shadow-xl">
        <button
          onClick={() => handleZoom("in")}
          className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom("out")}
          className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded transition"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Empty State Overlay */}
      {filteredNodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-3">
            <Sparkles className="w-8 h-8 text-sky-400 animate-pulse" />
          </div>
          <h4 className="text-base font-semibold text-slate-200">Knowledge Graph Standby</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Answer discovery questions to generate project entities, features, requirements, and dependencies.
          </p>
        </div>
      )}
    </div>
  );
}
