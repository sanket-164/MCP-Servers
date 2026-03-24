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

const BASE_URL = process.env.COC_API_URL;
const API_TOKEN = process.env.COC_API_TOKEN;

if (!API_TOKEN) {
    console.error(
        "ERROR: COC_API_TOKEN environment variable is not set."
    );
    process.exit(1);
}

if (!BASE_URL) {
    console.error(
        "ERROR: COC_API_URL environment variable is not set."
    );
    process.exit(1);
}


// HTTP Helper

async function cocFetch(
    path: string,
    query: Record<string, string | number | undefined> = {}
): Promise<unknown> {
    const url = new URL(`${BASE_URL}${path}`);
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`CoC API error ${res.status}: ${err}`);
    }

    return res.json();
}

/** URL-encode a clan/player tag (# → %23) */
function encodeTag(tag: string): string {
    return encodeURIComponent(tag.startsWith("#") ? tag : `#${tag}`);
}

// Server

const server = new McpServer({
    name: "clash-of-clans",
    version: "1.0.0",
    description: "MCP server for the official Clash of Clans REST API",
});

// Schemas

const tagSchema = (label: string) =>
    z.string().describe(`${label} tag (with or without leading #)`);

const paginationSchema = {
    limit: z.number().int().positive().optional().describe("Max items to return"),
    after: z.string().optional().describe("Cursor for next page"),
    before: z.string().optional().describe("Cursor for previous page"),
};

//  CLANS

