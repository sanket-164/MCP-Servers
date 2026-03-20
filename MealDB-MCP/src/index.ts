import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// ─── Helper ───────────────────────────────────────────────────────────────────

async function fetchJSON(url: string): Promise<any> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
}

/** Format a full meal object into readable text */
function formatMeal(meal: Record<string, any>): string {
    const ingredients: string[] = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`]?.trim();
        const measure = meal[`strMeasure${i}`]?.trim();
        if (ingredient) ingredients.push(`  - ${measure ? measure + " " : ""}${ingredient}`);
    }

    return [
        `🍽️  ${meal.strMeal} (ID: ${meal.idMeal})`,
        `Category : ${meal.strCategory ?? "N/A"}`,
        `Cuisine  : ${meal.strArea ?? "N/A"}`,
        `Tags     : ${meal.strTags ?? "None"}`,
        `YouTube  : ${meal.strYoutube ?? "N/A"}`,
        `Image    : ${meal.strMealThumb ?? "N/A"}`,
        "",
        "Ingredients:",
        ...ingredients,
        "",
        "Instructions:",
        meal.strInstructions ?? "N/A",
    ].join("\n");
}

/** Format a lightweight meal summary (id + name + thumb) */
function formatSummary(meal: Record<string, any>): string {
    return `• ${meal.strMeal} (ID: ${meal.idMeal})${meal.strMealThumb ? " — " + meal.strMealThumb : ""}`;
}

// ─── Server ───────────────────────────────────────────────────────────────────

const server = new McpServer({
    name: "mealdb-mcp",
    version: "2.0.0",
    description:
        "MCP server that integrates with TheMealDB API to search, filter, and explore recipes.",
});

// ─── Tools ────────────────────────────────────────────────────────────────────

/**
 * 1. Search meals by name
 *    GET /search.php?s={name}
 */
server.registerTool(
    "search-meals-by-name",
    {
        description:
            "Search for meals by name. Returns full details (ingredients, instructions, YouTube link) for all matching meals.",
        inputSchema: z.object({
            name: z.string().describe('Meal name to search for, e.g. "Arrabiata" or "chicken"'),
        }),
    },
    async ({ name }) => {
        const data = await fetchJSON(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
        if (!data.meals) {
            return { content: [{ type: "text", text: `No meals found for "${name}".` }] };
        }
        const text = data.meals.map(formatMeal).join("\n\n" + "─".repeat(60) + "\n\n");
        return { content: [{ type: "text", text }] };
    }
);

/**
 * 2. List meals by first letter
 *    GET /search.php?f={letter}
 */
server.registerTool(
    "list-meals-by-letter",
    {
        description: "List all meals whose name starts with a given letter (a–z).",
        inputSchema: z.object({
            letter: z
                .string()
                .length(1)
                .regex(/[a-zA-Z]/)
                .describe('A single letter, e.g. "a"'),
        }),
    },
    async ({ letter }) => {
        const data = await fetchJSON(`${BASE_URL}/search.php?f=${letter.toLowerCase()}`);
        if (!data.meals) {
            return {
                content: [{ type: "text", text: `No meals found starting with "${letter}".` }],
            };
        }
        const text = `Meals starting with "${letter.toUpperCase()}":\n\n` + data.meals.map(formatSummary).join("\n");
        return { content: [{ type: "text", text }] };
    }
);

/**
 * 3. Look up meal by ID
 *    GET /lookup.php?i={id}
 */
server.registerTool(
    "lookup-meal-by-id",
    {
        description: "Get full recipe details for a specific meal using its numeric ID.",
        inputSchema: z.object({
            id: z.string().describe('TheMealDB meal ID, e.g. "52772"'),
        }),
    },
    async ({ id }) => {
        const data = await fetchJSON(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);
        if (!data.meals) {
            return { content: [{ type: "text", text: `No meal found with ID "${id}".` }] };
        }
        return { content: [{ type: "text", text: formatMeal(data.meals[0]) }] };
    }
);

/**
 * 4. Get a random meal
 *    GET /random.php
 */
server.registerTool(
    "get-random-meal",
    {
        description: "Fetch a completely random meal with full recipe details.",
        inputSchema: z.object({}),
    },
    async () => {
        const data = await fetchJSON(`${BASE_URL}/random.php`);
        return { content: [{ type: "text", text: formatMeal(data.meals[0]) }] };
    }
);

/**
 * 5. List all categories
 *    GET /categories.php
 */
server.registerTool(
    "list-categories",
    {
        description:
            "List all available meal categories (e.g. Beef, Chicken, Dessert, Seafood …) with descriptions.",
        inputSchema: z.object({}),
    },
    async () => {
        const data = await fetchJSON(`${BASE_URL}/categories.php`);
        const text =
            "Available Categories:\n\n" +
            data.categories
                .map(
                    (c: any) =>
                        `• ${c.strCategory} (ID: ${c.idCategory})\n  ${c.strCategoryDescription?.slice(0, 120) ?? ""}…`
                )
                .join("\n\n");
        return { content: [{ type: "text", text }] };
    }
);

/**
 * 6. Filter meals by category
 *    GET /filter.php?c={category}
 */
server.registerTool(
    "filter-by-category",
    {
        description: 'Filter meals by category name, e.g. "Seafood", "Dessert", "Beef".',
        inputSchema: z.object({
            category: z.string().describe('Category name, e.g. "Seafood"'),
        }),
    },
    async ({ category }) => {
        const data = await fetchJSON(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
        if (!data.meals) {
            return { content: [{ type: "text", text: `No meals found in category "${category}".` }] };
        }
        const text =
            `Meals in category "${category}" (${data.meals.length} results):\n\n` +
            data.meals.map(formatSummary).join("\n");
        return { content: [{ type: "text", text }] };
    }
);

/**
 * 7. Filter meals by area / cuisine
 *    GET /filter.php?a={area}
 */
server.registerTool(
    "filter-by-area",
    {
        description: 'Filter meals by cuisine / area, e.g. "Italian", "Canadian", "Indian".',
        inputSchema: z.object({
            area: z.string().describe('Cuisine area, e.g. "Italian"'),
        }),
    },
    async ({ area }) => {
        const data = await fetchJSON(`${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
        if (!data.meals) {
            return { content: [{ type: "text", text: `No meals found for area "${area}".` }] };
        }
        const text =
            `Meals from "${area}" cuisine (${data.meals.length} results):\n\n` +
            data.meals.map(formatSummary).join("\n");
        return { content: [{ type: "text", text }] };
    }
);

