import assert from "node:assert";
import { DiscoveryEngine } from "../src/lib/discovery/engine";
import { createAIProvider, LocalAIProvider } from "../src/lib/ai/provider";
import { calculateProjectCompleteness } from "../src/lib/discovery/completeness";
import { generatePRDDocument } from "../src/lib/prd/generator";
import type { Project } from "../src/types/project";

const blankProject: Project = {
  id: "test_proj_1",
  title: "Untitled",
  description: "",
  domain: "game",
  platforms: ["PC"],
  status: "discovery",
  nodes: [],
  edges: [],
  questions: [],
  decisions: [],
  assumptions: [],
  conflicts: [],
  risks: [],
  requirements: [],
  revisions: [],
  metadata: {
    domain: "game",
    platforms: ["PC"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  completeness: 0,
};

async function run() {
  console.log("1. Testing DiscoveryEngine.processIdea...");
  const engine = new DiscoveryEngine(blankProject);
  const ideaRes = engine.processIdea("A 3D Roblox RPG game with pets and multiplayer combat");

  assert.strictEqual(ideaRes.project.domain, "game");
  assert.ok(ideaRes.project.nodes.length >= 2, "Expected initial nodes");
  assert.ok(ideaRes.questions.length >= 2, "Expected initial questions");
  assert.ok(ideaRes.project.completeness > 0, "Expected positive completeness");

  console.log("2. Testing DiscoveryEngine.processAnswer...");
  const q1 = ideaRes.questions[0];
  const ansRes = engine.processAnswer(q1.id, "Action RPG / Adventure");
  assert.ok(ansRes.updatedNodes.length > 0, "Expected updated nodes");
  assert.ok(ansRes.newQuestions.length > 0, "Expected follow up questions");

  console.log("3. Testing Completeness Calculation...");
  const comp = calculateProjectCompleteness(ansRes.project);
  assert.ok(comp.overall > 0, "Overall completeness should be positive");
  assert.ok(comp.categories.vision !== undefined, "Vision category should be present");

  console.log("4. Testing Conflict Detection...");
  const conflicts = engine.detectConflicts();
  assert.ok(Array.isArray(conflicts), "Conflicts should be an array");

  console.log("5. Testing PRD Generator...");
  const prd = generatePRDDocument(ansRes.project);
  assert.strictEqual(prd.projectId, "test_proj_1");
  assert.ok(prd.sections.length >= 20, "Expected 20+ PRD sections");
  assert.ok(prd.sections.some((s) => s.id === "executive_summary"));
  assert.ok(prd.sections.some((s) => s.id === "product_vision"));

  console.log("6. Testing LocalAIProvider...");
  const provider = createAIProvider();
  assert.ok(provider instanceof LocalAIProvider);

  const aiRes = await provider.analyzeIdea("A SaaS dashboard for managing invoice billing and subscriptions", blankProject);
  assert.ok(aiRes.questions.length > 0);
  const summary = await provider.generateSummary(aiRes.nodeUpdates ? { ...blankProject, nodes: aiRes.nodeUpdates as any } : blankProject);
  assert.ok(summary.includes("Project Summary"));

  console.log("ALL TESTS PASSED SUCCESSFULLY!");
}

run();
