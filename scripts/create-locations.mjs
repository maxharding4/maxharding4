#!/usr/bin/env node
// Create missing Country and City entries in Contentful from a folder tree.
//
// Walks <input-dir>/<countrySlug>/<citySlug>/ and for each slug that
// doesn't already exist as an entry, creates one with the minimum
// required fields:
//
//   Country: slug, name (title-cased from slug)
//   City:    slug, name (title-cased from slug), country reference
//
// Entries are LEFT AS DRAFTS so you can fill in optional fields
// (countryCode, flagImage, description, visitDate) in the Contentful UI
// before publishing. Drafts can be referenced by other entries — so a
// City draft can point to a Country draft — but neither will be visible
// to the site (which uses the Content Delivery API) until published.
//
// Usage:
//   node --env-file=.env.local scripts/create-locations.mjs <input-dir> [--dry-run]
//
// Required env (typically in .env.local):
//   CONTENTFUL_SPACE_ID
//   CONTENTFUL_PHOTO_UPLOADER_TOKEN   Personal Access Token (CMA)
//   CONTENTFUL_ENVIRONMENT            Optional, default "master"

import contentfulManagement from "contentful-management";
const { createClient } = contentfulManagement;
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const positional = args.filter((a) => !a.startsWith("--"));
  return { inputDir: positional[0], dryRun: flags.has("--dry-run") };
}

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

async function listSubdirs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function fieldValue(entry, fieldName, locale) {
  const f = entry.fields?.[fieldName];
  if (f === undefined) return undefined;
  return f?.[locale] ?? f;
}

async function paginatedEntries(env, query) {
  const limit = 1000;
  const all = [];
  let skip = 0;
  while (true) {
    const batch = await env.getEntries({ ...query, skip, limit });
    all.push(...batch.items);
    if (batch.items.length < limit) break;
    skip += limit;
  }
  return all;
}

