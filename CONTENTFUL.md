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
| flagImage | Asset | No | Flag image |
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

## Resources

- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [Contentful JS SDK](https://github.com/contentful/contentful.js)
- [Content Delivery API Reference](https://www.contentful.com/developers/docs/references/content-delivery-api/)
