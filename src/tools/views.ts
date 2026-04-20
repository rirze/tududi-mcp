import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { summarizeView, tududiApi } from "../api.js";

export function registerViewTools(server: McpServer) {
  server.registerTool(
    "list_views",
    {
      description: "List saved views",
    },
    async () => {
      const data = await tududiApi("/views");
      const views = (Array.isArray(data) ? data : []).map(summarizeView);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: views.length, views }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "list_pinned_views",
    {
      description: "List pinned saved views",
    },
    async () => {
      const data = await tududiApi("/views/pinned");
      const views = (Array.isArray(data) ? data : []).map(summarizeView);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: views.length, views }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_view",
    {
      description: "Get a saved view by UID",
      inputSchema: {
        uid: z.string().describe("View UID"),
      },
    },
    async ({ uid }) => {
      const data = await tududiApi(`/views/${encodeURIComponent(uid)}`);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeView(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "create_view",
    {
      description: "Create a saved search view",
      inputSchema: {
        name: z.string().describe("View name"),
        search_query: z.string().optional(),
        filters: z.array(z.string()).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        due: z.string().optional(),
        defer: z.string().optional(),
        tags: z.array(z.string()).optional(),
        extras: z.array(z.string()).optional(),
        recurring: z.string().optional(),
      },
    },
    async ({ name, search_query, filters, priority, due, defer, tags, extras, recurring }) => {
      const body: Record<string, any> = { name };
      if (search_query !== undefined) body.search_query = search_query;
      if (filters !== undefined) body.filters = filters;
      if (priority !== undefined) body.priority = priority;
      if (due !== undefined) body.due = due;
      if (defer !== undefined) body.defer = defer;
      if (tags !== undefined) body.tags = tags;
      if (extras !== undefined) body.extras = extras;
      if (recurring !== undefined) body.recurring = recurring;

      const data = await tududiApi("/views", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeView(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_view",
    {
      description: "Update a saved view",
      inputSchema: {
        uid: z.string().describe("View UID"),
        name: z.string().optional(),
        search_query: z.string().optional(),
        filters: z.array(z.string()).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        due: z.string().optional(),
        defer: z.string().optional(),
        tags: z.array(z.string()).optional(),
        extras: z.array(z.string()).optional(),
        recurring: z.string().optional(),
        is_pinned: z.boolean().optional(),
      },
    },
    async ({ uid, name, search_query, filters, priority, due, defer, tags, extras, recurring, is_pinned }) => {
      const body: Record<string, any> = {};
      if (name !== undefined) body.name = name;
      if (search_query !== undefined) body.search_query = search_query;
      if (filters !== undefined) body.filters = filters;
      if (priority !== undefined) body.priority = priority;
      if (due !== undefined) body.due = due;
      if (defer !== undefined) body.defer = defer;
      if (tags !== undefined) body.tags = tags;
      if (extras !== undefined) body.extras = extras;
      if (recurring !== undefined) body.recurring = recurring;
      if (is_pinned !== undefined) body.is_pinned = is_pinned;

      const data = await tududiApi(`/views/${encodeURIComponent(uid)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeView(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_view",
    {
      description: "Delete a saved view",
      inputSchema: {
        uid: z.string().describe("View UID"),
      },
    },
    async ({ uid }) => {
      await tududiApi(`/views/${encodeURIComponent(uid)}`, { method: "DELETE" });
      return {
        content: [{ type: "text" as const, text: `View ${uid} deleted successfully` }],
      };
    }
  );
}
