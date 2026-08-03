import { Entry } from "contentful";
import { RecipeSkeleton } from "@/types/contentful";

/**
 * Pure tag helpers, kept free of any @/lib/contentful import: they are used
 * by the client-side CategoryRecipeGrid, and lib/contentful throws at module
 * evaluation in the browser (its env vars are server-only).
 */

/** A recipe's filter tags; absent field → empty list (tags are optional). */
export function recipeTags(recipe: Entry<RecipeSkeleton>): string[] {
  return (recipe.fields.tags as unknown as string[] | undefined) ?? [];
}

export interface TagPill {
  tag: string;
  count: number;
}

/**
 * Filter pills for a recipe list: every tag present on at least one recipe,
 * ordered by descending recipe count then alphabetically. Derived from the
 * data, so a pill can never match zero recipes and an untagged list yields
 * no pills at all.
 */
export function deriveTagPills(recipes: Entry<RecipeSkeleton>[]): TagPill[] {
  const counts = new Map<string, number>();
  for (const recipe of recipes) {
    for (const tag of new Set(recipeTags(recipe))) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
