#!/usr/bin/env node
// Create + publish a cookbook recipe entry (and its photo) in Contentful
// from a recipe source file. Replaces the per-recipe one-off scripts.
//
// Sources (auto-detected by extension):
//   *.md     Personal recipe format (~/repos/personal/assistant/recipes/):
//            "# Title", optional intro paragraph, "## Ingredients" bullets
//            (with **Sauce:** / ### Sauce subsections flattened into marker
//            lines), "## Steps" numbered list, "## Notes" (printed for
//            review, never uploaded).
//   *.html   A saved recipe web page. Parses the schema.org JSON-LD Recipe
//            block (works for Waitrose, BBC Good Food, and most recipe
//            sites). Note the text is the site's copy — consider rewording.
//
// Photo: expects photos/processed/cookbook/<slug>.jpg. If only the
// pre-processed original exists, runs scripts/process-photos-mixed.sh
// first. Refuses to publish an imageless recipe.
//
// Usage:
//   node --env-file=.env.local scripts/create-recipe.mjs <source> --category <mains|sides|snacks|desserts> [options]
//
// Options:
//   --category <slug>   REQUIRED. One of: mains, sides, snacks, desserts.
//   --slug <slug>       Override the slug (default: kebab-cased title).
//                       Must match the photo filename.
//   --title <title>     Override the title (e.g. to re-case an HTML title).
//   --servings <n>      Override servings. Sets the field only — never
//                       rescales ingredient quantities.
//   --dry-run           Print the parsed entry and exit without writing.
//
// Idempotent: if a recipe with the slug already exists, reports and exits.
//
// Required env (typically in .env.local):
//   CONTENTFUL_SPACE_ID
//   CONTENTFUL_PHOTO_UPLOADER_TOKEN   Personal Access Token (CMA)
//   CONTENTFUL_ENVIRONMENT            Optional, default "master"

import { createClient } from "contentful-management";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROCESSED_DIR = join(REPO_ROOT, "photos", "processed", "cookbook");
const PRE_PROCESSED_DIR = join(REPO_ROOT, "photos", "pre-processed", "cookbook");
const CATEGORY_SLUGS = ["mains", "sides", "snacks", "desserts"];
const LOCALE = "en-US";

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

// ---------------------------------------------------------------- args

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { dryRun: false };
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--category") opts.category = args[++i];
    else if (a === "--slug") opts.slug = args[++i];
    else if (a === "--title") opts.title = args[++i];
    else if (a === "--servings") opts.servings = Number(args[++i]);
    else if (a.startsWith("--")) die(`Unknown option: ${a}`);
    else positional.push(a);
  }
  opts.source = positional[0];
  return opts;
}

function kebabCase(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------- markdown

// Sentences that are portion/nutrition metadata, not description prose.
const METADATA_SENTENCE =
  /^(serves\s+\d+|~?\d+\s*kcal.*|~?\d+g?\s*protein.*|\d+\s*min(utes)?\.?)$/i;

function parseMarkdown(src) {
  const lines = src.split("\n");
  const recipe = { ingredients: [], steps: [], notes: [] };
  let section = "intro";
  const introLines = [];

  for (const raw of lines) {
    const line = raw.trim();
    const h1 = line.match(/^#\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    const boldHeading = line.match(/^\*\*(.+?):?\*\*:?$/);

    if (h1 && !recipe.title) {
      recipe.title = h1[1].trim();
    } else if (h2) {
      const name = h2[1].trim().toLowerCase();
      if (name.startsWith("ingredient")) section = "ingredients";
      else if (name.startsWith("step") || name.startsWith("method")) section = "steps";
      else if (name.startsWith("note")) section = "notes";
      else section = "other";
    } else if (section === "ingredients" && (h3 || boldHeading)) {
      // Subsection within ingredients → flattened marker line.
      const heading = (h3 ? h3[1] : boldHeading[1]).replace(/:$/, "").trim();
      recipe.ingredients.push(
        heading.toLowerCase() === "sauce" ? "For the sauce:" : `${heading}:`
      );
    } else if (line.startsWith("- ")) {
      const item = line.slice(2).trim();
      if (section === "ingredients") recipe.ingredients.push(item);
      else if (section === "notes") recipe.notes.push(item);
      else if (section === "steps") recipe.steps.push(item);
    } else if (section === "steps" && /^\d+\.\s+/.test(line)) {
      recipe.steps.push(line.replace(/^\d+\.\s+/, "").trim());
    } else if (section === "intro" && line && !line.startsWith("#")) {
      introLines.push(line);
    }
  }

  // Intro: pull servings/times out; whatever prose remains is the description.
  const intro = introLines.join(" ");
  const servesMatch = intro.match(/serves\s+(\d+)/i);
  if (servesMatch) recipe.servings = Number(servesMatch[1]);
  const minutesMatch = intro.match(/(\d+)\s*min/i);
  if (minutesMatch) recipe.cookTimeMinutes = Number(minutesMatch[1]);

  const description = intro
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s && !METADATA_SENTENCE.test(s))
    .join(". ");
  if (description) recipe.description = `${description}.`;

  return recipe;
}

// ---------------------------------------------------------------- html (JSON-LD)

function isoDurationToMinutes(iso) {
  const m = typeof iso === "string" && iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return undefined;
  return (Number(m[1]) || 0) * 60 + (Number(m[2]) || 0) || undefined;
}

function findRecipeNode(data) {
  if (Array.isArray(data)) return data.map(findRecipeNode).find(Boolean);
  if (!data || typeof data !== "object") return null;
  const type = data["@type"];
  if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) return data;
  if (data["@graph"]) return findRecipeNode(data["@graph"]);
  return null;
}

