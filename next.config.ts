import type { NextConfig } from "next";

/**
 * Security Headers Configuration
 * Implements OWASP security best practices and Content Security Policy
 *
 * NOTE: These headers are defined here for documentation and future use.
 * With static export (output: 'export'), headers must be configured on the
 * hosting platform (Vercel, Netlify, etc.) via their configuration files:
 * - Vercel: vercel.json
 * - Netlify: netlify.toml or _headers file
 * - See SECURITY.md for hosting-specific configuration examples
 */
export const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://cdn.contentful.com https://images.ctfassets.net",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  // Static HTML export to S3. See CONTENTFUL.md / SECURITY.md — content is
  // fetched at build time and there are no server/runtime features.
  output: "export",
  images: {
    // Next's default image optimizer needs a running server, which a static
    // export doesn't have. Serve the Contentful-hosted images as-is (they're
    // already resized on upload) instead of optimizing at request time.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
