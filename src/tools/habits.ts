import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { summarizeHabit, tududiApi } from "../api.js";

function normalizeHabitResponse(data: any): any {
  if (data?.habit) {
    return summarizeHabit(data.habit);
  }
  if (data?.task) {
    return summarizeHabit(data.task);
  }
  return data;
}

export function registerHabitTools(server: McpServer) {
  server.registerTool(
    "list_habits",
    {
      description: "List habits for the current user",
    },
    async () => {
      const data = await tududiApi("/habits");
      const habits = (Array.isArray(data?.habits) ? data.habits : []).map(summarizeHabit);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: habits.length, habits }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "create_habit",
    {
      description: "Create a new habit",
      inputSchema: {
        name: z.string().describe("Habit name"),
        habit_target_count: z.number().optional().describe("Target completions per period"),
        habit_frequency_period: z.enum(["daily", "weekly", "monthly"]).optional(),
        habit_streak_mode: z.enum(["calendar", "rolling"]).optional(),
        habit_flexibility_mode: z.enum(["flexible", "strict"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      },
    },
    async ({ name, habit_target_count, habit_frequency_period, habit_streak_mode, habit_flexibility_mode, priority }) => {
      const body: Record<string, any> = { name };
      if (habit_target_count !== undefined) body.habit_target_count = habit_target_count;
      if (habit_frequency_period !== undefined) body.habit_frequency_period = habit_frequency_period;
      if (habit_streak_mode !== undefined) body.habit_streak_mode = habit_streak_mode;
      if (habit_flexibility_mode !== undefined) body.habit_flexibility_mode = habit_flexibility_mode;
      if (priority !== undefined) body.priority = priority;

      const data = await tududiApi("/habits", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(normalizeHabitResponse(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "complete_habit",
    {
      description: "Log a habit completion",
      inputSchema: {
        uid: z.string().describe("Habit UID"),
        completed_at: z.string().optional().describe("Optional completion timestamp in ISO format"),
      },
    },
    async ({ uid, completed_at }) => {
      const body: Record<string, any> = {};
      if (completed_at) body.completed_at = completed_at;

      const data = await tududiApi(`/habits/${uid}/complete`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(normalizeHabitResponse(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_habit_completions",
    {
      description: "List logged completions for a habit",
      inputSchema: {
        uid: z.string().describe("Habit UID"),
        start_date: z.string().optional().describe("Optional ISO start date"),
        end_date: z.string().optional().describe("Optional ISO end date"),
      },
    },
    async ({ uid, start_date, end_date }) => {
      const params = new URLSearchParams();
      if (start_date) params.set("start_date", start_date);
      if (end_date) params.set("end_date", end_date);
      const query = params.toString();
      const data = await tududiApi(`/habits/${uid}/completions${query ? `?${query}` : ""}`);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_habit_completion",
    {
      description: "Delete a logged habit completion",
      inputSchema: {
        uid: z.string().describe("Habit UID"),
        completion_id: z.number().describe("Completion numeric ID"),
      },
    },
    async ({ uid, completion_id }) => {
      const data = await tududiApi(`/habits/${uid}/completions/${completion_id}`, {
        method: "DELETE",
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_habit_stats",
    {
      description: "Get statistics for a habit",
      inputSchema: {
        uid: z.string().describe("Habit UID"),
        start_date: z.string().optional().describe("Optional ISO start date"),
        end_date: z.string().optional().describe("Optional ISO end date"),
      },
    },
    async ({ uid, start_date, end_date }) => {
      const params = new URLSearchParams();
      if (start_date) params.set("start_date", start_date);
      if (end_date) params.set("end_date", end_date);
      const query = params.toString();
      const data = await tududiApi(`/habits/${uid}/stats${query ? `?${query}` : ""}`);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_habit",
    {
      description: "Update a habit",
      inputSchema: {
        uid: z.string().describe("Habit UID"),
        name: z.string().optional(),
        habit_target_count: z.number().optional(),
        habit_frequency_period: z.enum(["daily", "weekly", "monthly"]).optional(),
        habit_streak_mode: z.enum(["calendar", "rolling"]).optional(),
        habit_flexibility_mode: z.enum(["flexible", "strict"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      },
    },
    async ({ uid, name, habit_target_count, habit_frequency_period, habit_streak_mode, habit_flexibility_mode, priority }) => {
      const body: Record<string, any> = {};
      if (name !== undefined) body.name = name;
      if (habit_target_count !== undefined) body.habit_target_count = habit_target_count;
      if (habit_frequency_period !== undefined) body.habit_frequency_period = habit_frequency_period;
      if (habit_streak_mode !== undefined) body.habit_streak_mode = habit_streak_mode;
      if (habit_flexibility_mode !== undefined) body.habit_flexibility_mode = habit_flexibility_mode;
      if (priority !== undefined) body.priority = priority;

      const data = await tududiApi(`/habits/${uid}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(normalizeHabitResponse(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_habit",
    {
      description: "Delete a habit",
      inputSchema: {
        uid: z.string().describe("Habit UID"),
      },
    },
    async ({ uid }) => {
      const data = await tududiApi(`/habits/${uid}`, { method: "DELETE" });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );
}
