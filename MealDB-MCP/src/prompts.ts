import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
    const DISPLAY_PROMPT = "Present the meal information in a clear and structured card format, including: dish name, cuisine, category, ingredient list with measurements, step-by-step instructions, and YouTube/website links if available. Use the provided image URL only to show the dish visually. Do not add any extra image or links from the web.";

    server.registerPrompt(
        "find-recipe",
        {
            description: "Find a recipe by dish name and present it in a friendly, structured format.",
            argsSchema: {
                dish: z.string().describe("The dish you want a recipe for"),
            },
        },
        ({ dish }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Use the search-meals-by-name tool to find "${dish}". ${DISPLAY_PROMPT}`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        "meal-inspiration",
        {
            description: "Get a random meal suggestion with full recipe and cooking tips.",
        },
        () => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Use the get-random-meal tool to fetch a surprise meal. Present it enthusiastically as a recipe card with all ingredients and instructions. Add 2–3 helpful cooking tips based on the dish. ${DISPLAY_PROMPT}`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        "explore-cuisine",
        {
            description: "Explore meals from a specific cuisine and recommend top picks.",
            argsSchema: {
                cuisine: z.string().describe("The cuisine / area to explore, e.g. Italian"),
            },
        },
        ({ cuisine }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Use the filter-by-area tool to list all meals from "${cuisine}" cuisine. Then pick 3 standout dishes from the list, look up their full details using lookup-meal-by-id, and present them as a curated "${cuisine} Cuisine Highlights" guide.`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        "ingredient-based-meal-plan",
        {
            description: "Suggest meals based on a key ingredient the user has on hand.",
            argsSchema: {
                ingredient: z
                    .string()
                    .describe("Main ingredient available, e.g. chicken_breast"),
            },
        },
        ({ ingredient }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Use the filter-by-ingredient tool to find meals that use "${ingredient}". Pick 3 diverse options, fetch their full details with lookup-meal-by-id, and present a simple meal plan (breakfast/lunch/dinner or Mon/Tue/Wed) using those recipes. Include a brief description and cook time estimate for each.`,
                    },
                },
            ],
        })
    );

    server.registerPrompt(
        "category-deep-dive",
        {
            description: "Deep-dive into a meal category and surface the best recipes.",
            argsSchema: {
                category: z.string().describe("Meal category to explore, e.g. Seafood"),
            },
        },
        ({ category }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Use filter-by-category to list all "${category}" meals. Choose 3 that sound most interesting, look them up with lookup-meal-by-id, and write a short magazine-style feature about the "${category}" category with those recipes as highlights.`,
                    },
                },
            ],
        })
    );
}