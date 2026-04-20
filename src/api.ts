import { API_BASE, API_TIMEOUT_MS, TUDUDI_API_TOKEN, PRIORITY_MAP } from "./config.js";
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
  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal ?? AbortSignal.timeout(API_TIMEOUT_MS),
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
  } catch (error: any) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw new Error(
        `Tududi API request timed out after ${API_TIMEOUT_MS}ms: ${options.method || "GET"} ${endpoint}`
      );
    }

    throw error;
  }
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
