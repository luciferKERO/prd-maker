import { z } from "zod";

// --- Shared enums as Zod literals ---

const questionPriority = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "optional",
]);
const questionStatus = z.enum([
  "pending",
  "answered",
  "skipped",
  "deferred",
  "obsolete",
]);
const questionType = z.enum([
  "single_choice",
  "multiple_choice",
  "text",
  "number",
  "boolean",
  "slider",
  "ranking",
  "confirmation",
]);

const knowledgeStatus = z.enum([
  "inferred",
  "assumed",
  "draft",
  "confirmed",
  "rejected",
  "needs_clarification",
  "deprecated",
]);

const requirementPriority = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "optional",
]);

const requirementStatus = z.enum([
  "proposed",
  "in_review",
  "approved",
  "in_progress",
  "implemented",
  "rejected",
  "deferred",
]);

const requirementType = z.enum([
  "functional",
  "non_functional",
  "ux_ui",
  "technical",
]);

const nodeType = z.enum([
  "project",
  "goal",
  "non_goal",
  "feature",
  "requirement",
  "user_story",
  "system",
  "screen",
  "data_entity",
  "integration",
  "asset",
  "constraint",
  "risk",
  "decision",
  "assumption",
  "contradiction",
  "open_question",
  "deferred",
  "milestone",
  "test_req",
  "deploy_req",
  "audience",
  "persona",
  "nfr",
  "ux_ui_req",
  "tech_req",
  "content",
]);

const edgeRelationship = z.enum([
  "DEPENDS_ON",
  "REQUIRES",
  "PART_OF",
  "RELATED_TO",
  "DERIVED_FROM",
  "CONFLICTS_WITH",
  "AFFECTS",
  "IMPLEMENTS",
  "BLOCKS",
  "CONFIRMS",
]);

const assumptionStatus = z.enum([
  "inferred",
  "assumed",
  "confirmed",
  "rejected",
  "needs_clarification",
]);

const conflictStatus = z.enum([
  "detected",
  "acknowledged",
  "resolving",
  "resolved",
]);

// --- Schemas ---

export const zodDiscoveryQuestion = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  priority: questionPriority,
  questionType: questionType,
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
  required: z.boolean(),
  blocking: z.boolean(),
  dependsOn: z.array(z.string()),
  relatedNodeIds: z.array(z.string()),
  status: questionStatus,
  reason: z.string(),
  answer: z.unknown().optional(),
  answeredAt: z.number().optional(),
});

export const zodProjectNode = z.object({
  id: z.string(),
  type: nodeType,
  title: z.string(),
  description: z.string(),
  status: knowledgeStatus,
  priority: requirementPriority,
  confidence: z.number().min(0).max(1),
  source: z.string(),
  category: z.string(),
  metadata: z.record(z.unknown()),
  createdAt: z.number(),
  updatedAt: z.number(),
  relatedQuestionIds: z.array(z.string()),
});

export const zodProjectEdge = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relationship: edgeRelationship,
  label: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const zodProjectRequirement = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: requirementType,
  priority: requirementPriority,
  status: requirementStatus,
  acceptanceCriteria: z.array(z.string()),
  dependencies: z.array(z.string()),
  source: z.string(),
  relatedFeatures: z.array(z.string()),
  constraints: z.array(z.string()),
  testConsiderations: z.array(z.string()),
});

const zodProjectAssumption = z.object({
  id: z.string(),
  statement: z.string(),
  status: assumptionStatus,
  source: z.string(),
  impact: z.string(),
  relatedNodeIds: z.array(z.string()),
});

const zodProjectConflict = z.object({
  id: z.string(),
  description: z.string(),
  nodeA: z.string(),
  nodeB: z.string(),
  status: conflictStatus,
  resolution: z.string().optional(),
  relatedNodeIds: z.array(z.string()),
});

const zodAIAnalysisResult = z.object({
  known: z.array(z.string()),
  missing: z.array(z.string()),
  ambiguous: z.array(z.string()),
  conflicts: z.array(z.string()),
  assumptions: z.array(z.string()),
  dependencies: z.array(z.string()),
  completeness: z.number().min(0).max(100),
  nextAction: z
    .object({
      type: z.string(),
      label: z.string(),
      description: z.string(),
    })
    .optional(),
});

export const zodAIDiscoveryResponse = z.object({
  analysis: zodAIAnalysisResult,
  questions: z.array(zodDiscoveryQuestion),
  requirements: z.array(zodProjectRequirement).optional(),
  nodeUpdates: z.array(zodProjectNode.partial()).optional(),
  edgeUpdates: z.array(zodProjectEdge).optional(),
  assumptionUpdates: z.array(zodProjectAssumption).optional(),
  conflictUpdates: z.array(zodProjectConflict).optional(),
  summary: z.string(),
});
