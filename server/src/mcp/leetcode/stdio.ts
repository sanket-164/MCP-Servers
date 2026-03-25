import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";

async function main() {
    console.error("[leetcode-mcp] Starting server...");
    const server = createMcpServer();
    await server.connect(new StdioServerTransport());
    console.error("[leetcode-mcp] Server running on stdio");
}

main().catch((err) => {
    console.error("[leetcode-mcp] Fatal error:", err);
    process.exit(1);
});