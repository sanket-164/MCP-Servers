# Clash of Clans MCP (`clash-of-clans`)

Endpoint (initialize): `POST https://sanket-mcps.vercel.app/mcp/clash-of-clans`

This MCP server wraps the Clash of Clans REST API for clans, players, war status/logs, rankings, and comparisons.

## Tools

- `search-clans` (inputs: `name?`, `warFrequency?`, `locationId?`, `minMembers?`, `maxMembers?`, `minClanPoints?`, `minClanLevel?`, `labelIds?`, pagination)
- `get-clan` (input: `clanTag`)
- `get-clan-members` (inputs: `clanTag`, pagination)
- `get-clan-warlog` (inputs: `clanTag`, pagination)
- `get-current-war` (input: `clanTag`)
- `get-cwl-group` (input: `clanTag`)
- `get-cwl-war` (input: `warTag`)
- `get-capital-raid-seasons` (inputs: `clanTag`, pagination)
- `get-player` (input: `playerTag`)
- `get-player-battlelog` (inputs: `playerTag`, pagination)
- `get-player-league-history` (input: `playerTag`)
- `list-leagues` (pagination)
- `get-league` (input: `leagueId`)
- `list-league-seasons` (inputs: `leagueId`, pagination)
- `get-league-season-rankings` (inputs: `leagueId`, `seasonId`, pagination)
- `list-league-tiers` (pagination)
- `get-league-tier` (input: `leagueTierId`)
- `list-war-leagues` (pagination)
- `get-war-league` (input: `leagueId`)
- `list-capital-leagues` (pagination)
- `get-capital-league` (input: `leagueId`)
- `list-builder-base-leagues` (pagination)
- `get-builder-base-league` (input: `leagueId`)
- `get-ranked-battle-league-group` (inputs: `leagueGroupTag`, `leagueSeasonId`)
- `list-locations` (pagination)
- `get-location` (input: `locationId`)
- `get-clan-rankings` (inputs: `locationId`, pagination)
- `get-player-rankings` (inputs: `locationId`, pagination)
- `get-clan-builder-base-rankings` (inputs: `locationId`, pagination)
- `get-player-builder-base-rankings` (inputs: `locationId`, pagination)
- `get-capital-rankings` (inputs: `locationId`, pagination)
- `list-clan-labels` (pagination)
- `list-player-labels` (pagination)
- `get-gold-pass-season` (no inputs)
- `compare-clans` (inputs: `clanTagA`, `clanTagB`)
- `compare-players` (inputs: `playerTagA`, `playerTagB`)
- `compare-clan-wars` (inputs: `clanTagA`, `clanTagB`)
- `compare-clan-rankings` (inputs: `locationIdA`, `locationIdB`, `limit?`)
- `compare-player-rankings` (inputs: `locationIdA`, `locationIdB`, `limit?`)
- `compare-clan-capital-raids` (inputs: `clanTagA`, `clanTagB`, `limit?`)

## Prompt presets

- `clan-war-summary`
- `player-profile-summary`
- `clan-overview`
- `top-clans-leaderboard`
- `war-readiness-check`
- `compare-two-clans`
- `compare-two-players`
- `scout-opponent-clan`

## Self-host requirements (env vars)

If you run this server yourself, you must set:

- `COC_API_URL`
- `COC_API_TOKEN`
