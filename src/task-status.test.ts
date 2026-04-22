import test from "node:test";
import assert from "node:assert/strict";

import {
  summarizeApiKey,
  summarizeMcpToolCategory,
  summarizeQuote,
  summarizeSearchResult,
  summarizeShare,
  summarizeTask,
  summarizeUser,
} from "./api.js";
import {
  getTaskCompletionToggleStatus,
  normalizeTaskStatusInput,
  taskMatchesStatusFilter,
} from "./task-status.js";

test("normalizeTaskStatusInput maps legacy and numeric values", () => {
  assert.equal(normalizeTaskStatusInput("pending"), "not_started");
  assert.equal(normalizeTaskStatusInput("completed"), "done");
  assert.equal(normalizeTaskStatusInput("canceled"), "cancelled");
  assert.equal(normalizeTaskStatusInput(4), "waiting");
});

test("getTaskCompletionToggleStatus mirrors Tududi completion semantics", () => {
  assert.equal(getTaskCompletionToggleStatus("not_started"), "done");
  assert.equal(getTaskCompletionToggleStatus("completed"), "not_started");
  assert.equal(getTaskCompletionToggleStatus("archived"), "not_started");
});

test("taskMatchesStatusFilter supports legacy completed filter", () => {
  assert.equal(taskMatchesStatusFilter("done", "completed"), true);
  assert.equal(taskMatchesStatusFilter("archived", "completed"), true);
  assert.equal(taskMatchesStatusFilter("waiting", "completed"), false);
  assert.equal(taskMatchesStatusFilter("waiting", "active"), true);
});

test("summarizeTask reads Tududi serializer output correctly", () => {
  const summary = summarizeTask({
    id: 42,
    uid: "task_42",
    name: "Review MCP server",
    priority: 1,
    status: 2,
    due_date: "2026-04-21",
    Project: { name: "MCP" },
    tags: [{ name: "backend" }, { name: "bugfix" }],
    today: true,
  });

  assert.deepEqual(summary, {
    id: 42,
    uid: "task_42",
    name: "Review MCP server",
    priority: "medium",
    status: "done",
    due_date: "2026-04-21",
    project: "MCP",
    tags: ["backend", "bugfix"],
    today: true,
  });
});

test("summarizeSearchResult normalizes task search payloads", () => {
  const summary = summarizeSearchResult({
    type: "Task",
    id: 42,
    uid: "task_42",
    name: "Review MCP server",
    priority: 1,
    status: 2,
    due_date: "2026-04-21",
    Project: { name: "MCP" },
    tags: [{ name: "backend" }, { name: "bugfix" }],
    note: "Task body",
    recurrence_type: "none",
    created_at: "2026-04-20T00:00:00.000Z",
    completed_at: null,
  });

  assert.deepEqual(summary, {
    type: "Task",
    id: 42,
    uid: "task_42",
    name: "Review MCP server",
    priority: "medium",
    status: "done",
    due_date: "2026-04-21",
    project: "MCP",
    tags: ["backend", "bugfix"],
    today: false,
    description: "Task body",
    created_at: "2026-04-20T00:00:00.000Z",
    completed_at: null,
    recurrence_type: "none",
  });
});

test("summarizeSearchResult normalizes note and project search payloads", () => {
  const note = summarizeSearchResult({
    type: "Note",
    id: 7,
    uid: "note_7",
    title: "Weekly Review",
    description: "Latest notes",
  });
  const project = summarizeSearchResult({
    type: "Project",
    id: 8,
    uid: "proj_8",
    name: "Operations",
    description: "Ops work",
    priority: 2,
    status: "in_progress",
  });

  assert.deepEqual(note, {
    type: "Note",
    id: 7,
    uid: "note_7",
    name: "Weekly Review",
    title: "Weekly Review",
    description: "Latest notes",
  });
  assert.deepEqual(project, {
    type: "Project",
    id: 8,
    uid: "proj_8",
    name: "Operations",
    description: "Ops work",
    status: "in_progress",
    priority: "high",
    area: null,
    task_count: 0,
  });
});

test("summarizeApiKey, share, and quote normalize optional fields", () => {
  assert.deepEqual(
    summarizeApiKey({
      id: 5,
      name: "Integration",
      token_prefix: "tt_deadbeef",
      created_at: "2026-04-21T00:00:00.000Z",
    }),
    {
      id: 5,
      name: "Integration",
      token_prefix: "tt_deadbeef",
      created_at: "2026-04-21T00:00:00.000Z",
      updated_at: null,
      last_used_at: null,
      expires_at: null,
      revoked_at: null,
    }
  );

  assert.deepEqual(
    summarizeShare({
      user_id: 9,
      access_level: "read",
      email: "user@example.com",
      is_owner: false,
    }),
    {
      user_id: 9,
      access_level: "read",
      email: "user@example.com",
      avatar_image: null,
      is_owner: false,
      created_at: null,
    }
  );

  assert.deepEqual(summarizeQuote("Stay focused"), {
    text: "Stay focused",
  });

  assert.deepEqual(
    summarizeUser({
      id: 1,
      email: "user@example.com",
      role: "admin",
    }),
    {
      id: 1,
      uid: null,
      email: "user@example.com",
      name: null,
      surname: null,
      role: "admin",
      is_admin: true,
      avatar_image: null,
      language: null,
      appearance: null,
      timezone: null,
    }
  );

  assert.deepEqual(
    summarizeMcpToolCategory({
      category: "Tasks",
      tools: ["list_tasks", "get_task"],
    }),
    {
      category: "Tasks",
      count: 2,
      tools: ["list_tasks", "get_task"],
    }
  );
});
