import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts.js";

export function createMcpServer() {
    const server = new McpServer({
        name: "mealdb-mcp",
        version: "2.0.0",
        description:
            "MCP server that integrates with TheMealDB API to search, filter, and explore recipes.",
    });

    registerTools(server);
    registerPrompts(server);

    return server;
}

// Back-compat for existing stdio entrypoints.
export default createMcpServer();