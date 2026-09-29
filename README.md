# PRD Architect ⬡

**Autonomous AI Product Discovery, Requirements Engineering & JARVIS-Style Command Center**

> Transform vague ideas into detailed, implementation-ready Product Requirements Documents through continuous adaptive discovery and interactive visual knowledge graphs.

![PRD Architect](https://raw.githubusercontent.com/luciferKERO/prd-maker/main/public/preview.png)

---

## 🌟 Key Capabilities

1. **Continuous Adaptive Discovery Engine**:
   - Re-analyzes the entire project model after every answer.
   - Dynamic question generation with typed metadata, priority weights, and domain awareness (Games, Web Apps, Mobile Apps, SaaS, Visual Novels, APIs, AI Tools).
   - Real contradiction & conflict detection with user-guided resolution.
   - Explicit assumption management (labeled as inferred/assumed with confirm/reject actions).
   - Domain-weighted specification completeness calculator.

2. **Live Interactive Knowledge Graph**:
   - High-performance Canvas graph renderer representing project entities, requirements, features, user stories, risks, and decisions.
   - Semantic edge relationships (`DEPENDS_ON`, `REQUIRES`, `PART_OF`, `RELATED_TO`, `CONFLICTS_WITH`).
   - Dependency highlighting, search, filtering, and instant node inspection.

3. **JARVIS-Inspired AI Command Center**:
   - Signature animated Central AI Core reacting to 9 real application states (`idle`, `listening`, `analyzing`, `thinking`, `asking`, `updating`, `warning`, `complete`, `error`).
   - Real-time System Activity Feed and live project health telemetry.
   - Clean, dark-first futuristic HUD styling with zero unnecessary clutter.

4. **Live PRD Workspace & Multi-Format Export**:
   - 24+ structured, developer-actionable PRD sections with verifiable acceptance criteria.
   - Real-time synchronization between the discovery interview, knowledge graph, and document.
   - Export to Markdown (`.md`), Project JSON (`.json`), or Copy to Clipboard.

5. **Local-First & Offline Ready**:
   - 100% functional out-of-the-box with zero pre-requisite API keys via built-in deterministic local intelligence.
   - Client-side persistence with clean schema migration.
   - Zero mock data default — starts clean on every fresh session.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher (tested with Node.js 24)
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/luciferKERO/prd-maker.git
cd prd-maker

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration (Optional AI Providers)

By default, PRD Architect uses its internal offline deterministic discovery engine. To connect to cloud LLM providers:

Create a `.env.local` file from `.env.example`:
```bash
cp .env.example .env.local
```

Configure your preferred API key:
```env
# OpenAI / OpenRouter / Groq / DeepSeek
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Anthropic (Optional)
ANTHROPIC_API_KEY=your-anthropic-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

---

## 🧪 Testing & Quality Assurance

```bash
# Run test suite
npm test

# Type checking
npx tsc --noEmit

# Production build
npm run build
```

---

## 📊 CodeGraph Visualizer

This project is indexed with **CodeGraph** for precise AST, symbol, and call path mapping:

```bash
# Start the visualizer server (auto-opens at http://localhost:9742)
python serve-viz.py

# Run continuous auto-watcher for code changes
python watch-sync.py
```

---

## 🚢 Deployment to Vercel

The application is fully configured for zero-config Vercel deployment:

1. Push your repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Set the Framework Preset to **Next.js**.
4. Deploy!

---

## 📜 License
MIT License. Created by luciferKERO.
