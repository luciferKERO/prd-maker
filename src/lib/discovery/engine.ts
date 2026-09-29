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

  constructor(project?: Project) {
    if (project) {
      this.project = JSON.parse(JSON.stringify(project));
    } else {
      const now = Date.now();
      this.project = {
        id: `proj_${now}`,
        title: "Untitled Project",
        description: "",
        domain: "default",
        platforms: [],
        status: "discovery",
        completeness: 0,
        nodes: [],
        edges: [],
        questions: [],
        assumptions: [],
        conflicts: [],
        decisions: [],
        risks: [],
        requirements: [],
        revisions: [],
        metadata: {
          domain: "default",
          platforms: [],
          createdAt: now,
          updatedAt: now,
        },
      };
    }
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
      text.includes("novel visual") ||
      text.includes("renpy") ||
      text.includes("ren'py") ||
      text.includes("branching story") ||
      text.includes("cerita bercabang") ||
      text.includes("dating sim") ||
      text.includes("kinetic novel")
    ) {
      return "visual_novel";
    }

    // Game check
    if (
      text.includes("game") ||
      text.includes("permainan") ||
      text.includes("roblox") ||
      text.includes("unity") ||
      text.includes("godot") ||
      text.includes("unreal") ||
      text.includes("gameplay") ||
      text.includes("player") ||
      text.includes("pemain") ||
      text.includes("level") ||
      text.includes("rpg") ||
      text.includes("fps") ||
      text.includes("mmo") ||
      text.includes("adventure") ||
      text.includes("petualangan") ||
      text.includes("survival") ||
      text.includes("bertahan hidup") ||
      text.includes("horror") ||
      text.includes("horor") ||
      text.includes("puzzle") ||
      text.includes("teka-teki") ||
      text.includes("platformer") ||
      text.includes("racing") ||
      text.includes("balap") ||
      text.includes("fighting") ||
      text.includes("simulation") ||
      text.includes("simulasi") ||
      text.includes("sandbox") ||
      text.includes("open world")
    ) {
      return "game";
    }

    // AI Tool check
    if (
      text.includes("ai tool") ||
      text.includes("alat ai") ||
      text.includes("kecerdasan buatan") ||
      text.includes("llm") ||
      text.includes("gpt") ||
      text.includes("copilot") ||
      text.includes("agent") ||
      text.includes("rag") ||
      text.includes("prompt") ||
      text.includes("diffusion") ||
      text.includes("machine learning") ||
      text.includes("pembelajaran mesin") ||
      text.includes("neural")
    ) {
      return "ai_tool";
    }

    // SaaS check
    if (
      text.includes("saas") ||
      text.includes("subscription") ||
      text.includes("langganan") ||
      text.includes("b2b") ||
      text.includes("billing") ||
      text.includes("tagihan") ||
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
      text.includes("aplikasi mobile") ||
      text.includes("aplikasi android") ||
      text.includes("aplikasi ios") ||
      text.includes("aplikasi hp") ||
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
      text.includes("aplikasi web") ||
      text.includes("situs") ||
      text.includes("dashboard") ||
      text.includes("portal") ||
      text.includes("landing page") ||
      text.includes("blog") ||
      text.includes("ecommerce") ||
      text.includes("e-commerce") ||
      text.includes("toko online") ||
      text.includes("admin") ||
      text.includes("cms")
    ) {
      return "web_app";
    }

    // Desktop check
    if (
      text.includes("desktop app") ||
      text.includes("aplikasi desktop") ||
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
      text.includes("musik") ||
      text.includes("art generator") ||
      text.includes("video editor") ||
      text.includes("edit video") ||
      text.includes("drawing") ||
      text.includes("menggambar") ||
      text.includes("photo editing") ||
      text.includes("edit foto") ||
      text.includes("3d model")
    ) {
      return "creative";
    }

    // Educational check
    if (
      text.includes("course") ||
      text.includes("kursus") ||
      text.includes("quiz") ||
      text.includes("kuis") ||
      text.includes("learn") ||
      text.includes("belajar") ||
      text.includes("education") ||
      text.includes("edukasi") ||
      text.includes("pendidikan") ||
      text.includes("flashcard") ||
      text.includes("student") ||
      text.includes("mahasiswa") ||
      text.includes("siswa")
    ) {
      return "educational";
    }

    // Community check
    if (
      text.includes("forum") ||
      text.includes("discord") ||
      text.includes("chat app") ||
      text.includes("aplikasi chat") ||
      text.includes("social network") ||
      text.includes("media sosial") ||
      text.includes("feed") ||
      text.includes("community") ||
      text.includes("komunitas")
    ) {
      return "community";
    }

    // Automation check
    if (
      text.includes("automation") ||
      text.includes("otomasi") ||
      text.includes("bot") ||
      text.includes("scraper") ||
      text.includes("pipeline") ||
      text.includes("cron") ||
      text.includes("workflow") ||
      text.includes("alur kerja")
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
          title: "Apa genre utama dan tema inti dari game yang ingin Anda bangun?",
          description: "Menentukan gameplay loop inti, tempo permainan, dan target audiens pemain.",
          category: "genre",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_rpg", label: "Action RPG / Petualangan", description: "Quest, leveling, pertarungan, dan progres cerita" },
            { id: "opt_survival", label: "Survival / Sandbox", description: "Crafting, bangun markas, dan pengumpulan sumber daya" },
            { id: "opt_horror", label: "Horor / Thriller", description: "Ketegangan atmosfer, teka-teki, dan bertahan hidup" },
            { id: "opt_platformer", label: "Platformer 2D / 3D", description: "Navigasi rintangan presisi dan stage progression" },
            { id: "opt_puzzle", label: "Puzzle / Strategi", description: "Pemecahan masalah taktis dan level berbasis logika" },
            { id: "opt_roblox_sim", label: "Roblox Tycoon / Simulator", description: "Loop cepat, rebirth, pet, dan sistem otomatisasi" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Genre menentukan arsitektur mekanik gameplay dan sistem progresi.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Game engine dan platform target apa yang akan digunakan?",
          description: "Menentukan batasan teknis, sistem fisika, dan pipeline aset 2D/3D.",
          category: "platform",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_roblox", label: "Roblox Studio (Luau)", description: "Cross-play PC, Mobile, dan Console di platform Roblox" },
            { id: "opt_unity", label: "Unity (C#)", description: "Multiplatform mandiri untuk PC, Mobile, dan Konsol" },
            { id: "opt_godot", label: "Godot 4 (GDScript / C#)", description: "Engine open-source ringan untuk 2D/3D" },
            { id: "opt_unreal", label: "Unreal Engine 5 (C++ / Blueprints)", description: "Grafis 3D kelas atas dengan pencahayaan realistis" },
            { id: "opt_web", label: "Web / Three.js / HTML5", description: "Dapat dimainkan instan langsung dari browser" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Pilihan platform dan engine menentukan arsitektur stack dan target performa.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Bagaimana cakupan mode permainan dan multiplayer?",
          description: "Mempengaruhi kebutuhan server backend, replikasi state, dan sinkronisasi jaringan.",
          category: "multiplayer",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_sp", label: "Singleplayer Saja (Offline / Lokal)", description: "Sesi pemain mandiri tanpa koneksi antar pemain" },
            { id: "opt_coop", label: "Co-op / Tim Kecil (2 - 4 Pemain)", description: "Lobi kooperatif peer-to-peer atau dedicated kecil" },
            { id: "opt_pvp", label: "Multiplayer PvP (10 - 50 Pemain)", description: "Dedicated matchmaking server dengan proteksi anti-cheat" },
            { id: "opt_mmo", label: "MMO / Persistent World", description: "Dunia persisten berskala besar dengan database sharding" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Model multiplayer menjadi fondasi arsitektur jaringan backend game.",
        });
        break;
      }

      case "web_app":
      case "saas": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Siapa target audiens dan pengguna utama dari aplikasi ini?",
          description: "Memperjelas standar kemudahan penggunaan, hak akses, dan alur kerja utama.",
          category: "audience",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_b2b_smb", label: "Tim Bisnis / B2B & Usaha Kecil", description: "Kolaborasi multi-pengguna, laporan, dan billing" },
            { id: "opt_b2c_consumers", label: "Pengguna Umum / Konsumen B2C", description: "Onboarding instan, UI intuitif, dan ramah mobile" },
            { id: "opt_devs", label: "Developer & Pengguna Teknis", description: "Integrasi API, CLI, pintasan keyboard, dan ekspor data" },
            { id: "opt_internal", label: "Operasional Internal & Staf Admin", description: "Manajemen data komprehensif, log audit, dan role ketat" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Target audiens menentukan kompleksitas UX dan model keamanan sistem.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Metode autentikasi dan kontrol akses apa yang dibutuhkan?",
          description: "Menentukan batas keamanan, isolasi data, dan manajemen akun pengguna.",
          category: "auth",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_oauth_pass", label: "Email/Password + OAuth (Google / GitHub)", description: "Standar autentikasi modern untuk web/SaaS" },
            { id: "opt_magic_link", label: "Passwordless Magic Links / WebAuthn", description: "Login instan tanpa password via email atau biometrik" },
            { id: "opt_sso_rbac", label: "Enterprise SSO (SAML/Okta) + Granular RBAC", description: "Workspace korporat dengan pembagian role khusus" },
            { id: "opt_public_noauth", label: "Publik / Tanpa Login (Penyimpanan Lokal)", description: "Penggunaan anonim dengan data disimpan di browser (Local-First)" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Model autentikasi adalah dependensi mendasar bagi isolasi data pengguna.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Sebutkan 3 kapabilitas utama atau alur kerja terpenting yang dilakukan pengguna:",
          description: "Jelaskan langkah apa saja yang diselesaikan pengguna dalam satu sesi normal.",
          category: "features",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Fitur utama membentuk inti dari dokumen Spesifikasi Kebutuhan Fungsional.",
        });
        break;
      }

      case "mobile_app": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Framework dan platform mobile apa yang akan Anda targetkan?",
          description: "Menentukan strategi cross-platform vs native dan pipeline build aplikasi.",
          category: "platform",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_rn", label: "Cross-Platform (React Native / Expo)", description: "Satu basis kode TypeScript untuk Android & iOS" },
            { id: "opt_flutter", label: "Cross-Platform (Flutter / Dart)", description: "Performa tinggi dengan rendering canvas kustom" },
            { id: "opt_ios_native", label: "Native Mobile (Swift iOS / Kotlin Android)", description: "Integrasi penuh fitur hardware & OS native" },
            { id: "opt_pwa", label: "Progressive Web App (PWA / Web-to-Mobile)", description: "Dapat diinstal langsung dari browser tanpa app store" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Pemilihan framework menentukan pustaka UI dan proses rilis aplikasi.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Tingkat dukungan fungsionalitas offline apa yang diperlukan?",
          description: "Mempengaruhi penyimpanan SQLite/IndexedDB lokal dan strategi sinkronisasi data.",
          category: "offline",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_full_offline", label: "Full Offline-First dengan Sinkronisasi Otomatis", description: "Semua aksi berjalan offline dan tersinkron saat internet tersedia" },
            { id: "opt_cache_read", label: "Cache Read-Only saat Offline", description: "Bisa melihat data tersimpan; tambah/edit butuh internet" },
            { id: "opt_online_only", label: "Online Saja dengan Indikator Jaringan", description: "Aplikasi membutuhkan koneksi internet aktif untuk beroperasi" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Arsitektur offline-first harus dirancang sejak awal agar tidak merombak skema data.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Jelaskan struktur layar utama aplikasi dan gaya navigasi yang diinginkan:",
          description: "Contoh: Tab bar bawah (Bottom Nav), Drawer samping, atau Feed kartu dengan detail modal.",
          category: "ui_ux",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Hierarki layar membentuk user journey dan rute navigasi aplikasi.",
        });
        break;
      }

      case "visual_novel": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Bagaimana struktur narasi cerita dan perkiraan rute percabangan?",
          description: "Menentukan kompleksitas pilihan pemain, flag tracking, dan jumlah ending.",
          category: "branching",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_kinetic", label: "Kinetic Novel (Linier, Tanpa Pilihan)", description: "Fokus murni membaca cerita dengan satu alur cerita utama" },
            { id: "opt_standard_branches", label: "Rute Bercabang Standar (3 - 5 Rute Karakter)", description: "Pilihan di awal membagi ke rute karakter dengan ending masing-masing" },
            { id: "opt_complex_mesh", label: "Percabangan Kompleks & Multi-Ending (10+ Ending)", description: "Menggunakan meteran afinitas, variabel tersembunyi, dan true ending" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Kompleksitas percabangan menentukan arsitektur script dan state variabel cerita.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Engine visual novel apa yang akan digunakan?",
          description: "Mempengaruhi format penulisan script skenario dan pipeline aset gambar/suara.",
          category: "technical",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_renpy", label: "Ren'Py (Python)", description: "Standar industri untuk visual novel di PC dan Mobile" },
            { id: "opt_unity_vn", label: "Unity / Naninovel", description: "Animasi 2D/3D kaya dan porting mudah ke konsol" },
            { id: "opt_web_vn", label: "Web / HTML5 (Monogatari / Web Engine)", description: "Bisa dimainkan langsung di browser tanpa perlu instalasi" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Pilihan engine menentukan format dialog, transisi adegan, dan integrasi aset.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Deskripsikan karakter protagonis dan 2-4 tokoh utama lainnya:",
          description: "Sebutkan nama, kepribadian, motivasi, dan perannya dalam konflik cerita.",
          category: "audience",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Profil karakter menjadi acuan daftar dialog, ekspresi sprite, dan alur relasi.",
        });
        break;
      }

      case "api": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Gaya komunikasi dan protokol API apa yang akan diterapkan?",
          description: "Menentukan definisi skema kontrak data dan pembuatan SDK klien.",
          category: "technical",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_rest_json", label: "RESTful JSON API dengan Spesifikasi OpenAPI", description: "Endpoint standar HTTP dengan status code konsisten" },
            { id: "opt_graphql", label: "GraphQL dengan Typed Schema", description: "Klien dapat meminta payload presisi dan mendukung subscription" },
            { id: "opt_grpc", label: "gRPC / Protobuf", description: "Komunikasi biner performa tinggi untuk microservices" },
            { id: "opt_ws", label: "WebSocket / Server-Sent Events (SSE)", description: "Koneksi persisten real-time untuk stream data berkelanjutan" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Protokol API menentukan konfigurasi gateway, caching, dan dokumentasi teknis.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Strategi autentikasi dan pembatasan kuota (rate limiting) apa yang diperlukan?",
          description: "Melindungi endpoint API dari penyalahgunaan dan mengatur kuota pemakaian pengembang.",
          category: "auth",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_apikey", label: "API Key dengan Pembagian Kuota Berjenjang", description: "Developer menggunakan secret key dengan batas request per menit" },
            { id: "opt_jwt_oauth", label: "JWT Bearer Token / OAuth2", description: "Otorisasi pengguna dengan token berbatas waktu kedaluwarsa" },
            { id: "opt_mtls", label: "mTLS / VPC Internal Saja", description: "Keamanan antar-layanan privat zero-trust" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Mekanisme autentikasi sangat krusial dalam perancangan middleware gateway.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Sebutkan entitas data utama dan operasi CRUD / aksi yang tersedia:",
          description: "Contoh: Pengguna, Proyek, Dokumen, Tagihan, Webhook.",
          category: "data",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Rincian entitas membentuk model data dan daftar endpoint fungsional PRD.",
        });
        break;
      }

      case "ai_tool": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Apa kemampuan kecerdasan buatan (AI) utama dan nilai yang dihasilkan produk ini?",
          description: "Menjelaskan model AI yang digunakan, workflow otomatisasi, dan output yang diterima pengguna.",
          category: "vision",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Nilai inti AI menjadi penentu arsitektur model dan prompt pipeline.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Bagaimana arsitektur pemrosesan data dan pipeline AI yang akan digunakan?",
          description: "Menentukan kebutuhan basis data vektor, RAG, atau fine-tuning model.",
          category: "data",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_direct_llm", label: "Direct LLM API (OpenAI / Anthropic / Groq / Local)", description: "Pemanggilan langsung dengan prompt engineering terstruktur" },
            { id: "opt_rag_vector", label: "RAG dengan Vektor Database (Chroma / Pinecone / pgvector)", description: "Pencarian semantik dokumen sebelum inferensi model" },
            { id: "opt_local_embedded", label: "Model Lokal On-Device / Edge Inference", description: "Pemrosesan privat tanpa mengirim data ke server eksternal" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Pipeline data menentukan latensi sistem dan kebutuhan biaya komputasi.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Sebutkan antarmuka pengguna (UI) dan cara interaksi dengan AI yang diinginkan:",
          description: "Contoh: Chat assistant interaktif, kanvas visual dengan drag-and-drop, atau otomatisasi form cerdas.",
          category: "ui_ux",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Model interaksi menentukan tata letak komponen frontend dan status loading/streaming.",
        });
        break;
      }

      case "creative": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Siapa target kreator dan audiens pengguna utama dari produk ini?",
          description: "Menentukan tingkat kemudahan antarmuka, preset otomatis, dan kompleksitas alur kerja.",
          category: "audience",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_creator_social", label: "Konten Kreator / Media Sosial (TikTok/Reels/YouTube)", description: "Fokus format vertikal/horizontal cepat, template otomatis, dan ekspor instan" },
            { id: "opt_pro_editor", label: "Video Editor & Desainer Profesional", description: "Multi-track timeline presisi, shortcut fleksibel, dan kontrol parameter granular" },
            { id: "opt_casual_user", label: "Pengguna Kasual & Pelajar / Mahasiswa", description: "Tampilan sederhana tanpa kurva belajar rumit, berbasis wizard" },
            { id: "opt_biz_team", label: "Tim Pemasaran & Bisnis / Korporat", description: "Template branding konsisten, teks otomatis, dan aset kolaboratif" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Target audiens menentukan kedalaman kontrol timeline dan gaya interaksi UI.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Bagaimana alur kerja utama kreasi/penyuntingan (Core Workflow) yang diinginkan?",
          description: "Jelaskan proses dari memasukkan media, proses edit, hingga menghasilkan karya final.",
          category: "core_experience",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Alur kerja utama adalah inti dari spesifikasi user journey dan state engine.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Format media input/output dan kapabilitas penyuntingan apa yang wajib ada di MVP?",
          description: "Sebutkan format berkas (MP4/WebM/Audio/Gambar) dan fitur penting seperti potong video, teks/subtitel, musik latar, efek transisi.",
          category: "features",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Daftar fitur MVP menentukan cakupan pemrosesan aset dan rendering engine.",
        });
        break;
      }

      case "educational": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Siapa kelompok pembelajar dan instruktur target produk ini?",
          description: "Memperjelas rentang usia, tingkat kemahiran, dan skenario pembelajaran mandiri vs terbimbing.",
          category: "audience",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_edu_students", label: "Siswa Sekolah & Mahasiswa Universitas", description: "Fokus kurikulum terstruktur, latihan soal, dan persiapan ujian" },
            { id: "opt_edu_prof", label: "Profesional / Karir (Up-skilling)", description: "Pembelajaran mandiri fleksibel dengan studi kasus praktis" },
            { id: "opt_edu_general", label: "Pembelajar Umum / Hobi (Bahasa / Keterampilan)", description: "Gamifikasi menyenangkan dengan streak harian dan kuis kilat" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Target audiens menentukan struktur materi dan tingkat gamifikasi pembelajaran.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Bagaimana siklus belajar dan evaluasi (Learning Loop & Quizzes) yang dirancang?",
          description: "Contoh: Menonton materi -> Kuis pemahaman -> Latihan interaktif -> Review berkala (spaced repetition).",
          category: "core_experience",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Siklus belajar mendefinisikan modul progres belajar dan metrik penguasaan materi.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Fitur interaktif apa saja yang wajib tersedia dalam materi pembelajaran?",
          description: "Sebutkan fitur seperti flashcard interaktif, timer studi Pomodoro, leaderboard, dan unduh materi offline.",
          category: "features",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Fitur interaktif mempengaruhi arsitektur state kuis dan sinkronisasi skor.",
        });
        break;
      }

      case "community": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Komunitas apa yang menjadi fokus utama dan bagaimana hierarki anggotanya?",
          description: "Menentukan sistem peran/moderasi, privasi grup, dan norma interaksi.",
          category: "audience",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Struktur komunitas menentukan model perizinan (RBAC) dan moderasi konten.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Bagaimana interaksi linimasa, thread diskusi, atau percakapan real-time berjalan?",
          description: "Contoh: Forum diskusi berbasis upvote ala Reddit, chat channel ala Discord, atau feed linimasa.",
          category: "core_experience",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_comm_feed", label: "Social Feed Linimasa dengan Like & Komentar", description: "Post multimedia dengan algoritma trending dan following" },
            { id: "opt_comm_chat", label: "Real-Time Chat & Channel Komunitas", description: "Pesan instan cepat dengan dukungan voice/thread" },
            { id: "opt_comm_forum", label: "Forum Diskusi Berstruktur Kategori & Solusi", description: "Thread topik mendalam dengan voting jawaban terbaik" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Pola interaksi menentukan protokol jaringan (WebSocket vs REST) dan skema data.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Fitur sosial dan alat bantu moderasi apa yang dibutuhkan di versi 1.0?",
          description: "Sebutkan fitur seperti lencana reputasi, auto-mod spam filter, direct message, dan notifikasi aktivitas.",
          category: "features",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Fitur moderasi esensial untuk menjaga kualitas komunitas sejak peluncuran awal.",
        });
        break;
      }

      case "automation": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Bagaimana alur pemicu (triggers) dan rangkaian aksi (actions / pipeline) dieksekusi?",
          description: "Contoh: Webhook diterima -> Parse data -> Panggil AI / Transformasi -> Kirim notifikasi / Simpan DB.",
          category: "core_experience",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Alur pemicu-aksi menentukan arsitektur queue worker dan state engine pipeline.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Bagaimana strategi penjadwalan, concurrency, dan penanganan error / retry?",
          description: "Menentukan batas toleransi kegagalan task, timeout eksekusi, dan sistem antrean background.",
          category: "technical",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_auto_cron", label: "Jadwal Berkala (Cron / Polling Otomatis)", description: "Eksekusi otomatis pada interval waktu tertentu" },
            { id: "opt_auto_event", label: "Event-Driven Real-Time (Webhook / PubSub)", description: "Eksekusi seketika saat event eksternal terdeteksi" },
            { id: "opt_auto_manual", label: "Manual Trigger dengan Log Eksekusi Lengkap", description: "Dijalankan sesuai permintaan pengguna dengan riwayat detail" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Strategi eksekusi menentukan runtime backend dan penanganan kegagalan otomatis.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Integrasi layanan pihak ketiga dan format data apa yang harus diproses?",
          description: "Sebutkan API, webhook, atau sumber berkas eksternal yang terhubung.",
          category: "features",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Kebutuhan integrasi mendefinisikan adapter eksternal dan variabel rahasia (secrets).",
        });
        break;
      }

      case "desktop": {
        questions.push({
          id: this.generateQuestionId(),
          title: "Sistem operasi dan framework desktop apa yang ditargetkan?",
          description: "Menentukan arsitektur native vs hybrid dan izin akses sistem berkas lokal.",
          category: "technical",
          priority: "critical",
          questionType: "single_choice",
          options: [
            { id: "opt_desk_tauri", label: "Tauri (Rust + Web Frontend)", description: "Ukuran biner ultra-kecil, konsumsi memori rendah, dan performa tinggi" },
            { id: "opt_desk_electron", label: "Electron (Node.js + Chromium)", description: "Ekosistem kaya dengan kompatibilitas pustaka Node.js penuh" },
            { id: "opt_desk_pwa", label: "PWA Desktop (Chrome / Edge Installable)", description: "Ringan tanpa perlu kompilasi native installer terpisah" },
          ],
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Pilihan framework desktop menentukan proses bundling dan ukuran instalasi.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Bagaimana integrasi dengan sistem file lokal dan fungsionalitas offline?",
          description: "Contoh: Buka berkas lokal langsung tanpa upload, auto-save ke disk, atau export multi-format.",
          category: "core_experience",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Akses berkas lokal membedakan pengalaman desktop dari aplikasi web standar.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Fitur desktop native apa yang wajib tersedia di rilis awal?",
          description: "Misal: System tray icon, global keyboard shortcuts, drag-and-drop berkas dari desktop, auto-updater.",
          category: "features",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Fitur OS native meningkatkan kenyamanan alur kerja pengguna desktop.",
        });
        break;
      }

      default: {
        questions.push({
          id: this.generateQuestionId(),
          title: "Masalah utama apa yang ingin diselesaikan oleh produk ini, dan untuk siapa?",
          description: "Identifikasi secara jelas proposisi nilai inti dan target pengguna produk.",
          category: "vision",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Pernyataan masalah menjadi fondasi utama seluruh dokumen spesifikasi.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Apa saja fitur wajib yang harus ada pada versi rilis awal (MVP)?",
          description: "Sebutkan 3-5 fitur penting yang mendefinisikan versi 1.0.",
          category: "features",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Batasan fitur MVP menentukan cakupan produk dan prioritas pengerjaan.",
        });

        questions.push({
          id: this.generateQuestionId(),
          title: "Apa kendala teknis atau platform utama yang harus dipenuhi?",
          description: "Contoh: Harus berjalan di browser web, offline-first, dukungan perangkat mobile, atau teknologi tertentu.",
          category: "technical",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_web_tech", label: "Web Modern (Next.js / React / TypeScript)", description: "Aplikasi web responsif yang mudah diakses dari semua perangkat" },
            { id: "opt_mobile_tech", label: "Aplikasi Mobile (Android / iOS)", description: "Aplikasi native atau PWA yang dapat diinstal di smartphone" },
            { id: "opt_desktop_tech", label: "Aplikasi Desktop (Electron / Tauri)", description: "Aplikasi komputer dengan akses sistem file lokal" },
            { id: "opt_cli_tech", label: "Alat Terminal / CLI Utility", description: "Perangkat lunak berbasis perintah baris untuk pengembang" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Kendala teknologi menjadi panduan dalam perancangan arsitektur sistem.",
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

    // 5b. Auto-replenish if pending questions are low (< 2) and completeness < 85%
    const currentPending = this.project.questions.filter((q) => q.status === "pending");
    if (currentPending.length < 2) {
      const nextRound = this.generateNextRoundQuestions(Math.max(1, 3 - currentPending.length));
      for (const nq of nextRound) {
        if (!this.project.questions.some((q) => q.id === nq.id || q.title === nq.title)) {
          this.project.questions.push(nq);
          newQuestions.push(nq);
        }
      }
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

  public generateNextRoundQuestions(count: number = 3): DiscoveryQuestion[] {
    const comp = this.calculateCompleteness();
    const existingQ = this.project.questions || [];
    const pendingCategories = new Set(
      existingQ.filter((q) => q.status === "pending").map((q) => q.category)
    );
    const answeredCategories = new Set(
      existingQ.filter((q) => q.status === "answered").map((q) => q.category)
    );
    const existingTitles = new Set(existingQ.map((q) => q.title.toLowerCase().trim()));

    const questions: DiscoveryQuestion[] = [];
    const domain = (this.project.domain || "default") as ProjectDomain;

    // 1. Check template categories with lowest fulfillment
    const missingEntries = Object.entries(comp.categories)
      .filter(([catKey, val]) => val.score < val.total && !pendingCategories.has(catKey))
      .sort((a, b) => (a[1].score / a[1].total) - (b[1].score / b[1].total));

    for (const [catKey] of missingEntries) {
      if (questions.length >= count) break;
      const q = this.createQuestionForCategory(catKey, domain);
      if (q && !existingTitles.has(q.title.toLowerCase().trim())) {
        questions.push(q);
        pendingCategories.add(catKey);
        existingTitles.add(q.title.toLowerCase().trim());
      }
    }

    // 2. If more questions needed, generate deep dive refinement questions
    if (questions.length < count) {
      const deepDives = this.getDeepDiveQuestions(domain, answeredCategories, pendingCategories);
      for (const dq of deepDives) {
        if (questions.length >= count) break;
        if (!existingTitles.has(dq.title.toLowerCase().trim())) {
          questions.push(dq);
          existingTitles.add(dq.title.toLowerCase().trim());
        }
      }
    }

    return questions;
  }

  private createQuestionForCategory(category: string, domain: ProjectDomain): DiscoveryQuestion | null {
    switch (category) {
      case "audience":
        return {
          id: this.generateQuestionId(),
          title: "Siapa target audiens dan personas pengguna utama dari produk ini?",
          description: "Memperjelas segmen pengguna, standar kemudahan penggunaan, dan skenario pemakaian harian.",
          category: "audience",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_aud_creators", label: "Kreator Konten & Pengguna Media Kreatif", description: "Alur kerja cepat dengan antarmuka visual responsif" },
            { id: "opt_aud_pro", label: "Pengguna Profesional & Tim Bisnis", description: "Fitur lanjutan, stabilitas tinggi, dan kepatuhan standar" },
            { id: "opt_aud_students", label: "Pelajar / Mahasiswa & Edukasi", description: "Pengalaman belajar interaktif dan aksesibilitas ramah pemula" },
            { id: "opt_aud_devs", label: "Developer & Pengguna Teknis", description: "Integrasi sistem, modularitas, dan performa efisien" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Target audiens menjadi acuan dalam penentuan persona pengguna pada dokumen PRD.",
        };

      case "core_experience":
        return {
          id: this.generateQuestionId(),
          title: "Bagaimana alur kerja utama pengguna dari awal hingga selesai (Core Workflow)?",
          description: "Jelaskan langkah-langkah yang dilakukan pengguna untuk menyelesaikan tugas inti dalam aplikasi.",
          category: "core_experience",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Core experience mendefinisikan bab User Journey dan alur navigasi utama pada PRD.",
        };

      case "features":
        return {
          id: this.generateQuestionId(),
          title: "Sebutkan fitur pendukung lanjutan atau kapabilitas tambahan yang direncanakan:",
          description: "Contoh: template siap pakai, sistem riwayat (undo/redo), pintasan keyboard, filter cerdas, atau kolaborasi multi-user.",
          category: "features",
          priority: "high",
          questionType: "text",
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Rincian fitur membentuk daftar Functional Requirements dalam dokumen spesifikasi.",
        };

      case "deployment":
        return {
          id: this.generateQuestionId(),
          title: "Lingkungan hosting, platform deployment, dan distribusi apa yang ditargetkan?",
          description: "Menentukan pipeline CI/CD, konfigurasi build, dan infrastruktur rilis ke pengguna.",
          category: "deployment",
          priority: "medium",
          questionType: "single_choice",
          options: [
            { id: "opt_dep_vercel", label: "Vercel / Cloud Edge Serverless (Otomatis)", description: "Deployment instan global edge dengan integrasi Git otomatis" },
            { id: "opt_dep_pwa", label: "PWA / Web-to-Mobile (Installable ke Android/Desktop)", description: "Aplikasi web lokal yang dapat diinstal langsung sebagai native app" },
            { id: "opt_dep_docker", label: "Docker VPS / Self-Hosted Linux", description: "Kontrol infrastruktur privat dengan container mandiri" },
            { id: "opt_dep_desktop", label: "Desktop Native Installer (Windows / macOS)", description: "Paket distribusi executable (.exe / .dmg) offline" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Target deployment menentukan bab Deployment & DevOps Requirements di PRD.",
        };

      case "testing":
        return {
          id: this.generateQuestionId(),
          title: "Kriteria pengujian (QA) dan standar jaminan kualitas apa yang dibutuhkan?",
          description: "Contoh: Unit test otomatis, end-to-end user flow testing, benchmark performa, atau uji coba manual.",
          category: "testing",
          priority: "low",
          questionType: "single_choice",
          options: [
            { id: "opt_full_ci_test", label: "Unit Test + E2E Terintegrasi CI/CD", description: "Keandalan tinggi sebelum setiap rilis kode ke produksi" },
            { id: "opt_perf_bench", label: "Uji Performa & Stress Testing Beban", description: "Pengujian latensi rendering dan stabilitas memori aplikasi" },
            { id: "opt_manual_qa", label: "Manual QA + Smoke Testing Cepat", description: "Validasi MVP cepat untuk iterasi pengembangan awal" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Menentukan kriteria lolos uji pada bab Quality Assurance & Acceptance Criteria.",
        };

      case "data":
        return {
          id: this.generateQuestionId(),
          title: "Bagaimana arsitektur manajemen data dan penyimpanan aset yang akan digunakan?",
          description: "Menentukan model persistensi lokal vs cloud dan pola sinkronisasi data.",
          category: "data",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_data_local", label: "Local-First (IndexedDB / LocalStorage / OPFS)", description: "Data disimpan aman di perangkat pengguna dengan akses instan offline" },
            { id: "opt_data_cloud_sql", label: "Cloud Database Relasional (PostgreSQL / Supabase)", description: "Skema terstruktur dengan integritas transaksi dan sinkronisasi multi-device" },
            { id: "opt_data_hybrid", label: "Hybrid Local Cache dengan Sinkronisasi Cloud Opsional", description: "Respon instan offline dengan sinkronisasi background saat online" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Arsitektur data menentukan skema model database dan kontrak API.",
        };

      case "auth":
        return {
          id: this.generateQuestionId(),
          title: "Metode autentikasi dan kontrol akses pengguna apa yang dibutuhkan?",
          description: "Menentukan batas keamanan, isolasi data, dan manajemen akun pengguna.",
          category: "auth",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_auth_oauth", label: "Email/Password + OAuth (Google / GitHub)", description: "Standar autentikasi modern untuk web dan mobile" },
            { id: "opt_auth_magic", label: "Passwordless Magic Links / WebAuthn", description: "Login instan tanpa password via email atau biometrik" },
            { id: "opt_auth_none", label: "Publik / Tanpa Login (Penyimpanan Lokal Mandiri)", description: "Penggunaan privat instan tanpa perlu mendaftar akun" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Model autentikasi mendasari isolasi data dan keamanan pengguna.",
        };

      case "ui_ux":
        return {
          id: this.generateQuestionId(),
          title: "Gaya antarmuka pengguna (UI/UX) dan tema visual apa yang diinginkan?",
          description: "Contoh: Dark Mode Cyberpunk/HUD, Modern Minimalist Clean, atau Enterprise Studio Dashboard.",
          category: "ui_ux",
          priority: "medium",
          questionType: "single_choice",
          options: [
            { id: "opt_ui_dark_hud", label: "Dark Theme Futuristik / Sinematik HUD", description: "Palet gelap pekat dengan aksen neon cyan/emerald dan visual responsif" },
            { id: "opt_ui_clean_minimal", label: "Clean Minimalist (Light & Dark Otomatis)", description: "Tipografi tajam, ruang lapang, dan navigasi ergonomis" },
            { id: "opt_ui_dense_pro", label: "Density Tinggi / Pro Studio Multi-Panel", description: "Tata letak multi-kolom padat informasi dengan panel yang dapat dilipat" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Panduan UI/UX menjadi acuan desain komponen dan tata letak layar PRD.",
        };

      case "technical":
        return {
          id: this.generateQuestionId(),
          title: "Teknologi stack utama dan batas performa teknis apa yang harus dipenuhi?",
          description: "Contoh: Framework web modern, WebAssembly, komputasi canvas, atau batas latensi rendering.",
          category: "technical",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_tech_next_wasm", label: "Next.js / React + WebAssembly (WASM) / WebGPU", description: "Komputasi media berat langsung di sisi klien browser dengan latensi nol" },
            { id: "opt_tech_fullstack_ts", label: "TypeScript Fullstack (Next.js + Node / Serverless)", description: "Satu bahasa untuk frontend dan backend dengan tipe data aman end-to-end" },
            { id: "opt_tech_native_hybrid", label: "Tauri / Electron / Capacitor Hybrid", description: "Kemampuan integrasi hardware native dengan basis kode web" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Menentukan bab Arsitektur Teknis dan dependensi sistem pada PRD.",
        };

      case "monetization":
        return {
          id: this.generateQuestionId(),
          title: "Bagaimana strategi monetisasi atau distribusi nilai produk ini?",
          description: "Menentukan fitur berbayar, batas kuota gratis, atau model distribusi lisensi.",
          category: "monetization",
          priority: "low",
          questionType: "single_choice",
          options: [
            { id: "opt_mon_free", label: "100% Gratis / Open Source / Portofolio", description: "Tanpa biaya berlangganan atau pembatasan fitur" },
            { id: "opt_mon_freemium", label: "Freemium (Akses Gratis + Fitur Pro Berbayar)", description: "Fitur dasar gratis dengan opsi upgrade untuk ekspor kualitas tinggi" },
            { id: "opt_mon_sub", label: "Langganan Berulang SaaS (Bulanan / Tahunan)", description: "Paket berjenjang untuk individu, profesional, dan tim" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Menentukan bab Model Bisnis dan pembatasan tier fitur pada PRD.",
        };

      default:
        return null;
    }
  }

  private getDeepDiveQuestions(
    domain: ProjectDomain,
    answeredCategories: Set<string>,
    pendingCategories: Set<string>
  ): DiscoveryQuestion[] {
    const list: DiscoveryQuestion[] = [];

    if (!pendingCategories.has("security") && !answeredCategories.has("security")) {
      list.push({
        id: this.generateQuestionId(),
        title: "Kebijakan keamanan data, privasi, dan kepatuhan apa yang wajib dipenuhi?",
        description: "Menentukan enkripsi data saat diam/transit, sanitasi input, dan perlindungan privasi pengguna.",
        category: "security",
        priority: "medium",
        questionType: "single_choice",
        options: [
          { id: "opt_sec_standard", label: "Standar HTTPS/TLS + Enkripsi Data Lokal", description: "Proteksi standar untuk aplikasi web modern dan penyimpanan lokal" },
          { id: "opt_sec_zerotrust", label: "Zero-Knowledge / Client-Side Encryption", description: "Data hanya dapat didekripsi oleh pengguna dengan kunci privat" },
          { id: "opt_sec_gdpr", label: "Kepatuhan Privasi Ketat (GDPR/Hak Hapus Data)", description: "Mendukung ekspor data mandiri dan penghapusan akun instan" },
        ],
        required: false,
        blocking: false,
        dependsOn: [],
        relatedNodeIds: [],
        status: "pending",
        reason: "Menentukan spesifikasi Non-Functional Requirements pada aspek keamanan.",
      });
    }

    if (!pendingCategories.has("integrations") && !answeredCategories.has("integrations")) {
      list.push({
        id: this.generateQuestionId(),
        title: "Integrasi layanan pihak ketiga atau API eksternal apa yang dibutuhkan?",
        description: "Contoh: Penyedia AI (OpenAI / Anthropic / Groq), CDN aset, notifikasi, atau payment gateway.",
        category: "integrations",
        priority: "low",
        questionType: "text",
        required: false,
        blocking: false,
        dependsOn: [],
        relatedNodeIds: [],
        status: "pending",
        reason: "Mendokumentasikan Third-Party Dependencies & API Integrations pada PRD.",
      });
    }

    return list;
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
          title: "Bagaimana alur gameplay inti menit-ke-menit (core loop) yang dialami pemain?",
          description: "Contoh: Eksplorasi dungeon -> Kalahkan monster -> Kumpulkan loot -> Upgrade perlengkapan di kota -> Ulangi.",
          category: "core_gameplay",
          priority: "critical",
          questionType: "text",
          required: true,
          blocking: true,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Gameplay loop inti adalah penggerak utama retensi dan keterlibatan pemain.",
        });
      }

      if ((answeredCategory === "platform" || answeredCategory === "genre") && !existingCategories.has("monetization")) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "Model monetisasi apa yang akan Anda terapkan?",
          description: "Menentukan sistem pembelian dalam game (IAP), harga berbayar di awal, atau iklan.",
          category: "monetization",
          priority: "medium",
          questionType: "single_choice",
          options: [
            { id: "opt_f2p_cosmetic", label: "Free-to-Play dengan Gamepass Kosmetik", description: "Monetisasi adil: skin, efek visual, pet, tag VIP" },
            { id: "opt_premium_buy", label: "Game Premium Berbayar di Awal ($5 - $30)", description: "Game lengkap tanpa pembelian item di dalam game" },
            { id: "opt_f2p_battlepass", label: "Battle Pass Musiman & Booster", description: "Jalur progres berkala dengan konten musiman baru" },
            { id: "opt_free_no_ads", label: "100% Gratis / Open Source / Portofolio", description: "Tanpa transaksi komersial atau iklan" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Model monetisasi mempengaruhi desain sistem inventaris dan UI toko.",
        });
      }

      if (!existingCategories.has("art_audio") && this.project.questions.filter((q) => q.status === "answered").length >= 2) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "Gaya visual grafis dan arah audio/musik seperti apa yang diinginkan?",
          description: "Contoh: Low-poly stylized, pixel art retro, 3D semi-realistis, atau anime.",
          category: "art_audio",
          priority: "low",
          questionType: "single_choice",
          options: [
            { id: "opt_stylized_lowpoly", label: "Stylized Low-Poly / Anime", description: "Warna cerah, geometri bersih, dan performa sangat ringan" },
            { id: "opt_pixel_2d", label: "Retro 2D Pixel Art", description: "Estetika klasik 16-bit dengan animasi sprite tajam" },
            { id: "opt_realistic_3d", label: "3D High-End PBR / Realistis", description: "Pencahayaan detail, tekstur resolusi tinggi, efek partikel VFX" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Kebutuhan visual menentukan alokasi memori dan target aset game.",
        });
      }
    } else if (domain === "web_app" || domain === "saas") {
      if (answeredCategory === "auth" && !existingCategories.has("data")) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "Arsitektur database dan penyimpanan data apa yang paling cocok?",
          description: "Menentukan kompleksitas skema relasional dan pola query backend.",
          category: "data",
          priority: "high",
          questionType: "single_choice",
          options: [
            { id: "opt_pg_sql", label: "Database Relasional (PostgreSQL / Supabase / Prisma)", description: "Relasi ketat, transaksi ACID, dan integritas data tinggi" },
            { id: "opt_nosql_doc", label: "Document Database (MongoDB / Firestore)", description: "Skema fleksibel, prototipe cepat, dokumen JSON" },
            { id: "opt_edge_kv", label: "Edge KV / Client-Side Offline DB (IndexedDB / Local-First)", description: "Respon instan ultra-cepat dengan sinkronisasi browser" },
          ],
          required: true,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Arsitektur data menentukan skema model database dan kontrak API.",
        });
      }

      if (answeredCategory === "features" && !existingCategories.has("deployment")) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "Lingkungan hosting dan deployment CI/CD apa yang ditargetkan?",
          description: "Contoh: Vercel, AWS, Google Cloud, Docker VPS.",
          category: "deployment",
          priority: "medium",
          questionType: "single_choice",
          options: [
            { id: "opt_vercel", label: "Vercel / Next.js Serverless (Otomatis)", description: "Deployment instan global edge tanpa konfigurasi server rumit" },
            { id: "opt_aws_docker", label: "AWS / Cloud Container (Docker / Kubernetes)", description: "Kontrol infrastruktur penuh dengan komputasi mandiri" },
            { id: "opt_self_host", label: "VPS Linux Self-Hosted (Nginx / PM2)", description: "Hosting hemat biaya pada server Linux privat" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Target deployment mempengaruhi konfigurasi build dan variabel lingkungan produksi.",
        });
      }
    } else {
      // Generic follow up
      if (!existingCategories.has("testing") && this.project.questions.filter((q) => q.status === "answered").length >= 2) {
        followUps.push({
          id: this.generateQuestionId(),
          title: "Kriteria pengujian (QA) dan standar jaminan kualitas apa yang dibutuhkan?",
          description: "Contoh: Unit test otomatis, end-to-end user flow testing, atau uji coba manual.",
          category: "testing",
          priority: "low",
          questionType: "single_choice",
          options: [
            { id: "opt_full_ci_test", label: "Unit Test + E2E Terintegrasi CI/CD", description: "Keandalan tinggi sebelum setiap rilis kode ke produksi" },
            { id: "opt_manual_qa", label: "Manual QA + Smoke Testing Cepat", description: "Validasi MVP cepat untuk iterasi pengembangan awal" },
          ],
          required: false,
          blocking: false,
          dependsOn: [],
          relatedNodeIds: [],
          status: "pending",
          reason: "Menentukan gerbang kualitas pada bab Testing & QA di dokumen PRD.",
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

    return (completeness >= 75 || this.project.status === "complete") && !pendingImportant && !unresolvedConflicts;
  }
}
