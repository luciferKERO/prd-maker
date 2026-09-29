import type {
  Project,
  ProjectNode,
  ProjectEdge,
  ProjectAssumption,
  ProjectConflict,
  ProjectNodeType,
  KnowledgeStatus,
  RequirementPriority,
} from "../../types/project";

type ProjectDomain = string;
import type {
  DiscoveryQuestion,
  QuestionPriority,
  QuestionType,
  QuestionOption,
} from "../../types/discovery";
import { calculateProjectCompleteness } from "./completeness";

export class DiscoveryEngine {
  private project: Project;

  constructor(project: Project) {
    this.project = JSON.parse(JSON.stringify(project));
    if (!this.project.nodes) this.project.nodes = [];
    if (!this.project.edges) this.project.edges = [];
    if (!this.project.questions) this.project.questions = [];
    if (!this.project.assumptions) this.project.assumptions = [];
    if (!this.project.conflicts) this.project.conflicts = [];
    if (!this.project.decisions) this.project.decisions = [];
    if (!this.project.risks) this.project.risks = [];
    if (!this.project.requirements) this.project.requirements = [];
    if (!this.project.revisions) this.project.revisions = [];
  }

  public generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  public generateQuestionId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  public detectDomain(idea: string): ProjectDomain {
    const text = idea.toLowerCase();

    // Visual novel check
    if (
      text.includes("visual novel") ||
      text.includes("vn") ||
      text.includes("renpy") ||
      text.includes("ren'py") ||
      text.includes("branching story") ||
      text.includes("dating sim") ||
      text.includes("kinetic novel")
    ) {
      return "visual_novel";
    }

    // Game check
    if (
      text.includes("game") ||
      text.includes("roblox") ||
      text.includes("unity") ||
      text.includes("godot") ||
      text.includes("unreal") ||
      text.includes("gameplay") ||
      text.includes("player") ||
      text.includes("level") ||
      text.includes("rpg") ||
      text.includes("fps") ||
      text.includes("mmo") ||
      text.includes("adventure") ||
      text.includes("survival") ||
      text.includes("horror") ||
      text.includes("puzzle") ||
      text.includes("platformer") ||
      text.includes("racing") ||
      text.includes("fighting") ||
      text.includes("simulation") ||
      text.includes("sandbox") ||
      text.includes("open world")
    ) {
      return "game";
    }

    // AI Tool check
    if (
      text.includes("ai tool") ||
      text.includes("llm") ||
      text.includes("gpt") ||
      text.includes("copilot") ||
      text.includes("agent") ||
      text.includes("rag") ||
      text.includes("prompt") ||
      text.includes("diffusion") ||
      text.includes("machine learning") ||
      text.includes("neural")
    ) {
      return "ai_tool";
    }

    // SaaS check
    if (
      text.includes("saas") ||
      text.includes("subscription") ||
      text.includes("b2b") ||
      text.includes("billing") ||
      text.includes("multi-tenant") ||
      text.includes("multitenant") ||
      text.includes("workspace") ||
      text.includes("crm") ||
      text.includes("erp")
    ) {
      return "saas";
    }

    // Mobile check
    if (
      text.includes("mobile app") ||
      text.includes("ios app") ||
      text.includes("android app") ||
      text.includes("phone app") ||
      text.includes("tablet app") ||
      text.includes("react native") ||
      text.includes("flutter") ||
      text.includes("app store") ||
      text.includes("play store")
    ) {
      return "mobile_app";
    }

    // API check
    if (
      text.includes("api") ||
      text.includes("backend") ||
      text.includes("microservice") ||
      text.includes("endpoint") ||
      text.includes("graphql") ||
      text.includes("rest api") ||
      text.includes("grpc") ||
      text.includes("webhook")
    ) {
      return "api";
    }

    // Web app check
    if (
      text.includes("website") ||
      text.includes("web app") ||
      text.includes("webapp") ||
      text.includes("dashboard") ||
      text.includes("portal") ||
      text.includes("landing page") ||
      text.includes("blog") ||
      text.includes("ecommerce") ||
      text.includes("e-commerce") ||
      text.includes("admin") ||
      text.includes("cms")
    ) {
      return "web_app";
    }

    // Desktop check
    if (
      text.includes("desktop app") ||
      text.includes("electron") ||
      text.includes("tauri") ||
      text.includes("windows app") ||
      text.includes("macos app")
    ) {
      return "desktop";
    }

    // Creative check
    if (
      text.includes("music") ||
      text.includes("art generator") ||
      text.includes("video editor") ||
      text.includes("drawing") ||
      text.includes("photo editing") ||
      text.includes("3d model")
    ) {
      return "creative";
    }

    // Educational check
    if (
      text.includes("course") ||
      text.includes("quiz") ||
      text.includes("learn") ||
      text.includes("education") ||
      text.includes("flashcard") ||
      text.includes("student")
    ) {
      return "educational";
    }

    // Community check
    if (
      text.includes("forum") ||
      text.includes("discord") ||
      text.includes("chat app") ||
      text.includes("social network") ||
      text.includes("feed") ||
      text.includes("community")
    ) {
      return "community";
    }

    // Automation check
    if (
      text.includes("automation") ||
      text.includes("bot") ||
      text.includes("scraper") ||
      text.includes("pipeline") ||
      text.includes("cron") ||
      text.includes("workflow")
    ) {
      return "automation";
    }

    return "other";
  }

