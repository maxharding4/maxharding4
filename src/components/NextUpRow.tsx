import Image from "next/image";
import { getContentfulImageSrc, IMAGE_TRANSFORMS } from "@/lib/images";

interface NextUpRowProps {
  cityName: string;
  countryName: string;
  flagUrl?: string | null;
  /** Epoch ms of the planned visit; rendered as "July 2026". */
  visitTime: number;
}

/**
 * Slim, non-clickable row for the homepage "Next up" section. Upcoming cities
 * have no photos yet, so a full CityCard is mostly an empty image placeholder —
 * this shows just the flag, name, visit month, and a "Coming soon" badge.
 */
export default function NextUpRow({
  cityName,
  countryName,
  flagUrl,
  visitTime,
}: NextUpRowProps) {
  // UTC keeps the label stable regardless of the build machine's timezone.
  const visitLabel = new Date(visitTime).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {flagUrl ? (
        <Image
          src={getContentfulImageSrc(flagUrl, IMAGE_TRANSFORMS.flag)}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true" className="h-7 w-7 shrink-0 rounded-full bg-gray-100" />
      )}

      <p className="min-w-0 flex-1">
        <span className="block truncate">
          <span className="font-semibold text-gray-900">{cityName}</span>
          <span className="text-gray-500">, {countryName}</span>
        </span>
        {/* On narrow screens the date moves under the name to leave room for the badge. */}
        <span className="block text-sm text-gray-500 sm:hidden">{visitLabel}</span>
      </p>

      <span className="hidden text-sm text-gray-500 sm:block">{visitLabel}</span>
      <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Coming soon
      </span>
    </li>
  );
}
