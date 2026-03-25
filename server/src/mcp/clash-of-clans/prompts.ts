import { z } from "zod";
import { tagSchema } from "./schemas.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {

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
}