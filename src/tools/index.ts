import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTaskTools } from "./tasks.js";
import { registerProjectTools } from "./projects.js";
import { registerInboxTools } from "./inbox.js";
import { registerMiscTools } from "./misc.js";
import { registerNoteTools } from "./notes.js";
import { registerViewTools } from "./views.js";

export function registerAllTools(server: McpServer) {
  registerTaskTools(server);
  registerProjectTools(server);
  registerInboxTools(server);
  registerMiscTools(server);
  registerNoteTools(server);
  registerViewTools(server);
}
