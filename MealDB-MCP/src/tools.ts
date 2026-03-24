import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJSON, formatAreaList, formatCategoryList, formatIngredientList, formatMeal, formatMealPreview } from "./helpers.js";


export function registerTools(server: McpServer) {

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
            const data = await fetchJSON(`/search.php?s=${encodeURIComponent(name)}`);
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
            const data = await fetchJSON(`/search.php?f=${letter.toLowerCase()}`);
            if (!data.meals) {
                return {
                    content: [{ type: "text", text: `No meals found starting with "${letter}".` }],
                };
            }
            const text = `Meals starting with "${letter.toUpperCase()}":\n\n` + data.meals.map(formatMeal).join("\n");
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
            const data = await fetchJSON(`/lookup.php?i=${encodeURIComponent(id)}`);
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
            const data = await fetchJSON(`/random.php`);
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
            const data = await fetchJSON(`/categories.php`);

            return { content: [{ type: "text", text: formatCategoryList(data.categories) }] };
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
            const data = await fetchJSON(`/filter.php?c=${encodeURIComponent(category)}`);

            if (!data.meals) {
                return { content: [{ type: "text", text: `No meals found in category "${category}".` }] };
            }

            const text =
                `Meals in category "${category}" (${data.meals.length} results):\n\n` +
                data.meals.map(formatMealPreview).join("\n");

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
            const data = await fetchJSON(`/filter.php?a=${encodeURIComponent(area)}`);
            if (!data.meals) {
                return { content: [{ type: "text", text: `No meals found for area "${area}".` }] };
            }
            const text =
                `Meals from "${area}" cuisine (${data.meals.length} results):\n\n` +
                data.meals.map(formatMealPreview).join("\n");
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
            const data = await fetchJSON(`/filter.php?i=${encodeURIComponent(ingredient)}`);
            if (!data.meals) {
                return {
                    content: [{ type: "text", text: `No meals found with ingredient "${ingredient}".` }],
                };
            }
            const text =
                `Meals containing "${ingredient}" (${data.meals.length} results):\n\n` +
                data.meals.map(formatMealPreview).join("\n");
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
            const data = await fetchJSON(`/list.php?a=list`);
            return { content: [{ type: "text", text: formatAreaList(data.meals) }] };
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
            const data = await fetchJSON(`/list.php?i=list`);

            return { content: [{ type: "text", text: formatIngredientList(data.meals) }] };
        }
    );
}