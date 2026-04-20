import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { summarizeInboxItem, tududiApi } from "../api.js";

export function registerInboxTools(server: McpServer) {
  server.registerTool(
    "list_inbox",
    {
      description: "List inbox items",
      inputSchema: {
        limit: z.number().optional().default(20).describe("Number of items"),
        offset: z.number().optional().default(0).describe("Offset for pagination"),
      },
    },
    async ({ limit, offset }) => {
      const params = new URLSearchParams();
      params.set("limit", (limit || 20).toString());
      params.set("offset", (offset || 0).toString());

      const data = await tududiApi(`/inbox?${params.toString()}`);

      const items = (Array.isArray(data?.items) ? data.items : []).map(summarizeInboxItem);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                count: items.length,
                items,
                pagination: data?.pagination || null,
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
    "get_inbox_item",
    {
      description: "Get a specific inbox item by UID",
      inputSchema: {
        uid: z.string().describe("Inbox item UID"),
      },
    },
    async ({ uid }) => {
      const data = await tududiApi(`/inbox/${uid}`);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeInboxItem(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "add_to_inbox",
    {
      description: "Add an item to the inbox for later processing",
      inputSchema: {
        content: z.string().describe("Content of the inbox item"),
        source: z.string().optional().default("mcp").describe("Source identifier"),
      },
    },
    async ({ content, source }) => {
      const data = await tududiApi("/inbox", {
        method: "POST",
        body: JSON.stringify({ content, source: source || "mcp" }),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeInboxItem(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_inbox_item",
    {
      description: "Update an inbox item",
      inputSchema: {
        uid: z.string().describe("Inbox item UID"),
        content: z.string().optional().describe("Updated item content"),
        status: z.string().optional().describe("Updated item status"),
      },
    },
    async ({ uid, content, status }) => {
      const body: Record<string, any> = {};
      if (content !== undefined) body.content = content;
      if (status !== undefined) body.status = status;

      const data = await tududiApi(`/inbox/${uid}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeInboxItem(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "process_inbox_item",
    {
      description: "Mark an inbox item as processed",
      inputSchema: {
        uid: z.string().describe("Inbox item UID"),
      },
    },
    async ({ uid }) => {
      const data = await tududiApi(`/inbox/${uid}/process`, {
        method: "PATCH",
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeInboxItem(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "analyze_inbox_text",
    {
      description: "Analyze inbox text without creating an inbox item",
      inputSchema: {
        content: z.string().describe("Text content to analyze"),
      },
    },
    async ({ content }) => {
      const data = await tududiApi("/inbox/analyze-text", {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_inbox_item",
    {
      description: "Delete an inbox item",
      inputSchema: {
        uid: z.string().describe("Inbox item UID"),
      },
    },
    async ({ uid }) => {
      await tududiApi(`/inbox/${uid}`, {
        method: "DELETE",
      });

      return {
        content: [{ type: "text" as const, text: `Inbox item ${uid} deleted successfully` }],
      };
    }
  );
}
