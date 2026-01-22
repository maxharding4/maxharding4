import { MetadataRoute } from "next";

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
