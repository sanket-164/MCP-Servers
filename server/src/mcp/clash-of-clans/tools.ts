import { z } from "zod";
import { tagSchema, paginationSchema } from "./schemas.js";
import { cocFetch, encodeTag, formatBattle, formatClan, formatLeagueHistory, formatMemberList, formatPlayer, formatSearchedClan, formatWarLog } from "./helpers.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerTools(server: McpServer) {

  /** 
   * Search for clans by name and/or optional filters such as war frequency, location, min members, etc.
   * GET /clans
   */
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

      if (data.items.length === 0) {
        return { content: [{ type: "text", text: "No clans found matching the search criteria." }] };
      }

      const text = `Found ${data.items.length} clans:\n\n${data.items.map(formatSearchedClan).join("\n")}`;

      return { content: [{ type: "text", text }] };
    }
  );

  /** 
   * Get detailed information about a specific clan by tag.
   * GET /clans/{clanTag}
   */
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
      return { content: [{ type: "text", text: formatClan(data) }] };
    }
  );

  /**
   * List all members of a clan.
   * GET /clans/{clanTag}/members
   */
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

      if (data.items.length === 0) {
        return { content: [{ type: "text", text: `No members found for clan ${clanTag}.` }] };
      }

      const text = `${data.items.length} Members of ${clanTag}:\n\n${formatMemberList(data.items)}`;

      return { content: [{ type: "text", text }] };
    }
  );

  /**
   * Retrieve the war log of a clan (only available if the war log is public).
   * GET /clans/{clanTag}/warlog
   */
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

      if (!data.items) {
        return { content: [{ type: "text", text: "No war log available for this clan." }] };
      }

      const text = `War Log for ${clanTag}:\n\n${data.items.map(formatWarLog).join("\n\n")}`;

      return { content: [{ type: "text", text }] };
    }
  );

  /**
   * Get the current war status of a clan, including state, attacks, and opponents.
   * GET /clans/{clanTag}/currentwar
   */
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

  /**
   * Get the Clan War Leagues (CWL) group information for a clan.
   * GET /clans/{clanTag}/currentwar/leaguegroup
   */
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

  /**
   * Get details of a specific CWL individual war by its war tag.
   * GET /clanwarleagues/wars/{warTag}
   */
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

  /**
   * Get the clan capital raid seasons for a clan.
   * GET /clans/{clanTag}/capitalraidseasons
   */
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

  /**
   * Get detailed information about a player by their tag, including heroes, troops, spells, and achievements.
   * GET /players/{playerTag}
   */
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
      return { content: [{ type: "text", text: formatPlayer(data) }] };
    }
  );

  /**
   * Get the current Builder Base versus battle log for a player.
   * GET /players/{playerTag}/battlelog
   */
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

      if (!data.items) {
        return { content: [{ type: "text", text: "No battle log available for this player." }] };
      }

      const text = `Battle Log for ${playerTag}:\n\n${data.items.map(formatBattle).join("\n\n")}`;

      return { content: [{ type: "text", text }] };
    }
  );

  /**
   * Get the league history for a player, showing past seasons and rankings.
   * GET /players/{playerTag}/leaguehistory
   */
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

      if (!data.items) {
        return { content: [{ type: "text", text: "No league history available for this player." }] };
      }

      const text = `League History for ${playerTag}:\n\n${formatLeagueHistory(data)}`;

      return { content: [{ type: "text", text }] };
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

      const text = `Clan Comparison:\n\n${formatClan(clanA)}\n\n${formatClan(clanB)}`;

      return { content: [{ type: "text", text }] };
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

      const text = `Player Profiles:\n\n${formatPlayer(playerA)}\n\n${formatPlayer(playerB)}`;
      return { content: [{ type: "text", text }] };
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
}