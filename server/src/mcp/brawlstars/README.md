# Brawl Stars MCP (`brawlstars`)

Endpoint (initialize): `POST https://sanket-mcps.vercel.app/mcp/brawlstars`

This MCP server provides Brawl Stars data: players, clubs, rankings, brawlers, events, and comparison helpers.

## Tools

- `get-player` (input: `playerTag`)
- `get-player-battlelog` (input: `playerTag`)
- `get-club` (input: `clubTag`)
- `get-club-members` (input: `clubTag`)
- `get-player-rankings` (input: `countryCode` where `global` is supported)
- `get-club-rankings` (input: `countryCode` where `global` is supported)
- `get-brawler-rankings` (inputs: `countryCode`, `brawlerId`)
- `list-brawlers` (no inputs)
- `get-brawler` (input: `brawlerId`)
- `get-event-rotation` (no inputs)
- `list-game-modes` (no inputs)
- `compare-players` (inputs: `playerTag1`, `playerTag2`)
- `compare-clubs` (inputs: `clubTag1`, `clubTag2`)
- `compare-player-battlelogs` (inputs: `playerTag1`, `playerTag2`)
- `compare-brawlers` (inputs: `brawlerId1`, `brawlerId2`)
- `compare-player-rankings` (inputs: `playerTag1`, `playerTag2`, `countryCode`)

## Prompt presets

- `player-overview`
- `club-overview`
- `head-to-head`
- `club-rivalry`
- `meta-snapshot`
- `brawler-spotlight`

## Self-host requirements (env vars)

If you run this server yourself, you must set:

- `BRAWLSTARS_API_URL`
- `BRAWLSTARS_API_TOKEN`
