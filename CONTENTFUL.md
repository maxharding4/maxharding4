# Contentful Integration Documentation

## Overview

This project uses Contentful as a headless CMS to manage and deliver content. The integration uses the Contentful JavaScript SDK with the Content Delivery API for fetching published content.

## Setup

### 1. Install Dependencies

The Contentful SDK is already installed:

```bash
npm install contentful
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root (use `.env.local.example` as a template):

```env
CONTENTFUL_SPACE_ID=your_space_id_here
CONTENTFUL_ACCESS_TOKEN=your_access_token_here
CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_preview_token_here  # Optional
CONTENTFUL_PREVIEW_MODE=false  # Optional
```

**How to get these values:**
1. Log in to [Contentful](https://app.contentful.com/)
2. Navigate to your space
3. Go to Settings → API keys
4. Create a new API key or use an existing one
5. Copy the Space ID and Content Delivery API access token

### 3. Security Best Practices

- ✅ **Never commit API tokens** to version control
- ✅ `.env.local` is already in `.gitignore`
- ✅ Use **Content Delivery API** (read-only) for the public-facing site
- ✅ Only use **Content Preview API** for draft content in development
- ❌ **Never expose** API tokens in client-side code

## Usage

### Basic Client Usage

```typescript
import { contentfulClient } from "@/lib/contentful";

// The client is automatically configured using environment variables
```

### Fetch a Single Entry

```typescript
import { getEntry } from "@/lib/contentful";

const entry = await getEntry<YourContentType>("entry-id");
if (entry) {
  console.log(entry.fields);
}
```

### Fetch Entries by Content Type

```typescript
import { getEntriesByType, parseEntries } from "@/lib/contentful";

const entries = await getEntriesByType<YourContentType>("contentTypeId", {
  limit: 10,
  order: "-sys.createdAt",
});

const items = parseEntries(entries);
```

### Fetch All Entries with Filtering

```typescript
import { getAllEntries } from "@/lib/contentful";

const entries = await getAllEntries({
  "fields.category": "blog",
  limit: 20,
});
```

## API Rate Limits

### Content Delivery API (Production)

- **Rate Limit**: 78 requests per second
- **Burst**: Up to 216 requests per second for short periods
- **Recommendation**: Implement caching to stay well below limits

### Content Preview API (Development)

- **Rate Limit**: 14 requests per second
- **Burst**: Up to 40 requests per second for short periods
- **Recommendation**: Use sparingly, primarily for preview features

### Best Practices for Rate Limiting

1. **Cache responses** at build time using Next.js Static Generation
2. **Use incremental static regeneration** (ISR) if you need periodic updates
3. **Implement request batching** when fetching multiple related entries
4. **Monitor usage** in Contentful dashboard

## Caching Strategy

### For Static Export (Current Setup)

Since this project uses `output: 'export'` for static site generation:

1. **Build-time fetching**: All content is fetched during `next build`
2. **No runtime API calls**: Content is baked into static HTML
3. **Manual rebuilds**: Run `npm run build` to fetch latest content
4. **Zero rate limit concerns**: API is only called during builds

### Example: Static Page with Contentful Content

```typescript
// app/blog/page.tsx
import { getEntriesByType, parseEntries } from "@/lib/contentful";

export default async function BlogPage() {
  const entries = await getEntriesByType("blogPost", {
    order: "-sys.createdAt",
  });

  const posts = parseEntries(entries);

  return (
    <div>
      {posts.map((post) => (
        <article key={post.slug}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Recommended Caching Approach

For future enhancements if moving to dynamic rendering:

```typescript
// Enable Next.js caching with revalidation
export const revalidate = 3600; // Revalidate every hour

// Or use on-demand revalidation via webhooks
```

## Content Modeling Tips

1. **Create clear content types** with descriptive field names
2. **Use references** to link related content
3. **Add validations** in Contentful to ensure data quality
4. **Use Rich Text** for flexible content formatting
5. **Tag content** for easier filtering and organization

## Troubleshooting

### Error: "CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN must be set"

- Ensure `.env.local` exists and contains the required variables
- Restart the development server after adding environment variables

### Error: "The access token you sent could not be found"

- Verify the access token is correct
- Ensure you're using the Content Delivery API token (not Management API)
- Check that the token hasn't been deleted or regenerated in Contentful

### Preview Mode Not Working

- Ensure `CONTENTFUL_PREVIEW_ACCESS_TOKEN` is set
- Set `CONTENTFUL_PREVIEW_MODE=true` in `.env.local`
- Verify the preview token is for the Content Preview API

## Resources

- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [Contentful JavaScript SDK](https://github.com/contentful/contentful.js)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Content Delivery API Reference](https://www.contentful.com/developers/docs/references/content-delivery-api/)
