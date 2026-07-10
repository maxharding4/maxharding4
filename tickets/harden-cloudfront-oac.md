# Harden hosting: private S3 bucket + CloudFront Origin Access Control (OAC)

**Type:** Task · **Status:** To Do · **Area:** Hosting / infra · **Priority:** Low

## Objective

Serve `maxharding4.com` from a **private** S3 bucket that only CloudFront can read,
instead of the current public-bucket + S3-website-endpoint setup. This removes all
public access to the bucket and makes CloudFront the only way to reach the content.

## Current state (post-migration)

- CloudFront origin is the **S3 static-website endpoint**.
- The bucket `maxharding4.com` is **public-read** via a bucket policy
  (`s3:GetObject` to `Principal: "*"`), which is what a website endpoint requires.
- Anyone can therefore fetch objects directly from S3, bypassing CloudFront.

This is a standard, secure-enough setup for a public static site — but not the
gold standard. This ticket is the hardening step, not urgent.

## Target state

- Bucket is **fully private** (Block Public Access fully on, public bucket policy removed).
- CloudFront reads the bucket via **Origin Access Control (OAC)**; a bucket policy
  grants `s3:GetObject` only to the CloudFront distribution service principal
  (scoped to distribution `E18D7W5LICE64E`).
- CloudFront origin switched from the S3 **website** endpoint to the S3 **REST**
  endpoint (`maxharding4.com.s3.eu-west-2.amazonaws.com`).

## Technical Specifications

1. **Create an OAC** (CloudFront → Origin access) and attach it to the distribution's
   S3 origin; change the origin domain to the REST endpoint.
2. **Bucket policy** → replace the public-read statement with an OAC-scoped one:
   ```json
   {
     "Effect": "Allow",
     "Principal": { "Service": "cloudfront.amazonaws.com" },
     "Action": "s3:GetObject",
     "Resource": "arn:aws:s3:::maxharding4.com/*",
     "Condition": { "StringEquals": { "AWS:SourceArn": "arn:aws:cloudfront::091385753568:distribution/E18D7W5LICE64E" } }
   }
   ```
3. **Re-enable Block Public Access** on the bucket once the policy is OAC-only.
4. **Index/routing:** the REST endpoint does NOT do S3 website index-document
   resolution, so `/travel/` → `travel/index.html` no longer happens automatically.
   Add a **CloudFront Function** (viewer-request) to rewrite directory URLs to
   `…/index.html`. This replaces the behaviour we currently get for free from the
   website endpoint (we already ship folder-style routes via `trailingSlash`).
5. Verify custom error handling (`404.html`) still works via CloudFront error responses.

## Acceptance Criteria

- [ ] Direct S3 object URLs return `AccessDenied`; the site is reachable only via CloudFront.
- [ ] `maxharding4.com`, `/travel/`, city pages, `/cv/` all still return 200.
- [ ] Block Public Access is fully enabled on the bucket.
- [ ] Deploy pipeline (`aws s3 sync`) still works unchanged (it writes objects; OAC only affects reads).

## Notes

- **Risk:** this touches the live distribution's origin + routing. Do it behind a
  test distribution or during a low-traffic window; keep the current public policy
  ready to re-apply as instant rollback.
- The **CloudFront Function for directory-index rewriting is the fiddly part** — it's
  the piece the website endpoint currently handles for us. Budget most of the effort there.
- No change needed to the GitHub Actions deploy (writes are unaffected by OAC).
