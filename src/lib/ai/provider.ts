import type { Project } from "../../types/project";
import type { AIDiscoveryResponse } from "../../types/ai";
import type { PRDDocument } from "../../types/prd";
import { DiscoveryEngine } from "../discovery/engine";
import { generatePRDDocument } from "../prd/generator";

export interface AIProvider {
  analyzeIdea(idea: string, project: Project): Promise<AIDiscoveryResponse>;
  analyzeAnswer(questionId: string, answer: unknown, project: Project): Promise<AIDiscoveryResponse>;
  generatePRD(project: Project): Promise<PRDDocument>;
  generateSummary(project: Project): Promise<string>;
}

export class LocalAIProvider implements AIProvider {
  async analyzeIdea(idea: string, project: Project): Promise<AIDiscoveryResponse> {
    const engine = new DiscoveryEngine(project);
    const { project: updatedProject, questions } = engine.processIdea(idea);

    const comp = engine.calculateCompleteness();
    const known = updatedProject.nodes.map((n) => `${n.type}: ${n.title}`);
    const conflicts = updatedProject.conflicts.map((c) => c.description);
    const assumptions = updatedProject.assumptions.map((a) => a.statement);
    const dependencies = updatedProject.edges.map((e) => `${e.source} -> ${e.target}`);

    return {
      analysis: {
        known,
        missing: Object.entries(comp.categories)
          .filter(([, v]) => v.score < v.total)
          .map(([k, v]) => `${v.label} (${v.score}/${v.total})`),
        ambiguous: [],
        conflicts,
        assumptions,
        dependencies,
        completeness: comp.overall,
        nextAction: {
          type: "question",
          label: "Answer Core Questions",
          description: "Answer discovery questions to clarify architecture and requirements.",
        },
      },
      questions,
      nodeUpdates: updatedProject.nodes,
      edgeUpdates: updatedProject.edges,
      assumptionUpdates: updatedProject.assumptions,
      conflictUpdates: updatedProject.conflicts,
      summary: `Domain detected as **${updatedProject.domain}**. Identified ${updatedProject.nodes.length} nodes and generated ${questions.length} initial discovery questions. Current completeness: ${comp.overall}%.`,
    };
  }

  async analyzeAnswer(questionId: string, answer: unknown, project: Project): Promise<AIDiscoveryResponse> {
    const engine = new DiscoveryEngine(project);
    const result = engine.processAnswer(questionId, answer);
    const comp = engine.calculateCompleteness();

    const known = result.project.nodes.map((n) => `${n.type}: ${n.title}`);
    const conflicts = result.conflicts.map((c) => c.description);
    const assumptions = result.assumptions.map((a) => a.statement);
    const dependencies = result.newEdges.map((e) => `${e.source} -> ${e.target}`);

    return {
      analysis: {
        known,
        missing: Object.entries(comp.categories)
          .filter(([, v]) => v.score < v.total)
          .map(([k, v]) => `${v.label} (${v.score}/${v.total})`),
        ambiguous: [],
        conflicts,
        assumptions,
        dependencies,
        completeness: comp.overall,
        nextAction: {
          type: "continue",
          label: engine.isDiscoveryComplete() ? "Finalize PRD" : "Continue Discovery",
          description: engine.isDiscoveryComplete()
            ? "Specification complete. Ready to export PRD."
            : "Continue answering follow-up questions.",
        },
      },
      questions: result.newQuestions,
      nodeUpdates: result.updatedNodes,
      edgeUpdates: result.newEdges,
      assumptionUpdates: result.assumptions,
      conflictUpdates: result.conflicts,
      summary: `Updated project with answer. Created ${result.updatedNodes.length} node(s), ${result.newEdges.length} edge(s), and ${result.newQuestions.length} follow-up question(s). Completeness: ${comp.overall}%.`,
    };
  }

  async generatePRD(project: Project): Promise<PRDDocument> {
    return generatePRDDocument(project);
  }

  async generateSummary(project: Project): Promise<string> {
    const comp = new DiscoveryEngine(project).calculateCompleteness();
    const nodeCount = project.nodes?.length || 0;
    const reqCount = project.requirements?.length || 0;
    const pendingQuestions = (project.questions || []).filter((q) => q.status === "pending").length;
    const resolvedConflicts = (project.conflicts || []).filter((c) => c.status === "resolved").length;
    const totalConflicts = (project.conflicts || []).length;

    return `### Project Summary: ${project.title || "Untitled"}
- **Domain:** ${project.domain}
- **Completeness:** ${comp.overall}%
- **Knowledge Nodes:** ${nodeCount}
- **Requirements Defined:** ${reqCount}
- **Pending Questions:** ${pendingQuestions}
- **Conflicts:** ${resolvedConflicts}/${totalConflicts} resolved
- **Status:** ${project.status}

#### Category Breakdown:
${Object.entries(comp.categories)
  .map(([, v]) => `- **${v.label}:** ${v.score}/${v.total}`)
  .join("\n")}
`;
  }
}

export function createAIProvider(): AIProvider {
  // In future: can inspect process.env.OPENAI_API_KEY / ANTHROPIC_API_KEY to instantiate remote provider
  return new LocalAIProvider();
}
