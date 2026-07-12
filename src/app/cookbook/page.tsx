import { Asset } from "contentful";
import CategoryCard from "@/components/CategoryCard";
import { CATEGORIES, getAllRecipes, recipesInCategory } from "@/lib/cookbook";

// Note: content is fetched at build time only (output: 'export').
// Run 'npm run build' to pick up new recipes.

export default async function CookbookPage() {
  const recipes = await getAllRecipes();

  const categoriesWithRecipes = CATEGORIES.map((category) => {
    const categoryRecipes = recipesInCategory(recipes, category.slug);
    const firstImage = categoryRecipes
      .map((r) => r.fields.image as unknown as Asset | undefined)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((image) => (image?.fields as any)?.file?.url as string | undefined)
      .find(Boolean);
    return {
      category,
      recipeCount: categoryRecipes.length,
      previewImageUrl: firstImage ?? null,
    };
  });

  return (
    <div className="min-h-screen page-canvas">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="heading-hero text-gray-900">Cookbook</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            Recipes I actually cook — mains, sides, snacks and desserts.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categoriesWithRecipes.map(({ category, recipeCount, previewImageUrl }) => (
            <CategoryCard
              key={category.slug}
              category={category}
              recipeCount={recipeCount}
              previewImageUrl={previewImageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  const recipes = await getAllRecipes();
  const description = `A personal cookbook of ${recipes.length} ${
    recipes.length === 1 ? "recipe" : "recipes"
  } across mains, sides, snacks and desserts.`;

  return {
    title: "Cookbook | Recipes I Actually Cook",
    description,
    openGraph: {
      title: "Cookbook | Recipes I Actually Cook",
      description,
      url: "/cookbook",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Cookbook | Recipes I Actually Cook",
      description,
    },
  };
}
