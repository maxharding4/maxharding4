'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface PhotoOfTheDayCity {
  cityName: string;
  citySlug: string;
  cityDescription?: string;
  countryName: string;
  countrySlug: string;
  photos: {
    url: string;
    title?: string;
  }[];
}

interface PhotoOfTheDayProps {
  cities: PhotoOfTheDayCity[];
}

interface Selection {
  city: PhotoOfTheDayCity;
  photo: { url: string; title?: string };
}

// Number of whole days since the epoch in the viewer's local time. Increments
// once per local calendar day, so it's the seed that keeps the pick stable
// across refreshes and rolls it over at local midnight.
function localDayNumber(date: Date): number {
  const localMs = date.getTime() - date.getTimezoneOffset() * 60_000;
  return Math.floor(localMs / 86_400_000);
}

// Deterministic "photo of the day": one city per day, cycling through cities
// in a stable order so the same city never appears on consecutive days (unless
// it's the only one). Within the chosen city the photo advances each time the
// city comes back around. The same calendar day always yields the same photo.
export function pickForDay(
  cities: PhotoOfTheDayCity[],
  date: Date
): Selection | null {
  const eligible = cities
    .filter((city) => city.photos.length > 0)
    .sort((a, b) => a.citySlug.localeCompare(b.citySlug));
  if (eligible.length === 0) return null;

  const day = localDayNumber(date);
  const city = eligible[day % eligible.length];
  const photos = [...city.photos].sort((a, b) => a.url.localeCompare(b.url));
  const cycle = Math.floor(day / eligible.length);
  const photo = photos[cycle % photos.length];
  return { city, photo };
}

export default function PhotoOfTheDay({ cities }: PhotoOfTheDayProps) {
  const [selection, setSelection] = useState<Selection | null>(null);

  useEffect(() => {
    // Deliberate client-only sync: the pick must reflect the viewer's current
    // day (not the static-export build date), and starting null keeps the
    // server render stable. Mirrors Header's menu-on-navigation effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelection(pickForDay(cities, new Date()));
  }, [cities]);

  if (!selection) {
    return null;
  }

  const { city, photo } = selection;
  const { cityName, citySlug, cityDescription, countryName, countrySlug } = city;
  const altText = photo.title ?? `Photo of ${cityName}`;

  return (
    <section className="pb-4">
      <h2 className="heading-hero text-gray-900 text-center mb-6">
        Photo of the Day
      </h2>
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/travel/${countrySlug}/${citySlug}`}
          aria-label={`View photos of ${cityName}, ${countryName}`}
          className="block overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={photo.url}
              alt={altText}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3 text-white">
              <p className="text-lg font-semibold">
                {cityName}, {countryName}
              </p>
              {cityDescription && (
                <p className="text-sm mt-1 text-gray-200">{cityDescription}</p>
              )}
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
