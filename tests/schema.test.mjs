import assert from "node:assert";
import {
  zodAIDiscoveryResponse,
  zodDiscoveryQuestion,
  zodProjectNode,
  zodProjectEdge,
} from "../src/lib/validation/schemas.js";

// Test zodDiscoveryQuestion
const sampleQuestion = {
  id: "q-1",
  title: "Target audience?",
  description: "Who uses this?",
  category: "audience",
  priority: "high",
  questionType: "single_choice",
  options: [{ id: "opt-1", label: "Devs" }],
  required: true,
  blocking: false,
  dependsOn: [],
  relatedNodeIds: ["node-1"],
  status: "pending",
  reason: "Need audience clarity",
};
assert.doesNotThrow(() => zodDiscoveryQuestion.parse(sampleQuestion));

// Test zodProjectNode
const sampleNode = {
  id: "node-1",
  type: "feature",
  title: "Auth system",
  description: "OAuth2 login flow",
  status: "confirmed",
  priority: "high",
  confidence: 0.95,
  source: "user_input",
  category: "security",
  metadata: { tag: "mvp" },
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  relatedQuestionIds: ["q-1"],
};
assert.doesNotThrow(() => zodProjectNode.parse(sampleNode));

// Test zodProjectEdge
const sampleEdge = {
  id: "edge-1",
  source: "node-1",
  target: "node-2",
  relationship: "DEPENDS_ON",
};
assert.doesNotThrow(() => zodProjectEdge.parse(sampleEdge));

// Test zodAIDiscoveryResponse
const sampleAiResp = {
  analysis: {
    known: ["node-1"],
    missing: ["node-2"],
    ambiguous: [],
    conflicts: [],
    assumptions: [],
    dependencies: [],
    completeness: 42,
  },
  questions: [sampleQuestion],
  summary: "Initial analysis done",
};
assert.doesNotThrow(() => zodAIDiscoveryResponse.parse(sampleAiResp));

console.log("All schema validations passed!");
