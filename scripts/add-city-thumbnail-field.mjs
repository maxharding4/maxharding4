#!/usr/bin/env node
// Add the optional `thumbnail` media field to the `city` content type
// (see tickets/city-thumbnail-field.md for the spec).
//
// When set, the thumbnail is the photo shown on the country-page card and in
// link previews; when empty the site falls back to the first gallery photo.
//
// Idempotent: if the field already exists the script reports it and exits.
//
// Usage:
//   node --env-file=.env.local scripts/add-city-thumbnail-field.mjs [--dry-run]
//
// Required env (typically in .env.local):
//   CONTENTFUL_SPACE_ID
//   CONTENTFUL_PHOTO_UPLOADER_TOKEN   Personal Access Token (CMA)
//   CONTENTFUL_ENVIRONMENT            Optional, default "master"

import { createClient } from "contentful-management";

const FIELD_ID = "thumbnail";

const THUMBNAIL_FIELD = {
  id: FIELD_ID,
  name: "Thumbnail",
  type: "Link",
  linkType: "Asset",
  required: false,
  validations: [{ linkMimetypeGroup: ["image"] }],
};

const HELP_TEXT =
  "Photo shown on the country page card (and link previews). " +
  "Leave empty to use the first gallery photo.";

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

let city;
try {
  city = await client.contentType.get({ ...scope, contentTypeId: "city" });
} catch {
  die(`Content type "city" not found in ${CONTENTFUL_SPACE_ID}/${CONTENTFUL_ENVIRONMENT}`);
}

if (city.fields.some((f) => f.id === FIELD_ID)) {
  console.log(`✔ Field "${FIELD_ID}" already exists on "city" — nothing to do.`);
  process.exit(0);
}

if (dryRun) {
  console.log(
    `[dry-run] Would append optional field "${FIELD_ID}" (Link<Asset>, image-only) to "city" and publish.`,
  );
  console.log(`[dry-run] Would set help text: "${HELP_TEXT}"`);
  process.exit(0);
}

city.fields.push(THUMBNAIL_FIELD);
const updated = await client.contentType.update(
  { ...scope, contentTypeId: "city" },
  city,
);
await client.contentType.publish({ ...scope, contentTypeId: "city" }, updated);
console.log(
  `✔ Added field "${FIELD_ID}" to "city" and published (${updated.fields.length} fields total).`,
);

const editorInterface = await client.editorInterface.get({
  ...scope,
  contentTypeId: "city",
});
const controls = editorInterface.controls ?? [];
const control = controls.find((c) => c.fieldId === FIELD_ID);
if (control) {
  control.settings = { ...control.settings, helpText: HELP_TEXT };
} else {
  controls.push({
    fieldId: FIELD_ID,
    widgetId: "assetLinkEditor",
    settings: { helpText: HELP_TEXT },
  });
}
editorInterface.controls = controls;
await client.editorInterface.update(
  { ...scope, contentTypeId: "city" },
  editorInterface,
);
console.log(`✔ Set help text on "${FIELD_ID}".`);