function parseHtml(src) {
  const blocks = src.matchAll(
    /<script[^>]*application\/ld\+json[^>]*>(.*?)<\/script>/gs
  );
  let node = null;
  for (const [, block] of blocks) {
    try {
      node = findRecipeNode(JSON.parse(block.trim()));
    } catch {
      continue; // malformed block — keep looking
    }
    if (node) break;
  }
  if (!node) die("No schema.org Recipe JSON-LD found in the HTML.");

  const cleanText = (t) => t.replace(/\s*[\r\n]+\s*/g, " ").replace(/ {2,}/g, " ").trim();
  const yieldValue = Array.isArray(node.recipeYield)
    ? node.recipeYield[0]
    : node.recipeYield;
  const servings = Number(String(yieldValue ?? "").match(/\d+/)?.[0]) || undefined;

  return {
    title: cleanText(node.name ?? ""),
    description: node.description ? cleanText(node.description) : undefined,
    servings,
    prepTimeMinutes: isoDurationToMinutes(node.prepTime),
    cookTimeMinutes: isoDurationToMinutes(node.cookTime),
    ingredients: (node.recipeIngredient ?? []).map(cleanText),
    steps: (node.recipeInstructions ?? []).map((s) =>
      cleanText(typeof s === "string" ? s : (s.text ?? ""))
    ),
    notes: [],
    thirdParty: true,
  };
}

// ---------------------------------------------------------------- photo

function ensurePhoto(slug) {
  const processed = join(PROCESSED_DIR, `${slug}.jpg`);
  if (existsSync(processed)) return processed;

  const original = ["png", "jpg", "jpeg", "webp"]
    .map((ext) => join(PRE_PROCESSED_DIR, `${slug}.${ext}`))
    .find(existsSync);
  if (!original) {
    die(
      `No photo found for "${slug}".\n` +
        `   Expected ${processed}\n` +
        `   or an original at ${PRE_PROCESSED_DIR}/${slug}.{png,jpg,jpeg,webp}\n` +
        `   (--slug must match the photo filename).`
    );
  }

  console.log(`📷 Processing ${basename(original)} …`);
  execFileSync(join(REPO_ROOT, "scripts", "process-photos-mixed.sh"), [
    join(REPO_ROOT, "photos", "pre-processed"),
    join(REPO_ROOT, "photos", "processed"),
  ]);
  if (!existsSync(processed)) die(`Photo processing did not produce ${processed}.`);
  return processed;
}

function warnIfNotThreeByTwo(photoPath) {
  try {
    const dims = execFileSync("magick", ["identify", "-format", "%w %h", photoPath])
      .toString()
      .trim()
      .split(" ")
      .map(Number);
    const ratio = dims[0] / dims[1];
    if (Math.abs(ratio - 1.5) > 0.05) {
      console.warn(
        `⚠️  ${basename(photoPath)} is ${dims[0]}×${dims[1]} (${ratio.toFixed(2)}:1) — ` +
          `recipe cards use a 3:2 frame, so this photo will be cropped on cards.`
      );
    }
  } catch {
    // ImageMagick unavailable — skip the advisory check.
  }
}

// ---------------------------------------------------------------- main

const opts = parseArgs();
if (!opts.source) {
  die(
    "Usage: node --env-file=.env.local scripts/create-recipe.mjs <source.md|source.html> --category <slug> [--slug s] [--title t] [--servings n] [--dry-run]"
  );
}
if (!CATEGORY_SLUGS.includes(opts.category)) {
  die(`--category is required and must be one of: ${CATEGORY_SLUGS.join(", ")}`);
}

const sourcePath = resolve(opts.source);
if (!existsSync(sourcePath)) die(`Source not found: ${sourcePath}`);
const ext = extname(sourcePath).toLowerCase();
const src = await readFile(sourcePath, "utf-8");

const recipe = ext === ".md" ? parseMarkdown(src) : parseHtml(src);
if (opts.title) recipe.title = opts.title;
if (opts.servings) recipe.servings = opts.servings;
if (!recipe.title) die("Could not parse a title from the source.");
if (recipe.ingredients.length === 0) die("Parsed zero ingredients — check the source format.");
if (recipe.steps.length === 0) die("Parsed zero method steps — check the source format.");

const slug = opts.slug ?? kebabCase(recipe.title);

