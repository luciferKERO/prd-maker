# Findings & Environment Discovery

## Project: PRD Architect
- **Repository**: https://github.com/luciferKERO/prd-maker
- **Deployment Target**: Vercel
- **Host**: Windows 11, Node v24.18.1, npm 12.0.2, Python 3.11/3.14
- **Working Directory**: `C:\Users\Luci\Documents\prd maker app`
- **Initial Files**: `serve-viz.py`, `codegraph-viz.html`, `watch-sync.py`, `.codegraph`

## Architectural Decisions
1. **Framework**: Next.js 14/15 App Router with TypeScript, Tailwind CSS, Lucide React.
2. **State & Local Persistence**: Unified Project Schema with Zustand / React Context + LocalStorage / IndexedDB with automatic schema migration, versioning, and zero-mock default state.
3. **Graph Engine**: Interactive Canvas / SVG / React Flow knowledge graph renderer supporting node dragging, zooming, panning, semantic edge relationships, node inspector, and real-time state sync.
4. **Continuous Adaptive Discovery Engine**:
   - Dynamic question generation with typed metadata & priorities.
   - Re-analysis loop after every user answer.
   - Contradiction & conflict detection.
   - Dependency discovery & change impact analysis.
   - Assumption tracking (explicitly labeled, user confirm/reject).
   - Domain-aware intelligence (games, web apps, mobile apps, SaaS, visual novels, APIs, AI tools, etc.).
   - Accurate specification completeness calculator.
5. **JARVIS AI Command Center**:
   - Central AI Core with multi-state animations (idle, listening, analyzing, thinking, asking, updating, warning, complete, error).
   - Live AI System Status & structured System Activity Feed.
   - Needs Attention panel & Project Health metrics.
6. **Live PRD Workspace**:
   - Real-time PRD section synchronization.
   - Verifiable acceptance criteria & implementation-ready requirements.
   - Multi-format Export: Markdown, JSON, Copy to Clipboard.
7. **AI Provider Integration**:
   - Server-side route `/api/ai/discovery`, `/api/ai/prd` with support for OpenAI / Anthropic / Groq / OpenRouter / local keys via `.env`.
   - Built-in intelligent deterministic local rule engine fallback when no API key is set so the entire app is 100% functional out-of-the-box in demo/offline mode while clearly displaying active AI provider status.
8. **Testing & QA**:
   - Unit & integration tests with Vitest / Node test runner.
   - Visual QA and responsive styling.
