import type { DiscoveryQuestion } from "./discovery";

export type ProjectStatus =
  | "discovery"
  | "in_progress"
  | "review"
  | "complete"
  | "archived";

export type KnowledgeStatus =
  | "inferred"
  | "assumed"
  | "draft"
  | "confirmed"
  | "rejected"
  | "needs_clarification"
  | "deprecated";

export type RequirementPriority =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "optional";

export type RequirementStatus =
  | "proposed"
  | "in_review"
  | "approved"
  | "in_progress"
  | "implemented"
  | "rejected"
  | "deferred";

export type ProjectNodeType =
  | "project"
  | "goal"
  | "non_goal"
  | "feature"
  | "requirement"
  | "user_story"
  | "system"
  | "screen"
  | "data_entity"
  | "integration"
  | "asset"
  | "constraint"
  | "risk"
  | "decision"
  | "assumption"
  | "contradiction"
  | "open_question"
  | "deferred"
  | "milestone"
  | "test_req"
  | "deploy_req"
  | "audience"
  | "persona"
  | "nfr"
  | "ux_ui_req"
  | "tech_req"
  | "content";

export type ProjectEdgeRelationship =
  | "DEPENDS_ON"
  | "REQUIRES"
  | "PART_OF"
  | "RELATED_TO"
  | "DERIVED_FROM"
  | "CONFLICTS_WITH"
  | "AFFECTS"
  | "IMPLEMENTS"
  | "BLOCKS"
  | "CONFIRMS";

export type AssumptionStatus =
  | "inferred"
  | "assumed"
  | "confirmed"
  | "rejected"
  | "needs_clarification";

export type ConflictStatus =
  | "detected"
  | "acknowledged"
  | "resolving"
  | "resolved";

export type RiskLikelihood = "low" | "medium" | "high";

export type RiskImpact = "low" | "medium" | "high";

export type RiskStatus =
  | "identified"
  | "analyzed"
  | "mitigated"
  | "accepted"
  | "closed";

export type RequirementType =
  | "functional"
  | "non_functional"
  | "ux_ui"
  | "technical";

export type DecisionStatus =
  | "proposed"
  | "accepted"
  | "rejected"
  | "deprecated";

export interface ProjectNode {
  id: string;
  type: ProjectNodeType;
  title: string;
  description: string;
  status: KnowledgeStatus;
  priority: RequirementPriority;
  confidence: number;
  source: string;
  category: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  relatedQuestionIds: string[];
}

export interface ProjectEdge {
  id: string;
  source: string;
  target: string;
  relationship: ProjectEdgeRelationship;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface ProjectDecision {
  id: string;
  title: string;
  description: string;
  status: DecisionStatus;
  options: string[];
  selectedOption?: string;
  reason?: string;
  impact?: string;
  relatedNodeIds: string[];
}

export interface ProjectAssumption {
  id: string;
  statement: string;
  status: AssumptionStatus;
  source: string;
  impact: string;
  relatedNodeIds: string[];
}

export interface ProjectConflict {
  id: string;
  description: string;
  nodeA: string;
  nodeB: string;
  status: ConflictStatus;
  resolution?: string;
  relatedNodeIds: string[];
}

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  mitigation?: string;
  status: RiskStatus;
  relatedNodeIds: string[];
}

export interface ProjectRequirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  acceptanceCriteria: string[];
  dependencies: string[];
  source: string;
  relatedFeatures: string[];
  constraints: string[];
  testConsiderations: string[];
}

export interface ProjectRevision {
  id: string;
  version: number;
  timestamp: number;
  description: string;
  changes: string[];
}

export interface ProjectMetadata {
  domain: string;
  platforms: string[];
  targetAudience?: string;
  techStack?: string[];
  projectType?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  domain: string;
  platforms: string[];
  status: ProjectStatus;
  nodes: ProjectNode[];
  edges: ProjectEdge[];
  questions: DiscoveryQuestion[];
  decisions: ProjectDecision[];
  assumptions: ProjectAssumption[];
  conflicts: ProjectConflict[];
  risks: ProjectRisk[];
  requirements: ProjectRequirement[];
  revisions: ProjectRevision[];
  metadata: ProjectMetadata;
  completeness: number;
  activeQuestionId?: string;
}
