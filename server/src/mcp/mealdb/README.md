# TheMealDB MCP (`mealdb`)

Endpoint (initialize): `POST https://sanket-mcps.vercel.app/mcp/mealdb`

This MCP server integrates with TheMealDB to help you search and explore recipes (by dish name, category, cuisine, ingredient, or randomly).

## Tools

- `search-meals-by-name` (input: `name`)
- `list-meals-by-letter` (input: `letter`)
- `lookup-meal-by-id` (input: `id`)
- `get-random-meal` (no inputs)
- `list-categories` (no inputs)
- `filter-by-category` (input: `category`)
- `filter-by-area` (input: `area`)
- `filter-by-ingredient` (input: `ingredient`)
- `list-areas` (no inputs)
- `list-ingredients` (no inputs)

## Prompt presets

- `find-recipe`
- `meal-inspiration`
- `explore-cuisine`
- `ingredient-based-meal-plan`
- `category-deep-dive`
