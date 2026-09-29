export type PRDSectionStatus =
  | "draft"
  | "reviewed"
  | "final"
  | "not_applicable";

export type ExportFormat = "markdown" | "json" | "clipboard";

export interface PRDSection {
  id: string;
  title: string;
  order: number;
  content: string;
  status: PRDSectionStatus;
  relatedNodeIds: string[];
}

export interface PRDDocument {
  id: string;
  projectId: string;
  title: string;
  sections: PRDSection[];
  generatedAt: number;
  version: number;
  exportFormats: ("markdown" | "json" | "html")[];
}
