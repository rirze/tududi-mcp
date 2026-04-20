import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { summarizeNote, tududiApi } from "../api.js";

export function registerNoteTools(server: McpServer) {
  server.registerTool(
    "list_notes",
    {
      description: "List notes with optional sorting and tag filtering",
      inputSchema: {
        order_by: z.string().optional().describe("Sort order, e.g. title:asc or updated_at:desc"),
        tag: z.string().optional().describe("Filter notes by tag name"),
        limit: z.number().optional().default(50).describe("Max notes to return"),
      },
    },
    async ({ order_by, tag, limit }) => {
      const params = new URLSearchParams();
      if (order_by) params.set("order_by", order_by);
      if (tag) params.set("tag", tag);

      const query = params.toString();
      const data = await tududiApi(`/notes${query ? `?${query}` : ""}`);
      const notes = (Array.isArray(data) ? data : []).map(summarizeNote).slice(0, limit || 50);

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: notes.length, notes }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_note",
    {
      description: "Get a specific note by UID",
      inputSchema: {
        uid: z.string().describe("Note UID"),
      },
    },
    async ({ uid }) => {
      const data = await tududiApi(`/note/${uid}`);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeNote(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "create_note",
    {
      description: "Create a new note",
      inputSchema: {
        title: z.string().describe("Note title"),
        content: z.string().optional().describe("Note content"),
        project_uid: z.string().optional().describe("Assign note to project UID"),
        project_id: z.number().optional().describe("Assign note to project ID"),
        tags: z.array(z.string()).optional().describe("Tag names"),
        color: z.string().optional().describe("Optional note color"),
      },
    },
    async ({ title, content, project_uid, project_id, tags, color }) => {
      const body: Record<string, any> = { title };
      if (content !== undefined) body.content = content;
      if (project_uid) body.project_uid = project_uid;
      if (project_id !== undefined) body.project_id = project_id;
      if (tags) body.tags = tags.map((name) => ({ name }));
      if (color !== undefined) body.color = color;

      const data = await tududiApi("/note", {
        method: "POST",
        body: JSON.stringify(body),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeNote(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_note",
    {
      description: "Update an existing note",
      inputSchema: {
        uid: z.string().describe("Note UID"),
        title: z.string().optional(),
        content: z.string().optional(),
        project_uid: z.string().optional(),
        project_id: z.number().optional(),
        tags: z.array(z.string()).optional(),
        color: z.string().optional(),
      },
    },
    async ({ uid, title, content, project_uid, project_id, tags, color }) => {
      const body: Record<string, any> = {};
      if (title !== undefined) body.title = title;
      if (content !== undefined) body.content = content;
      if (project_uid !== undefined) body.project_uid = project_uid;
      if (project_id !== undefined) body.project_id = project_id;
      if (tags !== undefined) body.tags = tags.map((name) => ({ name }));
      if (color !== undefined) body.color = color;

      const data = await tududiApi(`/note/${uid}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeNote(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_note",
    {
      description: "Delete a note",
      inputSchema: {
        uid: z.string().describe("Note UID"),
      },
    },
    async ({ uid }) => {
      await tududiApi(`/note/${uid}`, { method: "DELETE" });
      return {
        content: [{ type: "text" as const, text: `Note ${uid} deleted successfully` }],
      };
    }
  );
}
