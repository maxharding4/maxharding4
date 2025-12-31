import { createClient, Entry, EntryCollection, EntrySkeletonType } from "contentful";

/**
 * Contentful Client Configuration
 *
 * Creates a client instance for interacting with the Contentful Content Delivery API.
 * Uses environment variables for configuration.
 */

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const PREVIEW_ACCESS_TOKEN = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;
const PREVIEW_MODE = process.env.CONTENTFUL_PREVIEW_MODE === "true";

if (!SPACE_ID || !ACCESS_TOKEN) {
  throw new Error(
    "CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN must be set in environment variables"
  );
}

/**
 * Create Contentful client
 * Uses preview API if PREVIEW_MODE is enabled and preview token is available
 */
export const contentfulClient = createClient({
  space: SPACE_ID,
  accessToken: PREVIEW_MODE && PREVIEW_ACCESS_TOKEN ? PREVIEW_ACCESS_TOKEN : ACCESS_TOKEN,
  host: PREVIEW_MODE && PREVIEW_ACCESS_TOKEN ? "preview.contentful.com" : "cdn.contentful.com",
});

/**
 * Fetch a single entry by ID
 *
 * @param entryId - The ID of the entry to fetch
 * @returns The entry data or null if not found
 */
export async function getEntry<T extends EntrySkeletonType>(
  entryId: string
): Promise<Entry<T> | null> {
  try {
    const entry = await contentfulClient.getEntry<T>(entryId);
    return entry;
  } catch (error) {
    console.error(`Error fetching entry ${entryId}:`, error);
    return null;
  }
}

/**
 * Fetch entries by content type
 *
 * @param contentType - The content type ID to fetch
 * @param query - Optional query parameters for filtering, sorting, etc.
 * @returns Collection of entries or empty array if error occurs
 */
export async function getEntriesByType<T extends EntrySkeletonType>(
  contentType: string,
  query?: Record<string, unknown>
): Promise<EntryCollection<T>> {
  try {
    const entries = await contentfulClient.getEntries<T>({
      content_type: contentType,
      ...query,
    });
    return entries;
  } catch (error) {
    console.error(`Error fetching entries for content type ${contentType}:`, error);
    return {
      items: [],
      total: 0,
      skip: 0,
      limit: 0,
      sys: { type: "Array" },
    };
  }
}

/**
 * Fetch all entries with optional query parameters
 *
 * @param query - Optional query parameters for filtering, sorting, etc.
 * @returns Collection of entries or empty array if error occurs
 */
export async function getAllEntries<T extends EntrySkeletonType>(
  query?: Record<string, unknown>
): Promise<EntryCollection<T>> {
  try {
    const entries = await contentfulClient.getEntries<T>(query);
    return entries;
  } catch (error) {
    console.error("Error fetching all entries:", error);
    return {
      items: [],
      total: 0,
      skip: 0,
      limit: 0,
      sys: { type: "Array" },
    };
  }
}

/**
 * Parse Contentful response to extract field data
 *
 * @param entry - The Contentful entry
 * @returns The fields object from the entry
 */
export function parseEntry<T extends EntrySkeletonType>(
  entry: Entry<T>
): T["fields"] {
  return entry.fields;
}

/**
 * Parse multiple Contentful entries to extract field data
 *
 * @param entries - Collection of Contentful entries
 * @returns Array of field objects
 */
export function parseEntries<T extends EntrySkeletonType>(
  entries: EntryCollection<T>
): T["fields"][] {
  return entries.items.map((entry) => entry.fields);
}
