import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { summarizeArea, summarizeSearchResult, summarizeTag, tududiApi } from "../api.js";

export function registerMiscTools(server: McpServer) {
  server.registerTool(
    "list_areas",
    {
      description: "List all areas (project groupings)",
    },
    async () => {
      const data = await tududiApi("/areas");
      const areas = (Array.isArray(data) ? data : []).map(summarizeArea);

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: areas.length, areas }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_area",
    {
      description: "Get a specific area by UID",
      inputSchema: {
        uid: z.string().describe("Area UID"),
      },
    },
    async ({ uid }) => {
      const data = await tududiApi(`/areas/${uid}`);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeArea(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "create_area",
    {
      description: "Create a new area",
      inputSchema: {
        name: z.string().describe("Area name"),
        description: z.string().optional().describe("Area description"),
      },
    },
    async ({ name, description }) => {
      const data = await tududiApi("/areas", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeArea(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_area",
    {
      description: "Update an existing area",
      inputSchema: {
        uid: z.string().describe("Area UID"),
        name: z.string().optional(),
        description: z.string().optional(),
      },
    },
    async ({ uid, name, description }) => {
      const data = await tududiApi(`/areas/${uid}`, {
        method: "PATCH",
        body: JSON.stringify({ name, description }),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeArea(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_area",
    {
      description: "Delete an area",
      inputSchema: {
        uid: z.string().describe("Area UID"),
      },
    },
    async ({ uid }) => {
      await tududiApi(`/areas/${uid}`, { method: "DELETE" });

      return {
        content: [{ type: "text" as const, text: `Area ${uid} deleted successfully` }],
      };
    }
  );

  server.registerTool(
    "list_tags",
    {
      description: "List all tags",
    },
    async () => {
      const data = await tududiApi("/tags");
      const tags = (Array.isArray(data) ? data : []).map(summarizeTag);

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: tags.length, tags }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_tag",
    {
      description: "Get a tag by UID or name",
      inputSchema: {
        uid: z.string().optional().describe("Tag UID"),
        name: z.string().optional().describe("Tag name"),
      },
    },
    async ({ uid, name }) => {
      const params = new URLSearchParams();
      if (uid) params.set("uid", uid);
      if (name) params.set("name", name);

      const data = await tududiApi(`/tag?${params.toString()}`);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeTag(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "create_tag",
    {
      description: "Create a new tag",
      inputSchema: {
        name: z.string().describe("Tag name"),
      },
    },
    async ({ name }) => {
      const data = await tududiApi("/tag", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeTag(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_tag",
    {
      description: "Update a tag by UID or name identifier",
      inputSchema: {
        identifier: z.string().describe("Tag UID or name"),
        name: z.string().describe("New tag name"),
      },
    },
    async ({ identifier, name }) => {
      const data = await tududiApi(`/tag/${encodeURIComponent(identifier)}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summarizeTag(data), null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_tag",
    {
      description: "Delete a tag by UID or name identifier",
      inputSchema: {
        identifier: z.string().describe("Tag UID or name"),
      },
    },
    async ({ identifier }) => {
      await tududiApi(`/tag/${encodeURIComponent(identifier)}`, {
        method: "DELETE",
      });

      return {
        content: [{ type: "text" as const, text: `Tag ${identifier} deleted successfully` }],
      };
    }
  );

  server.registerTool(
    "search",
    {
      description: "Search across tasks, projects, and notes",
      inputSchema: {
        query: z.string().describe("Search query"),
      },
    },
    async ({ query }) => {
      const data = await tududiApi(`/search?q=${encodeURIComponent(query)}`);
      const rawResults = Array.isArray(data?.results) ? data.results : [];
      const results = rawResults.map(summarizeSearchResult);
      const response: Record<string, any> = {
        count: results.length,
        results,
      };

      if (data?.pagination) {
        response.pagination = data.pagination;
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_url_title",
    {
      description: "Fetch title and metadata for a URL",
      inputSchema: {
        url: z.string().describe("URL to inspect"),
      },
    },
    async ({ url }) => {
      const data = await tududiApi(`/url/title?url=${encodeURIComponent(url)}`);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "extract_urls_from_text",
    {
      description: "Extract and preview the first URL found in text",
      inputSchema: {
        text: z.string().describe("Text that may contain URLs"),
      },
    },
    async ({ text }) => {
      const data = await tududiApi("/url/extract-from-text", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_random_quote",
    {
      description: "Get a random motivational quote from Tududi",
    },
    async () => {
      const data = await tududiApi("/quotes/random");

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "list_feature_flags",
    {
      description: "List backend feature flags",
    },
    async () => {
      const data = await tududiApi("/feature-flags");

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_version",
    {
      description: "Get the Tududi backend version",
    },
    async () => {
      const data = await tududiApi("/version");

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_registration_status",
    {
      description: "Get whether registration is enabled on the backend",
    },
    async () => {
      const data = await tududiApi("/registration-status");

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );
}
