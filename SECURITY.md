# Security

## Overview

This is a static site (`output: 'export'`) with limited security concerns:
- ✅ No server-side code execution
- ✅ No database
- ✅ Pre-rendered static HTML

## HTTPS Requirements

**Critical**: Your hosting platform must enforce HTTPS with a valid SSL/TLS certificate.

Recommended platforms (handle HTTPS automatically):
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages (with custom domain)

## Environment Variables

- ✅ Never commit `.env.local` (already gitignored)
- ✅ Never expose API tokens in client code
- ✅ Use Content Delivery API (read-only) for public site

## Dependencies

Run regular security audits:

```bash
npm audit
npm audit fix  # Auto-fix vulnerabilities
```

Current status: ✅ No known vulnerabilities

## Content Security

React's built-in XSS protection handles most concerns. Contentful content is trusted CMS content.

## Testing

```bash
npm test          # Run all tests
npm run lint      # Static analysis
npm audit         # Security audit
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [SecurityHeaders.com](https://securityheaders.com)

**Last Updated**: 2026-01-06
