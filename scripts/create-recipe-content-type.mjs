#!/usr/bin/env node
// Create the `recipe` content type in Contentful (see
// tickets/cookbook-recipe-content-model.md for the model spec).
//
// Categories are a validated dropdown on the recipe itself — deliberately
// NOT a separate content type. The four values (mains/sides/snacks/desserts)
// are fixed; category pages are defined in code.
//
// Idempotent: if a `recipe` content type already exists the script reports
// it and exits without touching it (no field merging/migration).
//
// Usage:
//   node --env-file=.env.local scripts/create-recipe-content-type.mjs [--dry-run]
//
// Required env (typically in .env.local):
//   CONTENTFUL_SPACE_ID
//   CONTENTFUL_PHOTO_UPLOADER_TOKEN   Personal Access Token (CMA)
//   CONTENTFUL_ENVIRONMENT            Optional, default "master"

import { createClient } from "contentful-management";

const CATEGORY_VALUES = ["mains", "sides", "snacks", "desserts"];
const KEBAB_CASE = "^[a-z0-9]+(?:-[a-z0-9]+)*$";

const RECIPE_CONTENT_TYPE = {
  name: "Recipe",
  description:
    "A cookbook recipe. Category is a fixed dropdown (mains/sides/snacks/desserts); category pages are defined in code, not in Contentful.",
  displayField: "title",
  fields: [
    { id: "title", name: "Title", type: "Symbol", required: true },
    {
      id: "slug",
      name: "Slug",
      type: "Symbol",
      required: true,
      validations: [
        { unique: true },
        {
          regexp: { pattern: KEBAB_CASE },
          message: "Use kebab-case, e.g. lemon-drizzle-cake",
        },
      ],
    },
    {
      id: "category",
      name: "Category",
      type: "Symbol",
      required: true,
      validations: [{ in: CATEGORY_VALUES }],
    },
    { id: "description", name: "Description", type: "Text" },
    {
      id: "image",
      name: "Image",
      type: "Link",
      linkType: "Asset",
      validations: [{ linkMimetypeGroup: ["image"] }],
    },
    { id: "ingredients", name: "Ingredients", type: "Text", required: true },
    { id: "method", name: "Method", type: "Text", required: true },
    { id: "servings", name: "Servings", type: "Integer" },
    { id: "prepTimeMinutes", name: "Prep time (minutes)", type: "Integer" },
    { id: "cookTimeMinutes", name: "Cook time (minutes)", type: "Integer" },
  ],
};

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");

const {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_PHOTO_UPLOADER_TOKEN,
  CONTENTFUL_ENVIRONMENT = "master",
} = process.env;

if (!CONTENTFUL_SPACE_ID) die("CONTENTFUL_SPACE_ID not set");
if (!CONTENTFUL_PHOTO_UPLOADER_TOKEN) {
  die(
    "CONTENTFUL_PHOTO_UPLOADER_TOKEN not set. Create one at https://app.contentful.com/account/profile/cma_tokens",
  );
}

const client = createClient(
  { accessToken: CONTENTFUL_PHOTO_UPLOADER_TOKEN },
  { type: "plain" },
);
const scope = {
  spaceId: CONTENTFUL_SPACE_ID,
  environmentId: CONTENTFUL_ENVIRONMENT,
};

let existing = null;
try {
  existing = await client.contentType.get({
    ...scope,
    contentTypeId: "recipe",
  });
} catch {
  // 404 — doesn't exist yet, which is what we want
}

if (existing) {
  console.log(
    `✔ Content type "recipe" already exists (${existing.sys.publishedVersion ? "published" : "draft"}) — nothing to do.`,
  );
  process.exit(0);
}

if (dryRun) {
  console.log("[dry-run] Would create + publish content type \"recipe\":");
  for (const f of RECIPE_CONTENT_TYPE.fields) {
    console.log(
      `  - ${f.id} (${f.type}${f.linkType ? `<${f.linkType}>` : ""})${f.required ? " required" : ""}`,
    );
  }
  process.exit(0);
}

const created = await client.contentType.createWithId(
  { ...scope, contentTypeId: "recipe" },
  RECIPE_CONTENT_TYPE,
);
await client.contentType.publish({ ...scope, contentTypeId: "recipe" }, created);
console.log(
  `✔ Created and published content type "recipe" in ${CONTENTFUL_SPACE_ID}/${CONTENTFUL_ENVIRONMENT} (${RECIPE_CONTENT_TYPE.fields.length} fields).`,
);
console.log(
  "  Category dropdown values: " + CATEGORY_VALUES.join(", "),
);
