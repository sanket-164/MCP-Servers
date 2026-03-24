import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../.env"),
});

const BASE_URL = process.env.BRAWLSTARS_API_URL;
const API_TOKEN = process.env.BRAWLSTARS_API_TOKEN;

if (!API_TOKEN) {
    console.error(
        "ERROR: BRAWL_STARS_API_TOKEN environment variable is not set."
    );
    process.exit(1);
}

if (!BASE_URL) {
    console.error(
        "ERROR: BRAWL_STARS_API_URL environment variable is not set."
    );
    process.exit(1);
}


// Helpers

/** URL-encode a clan/player tag (# → %23) */
function encodeTag(tag: string): string {
    return encodeURIComponent(tag.startsWith("#") ? tag : `#${tag}`);
}

async function brawlFetch(path: string) {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        throw new Error(`Brawl Stars API error ${res.status}: ${err}`);
    }

    return res.json();
}

// Server

const server = new McpServer({
    name: "brawlstars-server",
    version: "1.0.0",
    description:
        "MCP server for the Brawl Stars API — players, clubs, rankings, brawlers, events, and comparisons.",
});


// Schemas

const tagSchema = (label: string) =>
    z.string().describe(`${label} tag (with or without leading #)`);


//  PLAYERS

server.registerTool(
    "get-player",
    {
        description:
            "Get detailed information about a Brawl Stars player by their player tag (e.g. #ABC123).",
        inputSchema: z.object({
            playerTag: tagSchema("Player"),
        }),
    },
    async ({ playerTag }) => {
        const data = await brawlFetch(`/players/${encodeTag(playerTag)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-player-battlelog",
    {
        description:
            "Get the recent battle log for a Brawl Stars player (last ~25 battles).",
        inputSchema: z.object({
            playerTag: tagSchema("Player"),
        }),
    },
    async ({ playerTag }) => {
        const data = await brawlFetch(
            `/players/${encodeTag(playerTag)}/battlelog`
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);


//  CLUBS

server.registerTool(
    "get-club",
    {
        description:
            "Get detailed information about a Brawl Stars club by its club tag.",
        inputSchema: z.object({
            clubTag: tagSchema("Club"),
        }),
    },
    async ({ clubTag }) => {
        const data = await brawlFetch(`/clubs/${encodeTag(clubTag)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-club-members",
    {
        description: "List all members of a Brawl Stars club.",
        inputSchema: z.object({
            clubTag: tagSchema("Club"),
        }),
    },
    async ({ clubTag }) => {
        const data = await brawlFetch(`/clubs/${encodeTag(clubTag)}/members`);
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
);


//  RANKINGS

server.registerTool(
    "get-player-rankings",
    {
        description:
            "Get player rankings for a specific country or globally. Use 'global' as the country code for global rankings.",
        inputSchema: z.object({
            countryCode: z
                .string()
                .describe(
                    "ISO 3166-1 alpha-2 country code (e.g. 'US', 'IN') or 'global'."
                ),
        }),
    },
    async ({ countryCode }) => {
        const data = await brawlFetch(
            `/rankings/${countryCode}/players`
        );
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
);

server.registerTool(
    "get-club-rankings",
    {
        description:
            "Get club rankings for a specific country or globally. Use 'global' for global rankings.",
        inputSchema: z.object({
            countryCode: z
                .string()
                .describe(
                    "ISO 3166-1 alpha-2 country code (e.g. 'US', 'IN') or 'global'."
                ),
        }),
    },
    async ({ countryCode }) => {
        const data = await brawlFetch(`/rankings/${countryCode}/clubs`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-brawler-rankings",
    {
        description:
            "Get rankings for a specific brawler in a country or globally.",
        inputSchema: z.object({
            countryCode: z
                .string()
                .describe(
                    "ISO 3166-1 alpha-2 country code (e.g. 'US', 'IN') or 'global'."
                ),
            brawlerId: z
                .number()
                .int()
                .describe("The numeric ID of the brawler (use list-brawlers to find it)."),
        }),
    },
    async ({ countryCode, brawlerId }) => {
        const data = await brawlFetch(
            `/rankings/${countryCode}/brawlers/${brawlerId}`
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);


//  BRAWLERS

server.registerTool(
    "list-brawlers",
    {
        description:
            "Get the full list of all available brawlers in Brawl Stars, including their IDs, names, and star powers.",
        inputSchema: z.object({}),
    },
    async () => {
        const data = await brawlFetch("/brawlers");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-brawler",
    {
        description:
            "Get detailed information about a specific brawler by their numeric ID.",
        inputSchema: z.object({
            brawlerId: z
                .number()
                .int()
                .describe("The numeric ID of the brawler (use list-brawlers to find it)."),
        }),
    },
    async ({ brawlerId }) => {
        const data = await brawlFetch(`/brawlers/${brawlerId}`);
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
);


//  EVENTS

server.registerTool(
    "get-event-rotation",
    {
        description:
            "Get the current event rotation in Brawl Stars, including active maps and modes.",
        inputSchema: z.object({}),
    },
    async () => {
        const data = await brawlFetch("/events/rotation");
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
);

server.registerTool(
    "list-game-modes",
    {
        description: "Get the list of all available game modes in Brawl Stars.",
        inputSchema: z.object({}),
    },
    async () => {
        const data = await brawlFetch("/gamemodes");
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
);


//  COMPARISONS

server.registerTool(
    "compare-players",
    {
        description:
            "Compare two Brawl Stars players side-by-side. Returns trophies, club, brawler count, victories, and recent battle win-rates for both players.",
        inputSchema: z.object({
            playerTag1: tagSchema("Player"),
            playerTag2: tagSchema("Player"),
        }),
    },
    async ({ playerTag1, playerTag2 }) => {
        const [p1, p2] = await Promise.all([
            brawlFetch(`/players/${encodeTag(playerTag1)}`),
            brawlFetch(`/players/${encodeTag(playerTag2)}`),
        ]);

        return {
            content: [{ type: "text", text: JSON.stringify({ player1: p1, player2: p2 }, null, 2) }],
        };
    }
);

server.registerTool(
    "compare-clubs",
    {
        description:
            "Compare two Brawl Stars clubs side-by-side. Returns trophies, member counts, type, and top members for both clubs.",
        inputSchema: z.object({
            clubTag1: tagSchema("Club"),
            clubTag2: tagSchema("Club"),
        }),
    },
    async ({ clubTag1, clubTag2 }) => {
        const [c1, c2] = await Promise.all([
            brawlFetch(`/clubs/${encodeTag(clubTag1)}`),
            brawlFetch(`/clubs/${encodeTag(clubTag2)}`),
        ]);

        return {
            content: [{ type: "text", text: JSON.stringify({ club1: c1, club2: c2 }, null, 2) }],
        };
    }
);

server.registerTool(
    "compare-player-battlelogs",
    {
        description:
            "Compare recent battle performance of two players. Returns win rate, most-used brawlers, and star player counts for each.",
        inputSchema: z.object({
            playerTag1: tagSchema("Player"),
            playerTag2: tagSchema("Player"),
        }),
    },
    async ({ playerTag1, playerTag2 }) => {
        const [log1, log2] = await Promise.all([
            brawlFetch(`/players/${encodeTag(playerTag1)}/battlelog`),
            brawlFetch(`/players/${encodeTag(playerTag2)}/battlelog`),
        ]);

        function analyzeBattles(tag: any, log: any) {
            const battles = log.items ?? [];
            let wins = 0, losses = 0, starPlayerCount = 0;
            const brawlerFreq = {} as Record<string, number>;

            for (const battle of battles) {
                const result = battle.battle?.result;
                if (result === "victory") wins++;
                else if (result === "defeat") losses++;

                // Find this player's brawler across all teams
                const allPlayers = [
                    ...(battle.battle?.teams ?? []).flat(),
                    ...(battle.battle?.players ?? []),
                ];
                const self = allPlayers.find(
                    (p) => p.tag?.replace("#", "") === tag.replace("#", "")
                );
                if (self?.brawler?.name) {
                    brawlerFreq[self.brawler.name] =
                        (brawlerFreq[self.brawler.name] ?? 0) + 1;
                }
                if (battle.battle?.starPlayer?.tag?.replace("#", "") === tag.replace("#", "")) {
                    starPlayerCount++;
                }
            }

            const topBrawlers = Object.entries(brawlerFreq)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([name, count]) => ({ name, count }));

            return {
                tag,
                totalBattles: battles.length,
                wins,
                losses,
                winRate:
                    battles.length > 0
                        ? `${((wins / battles.length) * 100).toFixed(1)}%`
                        : "N/A",
                starPlayerCount,
                topBrawlers,
            };
        }

        return { content: [{ type: "text", text: JSON.stringify({ player1: analyzeBattles(playerTag1, log1), player2: analyzeBattles(playerTag2, log2) }, null, 2) }] };
    }
);

server.registerTool(
    "compare-brawlers",
    {
        description:
            "Compare two brawlers side-by-side by their numeric IDs, showing their star powers, gadgets, and gear info.",
        inputSchema: z.object({
            brawlerId1: z.number().int().describe("Numeric ID of the first brawler."),
            brawlerId2: z
                .number()
                .int()
                .describe("Numeric ID of the second brawler."),
        }),
    },
    async ({ brawlerId1, brawlerId2 }) => {
        const [b1, b2] = await Promise.all([
            brawlFetch(`/brawlers/${brawlerId1}`),
            brawlFetch(`/brawlers/${brawlerId2}`),
        ]);

        return {
            content: [{ type: "text", text: JSON.stringify({ brawler1: b1, brawler2: b2 }, null, 2) }],
        };
    }
);

server.registerTool(
    "compare-player-rankings",
    {
        description:
            "Look up two players in a country (or global) ranking list and compare their ranked positions and trophies.",
        inputSchema: z.object({
            playerTag1: tagSchema("Player"),
            playerTag2: tagSchema("Player"),
            countryCode: z
                .string()
                .describe("Country code or 'global' for global rankings."),
        }),
    },
    async ({ playerTag1, playerTag2, countryCode }) => {
        const rankings = await brawlFetch(`/rankings/${countryCode}/players`);
        const list = rankings.items ?? [];

        function findInRankings(tag: string) {
            const clean = tag.replace("#", "").toUpperCase();
            const entry = list.find(
                (p: { tag?: string }) => p.tag?.replace("#", "").toUpperCase() === clean
            );
            return entry
                ? {
                    name: entry.name,
                    tag: entry.tag,
                    trophies: entry.trophies,
                    rank: entry.rank,
                }
                : { tag, note: "Not found in top rankings list." };
        }

        return { content: [{ type: "text", text: JSON.stringify({ countryCode, player1: findInRankings(playerTag1), player2: findInRankings(playerTag2) }, null, 2) }] };
    }
);


//  PROMPTS

server.registerPrompt(
    "player-overview",
    {
        description:
            "Generate a comprehensive overview report for a Brawl Stars player.",
        argsSchema: {
            playerTag: z.string().describe("The player tag to report on."),
        },
    },
    ({ playerTag }) => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Use the get-player and get-player-battlelog tools to gather full information about the Brawl Stars player with tag ${playerTag}. Then write a concise overview report covering: their current trophies and highest trophies, experience level, club membership, total victories (3v3, solo, duo), their top 5 brawlers by trophies, and recent battle win rate from the battle log.`,
                },
            },
        ],
    })
);

server.registerPrompt(
    "club-overview",
    {
        description:
            "Generate a comprehensive overview report for a Brawl Stars club.",
        argsSchema: {
            clubTag: z.string().describe("The club tag to report on."),
        },
    },
    ({ clubTag }) => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Use the get-club and get-club-members tools to gather full information about the Brawl Stars club with tag ${clubTag}. Then write a concise report covering: club name, type, total trophies, required trophies to join, number of members, top 5 members by trophies, and any description provided.`,
                },
            },
        ],
    })
);

server.registerPrompt(
    "head-to-head",
    {
        description:
            "Run a full head-to-head comparison between two players including stats and recent battles.",
        argsSchema: {
            playerTag1: z.string().describe("First player's tag."),
            playerTag2: z.string().describe("Second player's tag."),
        },
    },
    ({ playerTag1, playerTag2 }) => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Use the compare-players and compare-player-battlelogs tools to do a full head-to-head comparison between players ${playerTag1} and ${playerTag2}. Summarise who is leading in trophies, victories, win rate, top brawlers used, and star player count. Declare an overall edge for one player if the stats clearly favour them, or call it close if it's competitive.`,
                },
            },
        ],
    })
);

server.registerPrompt(
    "club-rivalry",
    {
        description: "Compare two clubs to determine which is stronger.",
        argsSchema: {
            clubTag1: z.string().describe("First club tag."),
            clubTag2: z.string().describe("Second club tag."),
        },
    },
    ({ clubTag1, clubTag2 }) => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Use the compare-clubs tool to compare clubs ${clubTag1} and ${clubTag2}. Present a rivalry-style breakdown: which club has more trophies, more members, a higher entry requirement, and stronger top-5 members. Give a final verdict on which club appears stronger overall.`,
                },
            },
        ],
    })
);

server.registerPrompt(
    "meta-snapshot",
    {
        description:
            "Summarise the current Brawl Stars meta: active events, available game modes, and top global players.",
        argsSchema: {},
    },
    () => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Use the get-event-rotation, list-game-modes, and get-player-rankings (countryCode: 'global') tools to build a current meta snapshot. Summarise: (1) what events are live right now and their maps/modes, (2) all available game modes, (3) the top 10 global players and their trophies.`,
                },
            },
        ],
    })
);

server.registerPrompt(
    "brawler-spotlight",
    {
        description: "Deep-dive report on a specific brawler and their global top players.",
        argsSchema: {
            brawlerId: z.string().describe("Numeric brawler ID."),
        },
    },
    ({ brawlerId }) => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Use get-brawler with ID ${brawlerId} and get-brawler-rankings (countryCode: 'global', brawlerId: ${brawlerId}) to produce a brawler spotlight. Cover: brawler name, all star powers, gadgets, gears, and the top 10 ranked players using this brawler globally with their trophy counts.`,
                },
            },
        ],
    })
);


// Start

async function main() {
    console.error("Starting Brawl Stars MCP server...");
    server.connect(new StdioServerTransport());
    console.error("Brawl Stars MCP server started successfully.");
}

main().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});