async function main() {
  const { inputDir, dryRun } = parseArgs();
  if (!inputDir) {
    die(
      "Usage: node --env-file=.env.local scripts/create-locations.mjs <input-dir> [--dry-run]",
    );
  }
  const absInput = resolve(inputDir);
  if (!existsSync(absInput)) die(`Input directory not found: ${absInput}`);

  const {
    CONTENTFUL_SPACE_ID,
    CONTENTFUL_PHOTO_UPLOADER_TOKEN,
    CONTENTFUL_ENVIRONMENT = "master",
  } = process.env;
  if (!CONTENTFUL_SPACE_ID) {
    die(
      "CONTENTFUL_SPACE_ID not set. Tip: prefix command with `node --env-file=.env.local`",
    );
  }
  if (!CONTENTFUL_PHOTO_UPLOADER_TOKEN) {
    die(
      "CONTENTFUL_PHOTO_UPLOADER_TOKEN not set. Create one at https://app.contentful.com/account/profile/cma_tokens",
    );
  }

  console.log(`🌍 Contentful locations creator${dryRun ? " (DRY RUN)" : ""}`);
  console.log(`   Input:       ${absInput}`);
  console.log(`   Space:       ${CONTENTFUL_SPACE_ID}`);
  console.log(`   Environment: ${CONTENTFUL_ENVIRONMENT}`);

  const client = createClient({ accessToken: CONTENTFUL_PHOTO_UPLOADER_TOKEN });
  const space = await client.getSpace(CONTENTFUL_SPACE_ID);
  const env = await space.getEnvironment(CONTENTFUL_ENVIRONMENT);

  const locales = await env.getLocales();
  const locale = locales.items.find((l) => l.default)?.code ?? "en-US";
  console.log(`   Locale:      ${locale}\n`);

  console.log("📚 Indexing existing countries and cities...");
  const [existingCountries, existingCities] = await Promise.all([
    paginatedEntries(env, { content_type: "country" }),
    paginatedEntries(env, { content_type: "city" }),
  ]);

  const countryBySlug = new Map();
  const countryById = new Map();
  for (const c of existingCountries) {
    const slug = fieldValue(c, "slug", locale);
    if (typeof slug === "string") {
      countryBySlug.set(slug, c);
      countryById.set(c.sys.id, c);
    }
  }

  const cityKeys = new Set();
  for (const city of existingCities) {
    const citySlug = fieldValue(city, "slug", locale);
    const countryLink = fieldValue(city, "country", locale);
    const country = countryById.get(countryLink?.sys?.id);
    const countrySlug = country ? fieldValue(country, "slug", locale) : null;
    if (typeof citySlug === "string" && typeof countrySlug === "string") {
      cityKeys.add(`${countrySlug}/${citySlug}`);
    }
  }
  console.log(
    `   ${countryBySlug.size} country entries · ${cityKeys.size} city entries indexed.\n`,
  );

  let countriesCreated = 0;
  let citiesCreated = 0;
  let errors = 0;

  const countrySlugs = await listSubdirs(absInput);
  for (const countrySlug of countrySlugs) {
    let countryEntry = countryBySlug.get(countrySlug);

    if (!countryEntry) {
      const name = titleFromSlug(countrySlug);
      if (dryRun) {
        console.log(
          `🌍 [dry-run] would create Country: "${name}" (slug=${countrySlug})`,
        );
        // Synthesise a placeholder so the city loop can still process subfolders.
        countryEntry = { sys: { id: `__dryrun__${countrySlug}` } };
      } else {
        try {
          countryEntry = await env.createEntry("country", {
            fields: {
              name: { [locale]: name },
              slug: { [locale]: countrySlug },
            },
          });
          countryBySlug.set(countrySlug, countryEntry);
          countryById.set(countryEntry.sys.id, countryEntry);
          console.log(
            `🌍 ✅ Created Country: "${name}" (slug=${countrySlug}) → ${countryEntry.sys.id} (draft)`,
          );
          countriesCreated++;
        } catch (e) {
          console.error(
            `🌍 ❌ Failed to create Country ${countrySlug}: ${e.message.split("\n")[0]}`,
          );
          errors++;
          continue;
        }
      }
    } else {
      console.log(`🌍 ${countrySlug} (exists)`);
    }

    const countryPath = join(absInput, countrySlug);
    const citySlugs = await listSubdirs(countryPath);
    for (const citySlug of citySlugs) {
      const key = `${countrySlug}/${citySlug}`;
      if (cityKeys.has(key)) {
        console.log(`   📍 ${citySlug} (exists)`);
        continue;
      }
      const name = titleFromSlug(citySlug);
      if (dryRun) {
        console.log(
          `   📍 [dry-run] would create City: "${name}" (slug=${citySlug}) → ${countrySlug}`,
        );
        cityKeys.add(key);
        continue;
      }
      try {
        const city = await env.createEntry("city", {
          fields: {
            name: { [locale]: name },
            slug: { [locale]: citySlug },
            country: {
              [locale]: {
                sys: {
                  type: "Link",
                  linkType: "Entry",
                  id: countryEntry.sys.id,
                },
              },
            },
          },
        });
        cityKeys.add(key);
        console.log(
          `   📍 ✅ Created City: "${name}" (slug=${citySlug}) → ${city.sys.id} (draft)`,
        );
        citiesCreated++;
      } catch (e) {
        console.error(
          `   📍 ❌ Failed to create City ${citySlug}: ${e.message.split("\n")[0]}`,
        );
        errors++;
      }
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Done.${dryRun ? " (dry run, no writes)" : ""}`);
  console.log(`Countries created: ${countriesCreated}`);
  console.log(`Cities created:    ${citiesCreated}`);
  console.log(`Errors:            ${errors}`);
  if (countriesCreated + citiesCreated > 0 && !dryRun) {
    console.log("\n💡 New entries are saved as DRAFTS. Open them in Contentful");
    console.log("   to add countryCode / flagImage / description, then publish.");
  }
  if (errors > 0) process.exit(1);
}

main().catch((e) => {
  console.error(`\nFatal: ${e.stack ?? e.message}`);
  process.exit(1);
});
