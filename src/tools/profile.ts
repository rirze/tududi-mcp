import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { summarizeApiKey, summarizeProfile, tududiApi } from "../api.js";

export function registerProfileTools(server: McpServer) {
  server.registerTool(
    "get_profile",
    {
      description: "Get the current user's profile and settings",
    },
    async () => {
      const data = await tududiApi("/profile");
      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeProfile(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_profile",
    {
      description: "Update the current user's profile",
      inputSchema: {
        name: z.string().optional(),
        surname: z.string().optional(),
        appearance: z.string().optional(),
        language: z.string().optional(),
        timezone: z.string().optional(),
        first_day_of_week: z.number().optional(),
        task_summary_enabled: z.boolean().optional(),
        task_summary_frequency: z.string().optional(),
        task_intelligence_enabled: z.boolean().optional(),
        auto_suggest_next_actions_enabled: z.boolean().optional(),
        productivity_assistant_enabled: z.boolean().optional(),
        next_task_suggestion_enabled: z.boolean().optional(),
        pomodoro_enabled: z.boolean().optional(),
      },
    },
    async (args) => {
      const data = await tududiApi("/profile", {
        method: "PATCH",
        body: JSON.stringify(args),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeProfile(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "change_password",
    {
      description: "Change the current user's password",
      inputSchema: {
        currentPassword: z.string().describe("Current password"),
        newPassword: z.string().describe("New password"),
      },
    },
    async ({ currentPassword, newPassword }) => {
      const data = await tududiApi("/profile/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "list_api_keys",
    {
      description: "List API keys for the current user",
    },
    async () => {
      const data = await tududiApi("/profile/api-keys");
      const api_keys = (Array.isArray(data) ? data : []).map(summarizeApiKey);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: api_keys.length, api_keys }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "create_api_key",
    {
      description: "Create a new API key",
      inputSchema: {
        name: z.string().describe("API key name"),
        expires_at: z.string().optional().describe("Optional ISO expiration timestamp"),
      },
    },
    async ({ name, expires_at }) => {
      const data = await tududiApi("/profile/api-keys", {
        method: "POST",
        body: JSON.stringify({ name, expires_at }),
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                token: data?.token ?? null,
                apiKey: data?.apiKey ? summarizeApiKey(data.apiKey) : null,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    "revoke_api_key",
    {
      description: "Revoke an API key by numeric ID",
      inputSchema: {
        id: z.number().describe("API key numeric ID"),
      },
    },
    async ({ id }) => {
      const data = await tududiApi(`/profile/api-keys/${id}/revoke`, {
        method: "POST",
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeApiKey(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_api_key",
    {
      description: "Delete an API key by numeric ID",
      inputSchema: {
        id: z.number().describe("API key numeric ID"),
      },
    },
    async ({ id }) => {
      await tududiApi(`/profile/api-keys/${id}`, {
        method: "DELETE",
      });
      return {
        content: [{ type: "text" as const, text: `API key ${id} deleted successfully` }],
      };
    }
  );

  server.registerTool(
    "get_task_summary_status",
    {
      description: "Get task summary email status",
    },
    async () => {
      const data = await tududiApi("/profile/task-summary/status");
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "toggle_task_summary",
    {
      description: "Toggle task summary emails on or off",
    },
    async () => {
      const data = await tududiApi("/profile/task-summary/toggle", {
        method: "POST",
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_task_summary_frequency",
    {
      description: "Update task summary frequency",
      inputSchema: {
        frequency: z.string().describe("Task summary frequency"),
      },
    },
    async ({ frequency }) => {
      const data = await tududiApi("/profile/task-summary/frequency", {
        method: "POST",
        body: JSON.stringify({ frequency }),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "send_task_summary_now",
    {
      description: "Trigger the task summary immediately",
    },
    async () => {
      const data = await tududiApi("/profile/task-summary/send-now", {
        method: "POST",
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_today_settings",
    {
      description: "Update dashboard today-page settings",
      inputSchema: {
        showMetrics: z.boolean().optional(),
        projectShowMetrics: z.boolean().optional(),
        showProductivity: z.boolean().optional(),
        showNextTaskSuggestion: z.boolean().optional(),
        showSuggestions: z.boolean().optional(),
        showDueToday: z.boolean().optional(),
        showCompleted: z.boolean().optional(),
        showDailyQuote: z.boolean().optional(),
      },
    },
    async (args) => {
      const data = await tududiApi("/profile/today-settings", {
        method: "PUT",
        body: JSON.stringify(args),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_sidebar_settings",
    {
      description: "Update sidebar settings",
      inputSchema: {
        pinnedViewsOrder: z.array(z.string()).describe("Ordered list of pinned view UIDs"),
      },
    },
    async ({ pinnedViewsOrder }) => {
      const data = await tududiApi("/profile/sidebar-settings", {
        method: "PUT",
        body: JSON.stringify({ pinnedViewsOrder }),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_ui_settings",
    {
      description: "Update UI settings",
      inputSchema: {
        project: z
          .record(z.string(), z.any())
          .optional()
          .describe("Project UI settings object"),
      },
    },
    async (args) => {
      const data = await tududiApi("/profile/ui-settings", {
        method: "PUT",
        body: JSON.stringify(args),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );
}
