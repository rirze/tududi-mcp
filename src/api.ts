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

export function summarizeNotification(notification: any): any {
  return {
    id: notification.id,
    uid: notification.uid,
    type: notification.type,
    level: notification.level,
    title: notification.title,
    message: notification.message,
    data: notification.data ?? null,
    sources: Array.isArray(notification.sources) ? notification.sources : [],
    read_at: notification.read_at ?? null,
    sent_at: notification.sent_at ?? null,
    created_at: notification.created_at ?? null,
    updated_at: notification.updated_at ?? null,
  };
}

export function summarizeApiKey(apiKey: any): any {
  return {
    id: apiKey.id,
    name: apiKey.name,
    token_prefix: apiKey.token_prefix ?? null,
    created_at: apiKey.created_at ?? null,
    updated_at: apiKey.updated_at ?? null,
    last_used_at: apiKey.last_used_at ?? null,
    expires_at: apiKey.expires_at ?? null,
    revoked_at: apiKey.revoked_at ?? null,
  };
}

export function summarizeShare(share: any): any {
  return {
    user_id: share.user_id,
    access_level: share.access_level ?? null,
    email: share.email ?? null,
    avatar_image: share.avatar_image ?? null,
    is_owner: share.is_owner ?? false,
    created_at: share.created_at ?? null,
  };
}

export function summarizeQuote(quote: any): any {
  if (typeof quote === "string") {
    return { text: quote };
  }

  return {
    text: quote?.text ?? quote?.quote ?? null,
    author: quote?.author ?? null,
  };
}

export function summarizeHabit(habit: any): any {
  return {
    id: habit.id,
    uid: habit.uid,
    name: habit.name,
    status: normalizeTaskStatusInput(habit.status) || habit.status,
    priority: PRIORITY_MAP[habit.priority] || habit.priority,
    habit_target_count: habit.habit_target_count ?? null,
    habit_frequency_period: habit.habit_frequency_period ?? null,
    habit_streak_mode: habit.habit_streak_mode ?? null,
    habit_flexibility_mode: habit.habit_flexibility_mode ?? null,
    habit_current_streak: habit.habit_current_streak ?? 0,
    habit_best_streak: habit.habit_best_streak ?? 0,
    habit_total_completions: habit.habit_total_completions ?? 0,
    created_at: habit.created_at ?? null,
    updated_at: habit.updated_at ?? null,
  };
}

export function summarizeProfile(profile: any): any {
  return {
    uid: profile.uid,
    email: profile.email,
    name: profile.name ?? null,
    surname: profile.surname ?? null,
    appearance: profile.appearance ?? null,
    language: profile.language ?? null,
    timezone: profile.timezone ?? null,
    first_day_of_week: profile.first_day_of_week ?? null,
    avatar_image: profile.avatar_image ?? null,
    telegram_chat_id: profile.telegram_chat_id ?? null,
    task_summary_enabled: profile.task_summary_enabled ?? null,
    task_summary_frequency: profile.task_summary_frequency ?? null,
    task_intelligence_enabled: profile.task_intelligence_enabled ?? null,
    auto_suggest_next_actions_enabled: profile.auto_suggest_next_actions_enabled ?? null,
    pomodoro_enabled: profile.pomodoro_enabled ?? null,
    today_settings: profile.today_settings ?? null,
    sidebar_settings: profile.sidebar_settings ?? null,
    productivity_assistant_enabled: profile.productivity_assistant_enabled ?? null,
    next_task_suggestion_enabled: profile.next_task_suggestion_enabled ?? null,
    notification_preferences: profile.notification_preferences ?? null,
    keyboard_shortcuts: profile.keyboard_shortcuts ?? null,
    ui_settings: profile.ui_settings ?? null,
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
