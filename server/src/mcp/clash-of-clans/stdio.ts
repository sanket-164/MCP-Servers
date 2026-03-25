import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";

async function main() {
    console.error("Starting Clash of Clans MCP server...");
    const server = createMcpServer();
    await server.connect(new StdioServerTransport());
    console.error("Server started successfully");
}

main().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});