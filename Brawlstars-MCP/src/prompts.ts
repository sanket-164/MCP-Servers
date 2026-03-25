import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {

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
}