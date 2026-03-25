import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts.js";


export function createMcpServer() {
    const server = new McpServer({
        name: "brawlstars-server",
        version: "1.0.0",
        description:
            "MCP server for the Brawl Stars API — players, clubs, rankings, brawlers, events, and comparisons.",
    });

    registerTools(server);
    registerPrompts(server);

    return server;
}

// Back-compat for existing stdio entrypoints.
export default createMcpServer();