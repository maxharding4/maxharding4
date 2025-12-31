# Security Documentation

## Overview

This document outlines the security measures implemented in this Next.js application, following OWASP best practices and industry standards.

## Security Headers

All pages are configured with comprehensive security headers through `next.config.ts`:

### Content Security Policy (CSP)

Restricts resources the browser can load, preventing XSS attacks:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://cdn.contentful.com https://images.ctfassets.net;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
```

**Note**: `unsafe-inline` and `unsafe-eval` are currently enabled for Next.js compatibility. For production, consider implementing nonces or hashes for inline scripts.

### Additional Security Headers

- **X-Frame-Options**: `DENY` - Prevents clickjacking attacks
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **Permissions-Policy**: Restricts browser features (camera, microphone, geolocation)
- **Strict-Transport-Security**: `max-age=31536000; includeSubDomains` - Enforces HTTPS
- **X-XSS-Protection**: `1; mode=block` - Enables browser XSS protection

## Security Utilities

The `src/lib/security.ts` module provides functions to prevent common vulnerabilities:

### XSS Prevention

```typescript
import { sanitizeHtml, escapeHtml } from '@/lib/security';

// Remove dangerous HTML tags and attributes
const safe = sanitizeHtml(userInput);

// Escape special characters for text content
const escaped = escapeHtml(userInput);
```

### URL Validation

```typescript
import { sanitizeUrl } from '@/lib/security';

// Validate and sanitize URLs
const safeUrl = sanitizeUrl(url, ['example.com', 'trusted.com']);
```

### Input Validation

```typescript
import { isValidEmail, validateNoSqlInjection } from '@/lib/security';

// Email validation
if (isValidEmail(email)) {
  // Process email
}

// SQL injection detection (basic check)
if (validateNoSqlInjection(input)) {
  // Input appears safe
}
```

### File Upload Validation

```typescript
import { validateFileUpload } from '@/lib/security';

const result = validateFileUpload(
  file,
  ['image/jpeg', 'image/png'],
  5 * 1024 * 1024 // 5MB
);

if (result.valid) {
  // Process upload
} else {
  console.error(result.error);
}
```

### Rate Limiting (Client-Side)

```typescript
import { checkRateLimit } from '@/lib/security';

if (checkRateLimit('api-call', 10, 60000)) {
  // Allow request (max 10 per minute)
} else {
  // Rate limit exceeded
}
```

### Contentful Content Sanitization

```typescript
import { sanitizeContentfulContent } from '@/lib/security';

const safeContent = sanitizeContentfulContent(contentfulData);
```

## Environment Variables

### Security Best Practices

1. **Never commit secrets** - All sensitive data is in `.env.local` which is gitignored
2. **Use `NEXT_PUBLIC_` prefix carefully** - Only for truly public data
3. **Validate on server** - Don't trust environment variables exposed to client

### Required Environment Variables

See `.env.local.example` for a template. Required variables:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_token
```

## Dependencies Security

### Automated Checks

```bash
# Run security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for specific severity
npm audit --audit-level=moderate
```

### Dependency Management

- **Dependabot**: Automated dependency updates (configure in GitHub)
- **Lock Files**: `package-lock.json` committed to ensure consistent builds
- **Regular Updates**: Keep Next.js, React, and all dependencies up to date

### Current Status

✅ No known vulnerabilities (as of last audit)

## Static Site Security

Since this is a static export site (`output: 'export'`):

✅ **No server-side attack surface** - Static files only
✅ **No database** - No SQL injection risk
✅ **No server-side code execution** - Content is pre-built

### Remaining Concerns

⚠️ **Client-side XSS** - Mitigated with CSP and input sanitization
⚠️ **Third-party content** - Contentful content is sanitized before rendering
⚠️ **Dependency vulnerabilities** - Regular audits required

## HTTPS and Transport Security

### Hosting Requirements

- ✅ HTTPS must be enforced by hosting platform
- ✅ Valid SSL/TLS certificate required
- ✅ HSTS header configured (Strict-Transport-Security)
- ⚠️ Consider CAA DNS records for certificate authority authorization

### Recommended Hosting Platforms

All of these handle HTTPS automatically:
- Vercel
- Netlify
- GitHub Pages (with custom domain)
- Cloudflare Pages

## Testing Security

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Manual Security Testing

1. **CSP Validation**
   - Open browser console
   - Check for CSP violations
   - Test with [securityheaders.com](https://securityheaders.com)

2. **Header Verification**
   - Use [Mozilla Observatory](https://observatory.mozilla.org)
   - Test with browser DevTools Network tab

3. **Dependency Audit**
   ```bash
   npm audit
   ```

4. **Static Analysis**
   ```bash
   npm run lint
   ```

## Security Checklist

Use this checklist for regular security reviews:

### Configuration
- [ ] All security headers configured in `next.config.ts`
- [ ] CSP is as restrictive as possible
- [ ] HTTPS enforced on hosting platform
- [ ] Environment variables properly secured

### Code
- [ ] User input is validated and sanitized
- [ ] Contentful content is sanitized before rendering
- [ ] No secrets in client-side code
- [ ] All external URLs validated

### Dependencies
- [ ] `npm audit` shows no vulnerabilities
- [ ] Dependencies are up to date
- [ ] No unnecessary dependencies installed

### Build
- [ ] Static build contains no sensitive data
- [ ] Build output reviewed for security issues
- [ ] Source maps not included in production build

### Testing
- [ ] Security tests pass
- [ ] Manual security review completed
- [ ] Third-party security scan completed

## Incident Response

### If a Vulnerability is Discovered

1. **Assess Impact**
   - Determine affected versions
   - Identify potential data exposure
   - Document the vulnerability

2. **Immediate Actions**
   - Create a private security advisory
   - Develop and test a fix
   - Update dependencies if applicable

3. **Deployment**
   - Deploy fix to production immediately
   - Notify affected users if necessary
   - Document the incident

4. **Post-Incident**
   - Conduct a retrospective
   - Update security practices
   - Add tests to prevent recurrence

### Reporting Security Issues

For security concerns, contact: [Your security contact email]

## Compliance

This application follows:

- ✅ OWASP Top 10 guidelines
- ✅ Next.js security best practices
- ✅ Modern web security standards

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [SecurityHeaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)

## Updates

This security documentation should be reviewed and updated:
- When adding new features
- When updating dependencies
- At least quarterly
- After any security incident

**Last Updated**: 2025-12-31