server.registerTool(
    "search-clans",
    {
        description: "Search for clans by name and/or optional filters such as war frequency, location, min members, etc.",
        inputSchema: z.object({
            name: z.string().min(3).optional().describe("Clan name to search (min 3 chars)"),
            warFrequency: z
                .enum(["always", "moreThanOncePerWeek", "oncePerWeek", "lessThanOncePerWeek", "never", "unknown"])
                .optional(),
            locationId: z.number().int().optional().describe("Location ID filter"),
            minMembers: z.number().int().min(1).max(50).optional(),
            maxMembers: z.number().int().min(1).max(50).optional(),
            minClanPoints: z.number().int().optional(),
            minClanLevel: z.number().int().optional(),
            labelIds: z.string().optional().describe("Comma-separated label IDs"),
            ...paginationSchema,
        }),
    },
    async ({ name, warFrequency, locationId, minMembers, maxMembers, minClanPoints, minClanLevel, labelIds, limit, after, before }) => {
        const data = await cocFetch("/clans", { name, warFrequency, locationId, minMembers, maxMembers, minClanPoints, minClanLevel, labelIds, limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-clan",
    {
        description: "Get detailed information about a specific clan by tag.",
        inputSchema: z.object({
            clanTag: tagSchema("Clan"),
        }),
    },
    async ({ clanTag }) => {
        const data = await cocFetch(`/clans/${encodeTag(clanTag)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-clan-members",
    {
        description: "List all members of a clan.",
        inputSchema: z.object({
            clanTag: tagSchema("Clan"),
            ...paginationSchema,
        }),
    },
    async ({ clanTag, limit, after, before }) => {
        const data = await cocFetch(`/clans/${encodeTag(clanTag)}/members`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-clan-warlog",
    {
        description: "Retrieve the war log of a clan (only available if the war log is public).",
        inputSchema: z.object({
            clanTag: tagSchema("Clan"),
            ...paginationSchema,
        }),
    },
    async ({ clanTag, limit, after, before }) => {
        const data = await cocFetch(`/clans/${encodeTag(clanTag)}/warlog`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-current-war",
    {
        description: "Get information about the clan's current war, including state, attacks, and opponents.",
        inputSchema: z.object({
            clanTag: tagSchema("Clan"),
        }),
    },
    async ({ clanTag }) => {
        const data = await cocFetch(`/clans/${encodeTag(clanTag)}/currentwar`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-cwl-group",
    {
        description: "Get the Clan War Leagues (CWL) group information for a clan.",
        inputSchema: z.object({
            clanTag: tagSchema("Clan"),
        }),
    },
    async ({ clanTag }) => {
        const data = await cocFetch(`/clans/${encodeTag(clanTag)}/currentwar/leaguegroup`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-cwl-war",
    {
        description: "Get details of a specific CWL individual war by its war tag.",
        inputSchema: z.object({
            warTag: tagSchema("War"),
        }),
    },
    async ({ warTag }) => {
        const data = await cocFetch(`/clanwarleagues/wars/${encodeTag(warTag)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-capital-raid-seasons",
    {
        description: "Get the clan capital raid seasons for a clan.",
        inputSchema: z.object({
            clanTag: tagSchema("Clan"),
            ...paginationSchema,
        }),
    },
    async ({ clanTag, limit, after, before }) => {
        const data = await cocFetch(`/clans/${encodeTag(clanTag)}/capitalraidseasons`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

//  PLAYERS

server.registerTool(
    "get-player",
    {
        description: "Get detailed information about a player by their tag, including heroes, troops, spells, and achievements.",
        inputSchema: z.object({
            playerTag: tagSchema("Player"),
        }),
    },
    async ({ playerTag }) => {
        const data = await cocFetch(`/players/${encodeTag(playerTag)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-player-battlelog",
    {
        description: "Get the battle log for a player, showing recent Builder Base versus battles.",
        inputSchema: z.object({
            playerTag: tagSchema("Player"),
            ...paginationSchema,
        }),
    },
    async ({ playerTag, limit, after, before }) => {
        const data = await cocFetch(`/players/${encodeTag(playerTag)}/battlelog`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-player-league-history",
    {
        description: "Get the league history for a player, showing past seasons and rankings.",
        inputSchema: z.object({
            playerTag: tagSchema("Player"),
        }),
    },
    async ({ playerTag }) => {
        const data = await cocFetch(`/players/${encodeTag(playerTag)}/leaguehistory`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "verify-player-token",
    {
        description: "Verify a player API token retrieved from in-game settings to confirm player identity.",
        inputSchema: z.object({
            playerTag: tagSchema("Player"),
            playerApiToken: z.string().describe("The player-specific token from in-game settings"),
        }),
    },
    async ({ playerTag, playerApiToken }) => {
        const url = `${BASE_URL}/players/${encodeTag(playerTag)}/verifytoken`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: playerApiToken }),
        });
        const data = await res.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

//  LEAGUES

server.registerTool(
    "list-leagues",
    {
        description: "List all available player leagues (Bronze → Legend).",
        inputSchema: z.object({ ...paginationSchema }),
    },
    async ({ limit, after, before }) => {
        const data = await cocFetch("/leagues", { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-league",
    {
        description: "Get information about a specific player league by its ID.",
        inputSchema: z.object({
            leagueId: z.number().int().describe("League ID"),
        }),
    },
    async ({ leagueId }) => {
        const data = await cocFetch(`/leagues/${leagueId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "list-league-seasons",
    {
        description: "List all available seasons for a league. Only usable for the Legend League (ID 29000022).",
        inputSchema: z.object({
            leagueId: z.number().int().describe("League ID (use 29000022 for Legend League)"),
            ...paginationSchema,
        }),
    },
    async ({ leagueId, limit, after, before }) => {
        const data = await cocFetch(`/leagues/${leagueId}/seasons`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-league-season-rankings",
    {
        description: "Get player rankings for a specific league season. Only available for the Legend League (ID 29000022).",
        inputSchema: z.object({
            leagueId: z.number().int().describe("League ID (use 29000022 for Legend League)"),
            seasonId: z.string().describe("Season ID in YYYY-MM format, e.g. 2024-06"),
            ...paginationSchema,
        }),
    },
    async ({ leagueId, seasonId, limit, after, before }) => {
        const data = await cocFetch(`/leagues/${leagueId}/seasons/${seasonId}`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "list-league-tiers",
    {
        description: "List all league tiers.",
        inputSchema: z.object({ ...paginationSchema }),
    },
    async ({ limit, after, before }) => {
        const data = await cocFetch("/leaguetiers", { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-league-tier",
    {
        description: "Get information about a specific league tier by its ID.",
        inputSchema: z.object({
            leagueTierId: z.number().int().describe("League tier ID"),
        }),
    },
    async ({ leagueTierId }) => {
        const data = await cocFetch(`/leaguetiers/${leagueTierId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "list-war-leagues",
    {
        description: "List all Clan War League tiers.",
        inputSchema: z.object({ ...paginationSchema }),
    },
    async ({ limit, after, before }) => {
        const data = await cocFetch("/warleagues", { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-war-league",
    {
        description: "Get information about a specific Clan War League tier by ID.",
        inputSchema: z.object({
            leagueId: z.number().int().describe("War league ID"),
        }),
    },
    async ({ leagueId }) => {
        const data = await cocFetch(`/warleagues/${leagueId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "list-capital-leagues",
    {
        description: "List all Clan Capital League tiers.",
        inputSchema: z.object({ ...paginationSchema }),
    },
    async ({ limit, after, before }) => {
        const data = await cocFetch("/capitalleagues", { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-capital-league",
    {
        description: "Get information about a specific Clan Capital League tier by ID.",
        inputSchema: z.object({
            leagueId: z.number().int().describe("Capital league ID"),
        }),
    },
    async ({ leagueId }) => {
        const data = await cocFetch(`/capitalleagues/${leagueId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "list-builder-base-leagues",
    {
        description: "List all Builder Base leagues.",
        inputSchema: z.object({ ...paginationSchema }),
    },
    async ({ limit, after, before }) => {
        const data = await cocFetch("/builderbaseleagues", { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-builder-base-league",
    {
        description: "Get information about a specific Builder Base league by its ID.",
        inputSchema: z.object({
            leagueId: z.number().int().describe("Builder Base league ID"),
        }),
    },
    async ({ leagueId }) => {
        const data = await cocFetch(`/builderbaseleagues/${leagueId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-ranked-battle-league-group",
    {
        description: "Get ranked battle league group information for a specific season and player.",
        inputSchema: z.object({
            leagueGroupTag: tagSchema("League group"),
            leagueSeasonId: z.string().describe("Season ID in YYYY-MM format, e.g. 2024-06"),
        }),
    },
    async ({ leagueGroupTag, leagueSeasonId }) => {
        const data = await cocFetch(`/leaguegroup/${encodeTag(leagueGroupTag)}/${leagueSeasonId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

//  LOCATIONS / RANKINGS

server.registerTool(
    "list-locations",
    {
        description: "List all available locations (countries and global) for use in rankings.",
        inputSchema: z.object({ ...paginationSchema }),
    },
    async ({ limit, after, before }) => {
        const data = await cocFetch("/locations", { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-location",
    {
        description: "Get information about a specific location by its ID.",
        inputSchema: z.object({
            locationId: z.number().int().describe("Location ID"),
        }),
    },
    async ({ locationId }) => {
        const data = await cocFetch(`/locations/${locationId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-clan-rankings",
    {
        description: "Get clan trophy rankings for a specific location.",
        inputSchema: z.object({
            locationId: z.number().int().describe("Location ID (use 32000000 for global)"),
            ...paginationSchema,
        }),
    },
    async ({ locationId, limit, after, before }) => {
        const data = await cocFetch(`/locations/${locationId}/rankings/clans`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-player-rankings",
    {
        description: "Get player trophy rankings for a specific location.",
        inputSchema: z.object({
            locationId: z.number().int().describe("Location ID (use 32000000 for global)"),
            ...paginationSchema,
        }),
    },
    async ({ locationId, limit, after, before }) => {
        const data = await cocFetch(`/locations/${locationId}/rankings/players`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-clan-builder-base-rankings",
    {
        description: "Get clan Builder Base rankings for a specific location.",
        inputSchema: z.object({
            locationId: z.number().int().describe("Location ID (use 32000000 for global)"),
            ...paginationSchema,
        }),
    },
    async ({ locationId, limit, after, before }) => {
        const data = await cocFetch(`/locations/${locationId}/rankings/clans-builder-base`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-player-builder-base-rankings",
    {
        description: "Get player Builder Base rankings for a specific location.",
        inputSchema: z.object({
            locationId: z.number().int().describe("Location ID (use 32000000 for global)"),
            ...paginationSchema,
        }),
    },
    async ({ locationId, limit, after, before }) => {
        const data = await cocFetch(`/locations/${locationId}/rankings/players-builder-base`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "get-capital-rankings",
    {
        description: "Get Clan Capital trophy rankings for a specific location.",
        inputSchema: z.object({
            locationId: z.number().int().describe("Location ID (use 32000000 for global)"),
            ...paginationSchema,
        }),
    },
    async ({ locationId, limit, after, before }) => {
        const data = await cocFetch(`/locations/${locationId}/rankings/capitals`, { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

//  LABELS

server.registerTool(
    "list-clan-labels",
    {
        description: "List all available clan labels that can be used to categorize or filter clans.",
        inputSchema: z.object({ ...paginationSchema }),
    },
    async ({ limit, after, before }) => {
        const data = await cocFetch("/labels/clans", { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

server.registerTool(
    "list-player-labels",
    {
        description: "List all available player labels.",
        inputSchema: z.object({ ...paginationSchema }),
    },
    async ({ limit, after, before }) => {
        const data = await cocFetch("/labels/players", { limit, after, before });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

//  GOLD PASS

server.registerTool(
    "get-gold-pass-season",
    {
        description: "Get information about the current Gold Pass season, including start/end times.",
    },
    async () => {
        const data = await cocFetch("/goldpass/seasons/current");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
);

//  COMPARISONS

server.registerTool(
    "compare-clans",
    {
        description:
            "Fetch two clans in parallel and return both profiles side-by-side for direct comparison of level, trophies, member count, war record, war league, location, and capital.",
        inputSchema: z.object({
            clanTagA: tagSchema("First clan"),
            clanTagB: tagSchema("Second clan"),
        }),
    },
    async ({ clanTagA, clanTagB }) => {
        const [clanA, clanB] = await Promise.all([
            cocFetch(`/clans/${encodeTag(clanTagA)}`),
            cocFetch(`/clans/${encodeTag(clanTagB)}`),
        ]);
        return { content: [{ type: "text", text: JSON.stringify({ clanA, clanB }, null, 2) }] };
    }
);

server.registerTool(
    "compare-players",
    {
        description:
            "Fetch two players in parallel and return both full profiles side-by-side for comparison of town hall, trophies, war stars, heroes, donations, and achievements.",
        inputSchema: z.object({
            playerTagA: tagSchema("First player"),
            playerTagB: tagSchema("Second player"),
        }),
    },
    async ({ playerTagA, playerTagB }) => {
        const [playerA, playerB] = await Promise.all([
            cocFetch(`/players/${encodeTag(playerTagA)}`),
            cocFetch(`/players/${encodeTag(playerTagB)}`),
        ]);
        return { content: [{ type: "text", text: JSON.stringify({ playerA, playerB }, null, 2) }] };
    }
);

server.registerTool(
    "compare-clan-wars",
    {
        description:
            "Fetch the current war for two different clans in parallel — useful for scouting an upcoming opponent or benchmarking war performance between clans.",
        inputSchema: z.object({
            clanTagA: tagSchema("First clan"),
            clanTagB: tagSchema("Second clan"),
        }),
    },
    async ({ clanTagA, clanTagB }) => {
        const [warA, warB] = await Promise.all([
            cocFetch(`/clans/${encodeTag(clanTagA)}/currentwar`),
            cocFetch(`/clans/${encodeTag(clanTagB)}/currentwar`),
        ]);
        return { content: [{ type: "text", text: JSON.stringify({ clanA_war: warA, clanB_war: warB }, null, 2) }] };
    }
);

server.registerTool(
    "compare-clan-rankings",
    {
        description:
            "Fetch clan trophy rankings for two different locations in parallel (e.g. global vs a country) and return both leaderboards for comparison.",
        inputSchema: z.object({
            locationIdA: z.number().int().describe("First location ID (use 32000000 for global)"),
            locationIdB: z.number().int().describe("Second location ID"),
            limit: z.number().int().positive().optional().describe("Max clans per leaderboard (default 10)"),
        }),
    },
    async ({ locationIdA, locationIdB, limit }) => {
        const [rankA, rankB] = await Promise.all([
            cocFetch(`/locations/${locationIdA}/rankings/clans`, { limit: limit ?? 10 }),
            cocFetch(`/locations/${locationIdB}/rankings/clans`, { limit: limit ?? 10 }),
        ]);
        return { content: [{ type: "text", text: JSON.stringify({ locationA_rankings: rankA, locationB_rankings: rankB }, null, 2) }] };
    }
);

server.registerTool(
    "compare-player-rankings",
    {
        description:
            "Fetch player trophy rankings for two different locations in parallel — useful for comparing a country's top players against the global leaderboard.",
        inputSchema: z.object({
            locationIdA: z.number().int().describe("First location ID (use 32000000 for global)"),
            locationIdB: z.number().int().describe("Second location ID"),
            limit: z.number().int().positive().optional().describe("Max players per leaderboard (default 10)"),
        }),
    },
    async ({ locationIdA, locationIdB, limit }) => {
        const [rankA, rankB] = await Promise.all([
            cocFetch(`/locations/${locationIdA}/rankings/players`, { limit: limit ?? 10 }),
            cocFetch(`/locations/${locationIdB}/rankings/players`, { limit: limit ?? 10 }),
        ]);
        return { content: [{ type: "text", text: JSON.stringify({ locationA_rankings: rankA, locationB_rankings: rankB }, null, 2) }] };
    }
);

server.registerTool(
    "compare-clan-capital-raids",
    {
        description:
            "Fetch recent capital raid seasons for two clans in parallel to benchmark raid weekend performance.",
        inputSchema: z.object({
            clanTagA: tagSchema("First clan"),
            clanTagB: tagSchema("Second clan"),
            limit: z.number().int().min(1).max(5).optional().describe("Number of past seasons to include (default 1)"),
        }),
    },
    async ({ clanTagA, clanTagB, limit }) => {
        const [raidsA, raidsB] = await Promise.all([
            cocFetch(`/clans/${encodeTag(clanTagA)}/capitalraidseasons`, { limit: limit ?? 1 }),
            cocFetch(`/clans/${encodeTag(clanTagB)}/capitalraidseasons`, { limit: limit ?? 1 }),
        ]);
        return { content: [{ type: "text", text: JSON.stringify({ clanA_raids: raidsA, clanB_raids: raidsB }, null, 2) }] };
    }
);

//  PROMPTS

server.registerPrompt(
    "clan-war-summary",
    {
        description: "Generate a natural-language summary of a clan's current war status",
        argsSchema: { clanTag: tagSchema("Clan") },
    },
    ({ clanTag }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Use the get-current-war tool to fetch the current war data for clan ${clanTag}, then write a concise summary covering: war state, team sizes, current stars earned by each side, total destruction percentages, remaining attacks, and who is currently winning. Keep it short and easy to read.`,
            },
        }],
    })
);

server.registerPrompt(
    "player-profile-summary",
    {
        description: "Generate a readable profile card for a player",
        argsSchema: { playerTag: tagSchema("Player") },
    },
    ({ playerTag }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Use the get-player tool to fetch data for player ${playerTag}, then write a profile card covering: name, town hall level, clan, trophies, war stars, heroes and their levels, best trophies, donations given/received this season, and league. Format it nicely.`,
            },
        }],
    })
);

server.registerPrompt(
    "clan-overview",
    {
        description: "Generate a full overview of a clan including stats and top members",
        argsSchema: { clanTag: tagSchema("Clan") },
    },
    ({ clanTag }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Use the get-clan tool and get-clan-members tool to fetch data for clan ${clanTag}. Produce an overview that includes: clan name, level, description, war league, location, member count, clan points, win/loss/draw record, war frequency, and a list of top 5 members by trophies.`,
            },
        }],
    })
);

server.registerPrompt(
    "top-clans-leaderboard",
    {
        description: "Show the global top clans leaderboard",
        argsSchema: {
            count: z.string().optional().describe("Number of clans to show (default 10)"),
        },
    },
    ({ count }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Use the get-clan-rankings tool with locationId 32000000 (global) and limit ${count ?? 10} to fetch the top clans. Present the results as a numbered leaderboard table with rank, clan name, clan level, and trophy count.`,
            },
        }],
    })
);

server.registerPrompt(
    "war-readiness-check",
    {
        description: "Analyse a clan's roster and produce a war readiness report",
        argsSchema: { clanTag: tagSchema("Clan") },
    },
    ({ clanTag }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Use get-clan and get-clan-members tools for clan ${clanTag}. Provide a war readiness report: town hall level distribution, average trophies, and observations about the clan's strength. Suggest an optimal war size if possible.`,
            },
        }],
    })
);

server.registerPrompt(
    "compare-two-clans",
    {
        description: "Produce a detailed written comparison between two clans",
        argsSchema: {
            clanTagA: tagSchema("First clan"),
            clanTagB: tagSchema("Second clan"),
        },
    },
    ({ clanTagA, clanTagB }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Use the compare-clans tool with tags ${clanTagA} and ${clanTagB}. Write a detailed comparison covering: clan levels, member counts, trophy counts, war win/loss records, war frequency, war leagues, capital hall levels, and clan points. Conclude with a verdict on which clan appears stronger and why.`,
            },
        }],
    })
);

server.registerPrompt(
    "compare-two-players",
    {
        description: "Produce a detailed written comparison between two players",
        argsSchema: {
            playerTagA: tagSchema("First player"),
            playerTagB: tagSchema("Second player"),
        },
    },
    ({ playerTagA, playerTagB }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Use the compare-players tool with tags ${playerTagA} and ${playerTagB}. Write a head-to-head comparison covering: town hall levels, trophies, best trophies, war stars, hero levels, troop/spell upgrade progress, donations, and league. Conclude with a verdict on who has the stronger account.`,
            },
        }],
    })
);

server.registerPrompt(
    "scout-opponent-clan",
    {
        description: "Scout an opponent clan before war — combines clan info, member list, war log, and current war",
        argsSchema: { opponentClanTag: tagSchema("Opponent clan") },
    },
    ({ opponentClanTag }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Use get-clan, get-clan-members, get-clan-warlog, and get-current-war tools for clan ${opponentClanTag}. Produce a scouting report covering: clan level and description, member town hall distribution, recent war performance from the war log (win rate, average stars), and current war status if active. Highlight any notable strengths or weaknesses.`,
            },
        }],
    })
);

// Start

async function main() {
    console.error("Starting Clash of Clans MCP server...");
    server.connect(new StdioServerTransport());
    console.error("Server started successfully");
}

main().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});