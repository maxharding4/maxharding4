#!/usr/bin/env node
// Upload processed photos to Contentful as Assets, link them to the matching
// City entry's `photos` field, and tag with country-<slug> + city-<slug>.
//
// Expected input layout (mirrors what process-photos-mixed.sh produces):
//
//   <input-dir>/<countrySlug>/<citySlug>/*.{jpg,jpeg,png,webp}
//
// Usage:
//   node --env-file=.env.local scripts/upload-to-contentful.mjs <input-dir> [--dry-run]
//   node --env-file=.env.local scripts/upload-to-contentful.mjs --cleanup-drafts [--dry-run]
//   node --env-file=.env.local scripts/upload-to-contentful.mjs <input-dir> --relink [--dry-run]
//
// --cleanup-drafts deletes any unpublished Asset whose fileName matches
// the script's naming pattern (<country>-<city>-NNN.jpg). Useful for
// clearing orphans after a failed publish step.
//
// --relink rebuilds each City entry's `photos` array from the
// `city-<slug>` tag. Use this to recover after a failed linking step,
// or to repair a city whose photos array contains stale (deleted) link
// references that block future updates.
//
// Required env (typically in .env.local):
//   CONTENTFUL_SPACE_ID
//   CONTENTFUL_PHOTO_UPLOADER_TOKEN   Personal Access Token (CMA) from
//                                     https://app.contentful.com/account/profile/cma_tokens
//   CONTENTFUL_ENVIRONMENT            Optional, default "master"
//
// Safety:
//   - Idempotent: skips files whose fileName already appears on the city's photos array.
//   - Appends to `photos`; never replaces.
//   - `--dry-run` prints actions without writing anything.

