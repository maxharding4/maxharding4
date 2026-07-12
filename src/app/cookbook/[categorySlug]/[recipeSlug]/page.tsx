import Image from "next/image";
import { notFound } from "next/navigation";
import { Asset } from "contentful";
import Breadcrumb from "@/components/Breadcrumb";
import { getEntriesByType } from "@/lib/contentful";
import { getCategory, getAllRecipes, splitIngredients, splitMethodSteps } from "@/lib/cookbook";
import { getContentfulImageSrc, IMAGE_TRANSFORMS } from "@/lib/images";
import { RecipeSkeleton } from "@/types/contentful";

interface RecipePageProps {
  params: Promise<{
    categorySlug: string;
    recipeSlug: string;
  }>;
}

export async function generateStaticParams() {
  const recipes = await getAllRecipes();

  return recipes.map((recipe) => ({
    categorySlug: recipe.fields.category as unknown as string,
    recipeSlug: recipe.fields.slug as unknown as string,
  }));
}

export async function generateMetadata({ params }: RecipePageProps) {
  const { categorySlug, recipeSlug } = await params;

  const recipes = await getEntriesByType<RecipeSkeleton>("recipe", {
    "fields.slug": recipeSlug,
    limit: 1,
  });
  const recipe = recipes.items[0];
  const category = getCategory(categorySlug);

  if (!recipe || !category) {
    return { title: "Recipe Not Found" };
  }

  const title = recipe.fields.title as unknown as string;
  const description = recipe.fields.description as unknown as string | undefined;
  const image = recipe.fields.image as unknown as Asset | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageUrl = (image?.fields as any)?.file?.url as string | undefined;

  const metaDescription = description || `${title} — a ${category.label.toLowerCase()} recipe from my cookbook.`;

  return {
    title: `${title} | Cookbook`,
    description: metaDescription,
    openGraph: {
      title: `${title} | Cookbook`,
      description: metaDescription,
      url: `/cookbook/${categorySlug}/${recipeSlug}`,
      type: "article",
      ...(imageUrl && {
        images: [{ url: `https:${imageUrl}`, alt: `Photo of ${title}` }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Cookbook`,
      description: metaDescription,
      ...(imageUrl && { images: [`https:${imageUrl}`] }),
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { categorySlug, recipeSlug } = await params;

  const category = getCategory(categorySlug);
  if (!category) {
    notFound();
  }

  const recipes = await getEntriesByType<RecipeSkeleton>("recipe", {
    "fields.slug": recipeSlug,
    limit: 1,
  });
  const recipe = recipes.items[0];

  if (!recipe) {
    notFound();
  }

  // A recipe only lives under its own category's URL.
  if ((recipe.fields.category as unknown as string) !== category.slug) {
    notFound();
  }

  const title = recipe.fields.title as unknown as string;
  const description = recipe.fields.description as unknown as string | undefined;
  const image = recipe.fields.image as unknown as Asset | undefined;
  const servings = recipe.fields.servings as unknown as number | undefined;
  const prep = recipe.fields.prepTimeMinutes as unknown as number | undefined;
  const cook = recipe.fields.cookTimeMinutes as unknown as number | undefined;
  const ingredients = splitIngredients(recipe.fields.ingredients as unknown as string);
  const steps = splitMethodSteps(recipe.fields.method as unknown as string);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageUrl = (image?.fields as any)?.file?.url as string | undefined;

  const breadcrumbItems = [
    { label: "Cookbook", href: "/cookbook" },
    { label: category.label, href: `/cookbook/${category.slug}` },
    { label: title },
  ];

  const recipeSchema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: title,
    ...(description && { description }),
    ...(imageUrl && { image: `https:${imageUrl}` }),
    ...(servings && { recipeYield: servings }),
    ...(prep && { prepTime: `PT${prep}M` }),
    ...(cook && { cookTime: `PT${cook}M` }),
    recipeCategory: category.label,
    recipeIngredient: ingredients,
    recipeInstructions: steps.map((text, i) => ({
      "@type": "HowToStep",
      name: `Step ${i + 1}`,
      text,
    })),
  };

  const metaParts = [
    servings && `Serves ${servings}`,
    prep && `Prep ${prep} min`,
    cook && `Cook ${cook} min`,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen page-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Constrained reading column: recipe photos are 1536px wide, which is
            exactly 2× retina-sharp at max-w-3xl. Not full-bleed by design. */}
        <article className="mx-auto max-w-3xl">
          <header className="mb-8">
            <h1 className="heading-hero text-gray-900">{title}</h1>
            {description && (
              <p className="mt-4 text-lg text-gray-600">{description}</p>
            )}
            {metaParts.length > 0 && (
              <p className="mt-3 text-sm font-medium text-gray-500">
                {metaParts.join(" · ")}
              </p>
            )}
          </header>

          {imageUrl && (
            <div className="relative mb-10 aspect-[3/2] w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={getContentfulImageSrc(imageUrl, IMAGE_TRANSFORMS.recipeHero)}
                alt={`Photo of ${title}`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <section aria-labelledby="ingredients-heading" className="mb-10">
            <h2
              id="ingredients-heading"
              className="text-2xl font-semibold text-gray-900 mb-4"
            >
              Ingredients
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-gray-700">
              {ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="method-heading">
            <h2
              id="method-heading"
              className="text-2xl font-semibold text-gray-900 mb-4"
            >
              Method
            </h2>
            <ol className="list-decimal space-y-4 pl-5 text-gray-700">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </article>
      </div>
    </div>
  );
}
