import Image from "next/image";
import Link from "next/link";
import { CitySkeleton, PhotoSkeleton } from "@/types/contentful";
import { Entry } from "contentful";

interface CityCardProps {
  city: Entry<CitySkeleton>;
  countrySlug: string;
  previewPhoto?: Entry<PhotoSkeleton> | null;
  photoCount: number;
}

export default function CityCard({
  city,
  countrySlug,
  previewPhoto,
  photoCount,
}: CityCardProps) {
  const name = city.fields.name as unknown as string;
  const slug = city.fields.slug as unknown as string;

  // Get preview image URL from the first photo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previewImageUrl = previewPhoto
    ? ((previewPhoto.fields.image as any)?.fields?.file?.url as string | undefined)
    : undefined;

  return (
    <Link
      href={`/travel/${countrySlug}/${slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <article className="relative">
        {/* Preview Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {previewImageUrl ? (
            <Image
              src={`https:${previewImageUrl}`}
              alt={`Preview of ${name}`}
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

          {/* Photo count badge */}
          <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
            {photoCount} {photoCount === 1 ? "photo" : "photos"}
          </div>
        </div>

        {/* City Name */}
        <div className="p-4 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {name || "Unknown City"}
          </h2>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </article>
    </Link>
  );
}
