"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

/**
 * Google Analytics component with automatic route change tracking
 * Loads Google Analytics tracking script using gtag.js and tracks client-side navigation
 *
 * To use:
 * 1. Get your GA4 Measurement ID from https://analytics.google.com
 * 2. Add NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX to your .env.local file
 * 3. The component will automatically load GA and track all page views
 */
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track route changes
  useEffect(() => {
    if (!measurementId) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // Send page view event to GA
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", measurementId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, measurementId]);

  // Don't load GA if no measurement ID is configured
  if (!measurementId) {
    return null;
  }

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
