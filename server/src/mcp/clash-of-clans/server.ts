import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts.js";

export function createMcpServer() {
    const server = new McpServer({
        name: "clash-of-clans",
        version: "1.0.0",
        description: "MCP server for the official Clash of Clans REST API",
    });

    registerTools(server);
    registerPrompts(server);

    return server;
}

// Back-compat for existing stdio entrypoints.
export default createMcpServer();