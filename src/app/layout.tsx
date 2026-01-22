import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maxharding4.com"),
  title: {
    default: "Max Harding - Personal Website",
    template: "%s | Max Harding",
  },
  description: "Personal website and travel photography by Max Harding",
  openGraph: {
    title: "Max Harding - Personal Website",
    description: "Personal website and travel photography by Max Harding",
    url: "https://www.maxharding4.com",
    siteName: "Max Harding",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Max Harding - Personal Website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Max Harding - Personal Website",
    description: "Personal website and travel photography by Max Harding",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Person JSON-LD structured data
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Max Harding",
    url: "https://www.maxharding4.com",
    description: "Personal website and travel photography by Max Harding",
    jobTitle: "Software Engineer & Travel Photographer",
    sameAs: [
      // Add your social media profiles here when available
      // "https://linkedin.com/in/maxharding",
      // "https://github.com/maxharding",
    ],
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Person Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-white dark:focus:bg-white dark:focus:text-gray-900"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