  public processIdea(idea: string): { project: Project; questions: DiscoveryQuestion[] } {
    const domain = this.detectDomain(idea);
    this.project.domain = domain;
    this.project.description = idea;
    this.project.metadata = {
      ...this.project.metadata,
      domain,
      updatedAt: Date.now(),
      createdAt: this.project.metadata?.createdAt || Date.now(),
      platforms: this.project.platforms || [],
    };

    // Infer title if empty or default
    if (!this.project.title || this.project.title === "Untitled" || this.project.title === "Untitled Project") {
      const words = idea.trim().split(/\s+/).slice(0, 6).join(" ");
      this.project.title = words.length > 0 ? words.charAt(0).toUpperCase() + words.slice(1) : `${domain} Project`;
    }

    // Clear old initial nodes if fresh start
    const now = Date.now();
    const rootNodeId = this.generateNodeId();

    const rootNode: ProjectNode = {
      id: rootNodeId,
      type: "project",
      title: this.project.title,
      description: idea,
      status: "confirmed",
      priority: "critical",
      confidence: 1.0,
      source: "initial_idea",
      category: "vision",
      metadata: { domain, isRoot: true },
      createdAt: now,
      updatedAt: now,
      relatedQuestionIds: [],
    };

    const goalNodeId = this.generateNodeId();
    const goalNode: ProjectNode = {
      id: goalNodeId,
      type: "goal",
      title: "Deliver core value proposition",
      description: `Provide engaging and reliable user experience for: ${idea.slice(0, 150)}`,
      status: "inferred",
      priority: "critical",
      confidence: 0.9,
      source: "initial_idea",
      category: "vision",
      metadata: {},
      createdAt: now,
      updatedAt: now,
      relatedQuestionIds: [],
    };

    this.project.nodes = [rootNode, goalNode];
    this.project.edges = [
      {
        id: `edge_${Date.now()}_1`,
        source: rootNodeId,
        target: goalNodeId,
        relationship: "PART_OF",
        label: "Primary Goal",
      },
    ];

    // Detect and extract immediate keywords as candidate features
    const lower = idea.toLowerCase();
    if (lower.includes("multiplayer") || lower.includes("co-op") || lower.includes("pvp")) {
      const mpId = this.generateNodeId();
      this.project.nodes.push({
        id: mpId,
        type: "feature",
        title: "Multiplayer Networking",
        description: "Networked multiplayer gameplay and session synchronization",
        status: "inferred",
        priority: "high",
        confidence: 0.85,
        source: "idea_keyword",
        category: "multiplayer",
        metadata: {},
        createdAt: now,
        updatedAt: now,
        relatedQuestionIds: [],
      });
      this.project.edges.push({
        id: `edge_${Date.now()}_mp`,
        source: rootNodeId,
        target: mpId,
        relationship: "PART_OF",
      });
    }

    if (lower.includes("auth") || lower.includes("login") || lower.includes("user account")) {
      const authId = this.generateNodeId();
      this.project.nodes.push({
        id: authId,
        type: "feature",
        title: "User Authentication & Profiles",
        description: "Secure user registration, authentication, and profile persistence",
        status: "inferred",
        priority: "high",
        confidence: 0.85,
        source: "idea_keyword",
        category: "auth",
        metadata: {},
        createdAt: now,
        updatedAt: now,
        relatedQuestionIds: [],
      });
    }

    // Generate initial 2-3 high-priority discovery questions based on domain
    const questions = this.generateInitialQuestions(domain, idea);
    this.project.questions = questions;

    // Calculate completeness
    const comp = this.calculateCompleteness();
    this.project.completeness = comp.overall;

    return {
      project: this.project,
      questions,
    };
  }

