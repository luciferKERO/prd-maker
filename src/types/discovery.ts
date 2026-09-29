export type QuestionPriority =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "optional";

export type QuestionStatus =
  | "pending"
  | "answered"
  | "skipped"
  | "deferred"
  | "obsolete";

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "text"
  | "number"
  | "boolean"
  | "slider"
  | "ranking"
  | "confirmation";

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface DiscoveryQuestion {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: QuestionPriority;
  questionType: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  blocking: boolean;
  dependsOn: string[];
  relatedNodeIds: string[];
  status: QuestionStatus;
  reason: string;
  answer?: unknown;
  answeredAt?: number;
}

export interface DiscoveryRound {
  id: string;
  roundNumber: number;
  questions: DiscoveryQuestion[];
  analysis: string;
  timestamp: number;
}

export interface DiscoveryState {
  currentRound: number;
  totalRounds: number;
  rounds: DiscoveryRound[];
  isComplete: boolean;
  completionReason?: string;
}
