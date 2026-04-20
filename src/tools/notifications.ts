import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { summarizeNotification, tududiApi } from "../api.js";

export function registerNotificationTools(server: McpServer) {
  server.registerTool(
    "list_notifications",
    {
      description: "List notifications for the current user",
      inputSchema: {
        limit: z.number().optional().default(10).describe("Max notifications to return"),
        offset: z.number().optional().default(0).describe("Offset for pagination"),
        include_read: z.boolean().optional().default(true).describe("Include read notifications"),
        type: z.string().optional().describe("Optional notification type filter"),
      },
    },
    async ({ limit, offset, include_read, type }) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit ?? 10));
      params.set("offset", String(offset ?? 0));
      params.set("includeRead", String(include_read ?? true));
      if (type) params.set("type", type);

      const data = await tududiApi(`/notifications?${params.toString()}`);
      const notifications = (Array.isArray(data?.notifications) ? data.notifications : []).map(
        summarizeNotification
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                count: notifications.length,
                notifications,
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
    "get_unread_notification_count",
    {
      description: "Get unread notification count",
    },
    async () => {
      const data = await tududiApi("/notifications/unread-count");
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "mark_notification_read",
    {
      description: "Mark a notification as read",
      inputSchema: {
        id: z.number().describe("Notification numeric ID"),
      },
    },
    async ({ id }) => {
      const data = await tududiApi(`/notifications/${id}/read`, { method: "POST" });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                message: data.message,
                notification: data.notification ? summarizeNotification(data.notification) : null,
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
    "mark_notification_unread",
    {
      description: "Mark a notification as unread",
      inputSchema: {
        id: z.number().describe("Notification numeric ID"),
      },
    },
    async ({ id }) => {
      const data = await tududiApi(`/notifications/${id}/unread`, { method: "POST" });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                message: data.message,
                notification: data.notification ? summarizeNotification(data.notification) : null,
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
    "mark_all_notifications_read",
    {
      description: "Mark all notifications as read",
    },
    async () => {
      const data = await tududiApi("/notifications/mark-all-read", { method: "POST" });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_notification",
    {
      description: "Dismiss a notification",
      inputSchema: {
        id: z.number().describe("Notification numeric ID"),
      },
    },
    async ({ id }) => {
      const data = await tududiApi(`/notifications/${id}`, { method: "DELETE" });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );
}
