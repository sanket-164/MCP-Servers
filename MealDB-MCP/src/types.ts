export type RawMeal = {
    idMeal: string;
    strMeal: string;
    strMealAlternate?: string | null;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strTags?: string | null;
    strYoutube?: string | null;

    [key: `strIngredient${number}`]: string | null;
    [key: `strMeasure${number}`]: string | null;

    strSource?: string | null;
    strImageSource?: string | null;
    dateModified?: string | null;
};

export type RawCategory = {
    idCategory: string;
    strCategory: string;
    strCategoryThumb: string;
    strCategoryDescription: string;
};

export type RawMealPreview = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
};

export type RawArea = {
    strArea: string;
}

export type RawIngredient = {
    idIngredient: string;
    strIngredient: string;
    strDescription: string | null;
    strThumb: string;
    strType: string | null;
}