  private generateInitialQuestions(domain: ProjectDomain, idea: string): DiscoveryQuestion[] {
    const questions: DiscoveryQuestion[] = [];
    const now = Date.now();

    switch (domain) {
      case "game": {
        questions.push({
          id: this.generateQuestionId(),
          title: "What is the primary genre and core theme of your game?",
          description: "Defines the core game loop, pacing, and audience expectations.",
          category: "genre",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_rpg", label: "Action RPG / Adventure", description: "Quests, leveling, combat, story progression" },
            { id: "opt_survival", label: "Survival / Sandbox", description: "Crafting, base-building, resource gathering" },
            { id: "opt_horror", label: "Horror / Thriller", description: "Atmospheric tension, puzzles, evasion" },
            { id: "opt_platformer", label: "2D/3D Platformer", description: "Precision movement, obstacles, stages" },
            { id: "opt_puzzle", label: "Puzzle / Strategy", description: "Tactical decisions, problem solving, levels" },
            { id: "opt_roblox_sim", label: "Roblox Tycoon / Simulator", description: "Fast loops, rebirths, pets, automation" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Genre dictates gameplay mechanics and progression architecture.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Which game engine and target platforms are you building for?",
          description: "Determines technical constraints, physics engine, and asset pipelines.",
          category: "platform",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_roblox", label: "Roblox Studio (Luau)", description: "PC, Mobile, Console cross-play on Roblox" },
            { id: "opt_unity", label: "Unity (C#)", description: "Cross-platform PC/Mobile/Console standalone" },
            { id: "opt_godot", label: "Godot 4 (GDScript / C#)", description: "Lightweight 2D/3D open-source engine" },
            { id: "opt_unreal", label: "Unreal Engine 5 (C++ / Blueprints)", description: "High-end 3D graphics & physics" },
            { id: "opt_web", label: "Web / Three.js / HTML5", description: "Browser-based instant play" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Platform and engine determine tech stack, network architecture, and performance targets.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "What is the multiplayer scope?",
          description: "Influences server architecture, replication, and state sync.",
          category: "multiplayer",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_sp", label: "Singleplayer Only", description: "Offline or local client session" },
            { id: "opt_coop", label: "Co-op (2 - 4 Players)", description: "Small squad peer-to-peer or lobby" },
            { id: "opt_pvp", label: "Multiplayer PvP (10 - 50 Players)", description: "Dedicated servers, matchmaking, anti-cheat" },
            { id: "opt_mmo", label: "MMO / Persistent World", description: "Sharded world servers, database persistence" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Multiplayer design drives backend network architecture.",
        });
        break;
      }

      case "web_app":
      case "saas": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Who is the primary target audience and user persona?",
          description: "Clarifies core workflows, usability standards, and user permissions.",
          category: "audience",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_b2b_smb", label: "B2B Teams & Small Businesses", description: "Multi-user collaboration, reporting, billing" },
            { id: "opt_b2c_consumers", label: "B2C Everyday Consumers", description: "Frictionless onboarding, intuitive mobile-friendly UI" },
            { id: "opt_devs", label: "Developers & Technical Users", description: "APIs, CLI tools, keyboard shortcuts, code export" },
            { id: "opt_internal", label: "Internal Operations / Admin Staff", description: "Data management, audit logs, granular permissions" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Target audience dictates UX complexity and security requirements.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "What are the primary authentication and access control requirements?",
          description: "Defines security boundaries and user management.",
          category: "auth",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_oauth_pass", label: "Email/Password + OAuth (Google/GitHub)", description: "Standard modern SaaS auth" },
            { id: "opt_magic_link", label: "Passwordless Magic Links / WebAuthn", description: "Fast, secure, frictionless login" },
            { id: "opt_sso_rbac", label: "Enterprise SSO (SAML/Okta) + Granular RBAC", description: "Organization workspaces and custom roles" },
            { id: "opt_public_noauth", label: "Public / No Authentication Required", description: "Anonymous usage or client-side storage" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Authentication model is a foundational dependency for data isolation.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "What are the top 3 core capabilities or user workflows?",
          description: "Describe what a user accomplishes in a typical session.",
          category: "features",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Core features form the backbone of the Functional Requirements section.",
        });
        break;
      }

      case "mobile_app": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Which mobile platforms and framework do you intend to target?",
          description: "Guides cross-platform vs native architecture decisions.",
          category: "platform",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_rn", label: "Cross-Platform (React Native / Expo)", description: "Single codebase for iOS & Android" },
            { id: "opt_flutter", label: "Cross-Platform (Flutter)", description: "High performance custom canvas rendering" },
            { id: "opt_ios_native", label: "Native iOS (Swift / SwiftUI)", description: "Maximum Apple ecosystem integration" },
            { id: "opt_pwa", label: "Progressive Web App (PWA)", description: "Web-first installable mobile app" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Platform selection defines UI libraries and build pipelines.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "What level of offline functionality is required?",
          description: "Affects local SQLite/WatermelonDB storage and sync conflict strategies.",
          category: "offline",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_full_offline", label: "Full Offline-First with Background Sync", description: "All actions work offline; syncs when online" },
            { id: "opt_cache_read", label: "Read-Only Cached Offline Data", description: "View cached items; create/edit requires connection" },
            { id: "opt_online_only", label: "Online Only with Network Alerts", description: "Requires active internet connection to function" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Offline architecture is hard to retrofit if not planned early.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "What are the core user screens and primary navigation style?",
          description: "E.g. Bottom Tab Bar, Drawer, Feed with Modal Detail screens.",
          category: "ui_ux",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Screen hierarchy shapes mobile user stories and navigation routes.",
        });
        break;
      }

      case "visual_novel": {
        questions.push({
          id: this.generateQuestionId(),
          title: "What is the branching narrative structure and estimated routes?",
          description: "Defines choice complexity, flag tracking, and multiple endings.",
          category: "branching",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_kinetic", label: "Kinetic Novel (Linear, No Choices)", description: "Pure story reading experience, single canon ending" },
            { id: "opt_standard_branches", label: "Branching Routes (3 - 5 Character Routes)", description: "Early choices branch into unique heroine/hero story arcs" },
            { id: "opt_complex_mesh", label: "Complex Multi-Ending Mesh (10+ Endings)", description: "Variables, affinity meters, bad ends, and true ending unlock" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Branching complexity dictates script architecture and variable state management.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Which visual novel engine and platform are you targeting?",
          description: "Affects scripting language and asset distribution.",
          category: "technical",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_renpy", label: "Ren'Py (Python)", description: "Industry standard for desktop and mobile VNs" },
            { id: "opt_unity_vn", label: "Unity / Naninovel", description: "Rich 3D/2D animation and console porting" },
            { id: "opt_web_vn", label: "Web / HTML5 (Monogatari / Custom)", description: "Browser instant play without installation" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Engine choice dictates script formatting and asset pipeline.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Describe the protagonist and key main characters (2-4 characters):",
          description: "Name, personality, motivation, and role in the conflict.",
          category: "audience",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Character profiles define dialogue requirements and sprite assets.",
        });
        break;
      }

      case "api": {
        questions.push({
          id: this.generateQuestionId(),
          title: "What API communication style and protocol will be used?",
          description: "Defines schema definitions and client SDK patterns.",
          category: "technical",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_rest_json", label: "RESTful JSON API with OpenAPI Spec", description: "Standard HTTP endpoints and status codes" },
            { id: "opt_graphql", label: "GraphQL with Typed Schemas", description: "Flexible client-specified querying and subscriptions" },
            { id: "opt_grpc", label: "gRPC / Protobuf", description: "High-performance low-latency microservice RPCs" },
            { id: "opt_ws", label: "WebSocket / SSE Real-Time Stream", description: "Bidirectional persistent connection for event feeds" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "API protocol dictates gateway, caching, and documentation structure.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "What authentication and rate-limiting strategy is needed?",
          description: "Protects API endpoints and meters developer usage.",
          category: "auth",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_apikey", label: "API Keys with Tiered Rate Limiting", description: "Developers get secret keys with quota per minute" },
            { id: "opt_jwt_oauth", label: "JWT Bearer Tokens / OAuth2", description: "User delegated authorization with short-lived tokens" },
            { id: "opt_mtls", label: "mTLS / VPC Internal Only", description: "Zero-trust service-to-service internal security" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Auth mechanism is critical for API gateway configuration.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "List the primary entities and operations (CRUD / actions):",
          description: "E.g., Users, Projects, Documents, Invoices, Webhooks.",
          category: "data",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Entity breakdown forms the Data Model and Functional Endpoints specifications.",
        });
        break;
      }

      default: {
        questions.push({
          id: this.generateQuestionId(),
          title: "What is the primary problem this product solves, and for whom?",
          description: "Clearly identify the core value proposition and primary user.",
          category: "vision",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Core problem statement establishes project foundation.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "What are the must-have launch features (MVP scope)?",
          description: "List 3-5 capabilities that define version 1.0.",
          category: "features",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "MVP features define scope boundary and non-goals.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "What are the key technical or platform constraints?",
          description: "E.g. Web browser, Desktop app, specific languages, latency bounds.",
          category: "technical",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_web_tech", label: "Modern Web Stack (Next.js / React / Node)", description: "Universal web access" },
            { id: "opt_mobile_tech", label: "Mobile (iOS / Android)", description: "Handheld touch experience" },
            { id: "opt_desktop_tech", label: "Desktop Native / Electron", description: "Local files and high CPU capability" },
            { id: "opt_cli_tech", label: "CLI / Terminal Tool", description: "Scriptable developer utility" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Technical constraints shape architecture specifications.",
        });
        break;
      }
    }

    return questions;
  }

  public processAnswer(
    questionId: string,
    answer: unknown
  ): {
    project: Project;
    newQuestions: DiscoveryQuestion[];
    obsoleteQuestionIds: string[];
    updatedNodes: ProjectNode[];
    newEdges: ProjectEdge[];
    assumptions: ProjectAssumption[];
    conflicts: ProjectConflict[];
  } {
    const question = this.project.questions.find((q) => q.id === questionId);
    const obsoleteQuestionIds: string[] = [];
    const updatedNodes: ProjectNode[] = [];
    const newEdges: ProjectEdge[] = [];
    const assumptions: ProjectAssumption[] = [];
    const newQuestions: DiscoveryQuestion[] = [];
    const now = Date.now();

    if (question) {
      question.answer = answer;
      question.status = "answered";
      question.answeredAt = now;
    }

    const answerStr = typeof answer === "string" ? answer : JSON.stringify(answer || "");
    const lower = answerStr.toLowerCase();

    // 1. Create or update nodes based on answer category and text
    const category = question ? question.category : "features";
    let nodeType: ProjectNodeType = "feature";
    let priority: RequirementPriority = "high";

    if (category === "vision" || category === "genre") {
      nodeType = "goal";
      priority = "critical";
    } else if (category === "audience") {
      nodeType = "audience";
      priority = "high";
    } else if (category === "technical" || category === "platform") {
      nodeType = "tech_req";
      priority = "high";
    } else if (category === "auth") {
      nodeType = "requirement";
      priority = "high";
    } else if (category === "data") {
      nodeType = "data_entity";
      priority = "medium";
    } else if (category === "ui_ux") {
      nodeType = "ux_ui_req";
      priority = "medium";
    }

    // Extract title from answer option or text
    let nodeTitle = question?.title.slice(0, 40) || "Requirement";
    if (question?.options && typeof answer === "string") {
      const selected = question.options.find((o) => o.id === answer || o.label === answer);
      if (selected) {
        nodeTitle = `${selected.label}`;
      }
    } else if (typeof answer === "string" && answer.length > 0) {
      nodeTitle = answer.split("\n")[0].slice(0, 50);
    }

    const newNodeId = this.generateNodeId();
    const newNode: ProjectNode = {
      id: newNodeId,
      type: nodeType,
      title: nodeTitle,
      description: `Defined via discovery answer: ${answerStr.slice(0, 200)}`,
      status: "confirmed",
      priority,
      confidence: 1.0,
      source: "user_answer",
      category,
      metadata: { questionId, answer },
      createdAt: now,
      updatedAt: now,
      relatedQuestionIds: question ? [question.id] : [],
    };

    this.project.nodes.push(newNode);
    updatedNodes.push(newNode);

    // Link new node to root node
    const rootNode = this.project.nodes.find((n) => n.type === "project");
    if (rootNode) {
      const edge: ProjectEdge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        source: rootNode.id,
        target: newNodeId,
        relationship: "PART_OF",
        label: category,
      };
      this.project.edges.push(edge);
      newEdges.push(edge);
    }

    // 2. Discover semantic dependencies
    if (category === "features" || category === "core_gameplay") {
      const authNode = this.project.nodes.find((n) => n.category === "auth");
      if (authNode) {
        const depEdge: ProjectEdge = {
          id: `edge_dep_${Date.now()}`,
          source: newNodeId,
          target: authNode.id,
          relationship: "DEPENDS_ON",
          label: "Requires Auth",
        };
        this.project.edges.push(depEdge);
        newEdges.push(depEdge);
      }
    }

    if (lower.includes("multiplayer") || lower.includes("pvp") || lower.includes("co-op")) {
      const techNode = this.project.nodes.find((n) => n.category === "technical" || n.category === "platform");
      if (techNode) {
        const depEdge: ProjectEdge = {
          id: `edge_dep_net_${Date.now()}`,
          source: newNodeId,
          target: techNode.id,
          relationship: "DEPENDS_ON",
          label: "Network Stack",
        };
        this.project.edges.push(depEdge);
        newEdges.push(depEdge);
      }
    }

    // 3. Mark obsolete questions if conditions match
    if (lower.includes("singleplayer only") || lower.includes("opt_sp")) {
      // Multiplayer questions become obsolete
      for (const q of this.project.questions) {
        if (q.category === "multiplayer" && q.status === "pending" && q.id !== questionId) {
          q.status = "obsolete";
          obsoleteQuestionIds.push(q.id);
        }
      }
    }

    if (lower.includes("no authentication") || lower.includes("opt_public_noauth")) {
      for (const q of this.project.questions) {
        if ((q.category === "auth" || q.category === "rbac") && q.status === "pending" && q.id !== questionId) {
          q.status = "obsolete";
          obsoleteQuestionIds.push(q.id);
        }
      }
    }

    // 4. Update and generate assumptions
    if (category === "platform") {
      const assumption: ProjectAssumption = {
        id: `assump_${Date.now()}_1`,
        statement: `Users will primarily access the product with modern stable broadband internet connections.`,
        status: "assumed",
        source: "engine_inference",
        impact: "Requires responsive CDN and low-latency asset bundling.",
        relatedNodeIds: [newNodeId],
      };
      this.project.assumptions.push(assumption);
      assumptions.push(assumption);
    }

    // 5. Generate 1-3 intelligent follow-up questions
    const followUps = this.generateFollowUpQuestions(category, answer, this.project.domain as ProjectDomain);
    for (const fq of followUps) {
      this.project.questions.push(fq);
      newQuestions.push(fq);
    }

    // 6. Detect conflicts
    const conflicts = this.detectConflicts();

    // 7. Update completeness
    const completeness = this.calculateCompleteness();
    this.project.completeness = completeness.overall;

    return {
      project: this.project,
      newQuestions,
      obsoleteQuestionIds,
      updatedNodes,
      newEdges,
      assumptions,
      conflicts,
    };
  }

  private generateFollowUpQuestions(
    answeredCategory: string,
    answer: unknown,
    domain: ProjectDomain
  ): DiscoveryQuestion[] {
    const followUps: DiscoveryQuestion[] = [];
    const answerStr = String(answer).toLowerCase();
    const existingCategories = new Set(this.project.questions.map((q) => q.category));

    if (domain === "game") {
      if (answeredCategory === "genre" && !existingCategories.has("core_gameplay")) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "What is the core minute-to-minute gameplay loop?",
          description: "e.g., Explore dungeon -> Defeat monsters -> Collect loot -> Upgrade gear in hub -> Repeat.",
          category: "core_gameplay",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "The core loop is the central engine of player retention.",
        });
      }

      if ((answeredCategory === "platform" || answeredCategory === "genre") && !existingCategories.has("monetization")) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "What monetization model will you implement?",
          description: "Defines in-game purchases, premium pricing, or ads.",
          category: "monetization",
          priority: "medium",
          questionType: "single_choice",
          options: [
            { id: "opt_f2p_cosmetic", label: "Free-to-Play with Cosmetic Gamepasses", description: "Fair monetization, skins, pets, VIP tags" },
            { id: "opt_premium_buy", label: "Premium Paid Upfront ($9 - $29)", description: "Full complete game with no in-game purchases" },
            { id: "opt_f2p_battlepass", label: "Seasonal Battle Pass & Boosters", description: "Regular seasonal content updates and progression tracks" },
            { id: "opt_free_no_ads", label: "100% Free / Open Source / Portfolio", description: "No monetization or commercial transactions" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Monetization model impacts inventory systems and storefront design.",
        });
      }

      if (!existingCategories.has("art_audio") && this.project.questions.filter((q) => q.status === "answered").length >= 2) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "What visual art style and audio direction do you envision?",
          description: "e.g., Low-poly stylized, pixel art, semi-realistic 3D, retro PSX.",
          category: "art_audio",
          priority: "low",
          questionType: "single_choice",
          options: [
            { id: "opt_stylized_lowpoly", label: "Stylized Low-Poly / Anime", description: "Vibrant colors, clean geometry, lightweight performance" },
            { id: "opt_pixel_2d", label: "Retro 2D Pixel Art", description: "Classic 16-bit aesthetic, crisp sprite animations" },
            { id: "opt_realistic_3d", label: "High-End PBR 3D", description: "Realistic lighting, detailed textures, particle VFX" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Visual requirements define technical asset budgets and memory targets.",
        });
      }
    } else if (domain === "web_app" || domain === "saas") {
      if (answeredCategory === "auth" && !existingCategories.has("data")) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "What database and data storage architecture fits best?",
          description: "Defines relational schema complexity and query patterns.",
          category: "data",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_pg_sql", label: "Relational Database (PostgreSQL / Supabase)", description: "Strict relations, ACID transactions, relational integrity" },
            { id: "opt_nosql_doc", label: "Document Database (MongoDB / Firestore)", description: "Flexible schemas, fast prototyping, JSON documents" },
            { id: "opt_edge_kv", label: "Edge KV / Client-Side Offline DB", description: "Ultra-fast response with local IndexedDB sync" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Data architecture determines backend models and API contracts.",
        });
      }

