import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
    name: "clash-of-clans",
    version: "1.0.0",
    description: "MCP server for the official Clash of Clans REST API",
});

export default server;