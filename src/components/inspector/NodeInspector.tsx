"use client";

import React, { useState } from "react";
import { Project, ProjectNode, ProjectEdge } from "@/types/project";
import { HudPanel } from "@/components/ui/HudPanel";
import { TechLabel } from "@/components/ui/TechLabel";
import { cn } from "@/lib/utils";
import { X, ArrowRight, ShieldAlert, Link, Edit2, Check, FileText } from "lucide-react";

interface NodeInspectorProps {
  node: ProjectNode | null;
  project: Project;
  onClose: () => void;
  onUpdateNode?: (nodeId: string, updates: Partial<ProjectNode>) => void;
  onSelectNode?: (nodeId: string) => void;
  onJumpToQuestion?: (questionId: string) => void;
}

export function NodeInspector({
  node,
  project,
  onClose,
  onUpdateNode,
  onSelectNode,
  onJumpToQuestion,
}: NodeInspectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  if (!node) return null;

  // Find incoming & outgoing edges
  const incomingEdges = project.edges.filter((e) => e.target === node.id);
  const outgoingEdges = project.edges.filter((e) => e.source === node.id);

  // Find related nodes
  const incomingNodes = incomingEdges.map((e) => ({
    edge: e,
    node: project.nodes.find((n) => n.id === e.source),
  })).filter((item): item is { edge: ProjectEdge; node: ProjectNode } => !!item.node);

  const outgoingNodes = outgoingEdges.map((e) => ({
    edge: e,
    node: project.nodes.find((n) => n.id === e.target),
  })).filter((item): item is { edge: ProjectEdge; node: ProjectNode } => !!item.node);

  const handleStartEdit = () => {
    setEditedTitle(node.title);
    setEditedDescription(node.description || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateNode) {
      onUpdateNode(node.id, {
        title: editedTitle.trim() || node.title,
        description: editedDescription.trim(),
        updatedAt: Date.now(),
      });
    }
    setIsEditing(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "inferred":
      case "assumed":
        return "warning";
      case "conflicting":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "critical":
        return "text-rose-400 border-rose-500/30 bg-rose-500/10";
      case "high":
        return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      case "medium":
        return "text-sky-400 border-sky-500/30 bg-sky-500/10";
      default:
        return "text-slate-400 border-slate-500/30 bg-slate-500/10";
    }
  };

  return (
    <div className="w-80 md:w-96 flex flex-col h-full bg-slate-950/95 backdrop-blur-xl border-l border-sky-500/20 shadow-2xl p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
        <div className="flex items-center gap-2">
          <TechLabel text={node.type.replace("_", " ")} variant="info" size="xs" />
          <TechLabel text={node.status} variant={getStatusVariant(node.status)} size="xs" />
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Node Title & Description */}
      <div className="py-4 border-b border-sky-500/10">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-sky-400 uppercase font-mono tracking-wider">Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-sky-500/30 rounded text-sm text-slate-100 focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="text-xs text-sky-400 uppercase font-mono tracking-wider">Description</label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={3}
                className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-sky-500/30 rounded text-sm text-slate-100 focus:outline-none focus:border-sky-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-2.5 py-1 text-xs text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 rounded flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base text-slate-100 leading-snug">{node.title}</h3>
              {onUpdateNode && (
                <button
                  onClick={handleStartEdit}
                  className="p-1 text-slate-500 hover:text-sky-400 rounded transition"
                  title="Edit Node"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {node.description && (
              <p className="mt-2 text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-sky-500/10">
                {node.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Metadata Metrics */}
      <div className="py-3 border-b border-sky-500/10 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-slate-500 block">Priority</span>
          <span className={cn("font-medium uppercase tracking-wider text-[11px] px-1.5 py-0.5 rounded border inline-block mt-0.5", getPriorityColor(node.priority))}>
            {node.priority || "Normal"}
          </span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-slate-500 block">Confidence</span>
          <span className="font-mono text-sky-400 font-semibold mt-0.5 block">
            {Math.round((node.confidence || 1) * 100)}%
          </span>
        </div>
        <div className="col-span-2 bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-slate-500 block">Source</span>
          <span className="text-slate-300 truncate block mt-0.5 font-mono text-[11px]">
            {node.source || "User Answer"}
          </span>
        </div>
      </div>

      {/* Related Questions */}
      {node.relatedQuestionIds && node.relatedQuestionIds.length > 0 && (
        <div className="py-3 border-b border-sky-500/10">
          <span className="text-xs font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-2">
            <FileText className="w-3.5 h-3.5" /> Related Questions ({node.relatedQuestionIds.length})
          </span>
          <div className="space-y-1.5">
            {node.relatedQuestionIds.map((qid) => {
              const q = project.questions?.find((qu) => qu.id === qid);
              return (
                <div
                  key={qid}
                  className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-sky-500/30 transition text-xs"
                >
                  <span className="text-slate-300 truncate flex-1 pr-2">
                    {q?.title || qid}
                  </span>
                  {onJumpToQuestion && (
                    <button
                      onClick={() => onJumpToQuestion(qid)}
                      className="text-[10px] uppercase font-mono px-2 py-0.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 rounded"
                    >
                      Jump
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dependencies & Relationships */}
      <div className="py-3 space-y-4">
        {/* Outgoing (Depends On / Requires) */}
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
            <Link className="w-3.5 h-3.5 text-sky-400" /> Outgoing Links ({outgoingNodes.length})
          </span>
          {outgoingNodes.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic pl-1">No outgoing dependencies</p>
          ) : (
            <div className="space-y-1.5">
              {outgoingNodes.map(({ edge, node: targetNode }) => (
                <button
                  key={edge.id}
                  onClick={() => onSelectNode?.(targetNode.id)}
                  className="w-full text-left p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/40 transition group"
                >
                  <div className="flex items-center justify-between text-[10px] text-sky-400/80 font-mono">
                    <span>{edge.relationship}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-xs text-slate-200 truncate mt-0.5 font-medium">
                    {targetNode.title}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Incoming (Required By / Depended On) */}
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
            <Link className="w-3.5 h-3.5 text-teal-400" /> Incoming Links ({incomingNodes.length})
          </span>
          {incomingNodes.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic pl-1">No incoming dependencies</p>
          ) : (
            <div className="space-y-1.5">
              {incomingNodes.map(({ edge, node: sourceNode }) => (
                <button
                  key={edge.id}
                  onClick={() => onSelectNode?.(sourceNode.id)}
                  className="w-full text-left p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-800/40 transition group"
                >
                  <div className="flex items-center justify-between text-[10px] text-teal-400/80 font-mono">
                    <span>{edge.relationship}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-xs text-slate-200 truncate mt-0.5 font-medium">
                    {sourceNode.title}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
