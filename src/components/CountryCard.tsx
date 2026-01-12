import Image from "next/image";
import Link from "next/link";
import { CountrySkeleton } from "@/types/contentful";
import { Entry } from "contentful";

interface CountryCardProps {
  country: Entry<CountrySkeleton>;
  cityCount?: number;
}

export default function CountryCard({ country, cityCount }: CountryCardProps) {
  const name = country.fields.name as unknown as string;
  const slug = country.fields.slug as unknown as string;
  const flagImage = country.fields.flagImage;
  // Contentful Asset type - safely access the file URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageUrl = (flagImage as any)?.fields?.file?.url as string | undefined;

  return (
    <Link
      href={`/travel/${slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <article className="relative">
        {/* Flag Image */}
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100">
          {imageUrl && (
            <Image
              src={`https:${imageUrl}`}
              alt={`${name} flag`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          )}
        </div>

        {/* Country Name */}
        <div className="relative p-4 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {name || "Unknown"}
          </h3>

          {/* Album Count Badge */}
          {cityCount !== undefined && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
              {cityCount} {cityCount === 1 ? "album" : "albums"}
            </div>
          )}
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </article>
    </Link>
  );
}
