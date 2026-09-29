import type { Project } from "../../types/project";

export interface CategorySpec {
  id: string;
  label: string;
  weight: number;
  expectedCount: number;
  nodeTypes?: string[];
  categories?: string[];
}

export const DOMAIN_CATEGORY_TEMPLATES: Record<string, CategorySpec[]> = {
  game: [
    { id: "vision", label: "Vision & Concept", weight: 2.0, expectedCount: 1, categories: ["vision", "concept"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Target Audience", weight: 2.0, expectedCount: 1, categories: ["audience", "demographics"], nodeTypes: ["audience", "persona"] },
    { id: "genre", label: "Genre & Theme", weight: 2.0, expectedCount: 1, categories: ["genre", "theme", "art_audio"] },
    { id: "platform", label: "Target Platforms", weight: 1.5, expectedCount: 1, categories: ["platform", "hardware"] },
    { id: "core_gameplay", label: "Core Gameplay & Loop", weight: 2.0, expectedCount: 2, categories: ["core_experience", "gameplay", "mechanics"] },
    { id: "features", label: "Game Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "multiplayer", label: "Multiplayer & Network", weight: 1.0, expectedCount: 1, categories: ["multiplayer", "network", "social"] },
    { id: "progression", label: "Progression & Economy", weight: 1.0, expectedCount: 1, categories: ["progression", "economy", "retention"] },
    { id: "art_audio", label: "Art & Audio Style", weight: 1.0, expectedCount: 1, categories: ["art_audio", "visual", "sound"] },
    { id: "monetization", label: "Monetization Strategy", weight: 1.0, expectedCount: 1, categories: ["monetization", "business"] },
    { id: "technical", label: "Engine & Tech Stack", weight: 0.5, expectedCount: 1, categories: ["technical", "tech_stack", "engine"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "QA & Playtesting", weight: 0.5, expectedCount: 1, categories: ["testing", "qa"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Publishing & Launch", weight: 0.5, expectedCount: 1, categories: ["deployment", "launch"], nodeTypes: ["deploy_req"] },
  ],
  web_app: [
    { id: "vision", label: "Product Vision", weight: 2.0, expectedCount: 1, categories: ["vision", "concept"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Target Audience & Personas", weight: 2.0, expectedCount: 1, categories: ["audience", "target"], nodeTypes: ["audience", "persona"] },
    { id: "features", label: "Core Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "auth", label: "Auth & Permissions", weight: 1.5, expectedCount: 1, categories: ["auth", "security"] },
    { id: "data", label: "Data Model & Storage", weight: 1.5, expectedCount: 1, categories: ["data", "database"], nodeTypes: ["data_entity"] },
    { id: "ui_ux", label: "UI/UX & Layout", weight: 1.5, expectedCount: 1, categories: ["ui_ux", "design"], nodeTypes: ["ux_ui_req", "screen"] },
    { id: "technical", label: "Tech Stack & Architecture", weight: 0.5, expectedCount: 1, categories: ["technical", "tech_stack"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Testing Strategy", weight: 0.5, expectedCount: 1, categories: ["testing", "qa"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Hosting & CI/CD", weight: 0.5, expectedCount: 1, categories: ["deployment", "devops"], nodeTypes: ["deploy_req"] },
  ],
  saas: [
    { id: "vision", label: "Value Proposition & Vision", weight: 2.0, expectedCount: 1, categories: ["vision"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "B2B / Target Customers", weight: 2.0, expectedCount: 1, categories: ["audience"], nodeTypes: ["audience", "persona"] },
    { id: "features", label: "Product Modules & Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "auth", label: "Multi-tenancy & RBAC", weight: 1.5, expectedCount: 1, categories: ["auth", "multitenancy", "security"] },
    { id: "data", label: "Data Pipeline & Analytics", weight: 1.5, expectedCount: 1, categories: ["data"], nodeTypes: ["data_entity"] },
    { id: "monetization", label: "Subscription & Billing", weight: 1.5, expectedCount: 1, categories: ["monetization", "billing"] },
    { id: "integrations", label: "Third-Party Integrations", weight: 1.0, expectedCount: 1, categories: ["integration"], nodeTypes: ["integration"] },
    { id: "technical", label: "Cloud Infrastructure", weight: 0.5, expectedCount: 1, categories: ["technical"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "SLA & Reliability Testing", weight: 0.5, expectedCount: 1, categories: ["testing"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Enterprise Deployment", weight: 0.5, expectedCount: 1, categories: ["deployment"], nodeTypes: ["deploy_req"] },
  ],
  mobile_app: [
    { id: "vision", label: "Vision & Value Prop", weight: 2.0, expectedCount: 1, categories: ["vision"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Target Audience", weight: 2.0, expectedCount: 1, categories: ["audience"], nodeTypes: ["audience", "persona"] },
    { id: "platform", label: "iOS / Android Scope", weight: 1.5, expectedCount: 1, categories: ["platform", "mobile"] },
    { id: "features", label: "Core Mobile Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "navigation", label: "Navigation & Gestures", weight: 1.5, expectedCount: 1, categories: ["ui_ux", "navigation"], nodeTypes: ["ux_ui_req", "screen"] },
    { id: "offline", label: "Offline Storage & Sync", weight: 1.0, expectedCount: 1, categories: ["offline", "data"] },
    { id: "notifications", label: "Push & Permissions", weight: 1.0, expectedCount: 1, categories: ["notifications", "permissions"] },
    { id: "technical", label: "Mobile Framework", weight: 0.5, expectedCount: 1, categories: ["technical"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Device Testing & QA", weight: 0.5, expectedCount: 1, categories: ["testing"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Store Release (App Store/Play)", weight: 0.5, expectedCount: 1, categories: ["deployment"], nodeTypes: ["deploy_req"] },
  ],
  visual_novel: [
    { id: "vision", label: "Story Premise & Theme", weight: 2.0, expectedCount: 1, categories: ["vision", "story"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Target Reader & Rating", weight: 2.0, expectedCount: 1, categories: ["audience", "rating"], nodeTypes: ["audience", "persona"] },
    { id: "characters", label: "Main Cast & Characters", weight: 2.0, expectedCount: 2, categories: ["character", "cast"] },
    { id: "branching", label: "Branching Routes & Endings", weight: 2.0, expectedCount: 2, categories: ["branching", "narrative", "choices"] },
    { id: "art_audio", label: "Art Style & Music / Voice", weight: 1.5, expectedCount: 1, categories: ["art_audio", "visual", "sound"] },
    { id: "engine", label: "Engine (Ren'Py / Unity)", weight: 1.0, expectedCount: 1, categories: ["engine", "technical"], nodeTypes: ["tech_req"] },
    { id: "monetization", label: "Distribution & Pricing", weight: 1.0, expectedCount: 1, categories: ["monetization", "distribution"] },
    { id: "testing", label: "Route QA & Script Proofing", weight: 0.5, expectedCount: 1, categories: ["testing"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Publishing (Steam / Itch.io)", weight: 0.5, expectedCount: 1, categories: ["deployment"], nodeTypes: ["deploy_req"] },
  ],
  api: [
    { id: "vision", label: "API Purpose & Scope", weight: 2.0, expectedCount: 1, categories: ["vision"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Developer Consumers", weight: 2.0, expectedCount: 1, categories: ["audience"], nodeTypes: ["audience", "persona"] },
    { id: "features", label: "Endpoints & Resources", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "auth", label: "Auth & Rate Limiting", weight: 2.0, expectedCount: 1, categories: ["auth", "security"] },
    { id: "data", label: "Schemas & Data Contracts", weight: 1.5, expectedCount: 2, categories: ["data"], nodeTypes: ["data_entity"] },
    { id: "technical", label: "Protocols & Latency", weight: 0.5, expectedCount: 1, categories: ["technical"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Contract & Load Tests", weight: 0.5, expectedCount: 1, categories: ["testing"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Gateway & Versioning", weight: 0.5, expectedCount: 1, categories: ["deployment"], nodeTypes: ["deploy_req"] },
  ],
  ai_tool: [
    { id: "vision", label: "AI Capability & Value", weight: 2.0, expectedCount: 1, categories: ["vision"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Target Users", weight: 2.0, expectedCount: 1, categories: ["audience"], nodeTypes: ["audience", "persona"] },
    { id: "features", label: "AI Workflows & Output", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "data", label: "Data / RAG Pipeline", weight: 1.5, expectedCount: 1, categories: ["data", "embeddings"], nodeTypes: ["data_entity"] },
    { id: "ui_ux", label: "Interaction & Prompt UX", weight: 1.5, expectedCount: 1, categories: ["ui_ux"], nodeTypes: ["ux_ui_req", "screen"] },
    { id: "technical", label: "Models & Inference Latency", weight: 0.5, expectedCount: 1, categories: ["technical"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Eval & Hallucination Guardrails", weight: 0.5, expectedCount: 1, categories: ["testing"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Inference Scaling & Fallbacks", weight: 0.5, expectedCount: 1, categories: ["deployment"], nodeTypes: ["deploy_req"] },
  ],
  creative: [
    { id: "vision", label: "Vision & Creative Scope", weight: 2.0, expectedCount: 1, categories: ["vision", "concept"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Target Audience & Creators", weight: 2.0, expectedCount: 1, categories: ["audience", "target"], nodeTypes: ["audience", "persona"] },
    { id: "core_experience", label: "Core Editing / Creation Workflow", weight: 2.0, expectedCount: 2, categories: ["core_experience", "workflow", "editing"] },
    { id: "features", label: "Creative Tools & Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "technical", label: "Technical Architecture & Rendering", weight: 0.5, expectedCount: 1, categories: ["technical", "tech_stack"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Testing & Quality Assurance", weight: 0.5, expectedCount: 1, categories: ["testing", "qa"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Deployment & Export Delivery", weight: 0.5, expectedCount: 1, categories: ["deployment", "launch", "export"], nodeTypes: ["deploy_req"] },
  ],
  educational: [
    { id: "vision", label: "Vision & Learning Goals", weight: 2.0, expectedCount: 1, categories: ["vision", "concept"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Target Learners & Educators", weight: 2.0, expectedCount: 1, categories: ["audience", "target"], nodeTypes: ["audience", "persona"] },
    { id: "core_experience", label: "Learning Loop & Quizzes", weight: 2.0, expectedCount: 2, categories: ["core_experience", "learning", "curriculum"] },
    { id: "features", label: "Educational Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "technical", label: "Tech Stack & Architecture", weight: 0.5, expectedCount: 1, categories: ["technical", "tech_stack"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Testing & QA", weight: 0.5, expectedCount: 1, categories: ["testing", "qa"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Hosting & Distribution", weight: 0.5, expectedCount: 1, categories: ["deployment"], nodeTypes: ["deploy_req"] },
  ],
  community: [
    { id: "vision", label: "Community Purpose & Vision", weight: 2.0, expectedCount: 1, categories: ["vision"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Community Members & Moderation", weight: 2.0, expectedCount: 1, categories: ["audience"], nodeTypes: ["audience", "persona"] },
    { id: "core_experience", label: "Feed, Threads & Interaction", weight: 2.0, expectedCount: 2, categories: ["core_experience", "feed", "messaging"] },
    { id: "features", label: "Social Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "auth", label: "Auth & User Identity", weight: 1.5, expectedCount: 1, categories: ["auth", "security"] },
    { id: "technical", label: "Real-Time Stack & Infrastructure", weight: 0.5, expectedCount: 1, categories: ["technical"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Testing & Moderation QA", weight: 0.5, expectedCount: 1, categories: ["testing"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Deployment & Scaling", weight: 0.5, expectedCount: 1, categories: ["deployment"], nodeTypes: ["deploy_req"] },
  ],
  automation: [
    { id: "vision", label: "Automation Scope & Value", weight: 2.0, expectedCount: 1, categories: ["vision"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Target Operators / Teams", weight: 2.0, expectedCount: 1, categories: ["audience"], nodeTypes: ["audience", "persona"] },
    { id: "core_experience", label: "Triggers, Actions & Pipelines", weight: 2.0, expectedCount: 2, categories: ["core_experience", "workflow", "pipeline"] },
    { id: "features", label: "Bot & Pipeline Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "technical", label: "Execution Engine & Reliability", weight: 0.5, expectedCount: 1, categories: ["technical"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Testing & Error Handling", weight: 0.5, expectedCount: 1, categories: ["testing"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Runner Hosting & Scheduling", weight: 0.5, expectedCount: 1, categories: ["deployment"], nodeTypes: ["deploy_req"] },
  ],
  desktop: [
    { id: "vision", label: "Product Vision", weight: 2.0, expectedCount: 1, categories: ["vision"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Desktop Users", weight: 2.0, expectedCount: 1, categories: ["audience"], nodeTypes: ["audience", "persona"] },
    { id: "core_experience", label: "Desktop Workflow & UX", weight: 2.0, expectedCount: 2, categories: ["core_experience", "workflow"] },
    { id: "features", label: "Core Desktop Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "technical", label: "Desktop Framework & OS Support", weight: 0.5, expectedCount: 1, categories: ["technical"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Testing & OS Compatibility", weight: 0.5, expectedCount: 1, categories: ["testing"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Packaging & Auto-Update", weight: 0.5, expectedCount: 1, categories: ["deployment"], nodeTypes: ["deploy_req"] },
  ],
  default: [
    { id: "vision", label: "Vision & Value Prop", weight: 2.0, expectedCount: 1, categories: ["vision", "concept"], nodeTypes: ["project", "goal"] },
    { id: "audience", label: "Target Audience", weight: 2.0, expectedCount: 1, categories: ["audience", "target"], nodeTypes: ["audience", "persona"] },
    { id: "core_experience", label: "Core Experience", weight: 2.0, expectedCount: 2, categories: ["core_experience", "gameplay", "workflow"] },
    { id: "features", label: "Key Features", weight: 2.0, expectedCount: 3, nodeTypes: ["feature", "requirement"] },
    { id: "technical", label: "Technical Architecture", weight: 0.5, expectedCount: 1, categories: ["technical", "tech_stack"], nodeTypes: ["tech_req", "system"] },
    { id: "testing", label: "Testing & Quality", weight: 0.5, expectedCount: 1, categories: ["testing", "qa"], nodeTypes: ["test_req"] },
    { id: "deployment", label: "Deployment & Delivery", weight: 0.5, expectedCount: 1, categories: ["deployment", "launch"], nodeTypes: ["deploy_req"] },
  ]
};

export function calculateProjectCompleteness(project: Project): {
  overall: number;
  categories: Record<string, { score: number; total: number; label: string }>;
} {
  const domain = project.domain || project.metadata?.domain || "default";
  const templateList = DOMAIN_CATEGORY_TEMPLATES[domain] || DOMAIN_CATEGORY_TEMPLATES.default;

  const nodes = project.nodes || [];
  const categories: Record<string, { score: number; total: number; label: string }> = {};

  let totalWeightedScore = 0;
  let totalWeightedMax = 0;

  for (const cat of templateList) {
    const matchingNodes = nodes.filter((n) => {
      const typeMatch = cat.nodeTypes?.includes(n.type);
      const catMatch = cat.categories?.some((c) => {
        const nodeCat = (n.category || "").toLowerCase();
        const nodeTitle = (n.title || "").toLowerCase();
        return nodeCat === c || nodeCat.includes(c) || nodeTitle.includes(c);
      });
      return typeMatch || catMatch;
    });

    let nodeScore = 0;
    for (const node of matchingNodes) {
      if (node.status === "confirmed") {
        nodeScore += 1.0;
      } else if (node.status === "inferred" || node.status === "assumed") {
        nodeScore += 0.75;
      } else if (node.status === "draft") {
        nodeScore += 0.5;
      }
    }

    const clampedScore = Math.min(nodeScore, cat.expectedCount);
    categories[cat.id] = {
      score: Number(clampedScore.toFixed(1)),
      total: cat.expectedCount,
      label: cat.label,
    };

    totalWeightedScore += clampedScore * cat.weight;
    totalWeightedMax += cat.expectedCount * cat.weight;
  }

  const overall = totalWeightedMax > 0
    ? Math.min(100, Math.max(0, Math.round((totalWeightedScore / totalWeightedMax) * 100)))
    : 0;

  return {
    overall,
    categories,
  };
}