      if (answeredCategory === "features" && !existingCategories.has("deployment")) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "What is your target hosting and CI/CD deployment environment?",
          description: "E.g., Vercel, AWS, Cloudflare, Docker.",
          category: "deployment",
          priority: "medium",
          questionType: "single_choice",
          options: [
            { id: "opt_vercel", label: "Vercel / Next.js Serverless", description: "Instant global edge deployment with zero config" },
            { id: "opt_aws_docker", label: "AWS / Google Cloud (Containers / Docker)", description: "Full infrastructure control and dedicated compute" },
            { id: "opt_self_host", label: "Self-Hosted Linux VPS", description: "Cost-effective single server deployment" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Deployment targets affect build configuration and environment variables.",
        });
      }
    } else {
      // Generic follow up
      if (!existingCategories.has("testing") && this.project.questions.filter((q) => q.status === "answered").length >= 2) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "What are the primary acceptance criteria and QA testing requirements?",
          description: "E.g., Automated unit tests, end-to-end user flows, cross-device testing.",
          category: "testing",
          priority: "low",
          questionType: "single_choice",
          options: [
            { id: "opt_full_ci_test", label: "Unit + E2E Tests with CI Pipeline", description: "High reliability before every release" },
            { id: "opt_manual_qa", label: "Manual QA + Smoke Testing", description: "Fast MVP validation and rapid iteration" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Defines quality gates in the Testing & QA section.",
        });
      }
    }

    return followUps.slice(0, 2);
  }

  public calculateCompleteness(): {
    overall: number;
    categories: Record<string, { score: number; total: number; label: string }>;
  } {
    const result = calculateProjectCompleteness(this.project);
    this.project.completeness = result.overall;
    return result;
  }

  public detectConflicts(): ProjectConflict[] {
    const conflicts: ProjectConflict[] = [];
    const nodes = this.project.nodes || [];
    const answers = this.project.questions
      .filter((q) => q.status === "answered" && q.answer)
      .map((q) => `${q.title} -> ${JSON.stringify(q.answer)}`)
      .join(" ")
      .toLowerCase();

    const nodeTitles = nodes.map((n) => n.title.toLowerCase()).join(" ");
    const fullContext = `${answers} ${nodeTitles}`;

    // Conflict 1: Singleplayer vs Multiplayer
    const hasSingleplayer = fullContext.includes("singleplayer only") || fullContext.includes("purely singleplayer");
    const hasMultiplayer = fullContext.includes("multiplayer pvp") || fullContext.includes("mmo") || fullContext.includes("dedicated server");
    if (hasSingleplayer && hasMultiplayer) {
      const spNode = nodes.find((n) => n.title.toLowerCase().includes("singleplayer")) || nodes[0];
      const mpNode = nodes.find((n) => n.title.toLowerCase().includes("multiplayer")) || nodes[1] || nodes[0];
      conflicts.push({
        id: `conf_${Date.now()}_mp_sp`,
        description: "Contradiction detected: Specification requires 'Singleplayer Only' but also specifies 'Multiplayer / PvP' network infrastructure.",
        nodeA: spNode?.id || "root",
        nodeB: mpNode?.id || "root",
        status: "detected",
        resolution: "Choose either dedicated multiplayer architecture or focus exclusively on a standalone singleplayer loop.",
        relatedNodeIds: [spNode?.id, mpNode?.id].filter(Boolean) as string[],
      });
    }

    // Conflict 2: 100% Free vs Aggressive Monetization
    const isFree = fullContext.includes("100% free") || fullContext.includes("free / open source") || fullContext.includes("no monetization");
    const hasPaid = fullContext.includes("battle pass") || fullContext.includes("in-game purchases") || fullContext.includes("subscription tier") || fullContext.includes("gamepasses");
    if (isFree && hasPaid) {
      conflicts.push({
        id: `conf_${Date.now()}_monetization`,
        description: "Monetization Conflict: Product is specified as '100% Free / No In-App Purchases' but features include paid store/monetization modules.",
        nodeA: nodes[0]?.id || "root",
        nodeB: nodes[1]?.id || "root",
        status: "detected",
        resolution: "Clarify whether commercial monetization features should be removed or if the pricing model includes optional cosmetics.",
        relatedNodeIds: nodes.slice(0, 2).map((n) => n.id),
      });
    }

    // Conflict 3: No Auth vs Enterprise Roles / RBAC
    const noAuth = fullContext.includes("no authentication") || fullContext.includes("public / noauth");
    const hasRBAC = fullContext.includes("rbac") || fullContext.includes("organization workspace") || fullContext.includes("user permissions");
    if (noAuth && hasRBAC) {
      conflicts.push({
        id: `conf_${Date.now()}_auth_rbac`,
        description: "Security Contradiction: No authentication is enabled, yet role-based access control (RBAC) and user permissions are requested.",
        nodeA: nodes[0]?.id || "root",
        nodeB: nodes[1]?.id || "root",
        status: "detected",
        resolution: "Enable user authentication before configuring role-based permissions.",
        relatedNodeIds: nodes.slice(0, 2).map((n) => n.id),
      });
    }

    // Conflict 4: Casual Simple vs Hardcore Permadeath
    const isCasual = fullContext.includes("casual") || fullContext.includes("relaxing") || fullContext.includes("minimalist");
    const isHardcore = fullContext.includes("hardcore permadeath") || fullContext.includes("extreme difficulty") || fullContext.includes("punishing souls-like");
    if (isCasual && isHardcore) {
      conflicts.push({
        id: `conf_${Date.now()}_pacing`,
        description: "Gameplay Tension: Core vision targets 'Casual / Relaxing' audience while mechanics specify 'Hardcore Permadeath / High Punishment'.",
        nodeA: nodes[0]?.id || "root",
        nodeB: nodes[1]?.id || "root",
        status: "detected",
        resolution: "Consider offering difficulty modes (Relaxed Mode vs Nightmare Mode) to reconcile divergent player expectations.",
        relatedNodeIds: nodes.slice(0, 2).map((n) => n.id),
      });
    }

    this.project.conflicts = conflicts;
    return conflicts;
  }

  public detectDependencies(nodeId: string): ProjectEdge[] {
    const directEdges = this.project.edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    );
    return directEdges;
  }

  public getNextQuestions(count: number = 3): DiscoveryQuestion[] {
    const pendingQuestions = this.project.questions.filter((q) => q.status === "pending");

    const answeredIds = new Set(
      this.project.questions.filter((q) => q.status === "answered").map((q) => q.id)
    );

    // Filter questions whose dependencies are satisfied
    const availableQuestions = pendingQuestions.filter((q) => {
      if (!q.dependsOn || q.dependsOn.length === 0) return true;
      return q.dependsOn.every((depId) => answeredIds.has(depId));
    });

    const priorityWeight: Record<QuestionPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      optional: 4,
    };

    availableQuestions.sort((a, b) => {
      const pDiff = (priorityWeight[a.priority] ?? 2) - (priorityWeight[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;

      // Blocking questions preferred
      if (a.blocking && !b.blocking) return -1;
      if (!a.blocking && b.blocking) return 1;

      // Fewer dependencies first
      const aDeps = a.dependsOn?.length || 0;
      const bDeps = b.dependsOn?.length || 0;
      return aDeps - bDeps;
    });

    return availableQuestions.slice(0, count);
  }

  public isDiscoveryComplete(): boolean {
    const completeness = this.calculateCompleteness().overall;
    const pendingImportant = this.project.questions.some(
      (q) => q.status === "pending" && (q.priority === "critical" || q.priority === "high")
    );
    const unresolvedConflicts = this.project.conflicts.some(
      (c) => c.status === "detected" || c.status === "acknowledged" || c.status === "resolving"
    );

    return completeness > 75 && !pendingImportant && !unresolvedConflicts;
  }
}
