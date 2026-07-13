# Design a custom, on-brand 404 page

**Type:** Task · **Status:** To Do · **Area:** Frontend (`src/app/`) · **Priority:** Low

## Objective

Replace the generic Next.js 404 body with a bespoke, on-brand not-found page that
helps a lost visitor get back into the site.

## Current state (2026-07-13)

- No `src/app/not-found.tsx` exists — the site uses Next's App Router **default 404**.
- The generated `/404.html` **already carries full site chrome** (header, nav, footer,
  fonts, background) because the root layout wraps it. So it's not unstyled — only the
  middle message is generic: *"404 | This page could not be found."*
- CloudFront now serves this `/404.html` for `403`/`404` errors (custom error
  responses added during the OAC hardening), so a missing page shows the site-styled
  404 rather than a raw S3 error. **The plumbing is done; this ticket is purely the
  design/copy of the message body.**

## Scope

- Add `src/app/not-found.tsx` — a styled component rendered inside the existing layout.
- Content ideas: a friendly headline, a short line of copy, and clear links back into
  the site (Home, Travel gallery, Cookbook). Consider a relevant image/illustration.
- Keep it consistent with the existing page styling (Tailwind, the `heading-hero` /
  `page-canvas` conventions used elsewhere).

## Acceptance Criteria

- [ ] `src/app/not-found.tsx` renders a custom 404 with navigation back into the site.
- [ ] `/404.html` in the static export shows the new content (still wrapped in site chrome).
- [ ] A missing URL on the live site (e.g. `/nope/`) shows the styled page and returns
      HTTP 404 (CloudFront error responses already map 403/404 → `/404.html`).
- [ ] `npm run lint`, type-check, and tests pass.

## Notes

- Small, self-contained frontend change — needs a rebuild + manual deploy to go live.
- No infra changes required; the CloudFront custom error responses are already in place.
