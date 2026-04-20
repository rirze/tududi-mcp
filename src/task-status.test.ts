import test from "node:test";
import assert from "node:assert/strict";

import { summarizeTask } from "./api.js";
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
