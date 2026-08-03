#!/usr/bin/env node
// Attach photos to imageless recipe entries and publish them.
//
// Companion to create-recipe.mjs --draft: drafts are created without an
// image while photos are pending; once a processed photo exists at
// photos/processed/cookbook/<slug>.jpg this script uploads it, links it,
// and publishes the entry (also pre-warming the site's image derivatives).
//
// Finds work automatically: every recipe entry without an image field whose
// slug has a matching processed photo. Entries without a matching photo are
// listed and left untouched. Idempotent — entries that already have an
// image are never modified.
//
// Usage:
//   node --env-file=.env.local scripts/attach-recipe-images.mjs [--dry-run]
//
// Required env (typically in .env.local):
//   CONTENTFUL_SPACE_ID
//   CONTENTFUL_PHOTO_UPLOADER_TOKEN   Personal Access Token (CMA)
//   CONTENTFUL_ENVIRONMENT            Optional, default "master"

import { createClient } from "contentful-management";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROCESSED_DIR = join(REPO_ROOT, "photos", "processed", "cookbook");
const LOCALE = "en-US";

const dryRun = process.argv.includes("--dry-run");

const {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_PHOTO_UPLOADER_TOKEN,
  CONTENTFUL_ENVIRONMENT = "master",
} = process.env;
if (!CONTENTFUL_SPACE_ID) {
  console.error("❌ CONTENTFUL_SPACE_ID not set");
  process.exit(1);
}
if (!CONTENTFUL_PHOTO_UPLOADER_TOKEN) {
  console.error("❌ CONTENTFUL_PHOTO_UPLOADER_TOKEN not set");
  process.exit(1);
}

const cma = createClient(
  { accessToken: CONTENTFUL_PHOTO_UPLOADER_TOKEN },
  {
    type: "plain",
    defaults: { spaceId: CONTENTFUL_SPACE_ID, environmentId: CONTENTFUL_ENVIRONMENT },
  }
);

const { items } = await cma.entry.getMany({
  query: { content_type: "recipe", limit: 200, order: "fields.slug" },
});

const imageless = items.filter((e) => !e.fields.image);
if (imageless.length === 0) {
  console.log("✔ Every recipe entry already has an image — nothing to do.");
  process.exit(0);
}

const ready = [];
const waiting = [];
for (const entry of imageless) {
  const slug = entry.fields.slug[LOCALE];
  const photo = join(PROCESSED_DIR, `${slug}.jpg`);
  (existsSync(photo) ? ready : waiting).push({ entry, slug, photo });
}

if (waiting.length > 0) {
  console.log(`⏳ ${waiting.length} imageless entr${waiting.length === 1 ? "y" : "ies"} still waiting for a photo:`);
  for (const { slug } of waiting) console.log(`   - ${slug}`);
  console.log("");
}

if (ready.length === 0) {
  console.log("✔ No imageless entry has a matching processed photo yet — nothing to attach.");
  process.exit(0);
}

console.log(`📷 ${ready.length} entr${ready.length === 1 ? "y" : "ies"} to attach + publish${dryRun ? "  (DRY RUN)" : ""}:`);
for (const { slug } of ready) console.log(`   - ${slug}`);
console.log("");

if (dryRun) {
  console.log("[dry-run] Nothing written.");
  process.exit(0);
}

for (const { entry: found, slug, photo } of ready) {
  const title = found.fields.title[LOCALE];
  let entry = found;

  let asset = await cma.asset.createFromFiles(
    {},
    {
      fields: {
        title: { [LOCALE]: title },
        file: {
          [LOCALE]: {
            contentType: "image/jpeg",
            fileName: `${slug}.jpg`,
            file: await readFile(photo),
          },
        },
      },
    }
  );
  asset = await cma.asset.processForAllLocales({}, asset);
  asset = await cma.asset.publish({ assetId: asset.sys.id }, asset);

  entry.fields.image = {
    [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: asset.sys.id } },
  };
  entry = await cma.entry.update({ entryId: entry.sys.id }, entry);
  entry = await cma.entry.publish({ entryId: entry.sys.id }, entry);
  console.log(`✔ ${title} → asset ${asset.sys.id} attached, entry ${entry.sys.id} PUBLISHED`);

  // Pre-warm the derivatives the site requests — params mirror the cardThumb
  // and recipeHero presets in src/lib/images.ts (same as create-recipe.mjs).
  const fileUrl = asset.fields?.file?.[LOCALE]?.url;
  if (fileUrl) {
    const base = fileUrl.startsWith("http") ? fileUrl : `https:${fileUrl}`;
    const results = await Promise.allSettled(
      [`${base}?w=600&q=55&fm=webp`, `${base}?w=1536&q=75&fm=webp`].map((u) => fetch(u))
    );
    const warmed = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
    console.log(`  🔥 Pre-warmed ${warmed}/2 image derivatives.`);
  }
}

console.log(`\n💡 The site is static — run the deploy workflow to publish it.`);
process.exit(0);