console.log(`🍳 ${recipe.title}${opts.dryRun ? "  (DRY RUN)" : ""}`);
console.log(`   Slug:     ${slug}`);
console.log(`   Category: ${opts.category}`);
console.log(
  `   Servings: ${recipe.servings ?? "—"} · Prep: ${recipe.prepTimeMinutes ?? "—"} min · Cook: ${recipe.cookTimeMinutes ?? "—"} min`
);
console.log(`   Description: ${recipe.description ?? "—"}`);
console.log(`   Ingredients (${recipe.ingredients.length}):`);
for (const i of recipe.ingredients) console.log(`     - ${i}`);
console.log(`   Method (${recipe.steps.length} steps):`);
recipe.steps.forEach((s, i) => console.log(`     ${i + 1}. ${s}`));
if (recipe.notes.length > 0) {
  console.log(`   📝 Notes (NOT uploaded — fold in manually if wanted):`);
  for (const n of recipe.notes) console.log(`     - ${n}`);
}
if (recipe.thirdParty) {
  console.log(
    `   ⚠️  Source is a third-party page — description/method are its copy verbatim; consider rewording.`
  );
}

if (opts.dryRun) {
  console.log("\n[dry-run] Nothing written.");
  process.exit(0);
}

const {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_PHOTO_UPLOADER_TOKEN,
  CONTENTFUL_ENVIRONMENT = "master",
} = process.env;
if (!CONTENTFUL_SPACE_ID) die("CONTENTFUL_SPACE_ID not set");
if (!CONTENTFUL_PHOTO_UPLOADER_TOKEN) die("CONTENTFUL_PHOTO_UPLOADER_TOKEN not set");

const cma = createClient(
  { accessToken: CONTENTFUL_PHOTO_UPLOADER_TOKEN },
  {
    type: "plain",
    defaults: { spaceId: CONTENTFUL_SPACE_ID, environmentId: CONTENTFUL_ENVIRONMENT },
  }
);

const existing = await cma.entry.getMany({
  query: { content_type: "recipe", "fields.slug": slug, limit: 1 },
});
if (existing.items.length > 0) {
  console.log(`\n✔ Recipe "${slug}" already exists (${existing.items[0].sys.id}) — nothing to do.`);
  process.exit(0);
}

const photoPath = ensurePhoto(slug);
warnIfNotThreeByTwo(photoPath);

let asset = await cma.asset.createFromFiles(
  {},
  {
    fields: {
      title: { [LOCALE]: recipe.title },
      file: {
        [LOCALE]: {
          contentType: "image/jpeg",
          fileName: `${slug}.jpg`,
          file: await readFile(photoPath),
        },
      },
    },
  }
);
asset = await cma.asset.processForAllLocales({}, asset);
asset = await cma.asset.publish({ assetId: asset.sys.id }, asset);
console.log(`\n✔ Photo asset published → ${asset.sys.id}`);

const fields = {
  title: { [LOCALE]: recipe.title },
  slug: { [LOCALE]: slug },
  category: { [LOCALE]: opts.category },
  image: { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: asset.sys.id } } },
  ingredients: { [LOCALE]: recipe.ingredients.join("\n") },
  method: { [LOCALE]: recipe.steps.join("\n\n") },
};
if (recipe.description) fields.description = { [LOCALE]: recipe.description };
if (recipe.servings) fields.servings = { [LOCALE]: recipe.servings };
if (recipe.prepTimeMinutes) fields.prepTimeMinutes = { [LOCALE]: recipe.prepTimeMinutes };
if (recipe.cookTimeMinutes) fields.cookTimeMinutes = { [LOCALE]: recipe.cookTimeMinutes };

const entry = await cma.entry.create({ contentTypeId: "recipe" }, { fields });
await cma.entry.publish({ entryId: entry.sys.id }, entry);
console.log(`✔ Recipe entry published → ${entry.sys.id} (slug: ${slug}, category: ${opts.category})`);

// Pre-warm the Contentful Images API derivatives the site will request, so the
// first visitor after a deploy doesn't hit the on-the-fly generation lag (which
// can briefly render a broken image). Params mirror the cardThumb and recipeHero
// presets in src/lib/images.ts — keep them in sync. Best-effort: a warm failure
// is non-fatal (the derivative just generates on first real request instead).
const fileUrl = asset.fields?.file?.[LOCALE]?.url;
if (fileUrl) {
  const base = fileUrl.startsWith("http") ? fileUrl : `https:${fileUrl}`;
  const derivatives = [
    `${base}?w=600&q=55&fm=webp`, // cardThumb — recipe + category cards
    `${base}?w=1536&q=75&fm=webp`, // recipeHero — detail page
  ];
  const results = await Promise.allSettled(derivatives.map((u) => fetch(u)));
  const warmed = results.filter(
    (r) => r.status === "fulfilled" && r.value.ok
  ).length;
  console.log(`🔥 Pre-warmed ${warmed}/${derivatives.length} image derivatives.`);
}

console.log(`\n💡 The site is static — run the deploy workflow to publish it.`);

// Exit explicitly: the image pre-warm uses fetch (undici), whose keepalive
// connection pool would otherwise keep the event loop alive after all the
// awaited work is done. Everything above is complete at this point.
process.exit(0);
