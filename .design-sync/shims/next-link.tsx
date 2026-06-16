// Bundle-time shim for `next/link`. Claude Design (and the preview cards) have
// no Next.js router, so the real next/link throws "app router not mounted".
// A design system only needs the rendered anchor, so we swap it for a plain
// <a>. Aliased in via .design-sync/tsconfig.bundle.json -> cfg.tsconfig.
import * as React from "react";

type Href = string | { pathname?: string; href?: string };
type LinkProps = {
  href: Href;
  children?: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, ...rest },
  ref,
) {
  const h =
    typeof href === "string" ? href : (href?.href ?? href?.pathname ?? "#");
  return (
    <a ref={ref} href={h} {...rest}>
      {children}
    </a>
  );
});

export default Link;
