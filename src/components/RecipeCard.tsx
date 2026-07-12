import Image from "next/image";
import Link from "next/link";
import { RecipeSkeleton } from "@/types/contentful";
import { getContentfulImageSrc, IMAGE_TRANSFORMS } from "@/lib/images";
import { Asset, Entry } from "contentful";

interface RecipeCardProps {
  recipe: Entry<RecipeSkeleton>;
  categorySlug: string;
}

export default function RecipeCard({ recipe, categorySlug }: RecipeCardProps) {
  const title = recipe.fields.title as unknown as string;
  const slug = recipe.fields.slug as unknown as string;
  const description = recipe.fields.description as unknown as string | undefined;
  const image = recipe.fields.image as unknown as Asset | undefined;
  const servings = recipe.fields.servings as unknown as number | undefined;
  const prep = recipe.fields.prepTimeMinutes as unknown as number | undefined;
  const cook = recipe.fields.cookTimeMinutes as unknown as number | undefined;
  const totalMinutes = (prep ?? 0) + (cook ?? 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageUrl = (image?.fields as any)?.file?.url as string | undefined;

  return (
    <Link
      href={`/cookbook/${categorySlug}/${slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <article className="relative">
        {/* Recipe photos are 3:2 landscape and render uncropped in this frame
            (deliberately not CityCard's 4:3 — see cookbook-routes-and-ui ticket). */}
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100">
          {imageUrl ? (
            <Image
              src={getContentfulImageSrc(imageUrl, IMAGE_TRANSFORMS.cardThumb)}
              alt={`Photo of ${title}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="p-4 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
          )}
          {(totalMinutes > 0 || servings) && (
            <p className="mt-2 text-xs font-medium text-gray-500">
              {totalMinutes > 0 && <span>{totalMinutes} min</span>}
              {totalMinutes > 0 && servings && <span aria-hidden="true"> · </span>}
              {servings && (
                <span>
                  Serves {servings}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </article>
    </Link>
  );
}
