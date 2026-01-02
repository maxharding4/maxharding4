import Image from "next/image";
import Link from "next/link";
import { CountrySkeleton } from "@/types/contentful";
import { Entry } from "contentful";

interface CountryCardProps {
  country: Entry<CountrySkeleton>;
}

export default function CountryCard({ country }: CountryCardProps) {
  const fields = country.fields as unknown as {
    name: string;
    slug: string;
    flagImage?: any;
  };
  const { name, slug, flagImage } = fields;
  // Type assertion needed due to Contentful's Asset type complexity
  const imageUrl = flagImage?.fields?.file?.url as string | undefined;

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
        <div className="p-4 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </article>
    </Link>
  );
}