/**
 * 8. Filter meals by main ingredient
 *    GET /filter.php?i={ingredient}
 */
server.registerTool(
    "filter-by-ingredient",
    {
        description: 'Filter meals that use a specific main ingredient, e.g. "chicken_breast", "salmon".',
        inputSchema: z.object({
            ingredient: z
                .string()
                .describe('Ingredient name using underscores for spaces, e.g. "chicken_breast"'),
        }),
    },
    async ({ ingredient }) => {
        const data = await fetchJSON(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
        if (!data.meals) {
            return {
                content: [{ type: "text", text: `No meals found with ingredient "${ingredient}".` }],
            };
        }
        const text =
            `Meals containing "${ingredient}" (${data.meals.length} results):\n\n` +
            data.meals.map(formatSummary).join("\n");
        return { content: [{ type: "text", text }] };
    }
);

/**
 * 9. List all areas / cuisines
 *    GET /list.php?a=list
 */
server.registerTool(
    "list-areas",
    {
        description: "List all available cuisine areas (e.g. Italian, Indian, Japanese …).",
        inputSchema: z.object({}),
    },
    async () => {
        const data = await fetchJSON(`${BASE_URL}/list.php?a=list`);
        const text =
            "Available Cuisine Areas:\n\n" + data.meals.map((m: any) => `• ${m.strArea}`).join("\n");
        return { content: [{ type: "text", text }] };
    }
);

/**
 * 10. List all ingredients
 *     GET /list.php?i=list
 */
server.registerTool(
    "list-ingredients",
    {
        description: "List all ingredients available in the database with descriptions.",
        inputSchema: z.object({}),
    },
    async () => {
        const data = await fetchJSON(`${BASE_URL}/list.php?i=list`);
        const text =
            `All Ingredients (${data.meals.length} total):\n\n` +
            data.meals
                .map(
                    (m: any) =>
                        `• ${m.strIngredient} (ID: ${m.idIngredient})${m.strDescription ? " — " + m.strDescription.slice(0, 80) + "…" : ""}`
                )
                .join("\n");
        return { content: [{ type: "text", text }] };
    }
);

// ─── Prompts ──────────────────────────────────────────────────────────────────

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
                    text: `Use the search-meals-by-name tool to find "${dish}". Then present the first result as a well-formatted recipe card including: dish name, cuisine, category, ingredient list with measurements, step-by-step instructions, and the YouTube link if available.`,
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
                    text: `Use the get-random-meal tool to fetch a surprise meal. Present it enthusiastically as a recipe card with all ingredients and instructions. Add 2–3 helpful cooking tips based on the dish.`,
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.error("Starting MealDB MCP server...");
    server.connect(new StdioServerTransport());
    console.error("MealDB MCP server started successfully");
}

main().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});