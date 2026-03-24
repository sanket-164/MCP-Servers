import { RawArea, RawCategory, RawIngredient, RawMeal, RawMealPreview } from "./types.js";

/** Helper function to fetch JSON data from the MealDB API */
export async function fetchJSON(url: string): Promise<any> {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1${url}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
}

/** Format a full meal object into readable text */
export function formatMeal(meal: RawMeal): string {
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
        `Website  : https://sanket-mrchef.netlify.app/meal/${meal.idMeal}`,
        "",
        "Ingredients:",
        ...ingredients,
        "",
        "Instructions:",
        meal.strInstructions ?? "N/A",
    ].join("\n");
}

/** Format a lightweight meal summary (id + name + website) */
export function formatMealPreview(meal: RawMealPreview): string {
    return `• ${meal.strMeal} (ID: ${meal.idMeal}) — https://sanket-mrchef.netlify.app/meal/${meal.idMeal}`;
}

/** Format a list of categories into readable text */
export function formatCategoryList(categories: RawCategory[]): string {
    return (
        `Available Categories (${categories.length} total):\n\n` +
        categories
            .map(
                (c) =>
                    `• ${c.strCategory} (ID: ${c.idCategory}) (Website: https://sanket-mrchef.netlify.app/category/${c.strCategory})\n  ${c.strCategoryDescription?.slice(0, 120) ?? ""}…`
            )
            .join("\n\n")
    );
}

/** Format a list of cuisine areas into readable text */
export function formatAreaList(areas: RawArea[]): string {
    return (
        `All Cuisine Areas (${areas.length} total):\n\n` +
        areas
            .map(
                (a) =>
                    `• ${a.strArea} (Website: https://sanket-mrchef.netlify.app/country/${a.strArea})`
            )
            .join("\n")
    );
}

/** Format a list of ingredients into readable text */
export function formatIngredientList(ingredients: RawIngredient[]): string {
    return (
        `All Ingredients (${ingredients.length} total):\n\n` +
        ingredients
            .map(
                (i) =>
                    `• ${i.strIngredient} (ID: ${i.idIngredient})\n  ${i.strDescription?.slice(0, 120) ?? ""}…\n  Image: ${i.strThumb}`
            )
            .join("\n\n")
    );
}