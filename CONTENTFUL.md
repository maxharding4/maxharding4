# Contentful CMS Documentation

## Quick Start

### 1. Get API Credentials

1. Log in to [Contentful](https://app.contentful.com/)
2. Navigate to Settings → API keys
3. Copy your Space ID and Content Delivery API token

### 2. Configure Environment

Create `.env.local` (use `.env.local.example` as template):

```env
CONTENTFUL_SPACE_ID=your_space_id_here
CONTENTFUL_ACCESS_TOKEN=your_access_token_here
```

**Security**: Never commit `.env.local` - it's already gitignored.

### 3. Usage in Code

```typescript
import { getEntriesByType, parseEntries } from "@/lib/contentful";

const entries = await getEntriesByType("country", {
  order: "-sys.createdAt",
});
const countries = parseEntries(entries);
```

## Content Models

This project uses these Contentful content types:

### Country (`country`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | Text | Yes | Country/region name (e.g., "Italy", "Scotland") |
| countryCode | Text | No* | ISO 3166-1 or 3166-2 code (e.g., "IT", "GB-SCT") |
| flagImage | Asset | **Yes (to publish)** | 512×512 flag PNG; rendered on country cards. Required to publish the entry |
| description | Long text | No | Country description |
| slug | Text | Yes | URL identifier (e.g., "italy") |

*Unique when provided

**Country Code Format:**
- Whole countries: `IT`, `ES`, `FR`, `JP` (ISO 3166-1)
- Subdivisions: `GB-ENG`, `GB-SCT`, `US-CA` (ISO 3166-2)

Examples:
```
Italy: IT
Scotland: GB-SCT
Wales: GB-WLS
California: US-CA
```

### City (`city`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | Text | Yes | City name |
| country | Reference | Yes | Link to Country |
| description | Long text | No | City description |
| slug | Text | Yes | URL identifier |
| visitDate | Date | No | Visit date |

### Photo (`photo`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | Text | No | Photo title |
| image | Asset | Yes | Photo file (1920px width recommended) |
| city | Reference | Yes | Link to City |
| caption | Long text | No | Photo description |
| dateTaken | Date | No | Date taken |
| altText | Text | Yes | Accessibility description |
| displayOrder | Integer | No | Sort order |

## Creating Content Models

1. Go to Content model in Contentful
2. Click "Add content type"
3. Add fields matching the tables above
4. Set slug fields as "Unique"
5. Set display fields: `name` for Country/City, `title` for Photo

## Static Export Behavior

This site uses `output: 'export'` which means:
- ✅ Content fetched during `npm run build`
- ✅ No API calls at runtime (zero rate limit concerns)
- ⚠️ Manual rebuild needed to update content
- ⚠️ No ISR or revalidation (static HTML only)

To update content: `npm run build` after editing in Contentful.

## Rate Limits

Only relevant during builds:
- Content Delivery API: 78 req/sec (burst: 216 req/sec)
- Content Preview API: 14 req/sec (burst: 40 req/sec)

Static export typically makes 10-50 API calls per build.

## Troubleshooting

**Error: "CONTENTFUL_SPACE_ID must be set"**
- Check `.env.local` exists and has correct values
- Restart dev server after adding variables

**Error: "Access token not found"**
- Verify you're using Content Delivery API token (not Management API)
- Check token hasn't been regenerated in Contentful

## Creating Countries & Cities

Before uploading photos for new locations, make sure the Country and City
entries exist. `scripts/create-locations.mjs` reads the same folder layout
the photo uploader uses and creates any missing entries as **drafts**.

```bash
# Preview what would be created (no writes)
node --env-file=.env.local scripts/create-locations.mjs ./photos/pre-processed --dry-run

# Real run
node --env-file=.env.local scripts/create-locations.mjs ./photos/pre-processed
```

Behaviour:
- **Drafts, not published.** Auto-created entries are minimal. Open each
  one in Contentful to fill in optional fields like `countryCode`,
  `description` (countries) or `visitDate` (cities), then publish.
- **Flags auto-attached.** For each new country the script looks for
  `assets/flags/<slug>.png` (a committed 512×512 flag pack), uploads it as
  an Asset, and links it to the required `flagImage` field — so the draft
  is publish-ready. If no matching flag file exists the country is created
  without a flag and prints a warning (it can't be published until a flag
  is added).
- **`name` derived from slug.** `cair-paravel` → "Cair Paravel". Rename
  in the UI if you want something different.
- **Idempotent.** Re-running reports existing slugs as `(exists)` and only
  creates the gaps.
- **City references can point to draft Countries.** Contentful allows this;
  just remember to publish the Country before the City.

## Batch Uploading Photos

Use `scripts/upload-to-contentful.mjs` to bulk-upload processed photos. It walks
`<input-dir>/<countrySlug>/<citySlug>/*.{jpg,jpeg,png,webp}`, uploads each file as an
Asset, applies `country-<slug>` and `city-<slug>` tags, and appends the asset to the
matching City entry's `photos` field.

```bash
# 1. Add a Content Management API token to .env.local
#    (create one at https://app.contentful.com/account/profile/cma_tokens)
echo "CONTENTFUL_PHOTO_UPLOADER_TOKEN=CFPAT-..." >> .env.local

# 2. Dry-run first to verify what will be uploaded
node --env-file=.env.local scripts/upload-to-contentful.mjs ./photos/processed --dry-run

# 3. Real run
node --env-file=.env.local scripts/upload-to-contentful.mjs ./photos/processed
```

Behaviour:
- **Idempotent** — files whose `fileName` already exists on the target city's `photos`
  array are skipped, so re-runs are safe.
- **Append-only** — never replaces existing photos on a city.
- **Missing city** — folders that don't match any City entry's slug are reported and
  skipped (no auto-create).
- **Sequential** — uploads one file at a time, well within CMA rate limits.

## Resources

- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [Contentful JS SDK](https://github.com/contentful/contentful.js)
- [Content Delivery API Reference](https://www.contentful.com/developers/docs/references/content-delivery-api/)
