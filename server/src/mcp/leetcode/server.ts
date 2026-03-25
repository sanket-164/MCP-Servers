import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts.js";

export function createMcpServer() {
    const server = new McpServer({
        name: "leetcode-mcp",
        version: "1.0.0",
        description:
            "LeetCode MCP server — query user profiles, problems, contests, and discussions via the LeetCode GraphQL API.",
    });

    registerTools(server);
    registerPrompts(server);

    return server;
}

// Back-compat for existing stdio entrypoints.
export default createMcpServer();