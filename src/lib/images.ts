/**
 * Central resolver for Contentful-hosted image URLs.
 *
 * Contentful returns protocol-relative asset URLs (e.g. "//images.ctfassets.net/…").
 * This helper turns one into a usable <img> / next/image `src`, and is the single
 * place where image-source behaviour is controlled.
 *
 * Placeholder mode: set `NEXT_PUBLIC_USE_PLACEHOLDER_IMAGES=true` (in `.env.local`)
 * to serve a local placeholder for every Contentful image instead. Local dev and
 * builds then never fetch image bytes from Contentful — useful for working on
 * layout offline and for leaving your asset-bandwidth quota untouched. Production
 * builds leave this unset, so nothing changes for real visitors.
 *
 * Note: this deliberately covers only *rendered* images. Metadata/JSON-LD image
 * URLs (og:image, `contentUrl`) are strings in <head> that a browser never fetches
 * during local work, so they keep their real Contentful URLs.
 */

export const PLACEHOLDER_IMAGE_SRC = "/placeholder-image.svg";

const usePlaceholderImages =
  process.env.NEXT_PUBLIC_USE_PLACEHOLDER_IMAGES === "true";

/**
 * A subset of Contentful's Images API options. Applied as query params so the
 * CDN resizes/recompresses on the fly and serves far smaller bytes than the
 * uploaded original. See https://www.contentful.com/developers/docs/references/images-api/
 */
export interface ImageTransform {
  width?: number;
  height?: number;
  /** 1–100. Lower = smaller file. */
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png";
  fit?: "pad" | "fill" | "scale" | "crop" | "thumb";
}

/**
 * Per-context transform presets. Widths are ~2× the on-screen size so images
 * stay crisp on retina displays while still shrinking well below the original.
 * Gallery grid is the biggest win (city pages can hold 20+ photos); the lightbox
 * keeps full dimensions and only switches format so full-view quality is intact.
 */
export const IMAGE_TRANSFORMS = {
  cardThumb: { width: 600, quality: 55, format: "webp" },
  flag: { width: 400, format: "webp" },
  galleryThumb: { width: 800, quality: 60, format: "webp" },
  galleryFull: { quality: 82, format: "webp" },
  avatar: { width: 400, format: "webp" },
  // Recipe detail hero: displayed at max-w-3xl (768px), so 1536 = 2× retina.
  recipeHero: { width: 1536, quality: 75, format: "webp" },
} as const satisfies Record<string, ImageTransform>;

function withTransform(url: string, transform?: ImageTransform): string {
  // Only Contentful's Images API understands these params.
  if (!transform || !url.includes("images.ctfassets.net")) return url;
  const params = new URLSearchParams();
  if (transform.width) params.set("w", String(transform.width));
  if (transform.height) params.set("h", String(transform.height));
  if (transform.quality) params.set("q", String(transform.quality));
  if (transform.format) params.set("fm", transform.format);
  if (transform.fit) params.set("fit", transform.fit);
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Resolve a Contentful asset URL into an image `src`, optionally applying an
 * Images-API transform to shrink the delivered bytes.
 *
 * Returns the local placeholder when placeholder mode is on, or when no asset URL
 * is provided (a graceful fallback rather than a broken `https:undefined`). Callers
 * that render an explicit empty state should branch on the raw asset presence
 * *before* calling this.
 */
export function getContentfulImageSrc(
  assetUrl?: string | null,
  transform?: ImageTransform
): string {
  if (usePlaceholderImages || !assetUrl) return PLACEHOLDER_IMAGE_SRC;
  const base = assetUrl.startsWith("http") ? assetUrl : `https:${assetUrl}`;
  return withTransform(base, transform);
}
