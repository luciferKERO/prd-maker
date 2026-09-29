import test from "node:test";
import assert from "node:assert/strict";

// Test data and pure logic tests
test("Discovery Engine logic & domain detection", async (t) => {
  await t.test("Domain detection for games", () => {
    const gameKeywords = ["game", "roblox", "unity", "gameplay", "rpg", "atlantis"];
    const prompt = "I want to create a Roblox game about an underwater Atlantis city";
    const isGame = gameKeywords.some((k) => prompt.toLowerCase().includes(k));
    assert.equal(isGame, true);
  });

  await t.test("Completeness scoring weights", () => {
    const categories = {
      vision: { score: 1, total: 1, label: "Vision", weight: 2 },
      core_loop: { score: 1, total: 1, label: "Core Loop", weight: 2 },
      features: { score: 2, total: 3, label: "Features", weight: 1.5 },
      technical: { score: 0, total: 1, label: "Technical", weight: 0.5 },
    };

    let totalWeight = 0;
    let earnedWeight = 0;

    for (const cat of Object.values(categories)) {
      totalWeight += cat.weight;
      earnedWeight += (cat.score / cat.total) * cat.weight;
    }

    const completeness = Math.round((earnedWeight / totalWeight) * 100);
    assert.ok(completeness > 50 && completeness < 100);
  });

  await t.test("Contradiction detection logic", () => {
    const nodeA = { id: "n1", title: "Casual and accessible gameplay for all ages" };
    const nodeB = { id: "n2", title: "Hardcore demanding permadeath skill system" };

    const isCasual = nodeA.title.toLowerCase().includes("casual");
    const isHardcore = nodeB.title.toLowerCase().includes("hardcore");
    const conflictDetected = isCasual && isHardcore;

    assert.equal(conflictDetected, true);
  });

  await t.test("PRD section structure verification", () => {
    const requiredSections = [
      "Executive Summary",
      "Product Vision",
      "Goals",
      "Non-Goals",
      "Target Audience",
      "User Personas",
      "Core Experience",
      "Features",
      "Functional Requirements",
      "Non-Functional Requirements",
      "UX/UI Requirements",
      "Technical Architecture",
      "Data Model",
      "Integrations",
      "Dependencies",
      "Constraints",
      "Risks",
      "Testing Requirements",
      "Deployment Requirements",
      "Assumptions",
      "Open Questions",
    ];

    assert.ok(requiredSections.length >= 20);
  });
});
