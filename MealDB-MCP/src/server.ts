import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
    name: "mealdb-mcp",
    version: "2.0.0",
    description:
        "MCP server that integrates with TheMealDB API to search, filter, and explore recipes.",
});

export default server;