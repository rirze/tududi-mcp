export const TASK_STATUS_INPUT_VALUES = [
  "pending",
  "not_started",
  "in_progress",
  "completed",
  "done",
  "archived",
  "waiting",
  "cancelled",
  "canceled",
  "planned",
] as const;

export const TASK_STATUS_FILTER_VALUES = [
  ...TASK_STATUS_INPUT_VALUES,
  "active",
  "all",
] as const;

export type TaskStatusInput = (typeof TASK_STATUS_INPUT_VALUES)[number];
export type TaskStatusFilter = (typeof TASK_STATUS_FILTER_VALUES)[number];
export type CanonicalTaskStatus =
  | "not_started"
  | "in_progress"
  | "done"
  | "archived"
  | "waiting"
  | "cancelled"
  | "planned";

const TASK_STATUS_BY_NUMBER: Record<number, CanonicalTaskStatus> = {
  0: "not_started",
  1: "in_progress",
  2: "done",
  3: "archived",
  4: "waiting",
  5: "cancelled",
  6: "planned",
};

const TASK_STATUS_ALIASES: Record<string, CanonicalTaskStatus> = {
  pending: "not_started",
  not_started: "not_started",
  "not-started": "not_started",
  in_progress: "in_progress",
  "in-progress": "in_progress",
  completed: "done",
  done: "done",
  archived: "archived",
  waiting: "waiting",
  cancelled: "cancelled",
  canceled: "cancelled",
  planned: "planned",
};

function cleanTaskStatus(status: string): string {
  return status.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function normalizeTaskStatusInput(
  status: string | number | null | undefined
): CanonicalTaskStatus | undefined {
  if (status === null || status === undefined) {
    return undefined;
  }

  if (typeof status === "number") {
    return TASK_STATUS_BY_NUMBER[status];
  }

  return TASK_STATUS_ALIASES[cleanTaskStatus(status)];
}

export function isTaskDone(status: string | number | null | undefined): boolean {
  const normalized = normalizeTaskStatusInput(status);
  return normalized === "done" || normalized === "archived";
}

export function getTaskCompletionToggleStatus(
  status: string | number | null | undefined
): CanonicalTaskStatus {
  return isTaskDone(status) ? "not_started" : "done";
}

export function getTaskListApiStatus(
  status: TaskStatusFilter | undefined
): "completed" | "active" | "all" | undefined {
  if (!status) {
    return undefined;
  }

  if (status === "active") {
    return "active";
  }

  if (status === "all") {
    return "all";
  }

  const normalized = normalizeTaskStatusInput(status);

  if (!normalized) {
    return undefined;
  }

  if (normalized === "done" || normalized === "archived") {
    return "completed";
  }

  return "all";
}

export function taskMatchesStatusFilter(
  status: string | number | null | undefined,
  filter: TaskStatusFilter | undefined
): boolean {
  if (!filter || filter === "all") {
    return true;
  }

  const normalizedStatus = normalizeTaskStatusInput(status);

  if (!normalizedStatus) {
    return false;
  }

  if (filter === "active") {
    return normalizedStatus !== "done" && normalizedStatus !== "archived";
  }

  const normalizedFilter = normalizeTaskStatusInput(filter);

  if (!normalizedFilter) {
    return false;
  }

  if (cleanTaskStatus(filter) === "completed") {
    return normalizedStatus === "done" || normalizedStatus === "archived";
  }

  return normalizedStatus === normalizedFilter;
}
