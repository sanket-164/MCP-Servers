import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
    name: "brawlstars-server",
    version: "1.0.0",
    description:
        "MCP server for the Brawl Stars API — players, clubs, rankings, brawlers, events, and comparisons.",
});

export default server;