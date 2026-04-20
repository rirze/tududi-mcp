import { API_BASE, TUDUDI_API_TOKEN, PRIORITY_MAP } from "./config.js";
import { normalizeTaskStatusInput } from "./task-status.js";

export async function tududiApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  if (!TUDUDI_API_TOKEN) {
    throw new Error(
      "TUDUDI_API_TOKEN environment variable is required. Generate one in tududi Settings > API Tokens"
    );
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TUDUDI_API_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Tududi API error (${response.status}): ${error}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export function summarizeTask(task: any): any {
  const taskTags = Array.isArray(task.tags) ? task.tags : task.Tags;

  return {
    id: task.id,
    uid: task.uid,
    name: task.name,
    priority: PRIORITY_MAP[task.priority] || task.priority,
    status: normalizeTaskStatusInput(task.status) || task.status,
    due_date: task.due_date,
    project: task.Project?.name || task.project?.name || null,
    tags:
      taskTags?.map((tag: any) => (typeof tag === "string" ? tag : tag.name)).filter(Boolean) || [],
    today: task.today || false,
  };
}

export function summarizeProject(project: any): any {
  return {
    id: project.id,
    uid: project.uid,
    name: project.name,
    status: project.status,
    priority: PRIORITY_MAP[project.priority] || project.priority,
    area: project.Area?.name || project.area?.name || null,
    task_count: project.tasks?.length || project.task_count || 0,
  };
}

export function summarizeArea(area: any): any {
  return {
    id: area.id,
    uid: area.uid,
    name: area.name,
    description: area.description ?? null,
  };
}

export function summarizeTag(tag: any): any {
  return {
    id: tag.id,
    uid: tag.uid,
    name: tag.name,
  };
}

export function summarizeNote(note: any): any {
  const noteTags = Array.isArray(note.tags) ? note.tags : note.Tags;

  return {
    id: note.id,
    uid: note.uid,
    title: note.title,
    content: note.content ?? null,
    project: note.Project?.name || note.project?.name || null,
    tags:
      noteTags?.map((tag: any) => (typeof tag === "string" ? tag : tag.name)).filter(Boolean) || [],
    color: note.color ?? null,
    created_at: note.created_at ?? null,
    updated_at: note.updated_at ?? null,
  };
}

export function summarizeInboxItem(item: any): any {
  return {
    uid: item.uid,
    title: item.title ?? item.content ?? null,
    content: item.content ?? null,
    status: item.status ?? null,
    source: item.source ?? null,
    created_at: item.created_at ?? null,
    updated_at: item.updated_at ?? null,
  };
}

export function summarizeView(view: any): any {
  return {
    id: view.id,
    uid: view.uid,
    name: view.name,
    search_query: view.search_query ?? null,
    filters: Array.isArray(view.filters) ? view.filters : [],
    priority: view.priority ?? null,
    due: view.due ?? null,
    defer: view.defer ?? null,
    tags: Array.isArray(view.tags) ? view.tags : [],
    extras: Array.isArray(view.extras) ? view.extras : [],
    recurring: view.recurring ?? null,
    is_pinned: view.is_pinned ?? false,
    created_at: view.created_at ?? null,
    updated_at: view.updated_at ?? null,
  };
}

export function summarizeSearchResult(result: any): any {
  switch (result?.type) {
    case "Task":
      return {
        type: "Task",
        ...summarizeTask(result),
        description: result.description ?? result.note ?? null,
        created_at: result.created_at ?? null,
        completed_at: result.completed_at ?? null,
        recurrence_type: result.recurrence_type ?? null,
      };
    case "Project": {
      const summary = summarizeProject(result);
      return {
        type: "Project",
        ...summary,
        description: result.description ?? null,
      };
    }
    case "Area":
      return { type: "Area", ...summarizeArea(result) };
    case "Note":
      return {
        type: "Note",
        id: result.id,
        uid: result.uid,
        name: result.name || result.title,
        title: result.title || result.name || null,
        description: result.description ?? null,
      };
    case "Tag":
      return { type: "Tag", ...summarizeTag(result) };
    default:
      return result;
  }
}
