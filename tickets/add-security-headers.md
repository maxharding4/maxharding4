# Add security response headers via CloudFront

**Type:** Task · **Status:** To Do · **Area:** Hosting / infra · **Priority:** Low

## Problem

Responses from `maxharding4.com` carry **no security headers** — an external review
found none of HSTS, Content-Security-Policy, X-Content-Type-Options, X-Frame-Options,
Referrer-Policy, or Permissions-Policy.

Impact is limited for a static, no-auth site, but one gap is worth closing:

- **HSTS is missing.** There's an HTTP→HTTPS 301 redirect, but with no
  `Strict-Transport-Security` header a first-time visitor's initial HTTP request can
  still be intercepted (SSL-strip) before the redirect. HSTS tells browsers to go
  straight to HTTPS on every subsequent visit.

## Approach

Add a **CloudFront response-headers-policy** to the distribution (a managed feature —
no code, no rebuild). Suggested headers:

| Header | Value | Why |
|--------|-------|-----|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS. Add `preload` only once `www` is sorted (see `fix-www-subdomain.md`) and you're ready to commit. |
| `X-Content-Type-Options` | `nosniff` | Stop MIME-sniffing. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage. |
| `X-Frame-Options` | `DENY` | Anti-clickjacking (or use CSP `frame-ancestors`). |
| `Content-Security-Policy` | start report-only, then enforce | Tightest control; needs tuning for the GA script + Contentful image CDN. |

**CSP caveat:** the site loads Google Analytics and images from Contentful's CDN, so a
strict CSP needs those origins allow-listed (`img-src`/`connect-src` for
`images.ctfassets.net`, `script-src`/`connect-src` for the GA/gtag domains). Roll it
out as `Content-Security-Policy-Report-Only` first, watch for violations, then switch
to enforcing.

## Dependency

Best done **after** `harden-cloudfront-oac.md`. While the S3 website endpoint is
publicly reachable, these headers can be bypassed by hitting S3 directly — private
bucket + OAC is what guarantees all traffic actually goes through CloudFront and
picks up the policy.

## Acceptance Criteria

- [x] CloudFront response-headers-policy attached to the distribution.
      (`maxharding4-security-headers`, attached to the Default (*) behaviour on
      distribution `E18D7W5LICE64E`, 2026-07-13.)
- [x] `curl -sI https://maxharding4.com/` shows `Strict-Transport-Security` and
      `X-Content-Type-Options` at minimum. (Also serving `X-Frame-Options: DENY`
      and `Referrer-Policy: strict-origin-when-cross-origin`.)
- [ ] CSP (if added) verified not to break GA or Contentful images — deployed
      report-only first, then enforced. **Deferred** — CSP and HSTS `preload`
      intentionally left off this first pass (CSP needs GA + Contentful-CDN
      tuning; `preload` waits until `www` is fixed). Optional follow-up.

## Notes

- Low priority; HSTS is the highest-value item in the list.
- Found by the external security assessment on 2026-07-13.
