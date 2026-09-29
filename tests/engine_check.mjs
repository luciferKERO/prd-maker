import assert from 'node:assert';
import { DiscoveryEngine } from '../src/lib/discovery/engine.ts';

// 1. Test domain detection in Indonesian
const engine = new DiscoveryEngine();
const domainGame = engine.detectDomain('Game petualangan multiplayer di Roblox');
assert.strictEqual(domainGame, 'game', 'Should detect game domain for Indonesian text');

const domainWeb = engine.detectDomain('Aplikasi web manajemen tugas tim');
assert.strictEqual(domainWeb, 'web_app', 'Should detect web_app domain for Indonesian text');

const domainMobile = engine.detectDomain('Aplikasi mobile pesan antar makanan');
assert.strictEqual(domainMobile, 'mobile_app', 'Should detect mobile_app domain for Indonesian text');

// 2. Test initial processIdea
const ideaResult = engine.processIdea('Game petualangan aksi 3D dengan sistem inventaris dan multiplayer');
assert.strictEqual(ideaResult.project.domain, 'game');
assert(ideaResult.questions.length > 0, 'Should generate initial questions');

// Verify question language is Indonesian
const firstQ = ideaResult.questions[0];
console.log('First question title:', firstQ.title);
assert(
  firstQ.title.includes('genre') || firstQ.title.includes('Engine') || firstQ.title.includes('multiplayer') || firstQ.title.includes('tema'),
  'Question title should be in Indonesian'
);

// 3. Test answering question and state advancement
const answerResult = engine.processAnswer(firstQ.id, 'Action RPG');
assert(answerResult.project.nodes.length >= ideaResult.project.nodes.length, 'Nodes should not be lost');
assert.strictEqual(
  answerResult.project.questions.find((q) => q.id === firstQ.id)?.status,
  'answered',
  'Answered question status must be answered'
);

// Verify getNextQuestions returns next pending question
const nextEngine = new DiscoveryEngine(answerResult.project);
const nextQuestions = nextEngine.getNextQuestions(3);
assert(
  !nextQuestions.some((q) => q.id === firstQ.id),
  'Answered question must not be in next available questions'
);

// 4. Test creative domain discovery & multi-round replenishment
const creativeEngine = new DiscoveryEngine();
const creativeIdea = creativeEngine.processIdea('aku perlu web untuk bantu aku edit video secara cepat');
assert.strictEqual(creativeIdea.project.domain, 'creative', 'Should detect creative domain for video editing prompt');
assert.ok(creativeIdea.questions.length >= 3, 'Should generate initial questions for creative domain');

let currentProject = creativeIdea.project;
// Answer first question
const cEngine = new DiscoveryEngine(currentProject);
const firstCreativeQ = currentProject.questions.find((q) => q.status === 'pending');
assert.ok(firstCreativeQ, 'Should have pending question');
const resAnswer1 = cEngine.processAnswer(firstCreativeQ.id, 'Konten Kreator / Media Sosial');
currentProject = resAnswer1.project;

// Verify next round generation works when requested
const nextRoundQuestions = new DiscoveryEngine(currentProject).generateNextRoundQuestions(3);
assert.ok(nextRoundQuestions.length > 0, 'Should generate next round questions for uncovered domain pillars');

console.log('All engine checks passed successfully!');
