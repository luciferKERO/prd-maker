import type { DiscoveryQuestion } from "./discovery";
import type {
  ProjectRequirement,
  ProjectNode,
  ProjectEdge,
  ProjectAssumption,
  ProjectConflict,
} from "./project";

export type AIStatus =
  | "idle"
  | "listening"
  | "analyzing"
  | "thinking"
  | "asking"
  | "updating"
  | "warning"
  | "complete"
  | "error";

export type AIOperationStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed";

export interface AIOperation {
  id: string;
  type: string;
  status: AIOperationStatus;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

export interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AIAnalysisResult {
  known: string[];
  missing: string[];
  ambiguous: string[];
  conflicts: string[];
  assumptions: string[];
  dependencies: string[];
  completeness: number;
  nextAction?: {
    type: string;
    label: string;
    description: string;
  };
}

export interface AIDiscoveryResponse {
  analysis: AIAnalysisResult;
  questions: DiscoveryQuestion[];
  requirements?: ProjectRequirement[];
  nodeUpdates?: Partial<ProjectNode>[];
  edgeUpdates?: ProjectEdge[];
  assumptionUpdates?: ProjectAssumption[];
  conflictUpdates?: ProjectConflict[];
  summary: string;
}
