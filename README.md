# MCP Express: sanket-mcps

Deployed Express base URL: https://sanket-mcps.vercel.app/

This project exposes multiple Model Context Protocol (MCP) servers over HTTP.

## Available MCP servers

- `brawlstars`: https://sanket-mcps.vercel.app/mcp/brawlstars
- `clash-of-clans`: https://sanket-mcps.vercel.app/mcp/clash-of-clans
- `leetcode`: https://sanket-mcps.vercel.app/mcp/leetcode
- `mealdb`: https://sanket-mcps.vercel.app/mcp/mealdb

## Use cases (what each MCP is good for)

- `brawlstars`: player and club lookups, rankings by country/global, and matchup-style comparisons.
- `clash-of-clans`: clan scouting and war readiness summaries, war log lookups, and player/clan comparison helpers.
- `leetcode`: user profile analysis, problem discovery (by tag/difficulty), contest information, and discussion topic exploration.
- `mealdb`: recipe search, category/ingredient/cuisine filtering, and recipe-guided meal inspiration or planning.

## Server-specific docs

- [Brawl Stars MCP](server/src/mcp/brawlstars/README.md)
- [Clash of Clans MCP](server/src/mcp/clash-of-clans/README.md)
- [LeetCode MCP](server/src/mcp/leetcode/README.md)
- [TheMealDB MCP](server/src/mcp/mealdb/README.md)
