import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryRecipeGrid from "@/components/CategoryRecipeGrid";
import { CATEGORIES, getAllRecipes, getCategory, recipesInCategory } from "@/lib/cookbook";

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

// All four category pages are generated even when empty — the empty state
// below renders instead of a bare grid.
export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ categorySlug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getCategory(categorySlug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  const description = `${category.label} recipes from my cookbook. ${category.blurb}`;

  return {
    title: `${category.label} | Cookbook`,
    description,
    openGraph: {
      title: `${category.label} | Cookbook`,
      description,
      url: `/cookbook/${category.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.label} | Cookbook`,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const recipes = recipesInCategory(await getAllRecipes(), category.slug);

  const breadcrumbItems = [
    { label: "Cookbook", href: "/cookbook" },
    { label: category.label },
  ];

  return (
    <div className="min-h-screen page-canvas">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbItems} />

        <header className="mb-4">
          <h1 className="heading-hero text-gray-900">{category.label}</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">{category.blurb}</p>
        </header>

        {/* Count, tag filter pills, and grid live in a client component so
            the pills can filter; all cards are still in the static HTML. */}
        <CategoryRecipeGrid recipes={recipes} categorySlug={category.slug} />
      </div>
    </div>
  );
}
