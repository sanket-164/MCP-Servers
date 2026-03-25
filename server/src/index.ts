import { randomUUID } from "node:crypto";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { createMcpServer as createBrawlStarsServer } from "./mcp/brawlstars/server.js";
import { createMcpServer as createClashOfClansServer } from "./mcp/clash-of-clans/server.js";
import { createMcpServer as createLeetcodeServer } from "./mcp/leetcode/server.js";
import { createMcpServer as createMealDbServer } from "./mcp/mealdb/server.js";

type SessionState = {
    server: McpServer;
    transport: StreamableHTTPServerTransport;
};

const serverFactories: Record<string, () => McpServer> = {
    brawlstars: () => {
        const server = createBrawlStarsServer();
        return server;
    },
    "clash-of-clans": () => {
        const server = createClashOfClansServer();
        return server;
    },
    leetcode: () => {
        const server = createLeetcodeServer();
        return server;
    },
    mealdb: () => {
        const server = createMealDbServer();
        return server;
    },
};

const sessions = new Map<string, SessionState>();

function sessionKey(mcpId: string, sessionId: string) {
    return `${mcpId}:${sessionId}`;
}

function sendJsonRpcError(
    res: import("express").Response,
    statusCode: number,
    message: string,
    code: number = -32000,
) {
    if (res.headersSent) return;
    res.status(statusCode).json({
        jsonrpc: "2.0",
        error: { code, message },
        id: null,
    });
}

const app = createMcpExpressApp({
    host: process.env.MCP_HOST ?? "127.0.0.1",
});

app.get("/", (_req, res) => {
    res.json({
        name: "mcp-express",
        endpoints: Object.keys(serverFactories).map((id) => ({
            mcpId: id,
            url: `/mcp/${id}`,
        })),
        note: "Use POST /mcp/:mcpId to initialize; use mcp-session-id header for subsequent GET/POST/DELETE.",
    });
});

app.all("/mcp/:mcpId", async (req, res) => {
    const mcpId = req.params.mcpId;
    const factory = serverFactories[mcpId];
    if (!factory) {
        sendJsonRpcError(res, 404, `Unknown MCP server id: ${mcpId}`, -32601);
        return;
    }

    const sessionIdHeader = req.headers["mcp-session-id"];
    const sessionId = typeof sessionIdHeader === "string" ? sessionIdHeader : undefined;
    const parsedBody = req.method === "POST" ? req.body : undefined;

    try {
        if (sessionId) {
            const state = sessions.get(sessionKey(mcpId, sessionId));
            if (!state) {
                sendJsonRpcError(
                    res,
                    404,
                    `Unknown MCP session for server "${mcpId}"`,
                    -32000,
                );
                return;
            }
            await state.transport.handleRequest(req, res, parsedBody);
            return;
        }

        // No session id: expect a POST initialization request.
        if (req.method === "POST" && isInitializeRequest(req.body)) {
            const server = factory();
            let transport!: StreamableHTTPServerTransport;

            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                onsessioninitialized: (sid) => {
                    sessions.set(sessionKey(mcpId, sid), { server, transport });
                },
                onsessionclosed: (sid) => {
                    const key = sessionKey(mcpId, sid);
                    const state = sessions.get(key);
                    sessions.delete(key);
                    state?.server.close().catch(() => undefined);
                },
            });

            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
            return;
        }

        sendJsonRpcError(
            res,
            400,
            "Bad request: missing mcp-session-id header (or POST body is not an initialize request).",
            -32000,
        );
    } catch (err) {
        console.error(`[mcp-express] Error handling ${mcpId}:`, err);
        sendJsonRpcError(res, 500, "Internal server error", -32603);
    }
});

const PORT = process.env.MCP_PORT ? Number(process.env.MCP_PORT) : 3000;
app.listen(PORT, () => {
    console.log(`[mcp-express] MCP Express server listening on port ${PORT}`);
});

process.on("SIGINT", async () => {
    console.log("[mcp-express] Shutting down...");
    for (const state of sessions.values()) {
        try {
            await state.transport.close();
        } catch {
            // ignore
        }
        try {
            await state.server.close();
        } catch {
            // ignore
        }
    }
    process.exit(0);
});
