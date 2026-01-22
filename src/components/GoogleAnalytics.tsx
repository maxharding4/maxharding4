import Script from "next/script";

/**
 * Google Analytics component
 * Loads Google Analytics tracking script using gtag.js
 *
 * To use:
 * 1. Get your GA4 Measurement ID from https://analytics.google.com
 * 2. Add NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX to your .env.local file
 * 3. The component will automatically load GA when the ID is present
 */
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
