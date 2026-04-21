import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { summarizeShare, tududiApi } from "../api.js";

export function registerShareTools(server: McpServer) {
  server.registerTool(
    "list_shares",
    {
      description: "List shares for a given resource",
      inputSchema: {
        resource_type: z.string().describe("Resource type, for example task, project, or note"),
        resource_uid: z.string().describe("Resource UID"),
      },
    },
    async ({ resource_type, resource_uid }) => {
      const params = new URLSearchParams({ resource_type, resource_uid });
      const data = await tududiApi(`/shares?${params.toString()}`);
      const shares = (Array.isArray(data?.shares) ? data.shares : []).map(summarizeShare);

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: shares.length, shares }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "create_share",
    {
      description: "Share a resource with another user",
      inputSchema: {
        resource_type: z.string().describe("Resource type, for example task, project, or note"),
        resource_uid: z.string().describe("Resource UID"),
        target_user_email: z.string().describe("Email address of the target user"),
        access_level: z.enum(["read", "write"]).describe("Access level to grant"),
      },
    },
    async ({ resource_type, resource_uid, target_user_email, access_level }) => {
      await tududiApi("/shares", {
        method: "POST",
        body: JSON.stringify({ resource_type, resource_uid, target_user_email, access_level }),
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Share created for ${resource_type} ${resource_uid} -> ${target_user_email} (${access_level})`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "delete_share",
    {
      description: "Revoke a share from a target user",
      inputSchema: {
        resource_type: z.string().describe("Resource type, for example task, project, or note"),
        resource_uid: z.string().describe("Resource UID"),
        target_user_id: z.number().describe("Numeric user ID to revoke access from"),
      },
    },
    async ({ resource_type, resource_uid, target_user_id }) => {
      await tududiApi("/shares", {
        method: "DELETE",
        body: JSON.stringify({ resource_type, resource_uid, target_user_id }),
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Share removed for ${resource_type} ${resource_uid} from user ${target_user_id}`,
          },
        ],
      };
    }
  );
}
