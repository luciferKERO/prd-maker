const STORAGE_KEY = "prd-architect-projects";
const CURRENT_KEY = "prd-architect-current";
const SCHEMA_VERSION = 1;

export interface StoredData {
  version: number;
  projects: Record<string, unknown>;
  currentProjectId: string | null;
}

function getStoredData(): StoredData {
  if (typeof window === "undefined") {
    return { version: SCHEMA_VERSION, projects: {}, currentProjectId: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: SCHEMA_VERSION, projects: {}, currentProjectId: null };
    const data = JSON.parse(raw) as StoredData;
    if (data.version !== SCHEMA_VERSION) {
      // ponytail: migrate schema when version changes
      return { version: SCHEMA_VERSION, projects: data.projects || {}, currentProjectId: data.currentProjectId };
    }
    return data;
  } catch {
    return { version: SCHEMA_VERSION, projects: {}, currentProjectId: null };
  }
}

function setStoredData(data: StoredData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to persist project data:", e);
  }
}

export function saveProject(id: string, project: unknown): void {
  const data = getStoredData();
  data.projects[id] = project;
  data.currentProjectId = id;
  setStoredData(data);
}

export function loadProject(id: string): unknown | null {
  const data = getStoredData();
  return data.projects[id] || null;
}

export function loadCurrentProject(): { id: string; project: unknown } | null {
  const data = getStoredData();
  if (!data.currentProjectId) return null;
  const project = data.projects[data.currentProjectId];
  if (!project) return null;
  return { id: data.currentProjectId, project };
}

export function listProjects(): Array<{ id: string; title: string; updatedAt: number }> {
  const data = getStoredData();
  return Object.entries(data.projects).map(([id, p]) => {
    const proj = p as { title?: string; metadata?: { updatedAt?: number } };
    return {
      id,
      title: proj.title || "Untitled",
      updatedAt: proj.metadata?.updatedAt || 0,
    };
  }).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteProject(id: string): void {
  const data = getStoredData();
  delete data.projects[id];
  if (data.currentProjectId === id) {
    const ids = Object.keys(data.projects);
    data.currentProjectId = ids.length > 0 ? ids[0] : null;
  }
  setStoredData(data);
}

export function exportProjectJSON(project: unknown): string {
  return JSON.stringify(project, null, 2);
}

export function exportProjectMarkdown(sections: Array<{ title: string; content: string }>): string {
  return sections.map((s) => `# ${s.title}\n\n${s.content}`).join("\n\n---\n\n");
}
