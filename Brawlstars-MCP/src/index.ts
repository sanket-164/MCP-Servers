import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts.js";

async function main() {
    console.error("Starting Brawl Stars MCP server...");
    registerTools(server);
    registerPrompts(server);
    server.connect(new StdioServerTransport());
    console.error("Brawl Stars MCP server started successfully.");
}

main().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});