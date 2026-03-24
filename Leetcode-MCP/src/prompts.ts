import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";


export function registerPrompts(server: McpServer) {
    server.registerPrompt(
        "analyze-user-profile",
        {
            description:
                "Generate a comprehensive analysis of a LeetCode user's profile including strengths, weaknesses, progress, and suggested next steps.",
            argsSchema: {
                username: z.string().describe("LeetCode username to analyse"),
            },
        },
        ({ username }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please analyse the LeetCode profile for user "${username}".

Use the following tools to gather data:
1. get-user-profile — for profile info and total submission stats
2. get-user-solved-stats — for difficulty breakdown and beats percentages
3. get-user-skill-stats — for topic strengths
4. get-user-language-stats — for language preferences
5. get-user-contest-info — for contest rating and history

Then provide a structured analysis covering:
- **Profile Summary**: name, ranking, solved count
- **Difficulty Breakdown**: easy/medium/hard count and percentages
- **Topic Strengths & Gaps**: strong topics (many problems solved) vs. weak areas
- **Language Usage**: primary language(s) used
- **Contest Performance**: rating trend, typical rank
- **Recommendations**: specific topics or problem types to focus on next`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        "daily-challenge-explainer",
        {
            description:
                "Fetch today's daily challenge and provide a step-by-step explanation, approach hints, and a solution walkthrough.",
            argsSchema: {},
        },
        () => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Use the get-daily-challenge tool to fetch today's LeetCode daily problem.

Then provide:
1. **Problem Summary**: Restate the problem clearly in your own words
2. **Examples Walkthrough**: Trace through the given examples step by step
3. **Key Observations**: What patterns or tricks are relevant?
4. **Approach Options**: Describe 2-3 different approaches (brute force → optimised)
5. **Optimal Solution**: Explain the best approach with time/space complexity
6. **Edge Cases**: What edge cases should the implementation handle?`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        "find-practice-problems",
        {
            description:
                "Find and curate a practice problem list based on topic, difficulty and user goal.",
            argsSchema: {
                topic: z
                    .string()
                    .describe("Topic to practice, e.g. 'dynamic-programming', 'trees', 'graphs'"),
                difficulty: z
                    .enum(["EASY", "MEDIUM", "HARD"])
                    .optional()
                    .describe("Target difficulty"),
                count: z
                    .number()
                    .int()
                    .min(1)
                    .max(20)
                    .default(10)
                    .describe("Number of problems to suggest"),
            },
        },
        ({ topic, difficulty, count }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Use the search-problems-by-topic tool with tags=["${topic}"]${difficulty ? `, difficulty="${difficulty}"` : ""} and limit=${count} to fetch relevant problems.

Then produce a curated study plan:
1. **Problem List**: Title, difficulty, acceptance rate, link (https://leetcode.com/problems/<titleSlug>/)
2. **Learning Order**: Suggest the order to tackle them (easiest concepts first)
3. **Key Patterns**: What algorithmic patterns appear across these problems?
4. **Tips**: 1-2 specific tips for tackling ${topic} problems efficiently`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        "contest-prep",
        {
            description:
                "Generate a personalised contest preparation plan for a LeetCode user before an upcoming contest.",
            argsSchema: {
                username: z.string().describe("LeetCode username"),
            },
        },
        ({ username }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Prepare a contest preparation plan for LeetCode user "${username}".

Steps:
1. Use get-user-contest-info to get their current rating and recent contest history
2. Use get-user-skill-stats to identify weak topics
3. Use list-upcoming-contests to find the next contest

Then generate:
- **Current Standing**: Rating, global rank, recent trend
- **Weak Areas to Focus On**: Topics to study before the contest
- **Recommended Problems**: Use search-problems-by-topic to suggest 3-5 practice problems per weak area
- **Contest Strategy**: Time management tips based on their solved-problem distribution
- **Target**: Realistic rating improvement target for the next contest`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        "compare-users",
        {
            description: "Compare two LeetCode users side by side across key metrics.",
            argsSchema: {
                username1: z.string().describe("First LeetCode username"),
                username2: z.string().describe("Second LeetCode username"),
            },
        },
        ({ username1, username2 }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Compare LeetCode users "${username1}" and "${username2}".

For each user, call:
- get-user-solved-stats
- get-user-contest-info
- get-user-skill-stats
- get-user-language-stats

Then present a structured comparison table and narrative covering:
- Total problems solved (easy/medium/hard)
- Contest rating and rank
- Strongest and weakest topic areas
- Preferred programming language
- Overall assessment: who leads in which areas and why`,
                    },
                },
            ],
        })
    );
}