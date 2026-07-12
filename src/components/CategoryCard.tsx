import Image from "next/image";
import Link from "next/link";
import { CategoryConfig } from "@/lib/cookbook";
import { getContentfulImageSrc, IMAGE_TRANSFORMS } from "@/lib/images";

interface CategoryCardProps {
  category: CategoryConfig;
  recipeCount: number;
  /** Contentful asset URL of the category's preview image (first recipe's photo) */
  previewImageUrl?: string | null;
}

export default function CategoryCard({
  category,
  recipeCount,
  previewImageUrl,
}: CategoryCardProps) {
  const isComingSoon = recipeCount === 0;

  const cardContent = (
    <article className="relative">
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100">
        {previewImageUrl ? (
          <Image
            src={getContentfulImageSrc(previewImageUrl, IMAGE_TRANSFORMS.cardThumb)}
            alt={`${category.label} recipes`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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

        {/* COMING SOON overlay - only covers image section */}
        {isComingSoon && (
          <div
            className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm"
            role="status"
            aria-label="Coming soon - No recipes available yet"
          >
            <div className="text-center">
              <p className="text-white text-2xl font-bold tracking-wide">
                COMING SOON
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="relative p-4 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {category.label}
        </h2>
        <p className="mt-1 text-sm text-gray-600">{category.blurb}</p>

        {!isComingSoon && (
          <div className="absolute right-4 top-4 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
          </div>
        )}
      </div>

      {!isComingSoon && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </article>
  );

  if (isComingSoon) {
    return (
      <div
        className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm cursor-not-allowed opacity-75"
        aria-disabled="true"
        aria-label={`${category.label} - Coming soon, no recipes available yet`}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/cookbook/${category.slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {cardContent}
    </Link>
  );
}
