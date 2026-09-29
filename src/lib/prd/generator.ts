import type { Project, ProjectNode } from "../../types/project";
import type { PRDDocument, PRDSection, PRDSectionStatus } from "../../types/prd";

interface SectionDef {
  id: string;
  title: string;
  order: number;
  nodeTypes?: string[];
  categories?: string[];
  generator: (nodes: ProjectNode[], project: Project) => string;
}

function nodesOf(nodes: ProjectNode[], types?: string[], categories?: string[]): ProjectNode[] {
  return nodes.filter((n) => {
    if (types && types.includes(n.type)) return true;
    if (categories) {
      const cat = (n.category || "").toLowerCase();
      return categories.some((c) => cat === c || cat.includes(c));
    }
    return false;
  });
}

function bulletList(items: string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

function nodeBlock(n: ProjectNode): string {
  let block = `### ${n.title}\n\n${n.description}\n\n`;
  block += `- **Status:** ${n.status}\n`;
  block += `- **Priority:** ${n.priority}\n`;
  block += `- **Confidence:** ${Math.round(n.confidence * 100)}%\n`;
  return block;
}

const SECTION_DEFS: SectionDef[] = [
  {
    id: "executive_summary",
    title: "Executive Summary",
    order: 1,
    nodeTypes: ["project"],
    categories: ["vision"],
    generator: (nodes, project) => {
      const root = nodes.find((n) => n.type === "project");
      return `## Executive Summary\n\n${project.description || root?.description || "Product description pending discovery."}\n\n**Domain:** ${project.domain}\n**Status:** ${project.status}\n`;
    },
  },
  {
    id: "product_vision",
    title: "Product Vision",
    order: 2,
    nodeTypes: ["project", "goal"],
    categories: ["vision", "concept"],
    generator: (nodes) => {
      const relevant = nodesOf(nodes, ["project", "goal"], ["vision", "concept"]);
      if (!relevant.length) return "";
      return `## Product Vision\n\n${relevant.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "goals",
    title: "Goals",
    order: 3,
    nodeTypes: ["goal"],
    generator: (nodes) => {
      const goals = nodesOf(nodes, ["goal"]);
      if (!goals.length) return "";
      return `## Goals\n\n${goals.map((g) => `- **${g.title}**: ${g.description}`).join("\n")}`;
    },
  },
  {
    id: "non_goals",
    title: "Non-Goals",
    order: 4,
    nodeTypes: ["non_goal"],
    generator: (nodes) => {
      const ngs = nodesOf(nodes, ["non_goal"]);
      if (!ngs.length) return "## Non-Goals\n\n_No non-goals defined yet. Consider specifying what is explicitly out of scope._";
      return `## Non-Goals\n\n${ngs.map((n) => `- ${n.title}: ${n.description}`).join("\n")}`;
    },
  },
  {
    id: "target_audience",
    title: "Target Audience",
    order: 5,
    nodeTypes: ["audience"],
    categories: ["audience", "target", "demographics"],
    generator: (nodes) => {
      const audience = nodesOf(nodes, ["audience"], ["audience", "target", "demographics"]);
      if (!audience.length) return "";
      return `## Target Audience\n\n${audience.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "user_personas",
    title: "User Personas",
    order: 6,
    nodeTypes: ["persona"],
    generator: (nodes) => {
      const personas = nodesOf(nodes, ["persona"]);
      if (!personas.length) return "";
      return `## User Personas\n\n${personas.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "core_experience",
    title: "Core Experience",
    order: 7,
    categories: ["core_experience", "gameplay", "core_gameplay", "workflow"],
    generator: (nodes) => {
      const core = nodesOf(nodes, undefined, ["core_experience", "gameplay", "core_gameplay", "workflow"]);
      if (!core.length) return "";
      return `## Core Experience\n\n${core.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "features",
    title: "Features",
    order: 8,
    nodeTypes: ["feature"],
    generator: (nodes) => {
      const features = nodesOf(nodes, ["feature"]);
      if (!features.length) return "";
      return `## Features\n\n${features.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "functional_requirements",
    title: "Functional Requirements",
    order: 9,
    nodeTypes: ["requirement"],
    generator: (nodes, project) => {
      const reqs = [
        ...nodesOf(nodes, ["requirement"]),
        ...(project.requirements?.filter((r) => r.type === "functional") || []).map((r) => ({
          id: r.id,
          type: "requirement" as const,
          title: r.title,
          description: `${r.description}\n\n**Acceptance Criteria:**\n${bulletList(r.acceptanceCriteria || [])}`,
          status: "confirmed" as const,
          priority: r.priority,
          confidence: 1,
          source: "requirements",
          category: "functional",
          metadata: {},
          createdAt: 0,
          updatedAt: 0,
          relatedQuestionIds: [],
        })),
      ];
      if (!reqs.length) return "";
      return `## Functional Requirements\n\n${reqs.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "non_functional_requirements",
    title: "Non-Functional Requirements",
    order: 10,
    nodeTypes: ["nfr"],
    generator: (nodes, project) => {
      const nfrs = [
        ...nodesOf(nodes, ["nfr"]),
        ...(project.requirements?.filter((r) => r.type === "non_functional") || []).map((r) => ({
          id: r.id,
          type: "nfr" as const,
          title: r.title,
          description: `${r.description}\n\n**Acceptance Criteria:**\n${bulletList(r.acceptanceCriteria)}`,
          status: "confirmed" as const,
          priority: r.priority,
          confidence: 1,
          source: "requirements",
          category: "nfr",
          metadata: {},
          createdAt: 0,
          updatedAt: 0,
          relatedQuestionIds: [],
        })),
      ];
      if (!nfrs.length) return "";
      return `## Non-Functional Requirements\n\n${nfrs.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "ux_ui_requirements",
    title: "UX/UI Requirements",
    order: 11,
    nodeTypes: ["ux_ui_req", "screen"],
    categories: ["ui_ux", "design"],
    generator: (nodes) => {
      const ux = nodesOf(nodes, ["ux_ui_req", "screen"], ["ui_ux", "design"]);
      if (!ux.length) return "";
      return `## UX/UI Requirements\n\n${ux.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "technical_architecture",
    title: "Technical Architecture",
    order: 12,
    nodeTypes: ["system", "tech_req"],
    categories: ["technical", "tech_stack", "engine"],
    generator: (nodes) => {
      const tech = nodesOf(nodes, ["system", "tech_req"], ["technical", "tech_stack", "engine"]);
      if (!tech.length) return "";
      return `## Technical Architecture\n\n${tech.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "data_model",
    title: "Data Model",
    order: 13,
    nodeTypes: ["data_entity"],
    categories: ["data", "database"],
    generator: (nodes) => {
      const data = nodesOf(nodes, ["data_entity"], ["data", "database"]);
      if (!data.length) return "";
      return `## Data Model\n\n${data.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "integrations",
    title: "Integrations",
    order: 14,
    nodeTypes: ["integration"],
    categories: ["integration"],
    generator: (nodes) => {
      const intg = nodesOf(nodes, ["integration"], ["integration"]);
      if (!intg.length) return "";
      return `## Integrations\n\n${intg.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "dependencies",
    title: "Dependencies",
    order: 15,
    generator: (nodes, project) => {
      const depEdges = project.edges?.filter((e) => e.relationship === "DEPENDS_ON") || [];
      if (!depEdges.length) return "";
      const nodeMap = new Map(nodes.map((n) => [n.id, n.title]));
      return `## Dependencies\n\n${depEdges.map((e) => `- **${nodeMap.get(e.source) || e.source}** depends on **${nodeMap.get(e.target) || e.target}**${e.label ? ` (${e.label})` : ""}`).join("\n")}`;
    },
  },
  {
    id: "constraints",
    title: "Constraints",
    order: 16,
    nodeTypes: ["constraint"],
    generator: (nodes) => {
      const constraints = nodesOf(nodes, ["constraint"]);
      if (!constraints.length) return "";
      return `## Constraints\n\n${constraints.map((c) => `- **${c.title}**: ${c.description}`).join("\n")}`;
    },
  },
  {
    id: "risks",
    title: "Risks",
    order: 17,
    nodeTypes: ["risk"],
    generator: (nodes, project) => {
      const riskNodes = nodesOf(nodes, ["risk"]);
      const risks = project.risks || [];
      const all = [
        ...riskNodes.map((n) => `- **${n.title}** [${n.priority}]: ${n.description}`),
        ...risks.map((r) => `- **${r.title}** [${r.likelihood}/${r.impact}]: ${r.description}${r.mitigation ? ` → _Mitigation: ${r.mitigation}_` : ""}`),
      ];
      if (!all.length) return "";
      return `## Risks\n\n${all.join("\n")}`;
    },
  },
  {
    id: "edge_cases",
    title: "Edge Cases",
    order: 18,
    categories: ["edge_case"],
    generator: (nodes) => {
      const ec = nodesOf(nodes, undefined, ["edge_case"]);
      if (!ec.length) return "";
      return `## Edge Cases\n\n${ec.map((n) => `- **${n.title}**: ${n.description}`).join("\n")}`;
    },
  },
  {
    id: "testing",
    title: "Testing",
    order: 19,
    nodeTypes: ["test_req"],
    categories: ["testing", "qa"],
    generator: (nodes) => {
      const tests = nodesOf(nodes, ["test_req"], ["testing", "qa"]);
      if (!tests.length) return "";
      return `## Testing\n\n${tests.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "deployment",
    title: "Deployment",
    order: 20,
    nodeTypes: ["deploy_req"],
    categories: ["deployment", "devops", "launch"],
    generator: (nodes) => {
      const deps = nodesOf(nodes, ["deploy_req"], ["deployment", "devops", "launch"]);
      if (!deps.length) return "";
      return `## Deployment\n\n${deps.map(nodeBlock).join("\n")}`;
    },
  },
  {
    id: "assumptions",
    title: "Assumptions",
    order: 21,
    nodeTypes: ["assumption"],
    generator: (nodes, project) => {
      const assumptionNodes = nodesOf(nodes, ["assumption"]);
      const assumptions = project.assumptions || [];
      const all = [
        ...assumptionNodes.map((n) => `- ⚠️ **[${n.status}]** ${n.title}: ${n.description}`),
        ...assumptions.map((a) => `- ⚠️ **[${a.status}]** ${a.statement} → _Impact: ${a.impact}_`),
      ];
      if (!all.length) return "";
      return `## Assumptions\n\n${all.join("\n")}`;
    },
  },
  {
    id: "open_questions",
    title: "Open Questions",
    order: 22,
    nodeTypes: ["open_question"],
    generator: (nodes, project) => {
      const openNodes = nodesOf(nodes, ["open_question"]);
      const pendingQs = (project.questions || []).filter((q) => q.status === "pending");
      const all = [
        ...openNodes.map((n) => `- ❓ ${n.title}: ${n.description}`),
        ...pendingQs.map((q) => `- ❓ **[${q.priority}]** ${q.title}${q.description ? `: ${q.description}` : ""}`),
      ];
      if (!all.length) return "";
      return `## Open Questions\n\n${all.join("\n")}`;
    },
  },
  {
    id: "deferred_decisions",
    title: "Deferred Decisions",
    order: 23,
    nodeTypes: ["deferred"],
    generator: (nodes, project) => {
      const deferred = nodesOf(nodes, ["deferred"]);
      const deferredDecisions = (project.decisions || []).filter((d) => d.status === "proposed");
      const all = [
        ...deferred.map((n) => `- 🔄 ${n.title}: ${n.description}`),
        ...deferredDecisions.map((d) => `- 🔄 ${d.title}: ${d.description}`),
      ];
      if (!all.length) return "";
      return `## Deferred Decisions\n\n${all.join("\n")}`;
    },
  },
  {
    id: "future_scope",
    title: "Future Scope",
    order: 24,
    categories: ["future", "v2", "roadmap"],
    generator: (nodes) => {
      const future = nodesOf(nodes, undefined, ["future", "v2", "roadmap"]);
      if (!future.length) return "";
      return `## Future Scope\n\n${future.map((n) => `- ${n.title}: ${n.description}`).join("\n")}`;
    },
  },
];

export function generatePRDDocument(project: Project): PRDDocument {
  const nodes = project.nodes || [];
  const now = Date.now();

  const sections: PRDSection[] = SECTION_DEFS.map((def) => {
    const content = def.generator(nodes, project);
    const hasContent = content.length > 0;
    const status: PRDSectionStatus = hasContent ? "draft" : "not_applicable";

    // Collect related node IDs
    const relatedNodeIds: string[] = [];
    if (def.nodeTypes || def.categories) {
      const matched = nodesOf(nodes, def.nodeTypes, def.categories);
      for (const m of matched) relatedNodeIds.push(m.id);
    }

    return {
      id: def.id,
      title: def.title,
      order: def.order,
      content: hasContent ? content : `_No data available for ${def.title}._`,
      status,
      relatedNodeIds,
    };
  });

  return {
    id: `prd_${project.id}_${now}`,
    projectId: project.id,
    title: `PRD: ${project.title || "Untitled Project"}`,
    sections,
    generatedAt: now,
    version: 1,
    exportFormats: ["markdown", "json", "html"],
  };
}