import contentfulManagement from "contentful-management";
const { createClient } = contentfulManagement;
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const positional = args.filter((a) => !a.startsWith("--"));
  return {
    inputDir: positional[0],
    dryRun: flags.has("--dry-run"),
    cleanupDrafts: flags.has("--cleanup-drafts"),
    relink: flags.has("--relink"),
  };
}

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function contentTypeFor(fileName) {
  const ext = extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function listSubdirs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

async function listImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && IMAGE_EXTS.has(extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort();
}

async function ensureTag(env, id, name, cache, dryRun) {
  if (cache.has(id)) return;
  if (dryRun) {
    console.log(`   🏷️  [dry-run] would ensure tag: ${id}`);
    cache.add(id);
    return;
  }
  try {
    await env.createTag(id, name, "public");
    console.log(`   🏷️  created tag: ${id}`);
  } catch (err) {
    // Tag already exists is the common case on re-runs — verify by GET.
    try {
      await env.getTag(id);
    } catch {
      throw new Error(`Could not create or fetch tag "${id}": ${err.message}`);
    }
  }
  cache.add(id);
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

function fieldValue(entry, fieldName, locale) {
  const f = entry.fields?.[fieldName];
  if (f === undefined) return undefined;
  return f?.[locale] ?? f;
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

async function buildCityIndex(env, locale) {
  const [cities, countries] = await Promise.all([
    paginatedEntries(env, { content_type: "city" }),
    paginatedEntries(env, { content_type: "country" }),
  ]);

  const countryInfoById = new Map();
  for (const c of countries) {
    const slug = fieldValue(c, "slug", locale);
    const name = fieldValue(c, "name", locale);
    if (typeof slug === "string") {
      countryInfoById.set(c.sys.id, {
        slug,
        name: typeof name === "string" && name.trim() ? name : titleFromSlug(slug),
      });
    }
  }

  const index = new Map();
  for (const city of cities) {
    const citySlug = fieldValue(city, "slug", locale);
    const cityName = fieldValue(city, "name", locale);
    const countryLink = fieldValue(city, "country", locale);
    const countryInfo = countryInfoById.get(countryLink?.sys?.id);
    if (typeof citySlug === "string" && countryInfo) {
      index.set(`${countryInfo.slug}/${citySlug}`, {
        entry: city,
        cityName:
          typeof cityName === "string" && cityName.trim()
            ? cityName
            : titleFromSlug(citySlug),
        countryName: countryInfo.name,
      });
    }
  }
  return index;
}

async function getCityPhotoFilenames(env, city, locale) {
  const refs = city.fields?.photos?.[locale] ?? [];
  if (refs.length === 0) return new Set();
  const ids = refs.map((r) => r.sys.id);
  const filenames = new Set();
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const assets = await env.getAssets({ "sys.id[in]": chunk.join(",") });
    for (const a of assets.items) {
      const fn = a.fields?.file?.[locale]?.fileName;
      if (fn) filenames.add(fn);
    }
  }
  return filenames;
}

async function uploadOne(
  env,
  filePath,
  fileName,
  countrySlug,
  citySlug,
  cityName,
  countryName,
  locale,
  dryRun,
) {
  // Title set to a neutral city/country string to satisfy the required field
  // on the Asset content type. This happens to match the fallback alt text
  // the site uses when an asset has no title, so on-page accessibility and
  // JSON-LD remain unchanged. Override per-photo in Contentful when you
  // want a real caption.
  const title = `Photo from ${cityName}, ${countryName}`;
  const tagLinks = [
    { sys: { type: "Link", linkType: "Tag", id: `country-${countrySlug}` } },
    { sys: { type: "Link", linkType: "Tag", id: `city-${citySlug}` } },
  ];

  if (dryRun) {
    console.log(
      `      [dry-run] would upload ${fileName} ("${title}") with tags country-${countrySlug}, city-${citySlug}`,
    );
    return null;
  }

  const buffer = await readFile(filePath);
  let asset = await env.createAssetFromFiles({
    fields: {
      title: { [locale]: title },
      file: {
        [locale]: {
          contentType: contentTypeFor(fileName),
          fileName,
          file: buffer,
        },
      },
    },
  });

  // Set tags before processing so they're attached on the first published version.
  asset.metadata = { tags: tagLinks };
  asset = await asset.update();

  asset = await asset.processForAllLocales();
  asset = await asset.publish();
  return asset;
}

async function resolvableAssetIds(env, ids) {
  // Bulk-check which asset IDs still exist. Anything missing is a stale
  // link that will fail Contentful's "notResolvable" validation on write.
  const found = new Set();
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const assets = await env.getAssets({ "sys.id[in]": chunk.join(",") });
    for (const a of assets.items) found.add(a.sys.id);
  }
  return found;
}

async function appendPhotosToCity(env, cityId, newAssetIds, locale) {
  // Re-fetch to get the latest version before mutating.
  const fresh = await env.getEntry(cityId);
  const existing = fresh.fields?.photos?.[locale] ?? [];

  // Filter out unresolvable links — Contentful rejects updates that
  // include broken Asset references, even if we're not adding them.
  let cleanExisting = existing;
  if (existing.length > 0) {
    const resolvable = await resolvableAssetIds(
      env,
      existing.map((l) => l.sys.id),
    );
    cleanExisting = existing.filter((l) => resolvable.has(l.sys.id));
  }

  const links = newAssetIds.map((id) => ({
    sys: { type: "Link", linkType: "Asset", id },
  }));
  fresh.fields.photos = {
    ...(fresh.fields.photos ?? {}),
    [locale]: [...cleanExisting, ...links],
  };
  const updated = await fresh.update();
  await updated.publish();
}

async function relinkCity(env, cityInfo, citySlug, locale, dryRun) {
  // Find every published asset tagged with city-<slug>, sort by fileName
  // (which equals the upload order thanks to our naming scheme), and
  // overwrite the city's photos array. Replacing — not appending — so
  // any stale links from previous failed runs are atomically cleared.
  const tagId = `city-${citySlug}`;
  const allTagged = [];
  let skip = 0;
  const limit = 1000;
  while (true) {
    const batch = await env.getAssets({
      "metadata.tags.sys.id[in]": tagId,
      skip,
      limit,
    });
    allTagged.push(...batch.items);
    if (batch.items.length < limit) break;
    skip += limit;
  }

  const validAssets = allTagged
    .filter((a) => a.sys.publishedVersion)
    .filter((a) => NAMING_PATTERN.test(a.fields?.file?.[locale]?.fileName ?? ""))
    .sort((a, b) => {
      const fa = a.fields?.file?.[locale]?.fileName ?? "";
      const fb = b.fields?.file?.[locale]?.fileName ?? "";
      return fa.localeCompare(fb);
    });

  if (validAssets.length === 0) {
    return { linked: 0, skipped: true };
  }

  if (dryRun) {
    return { linked: validAssets.length, dryRun: true, validAssets };
  }

  const fresh = await env.getEntry(cityInfo.entry.sys.id);
  const links = validAssets.map((a) => ({
    sys: { type: "Link", linkType: "Asset", id: a.sys.id },
  }));
  fresh.fields.photos = {
    ...(fresh.fields.photos ?? {}),
    [locale]: links,
  };
  const updated = await fresh.update();
  await updated.publish();
  return { linked: validAssets.length };
}

// Pattern matches our country-city-NNN.jpg naming scheme. Anchors the
// regex tightly so unrelated user-uploaded files (e.g. "IMG-001.jpg",
// "photo.jpg") are never picked up.
const NAMING_PATTERN = /^[a-z]+(-[a-z]+)+-\d{3}\.jpg$/;

async function cleanupDrafts(env, locale, dryRun) {
  console.log(
    "🧹 Scanning for unpublished draft assets matching <country>-<city>-NNN.jpg...",
  );

  const drafts = [];
  let skip = 0;
  const limit = 1000;
  while (true) {
    const batch = await env.getAssets({ skip, limit });
    for (const a of batch.items) {
      if (a.sys.publishedVersion) continue; // Skip anything already published.
      const fileEntry = a.fields?.file?.[locale];
      const fileName = fileEntry?.fileName;
      if (fileName && NAMING_PATTERN.test(fileName)) {
        drafts.push({ asset: a, fileName });
      }
    }
    if (batch.items.length < limit) break;
    skip += limit;
  }

  console.log(`   Found ${drafts.length} matching draft(s).\n`);

  if (drafts.length === 0) return { deleted: 0, errors: 0 };

  if (dryRun) {
    for (const { fileName } of drafts) {
      console.log(`   [dry-run] would delete: ${fileName}`);
    }
    return { deleted: 0, errors: 0 };
  }

  let deleted = 0;
  let errors = 0;
  for (let i = 0; i < drafts.length; i++) {
    const { asset, fileName } = drafts[i];
    const progress = `[${i + 1}/${drafts.length}]`;
    try {
      await asset.delete();
      console.log(`   ${progress} 🗑️  ${fileName}`);
      deleted++;
    } catch (e) {
      console.error(`   ${progress} ❌ ${fileName}: ${e.message}`);
      errors++;
    }
  }
  return { deleted, errors };
}

async function main() {
  const {
    inputDir,
    dryRun,
    cleanupDrafts: cleanupMode,
    relink: relinkMode,
  } = parseArgs();
  if (!cleanupMode && !inputDir) {
    die(
      "Usage: node --env-file=.env.local scripts/upload-to-contentful.mjs <input-dir> [--dry-run]\n" +
        "       node --env-file=.env.local scripts/upload-to-contentful.mjs --cleanup-drafts [--dry-run]\n" +
        "       node --env-file=.env.local scripts/upload-to-contentful.mjs <input-dir> --relink [--dry-run]",
    );
  }
  if (cleanupMode && relinkMode) {
    die("--cleanup-drafts and --relink can't be combined.");
  }
  const absInput = cleanupMode ? null : resolve(inputDir);
  if (absInput && !existsSync(absInput)) {
    die(`Input directory not found: ${absInput}`);
  }

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

  const modeLabel = cleanupMode
    ? "draft cleanup"
    : relinkMode
      ? "city relinker"
      : "uploader";
  console.log(`🚀 Contentful ${modeLabel}${dryRun ? " (DRY RUN)" : ""}`);
  if (absInput) console.log(`   Input:       ${absInput}`);
  console.log(`   Space:       ${CONTENTFUL_SPACE_ID}`);
  console.log(`   Environment: ${CONTENTFUL_ENVIRONMENT}`);

  const client = createClient({ accessToken: CONTENTFUL_PHOTO_UPLOADER_TOKEN });
  const space = await client.getSpace(CONTENTFUL_SPACE_ID);
  const env = await space.getEnvironment(CONTENTFUL_ENVIRONMENT);

  const locales = await env.getLocales();
  const locale = locales.items.find((l) => l.default)?.code ?? "en-US";
  console.log(`   Locale:      ${locale}\n`);

  if (cleanupMode) {
    const { deleted, errors } = await cleanupDrafts(env, locale, dryRun);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Cleanup done.${dryRun ? " (dry run, no writes)" : ""}`);
    console.log(`Deleted: ${deleted}`);
    console.log(`Errors:  ${errors}`);
    process.exit(errors > 0 ? 1 : 0);
  }

  console.log("📚 Indexing existing countries and cities...");
  const cityIndex = await buildCityIndex(env, locale);
  console.log(`   ${cityIndex.size} city entr${cityIndex.size === 1 ? "y" : "ies"} mapped.\n`);

  if (relinkMode) {
    let relinkedCount = 0;
    let relinkErrors = 0;
    let relinkSkipped = 0;
    const countrySlugs = await listSubdirs(absInput);
    for (const countrySlug of countrySlugs) {
      const countryPath = join(absInput, countrySlug);
      const citySlugs = await listSubdirs(countryPath);
      for (const citySlug of citySlugs) {
        const key = `${countrySlug}/${citySlug}`;
        const cityInfo = cityIndex.get(key);
        if (!cityInfo) {
          console.log(`📍 ${key} — ⚠️  no City entry, skipping`);
          relinkSkipped++;
          continue;
        }
        try {
          const result = await relinkCity(env, cityInfo, citySlug, locale, dryRun);
          if (result.skipped) {
            console.log(
              `📍 ${key} — ⚠️  no published assets tagged city-${citySlug}, skipping (refusing to clear existing photos)`,
            );
            relinkSkipped++;
          } else if (result.dryRun) {
            console.log(`📍 ${key} — [dry-run] would set photos to ${result.linked} link(s):`);
            result.validAssets.slice(0, 3).forEach((a) =>
              console.log(`     - ${a.fields?.file?.[locale]?.fileName}`),
            );
            if (result.linked > 3) console.log(`     ... +${result.linked - 3} more`);
          } else {
            console.log(`📍 ${key} — ✅ linked ${result.linked} photo(s)`);
            relinkedCount += result.linked;
          }
        } catch (e) {
          console.error(`📍 ${key} — ❌ ${e.message.split("\n")[0]}`);
          relinkErrors++;
        }
      }
    }
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Relink done.${dryRun ? " (dry run, no writes)" : ""}`);
    console.log(`Linked:  ${relinkedCount}`);
    console.log(`Skipped: ${relinkSkipped}`);
    console.log(`Errors:  ${relinkErrors}`);
    process.exit(relinkErrors > 0 ? 1 : 0);
  }

  const countrySlugs = await listSubdirs(absInput);
  const tagCache = new Set();
  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const countrySlug of countrySlugs) {
    const countryPath = join(absInput, countrySlug);
    const citySlugs = await listSubdirs(countryPath);
    try {
      await ensureTag(env, `country-${countrySlug}`, countrySlug, tagCache, dryRun);
    } catch (e) {
      console.error(`⚠️  ${countrySlug}: ${e.message}`);
    }

    for (const citySlug of citySlugs) {
      const cityPath = join(countryPath, citySlug);
      const key = `${countrySlug}/${citySlug}`;
      const files = await listImages(cityPath);
      console.log(`📍 ${key} — ${files.length} file(s)`);

      const cityInfo = cityIndex.get(key);
      if (!cityInfo) {
        console.log(`   ⚠️  No City entry found for ${key}. Skipping.`);
        skipped += files.length;
        continue;
      }
      const { entry: cityEntry, cityName, countryName } = cityInfo;

      try {
        await ensureTag(env, `city-${citySlug}`, citySlug, tagCache, dryRun);
      } catch (e) {
        console.error(`   ⚠️  ${e.message}`);
      }

      const existing = dryRun
        ? new Set()
        : await getCityPhotoFilenames(env, cityEntry, locale);

      const newAssetIds = [];
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const filePath = join(cityPath, fileName);
        const progress = `[${i + 1}/${files.length}]`;
        if (existing.has(fileName)) {
          console.log(`   ${progress} ⏭️  ${fileName} (already on city)`);
          skipped++;
          continue;
        }
        try {
          const asset = await uploadOne(
            env,
            filePath,
            fileName,
            countrySlug,
            citySlug,
            cityName,
            countryName,
            locale,
            dryRun,
          );
          console.log(
            `   ${progress} ✅ ${fileName}${asset ? ` → ${asset.sys.id}` : ""}`,
          );
          if (asset) newAssetIds.push(asset.sys.id);
          uploaded++;
        } catch (e) {
          console.error(`   ${progress} ❌ ${fileName}: ${e.message}`);
          errors++;
        }
      }

      if (newAssetIds.length > 0 && !dryRun) {
        try {
          await appendPhotosToCity(env, cityEntry.sys.id, newAssetIds, locale);
          console.log(
            `   📎 Linked ${newAssetIds.length} asset(s) to city entry & republished.\n`,
          );
        } catch (e) {
          console.error(`   ❌ Failed to update city entry: ${e.message}\n`);
          errors++;
        }
      } else {
        console.log("");
      }
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Done.${dryRun ? " (dry run, no writes)" : ""}`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);
  if (errors > 0) process.exit(1);
}

main().catch((e) => {
  console.error(`\nFatal: ${e.stack ?? e.message}`);
  process.exit(1);
});
