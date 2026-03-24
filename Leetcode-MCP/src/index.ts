import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts.js";

async function main() {
    console.error("[leetcode-mcp] Starting server...");
    registerTools(server);
    registerPrompts(server);
    await server.connect(new StdioServerTransport());
    console.error("[leetcode-mcp] Server running on stdio");
}

main().catch((err) => {
    console.error("[leetcode-mcp] Fatal error:", err);
    process.exit(1);
});