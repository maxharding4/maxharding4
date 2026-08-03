"use client";

import { useState } from "react";
import { Entry } from "contentful";
import { RecipeSkeleton } from "@/types/contentful";
import { deriveTagPills, recipeTags } from "@/lib/recipe-tags";
import RecipeCard from "@/components/RecipeCard";

interface CategoryRecipeGridProps {
  recipes: Entry<RecipeSkeleton>[];
  categorySlug: string;
}

function pillClasses(selected: boolean): string {
  // focus-visible (not focus): the ring is for keyboard navigation only —
  // after a tap/click the button keeps focus and a `focus:` ring would
  // linger on the selected pill.
  const base =
    "shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
  return selected
    ? `${base} border-gray-900 bg-gray-900 text-white`
    : `${base} border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-900`;
}

/**
 * The filterable recipe grid for a category page. Client-side only in the
 * lightest sense: all cards are in the static HTML, pills just show/hide.
 *
 * Pills are derived from the tags present on the given recipes — no
 * configured list, no empty pills, and a fully untagged category renders
 * no pill row at all. Single-select with an implicit "All" default; an
 * untagged recipe is visible under "All" and under no specific pill.
 */
export default function CategoryRecipeGrid({
  recipes,
  categorySlug,
}: CategoryRecipeGridProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const pills = deriveTagPills(recipes);
  const visible = selectedTag
    ? recipes.filter((recipe) => recipeTags(recipe).includes(selectedTag))
    : recipes;

  return (
    <div>
      <p className="mt-2 mb-8 text-sm text-gray-500">
        {visible.length} {visible.length === 1 ? "recipe" : "recipes"}
      </p>

      {pills.length > 0 && (
        /* Below sm this row bleeds to the viewport edge (negative margin
           mirrors the page container's px-4) and scrolls horizontally; the
           gradient is the "more off-screen" affordance. From sm up it wraps
           and the fade/bleed are disabled. The row keeps py-1 while
           scrollable: overflow-x-auto also clips vertically, and the
           keyboard focus ring extends 4px beyond the buttons. */
        <div className="relative -mx-4 mb-8 sm:mx-0">
          <div
            role="group"
            aria-label="Filter recipes by tag"
            className="flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0"
          >
            <button
              type="button"
              aria-pressed={selectedTag === null}
              onClick={() => setSelectedTag(null)}
              className={pillClasses(selectedTag === null)}
            >
              All
            </button>
            {pills.map(({ tag }) => (
              <button
                key={tag}
                type="button"
                aria-pressed={selectedTag === tag}
                onClick={() =>
                  setSelectedTag(selectedTag === tag ? null : tag)
                }
                className={pillClasses(selectedTag === tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f8f8f6] to-transparent sm:hidden"
          />
        </div>
      )}

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((recipe) => (
            <RecipeCard
              key={recipe.sys.id}
              recipe={recipe}
              categorySlug={categorySlug}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Recipes coming soon</p>
        </div>
      )}
    </div>
  );
}
