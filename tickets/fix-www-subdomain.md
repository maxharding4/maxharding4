# Fix www.maxharding4.com — broken, possible subdomain-takeover vector

**Type:** Task · **Status:** To Do · **Area:** Hosting / DNS · **Priority:** Medium

## Problem

`www.maxharding4.com` is misconfigured. It resolves (to CloudFront IPs, valid cert)
but every request returns an S3 error:

```
HTTP/2 404
x-amz-error-code: NoSuchBucket
x-amz-error-message: The specified bucket does not exist
x-amz-error-detail-bucketname: www.maxharding4.com
```

So `www` is routed to S3 by the bucket name `www.maxharding4.com`, and that bucket
doesn't exist. Two issues:

1. **It's broken.** Visitors typing `www.` get an S3 error page instead of the site.
   The apex `maxharding4.com` works fine; `www` should redirect to it.
2. **Potential subdomain takeover.** S3 bucket names are a single global namespace,
   so `www.maxharding4.com` is claimable by anyone. If the `www` routing resolves by
   bucket name (the `NoSuchBucket`/`bucketname` error strongly implies it does), an
   attacker who creates that bucket could serve arbitrary content under
   `www.maxharding4.com` — phishing/brand abuse under a subdomain that looks like yours.

## Investigate first (AWS console)

The apex is fronted by CloudFront with a cert valid for `www` too, so the exact
`www` path isn't fully determinable from outside. Before changing anything, confirm
in the console:

- Route 53 (or wherever DNS lives): what does the `www` record point to — a
  CloudFront distribution, or an S3 website endpoint directly?
- CloudFront: is `www.maxharding4.com` an alternate domain name (CNAME) on the apex
  distribution, or a separate distribution? What origin does it use?

That determines which fix below applies.

## Fix (pick per findings)

- **If `www` isn't wanted at all:** delete the `www` DNS record. Simplest; removes
  the takeover surface entirely.
- **If `www` should redirect to apex (recommended):** create an S3 bucket named
  `www.maxharding4.com` configured for **redirect all requests** to
  `https://maxharding4.com`, and point `www` at it (or add `www` as a CloudFront
  alias with a redirect function). Creating the bucket yourself also removes the
  takeover risk, since the name is then owned.
- Either way, once the OAC hardening lands (`harden-cloudfront-oac.md`), keep the
  `www` handling consistent with the private-bucket model.

## Acceptance Criteria

- [x] Confirmed in-console how `www` is currently routed (DNS target + CloudFront config).
      `www` A/AAAA alias → a **separate** CloudFront distribution `d22txfdj4mne1w`
      whose origin was `www.maxharding4.com.s3-website.eu-west-2.amazonaws.com` — a
      bucket that didn't exist (hence `NoSuchBucket`).
- [x] `https://www.maxharding4.com/` 301-redirects to `https://maxharding4.com/`
      (path preserved: `/cookbook/` → `/cookbook/`). No more `NoSuchBucket` page.
- [x] No claimable S3 bucket name is left dangling. **Fixed 2026-07-13** by creating
      the `www.maxharding4.com` bucket (eu-west-2) with static-website hosting set to
      "redirect all requests to `maxharding4.com`, https". This both claims the name
      (closing the takeover vector) and makes the existing distribution serve the
      redirect — no DNS, cert, or distribution changes needed.

**Status: Done.** Kept apex as canonical, `www` redirects (decided 2026-07-13).

## Notes

- Low urgency for the *broken* aspect (apex works), but the **takeover** aspect is
  the reason this isn't purely cosmetic — worth closing sooner rather than later.
- Found by the external security assessment on 2026-07-13.
