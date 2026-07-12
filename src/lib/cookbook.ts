import { Entry } from "contentful";
import { getEntriesByType } from "@/lib/contentful";
import { RecipeCategory, RecipeSkeleton } from "@/types/contentful";

/**
 * Cookbook category configuration.
 *
 * Categories are deliberately NOT a Contentful content type: the list is small
 * and stable, so recipes carry a validated `category` dropdown and the pages
 * (labels, blurbs, ordering) are defined here. This avoids managing category
 * entries and the orphaned-reference failure mode travel hit with countries.
 */
export interface CategoryConfig {
  slug: RecipeCategory;
  label: string;
  blurb: string;
}

export const CATEGORIES: readonly CategoryConfig[] = [
  {
    slug: "mains",
    label: "Mains",
    blurb: "Proper dinners — the dishes that anchor the plate.",
  },
  {
    slug: "sides",
    label: "Sides",
    blurb: "Supporting acts that sometimes steal the show.",
  },
  {
    slug: "snacks",
    label: "Snacks",
    blurb: "Small plates and between-meal fixes.",
  },
  {
    slug: "desserts",
    label: "Desserts",
    blurb: "The sweet finish.",
  },
];

const VALID_CATEGORY_SLUGS = new Set<string>(CATEGORIES.map((c) => c.slug));

export function getCategory(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/**
 * All recipes with a recognised category, sorted by title.
 *
 * A recipe whose `category` value isn't one of the configured slugs shouldn't
 * exist (Contentful validates the field), but if one slips through it is
 * skipped with a build-time warning rather than breaking the export — same
 * spirit as the orphaned-country guard on the homepage.
 */
export async function getAllRecipes(): Promise<Entry<RecipeSkeleton>[]> {
  const recipes = await getEntriesByType<RecipeSkeleton>("recipe", {
    order: ["fields.title"],
  });

  return recipes.items.filter((recipe) => {
    const category = recipe.fields.category as unknown as string;
    if (!VALID_CATEGORY_SLUGS.has(category)) {
      console.warn(
        `Skipping recipe "${recipe.fields.slug}" — unknown category "${category}"`
      );
      return false;
    }
    return true;
  });
}

export function recipesInCategory(
  recipes: Entry<RecipeSkeleton>[],
  categorySlug: string
): Entry<RecipeSkeleton>[] {
  return recipes.filter(
    (recipe) => (recipe.fields.category as unknown as string) === categorySlug
  );
}

/** One ingredient per line → list items. */
export function splitIngredients(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * One step per paragraph (blank-line separated) → numbered steps.
 * Falls back to one step per line when there are no blank lines, so
 * single-newline-separated content still renders sensibly.
 */
export function splitMethodSteps(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  if (paragraphs.length > 1) return paragraphs;
  return splitIngredients(text);
}
