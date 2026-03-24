import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
    name: "leetcode-mcp",
    version: "1.0.0",
    description:
        "LeetCode MCP server — query user profiles, problems, contests, and discussions via the LeetCode GraphQL API.",
});

export default server;