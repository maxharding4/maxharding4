import { MetadataRoute } from "next";

// Emit as a static file at build time (required under `output: 'export'`).
export const dynamic = "force-static";

/**
 * Generate robots.txt for search engine crawling rules
 * Allows all search engines to crawl all pages
 * References the sitemap for better indexing
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://maxharding4.com/sitemap.xml",
  };
}
