#!/usr/bin/env node
// Create missing Country and City entries in Contentful from a folder tree.
//
// Walks <input-dir>/<countrySlug>/<citySlug>/ and for each slug that
// doesn't already exist as an entry, creates one with the minimum
// required fields:
//
//   Country: slug, name (title-cased from slug), flagImage (see below)
//   City:    slug, name (title-cased from slug), country reference
//
// Flags: the `country` content type REQUIRES a flagImage asset to
// publish. For each new country we look for assets/flags/<slug>.png
// (a 512×512 pack committed to the repo), upload it as an Asset, and
// attach it — so the draft is publish-ready. If the slug has no matching
// flag file, the country is still created but WITHOUT a flag; you'll need
// to add one before it can be published (a warning is printed).
//
// Entries are LEFT AS DRAFTS so you can fill in optional fields
// (countryCode, description, visitDate) in the Contentful UI before
// publishing. Drafts can be referenced by other entries — so a City
// draft can point to a Country draft — but neither will be visible to
// the site (which uses the Content Delivery API) until published.
//
// Usage:
//   node --env-file=.env.local scripts/create-locations.mjs <input-dir> [--dry-run]
//
// Required env (typically in .env.local):
//   CONTENTFUL_SPACE_ID
//   CONTENTFUL_PHOTO_UPLOADER_TOKEN   Personal Access Token (CMA)
//   CONTENTFUL_ENVIRONMENT            Optional, default "master"

import { createClient } from "contentful-management";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Flag pack lives at <repo>/assets/flags/<slug>.png — resolve relative to
// this script so it works regardless of the caller's working directory.
const FLAGS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "assets",
  "flags",
);

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

// Upload assets/flags/<slug>.png and attach it to a freshly-created country
// so the draft satisfies the required flagImage field and is publish-ready.
// Returns true if a flag was attached (or would be, in dry-run), false if no
// matching flag file exists (country is left flag-less with a warning).
async function attachCountryFlag(cma, countryEntry, countrySlug, locale, dryRun) {
  const flagPath = join(FLAGS_DIR, `${countrySlug}.png`);
  if (!existsSync(flagPath)) {
    console.log(
      `   🏳️  ⚠️  no flag file (assets/flags/${countrySlug}.png) — country has no flag and can't be published until one is added`,
    );
    return false;
  }
  if (dryRun) {
    console.log(`   🏳️  [dry-run] would upload & attach flag ${countrySlug}.png`);
    return true;
  }
  let asset = await cma.asset.createFromFiles(
    {},
    {
      fields: {
        title: { [locale]: `${titleFromSlug(countrySlug)} flag` },
        file: {
          [locale]: {
            contentType: "image/png",
            fileName: `${countrySlug}.png`,
            file: await readFile(flagPath),
          },
        },
      },
    },
  );
  asset = await cma.asset.processForAllLocales({}, asset);
  asset = await cma.asset.publish({ assetId: asset.sys.id }, asset);

  // Re-fetch the country for its latest version before linking the flag.
  const fresh = await cma.entry.get({ entryId: countryEntry.sys.id });
  fresh.fields.flagImage = {
    [locale]: { sys: { type: "Link", linkType: "Asset", id: asset.sys.id } },
  };
  await cma.entry.update({ entryId: fresh.sys.id }, fresh);
  console.log(`   🏳️  attached flag ${countrySlug}.png → ${asset.sys.id}`);
  return true;
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

async function paginatedEntries(cma, query) {
  const limit = 1000;
  const all = [];
  let skip = 0;
  while (true) {
    const batch = await cma.entry.getMany({ query: { ...query, skip, limit } });
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

  const cma = createClient(
    { accessToken: CONTENTFUL_PHOTO_UPLOADER_TOKEN },
    {
      type: "plain",
      defaults: {
        spaceId: CONTENTFUL_SPACE_ID,
        environmentId: CONTENTFUL_ENVIRONMENT,
      },
    },
  );

  const locales = await cma.locale.getMany({});
  const locale = locales.items.find((l) => l.default)?.code ?? "en-US";
  console.log(`   Locale:      ${locale}\n`);

  console.log("📚 Indexing existing countries and cities...");
  const [existingCountries, existingCities] = await Promise.all([
    paginatedEntries(cma, { content_type: "country" }),
    paginatedEntries(cma, { content_type: "city" }),
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
        await attachCountryFlag(cma, countryEntry, countrySlug, locale, true);
      } else {
        try {
          countryEntry = await cma.entry.create(
            { contentTypeId: "country" },
            {
              fields: {
                name: { [locale]: name },
                slug: { [locale]: countrySlug },
              },
            },
          );
          countryBySlug.set(countrySlug, countryEntry);
          countryById.set(countryEntry.sys.id, countryEntry);
          console.log(
            `🌍 ✅ Created Country: "${name}" (slug=${countrySlug}) → ${countryEntry.sys.id} (draft)`,
          );
          countriesCreated++;
          await attachCountryFlag(cma, countryEntry, countrySlug, locale, false);
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
        const city = await cma.entry.create(
          { contentTypeId: "city" },
          {
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
          },
        );
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
    console.log("\n💡 New entries are saved as DRAFTS. Flags are attached");
    console.log("   automatically; open them in Contentful to add optional");
    console.log("   countryCode / description / visitDate, then publish.");
  }
  if (errors > 0) process.exit(1);
}

main().catch((e) => {
  console.error(`\nFatal: ${e.stack ?? e.message}`);
  process.exit(1);
});
