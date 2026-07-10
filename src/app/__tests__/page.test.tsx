/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import HomePage, { generateMetadata } from "../page";
import * as contentful from "@/lib/contentful";
import { Entry, EntryCollection } from "contentful";
import { CitySkeleton, PageSkeleton } from "@/types/contentful";
import React from "react";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-fill={fill ? "true" : "false"} />;
  },
}));

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock the contentful module
jest.mock("@/lib/contentful");

const mockHomePage: EntryCollection<PageSkeleton> = {
  items: [
    {
      sys: {
        id: "home-page-id",
        type: "Entry",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        locale: "en-US",
        contentType: {
          sys: { id: "page", type: "Link", linkType: "ContentType" },
        },
        revision: 1,
      },
      fields: {
        title: "Home",
        slug: "home",
        metaDescription:
          "Welcome to my personal website. I'm a Lead QA Engineer with a passion for travel photography, exploring the intersection of technology and creativity.",
        metaKeywords: ["lead qa engineer", "travel photography", "portfolio"],
        ogImage: {
          sys: {
            id: "og-image-id",
            type: "Asset",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            locale: "en-US",
            revision: 1,
          },
          fields: {
            title: "OG Image",
            file: {
              url: "//images.ctfassets.net/space/og-image.jpg",
              details: {
                size: 12345,
                image: { width: 1200, height: 630 },
              },
              fileName: "og-image.jpg",
              contentType: "image/jpeg",
            },
          },
          metadata: { tags: [] },
        },
      },
      metadata: { tags: [] },
    },
  ] as unknown as Entry<PageSkeleton>[],
  total: 1,
  skip: 0,
  limit: 1,
  sys: { type: "Array" },
};

const mockEmptyPage: EntryCollection<PageSkeleton> = {
  items: [],
  total: 0,
  skip: 0,
  limit: 1,
  sys: { type: "Array" },
};

// Fixed dates so future/past classification is deterministic regardless of run time.
const FUTURE = "2999-01-01";
const FAR_FUTURE = "2999-06-01";

interface MakeCityOpts {
  id: string;
  name: string;
  slug: string;
  countrySlug: string | null;
  visitDate?: string;
  photoCount: number;
}

function makeCity(opts: MakeCityOpts): Entry<CitySkeleton> {
  const photos = Array.from({ length: opts.photoCount }, (_, i) => ({
    sys: { id: `${opts.id}-photo-${i}`, type: "Asset" },
    fields: {
      title: `${opts.name} photo ${i}`,
      file: { url: `//images.ctfassets.net/${opts.id}-${i}.jpg` },
    },
  }));

  const country =
    opts.countrySlug === null
      ? undefined
      : {
          sys: { id: `country-${opts.countrySlug}`, type: "Entry" },
          fields: { name: opts.countrySlug, slug: opts.countrySlug },
        };

  return {
    sys: {
      id: opts.id,
      type: "Entry",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      locale: "en-US",
      contentType: { sys: { id: "city", type: "Link", linkType: "ContentType" } },
      revision: 1,
    },
    fields: {
      name: opts.name,
      slug: opts.slug,
      country,
      visitDate: opts.visitDate,
      photos,
    },
    metadata: { tags: [] },
  } as unknown as Entry<CitySkeleton>;
}

function cityCollection(
  cities: Entry<CitySkeleton>[]
): EntryCollection<CitySkeleton> {
  return {
    items: cities,
    total: cities.length,
    skip: 0,
    limit: 100,
    sys: { type: "Array" },
  };
}

/**
 * Route getEntriesByType by content type so the page's two fetches
 * (page + city) each resolve independently.
 */
function mockContentful(options?: {
  page?: EntryCollection<PageSkeleton>;
  cities?: Entry<CitySkeleton>[];
}) {
  const page = options?.page ?? mockHomePage;
  const cities = options?.cities ?? [];
  return jest
    .spyOn(contentful, "getEntriesByType")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockImplementation(async (type: string): Promise<any> => {
      if (type === "city") return cityCollection(cities);
      return page;
    });
}

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Hero", () => {
    it("renders the sr-only name as the single h1", async () => {
      mockContentful();
      render(await HomePage());

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Max Harding");
      expect(h1.className).toContain("sr-only");
    });

    it("shows the eyebrow as the visible hero", async () => {
      mockContentful();
      render(await HomePage());

      expect(
        screen.getByText("Lead QA Engineer · Travel Photographer")
      ).toBeInTheDocument();
    });

    it("renders introduction content from Contentful", async () => {
      mockContentful();
      render(await HomePage());

      expect(
        screen.getByText(/Welcome to my personal website/)
      ).toBeInTheDocument();
    });

    it("renders fallback introduction when Contentful fails", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockRejectedValue(new Error("Contentful error"));

      render(await HomePage());

      expect(
        screen.getByText(/Welcome to my personal website/)
      ).toBeInTheDocument();
    });
  });

  describe("Next up section", () => {
    it("renders upcoming coming-soon cities (no photos, future date)", async () => {
      mockContentful({
        cities: [
          makeCity({
            id: "tokyo",
            name: "Tokyo",
            slug: "tokyo",
            countrySlug: "japan",
            visitDate: FUTURE,
            photoCount: 0,
          }),
        ],
      });
      render(await HomePage());

      expect(screen.getByText("Next up")).toBeInTheDocument();
      expect(screen.getByText("Tokyo")).toBeInTheDocument();
    });

    it("is hidden entirely when nothing qualifies", async () => {
      mockContentful({
        cities: [
          makeCity({
            id: "porto",
            name: "Porto",
            slug: "porto",
            countrySlug: "portugal",
            visitDate: "2023-05-01",
            photoCount: 3,
          }),
        ],
      });
      render(await HomePage());

      expect(screen.queryByText("Next up")).not.toBeInTheDocument();
    });

    it("orders upcoming cities soonest first, capped at 2", async () => {
      mockContentful({
        cities: [
          makeCity({ id: "c-far", name: "FarCity", slug: "far", countrySlug: "x", visitDate: FAR_FUTURE, photoCount: 0 }),
          makeCity({ id: "c-soon", name: "SoonCity", slug: "soon", countrySlug: "x", visitDate: FUTURE, photoCount: 0 }),
          makeCity({ id: "c-third", name: "ThirdCity", slug: "third", countrySlug: "x", visitDate: "2999-09-01", photoCount: 0 }),
        ],
      });
      render(await HomePage());

      // Only the 2 soonest render; the third is dropped.
      expect(screen.getByText("SoonCity")).toBeInTheDocument();
      expect(screen.getByText("FarCity")).toBeInTheDocument();
      expect(screen.queryByText("ThirdCity")).not.toBeInTheDocument();

      const nextUp = screen.getByRole("region", { name: /next up/i });
      const names = Array.from(nextUp.querySelectorAll("h2"))
        .map((h) => h.textContent)
        .filter((n) => ["SoonCity", "FarCity", "ThirdCity"].includes(n ?? ""));
      expect(names).toEqual(["SoonCity", "FarCity"]);
    });
  });

  describe("Latest section", () => {
    it("renders photographed cities and a View all link", async () => {
      mockContentful({
        cities: [
          makeCity({ id: "porto", name: "Porto", slug: "porto", countrySlug: "portugal", visitDate: "2023-05-01", photoCount: 4 }),
        ],
      });
      const { container } = render(await HomePage());

      expect(screen.getByText("Latest")).toBeInTheDocument();
      expect(screen.getByText("Porto")).toBeInTheDocument();

      const viewAll = container.querySelector('a[href="/travel"]');
      expect(viewAll).toBeInTheDocument();
      expect(viewAll).toHaveTextContent(/view all/i);
    });

    it("orders cities most recently visited first", async () => {
      mockContentful({
        cities: [
          makeCity({ id: "a", name: "Oldest", slug: "a", countrySlug: "x", visitDate: "2019-01-01", photoCount: 1 }),
          makeCity({ id: "b", name: "Newest", slug: "b", countrySlug: "x", visitDate: "2024-01-01", photoCount: 1 }),
          makeCity({ id: "c", name: "Middle", slug: "c", countrySlug: "x", visitDate: "2021-01-01", photoCount: 1 }),
        ],
      });
      render(await HomePage());

      const latest = screen.getByRole("region", { name: /latest/i });
      const names = Array.from(latest.querySelectorAll("h2"))
        .map((h) => h.textContent)
        .filter((n) => ["Oldest", "Newest", "Middle"].includes(n ?? ""));
      expect(names).toEqual(["Newest", "Middle", "Oldest"]);
    });

    it("trims to complete rows of 3 so there is no orphan card (4 → 3)", async () => {
      const cities = Array.from({ length: 4 }, (_, i) =>
        makeCity({
          id: `c${i}`,
          name: `City${i}`,
          slug: `c${i}`,
          countrySlug: "x",
          // Newer index = more recent, so City0 is the oldest and gets dropped.
          visitDate: `20${20 + i}-01-01`,
          photoCount: 1,
        })
      );
      mockContentful({ cities });
      render(await HomePage());

      const latest = screen.getByRole("region", { name: /latest/i });
      const names = Array.from(latest.querySelectorAll("h2"))
        .map((h) => h.textContent)
        .filter((n) => /^City\d$/.test(n ?? ""));
      expect(names).toEqual(["City3", "City2", "City1"]); // oldest (City0) trimmed
    });

    it("shows at most two full rows (7 → 6)", async () => {
      const cities = Array.from({ length: 7 }, (_, i) =>
        makeCity({
          id: `c${i}`,
          name: `City${i}`,
          slug: `c${i}`,
          countrySlug: "x",
          visitDate: `20${10 + i}-01-01`,
          photoCount: 1,
        })
      );
      mockContentful({ cities });
      render(await HomePage());

      const latest = screen.getByRole("region", { name: /latest/i });
      const names = Array.from(latest.querySelectorAll("h2")).filter((h) =>
        /^City\d$/.test(h.textContent ?? "")
      );
      expect(names).toHaveLength(6);
    });

    it("shows a coming-soon message when no photographed cities exist", async () => {
      mockContentful({ cities: [] });
      render(await HomePage());

      expect(screen.getByText("Latest")).toBeInTheDocument();
      expect(screen.getByText(/Photos coming soon/i)).toBeInTheDocument();
    });
  });

  describe("Filtering rules", () => {
    it("excludes a past-dated city with no photos from both sections", async () => {
      mockContentful({
        cities: [
          makeCity({ id: "backlog", name: "Backlog", slug: "backlog", countrySlug: "x", visitDate: "2020-01-01", photoCount: 0 }),
        ],
      });
      render(await HomePage());

      expect(screen.queryByText("Backlog")).not.toBeInTheDocument();
      expect(screen.queryByText("Next up")).not.toBeInTheDocument();
      expect(screen.getByText(/Photos coming soon/i)).toBeInTheDocument();
    });

    it("skips cities whose country reference cannot be resolved", async () => {
      mockContentful({
        cities: [
          makeCity({ id: "orphan", name: "Orphan", slug: "orphan", countrySlug: null, visitDate: "2023-01-01", photoCount: 5 }),
          makeCity({ id: "porto", name: "Porto", slug: "porto", countrySlug: "portugal", visitDate: "2023-01-01", photoCount: 2 }),
        ],
      });
      render(await HomePage());

      expect(screen.queryByText("Orphan")).not.toBeInTheDocument();
      expect(screen.getByText("Porto")).toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    it("fetches the home page by slug", async () => {
      const spy = mockContentful();
      await HomePage();

      expect(spy).toHaveBeenCalledWith("page", {
        "fields.slug": "home",
        limit: 1,
      });
    });

    it("fetches cities with the country reference resolved", async () => {
      const spy = mockContentful();
      await HomePage();

      expect(spy).toHaveBeenCalledWith("city", { include: 2 });
    });

    it("renders without throwing when the city fetch fails", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockImplementation(async (type: string): Promise<any> => {
          if (type === "city") throw new Error("city fetch failed");
          return mockHomePage;
        });

      await expect(HomePage()).resolves.not.toThrow();
    });

    it("handles a home-page fetch error gracefully", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockRejectedValue(new Error("API Error"));

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();

      await expect(HomePage()).resolves.not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching home page:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    it("has exactly one h1 heading", async () => {
      mockContentful();
      const { container } = render(await HomePage());

      expect(container.querySelectorAll("h1")).toHaveLength(1);
    });

    it("exposes labelled sections as landmarks", async () => {
      mockContentful({
        cities: [
          makeCity({ id: "tokyo", name: "Tokyo", slug: "tokyo", countrySlug: "japan", visitDate: FUTURE, photoCount: 0 }),
          makeCity({ id: "porto", name: "Porto", slug: "porto", countrySlug: "portugal", visitDate: "2023-05-01", photoCount: 4 }),
        ],
      });
      render(await HomePage());

      expect(
        screen.getByRole("region", { name: /next up/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: /latest/i })
      ).toBeInTheDocument();
    });

    it("has a semantic header for the hero", async () => {
      mockContentful();
      const { container } = render(await HomePage());

      expect(container.querySelector("header")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("has responsive container classes", async () => {
      mockContentful();
      const { container } = render(await HomePage());

      const mainContainer = container.querySelector(".container");
      expect(mainContainer?.className).toContain("px-4");
      expect(mainContainer?.className).toContain("sm:px-6");
      expect(mainContainer?.className).toContain("lg:px-8");
    });

    it("standardizes top spacing on the content container", async () => {
      mockContentful();
      const { container } = render(await HomePage());

      const contentContainer = container.querySelector(".container");
      expect(contentContainer?.className).toContain("pt-12");
      expect(contentContainer?.className).toContain("sm:pt-16");
    });
  });

  describe("Structured Data", () => {
    it("includes WebPage structured data", async () => {
      mockContentful();
      const { container } = render(await HomePage());

      const script = container.querySelector(
        'script[type="application/ld+json"]'
      );
      expect(script).toBeInTheDocument();

      if (script?.textContent) {
        const jsonLd = JSON.parse(script.textContent);
        expect(jsonLd["@context"]).toBe("https://schema.org");
        expect(jsonLd["@type"]).toBe("WebPage");
        expect(jsonLd["@id"]).toBe("https://www.maxharding4.com/#webpage");
        expect(jsonLd.url).toBe("https://www.maxharding4.com");
      }
    });
  });

  describe("Security", () => {
    it("does not execute script tags in introduction content", async () => {
      const maliciousPage = {
        ...mockHomePage,
        items: [
          {
            ...mockHomePage.items[0],
            fields: {
              ...mockHomePage.items[0].fields,
              metaDescription: '<script>alert("xss")</script>Safe content',
            },
          },
        ],
      } as unknown as EntryCollection<PageSkeleton>;

      mockContentful({ page: maliciousPage });
      const { container } = render(await HomePage());

      expect(screen.getByText(/Safe content/)).toBeInTheDocument();
      const scripts = container.querySelectorAll("script");
      const nonJsonLdScripts = Array.from(scripts).filter(
        (s) => s.getAttribute("type") !== "application/ld+json"
      );
      expect(nonJsonLdScripts).toHaveLength(0);
    });
  });

  describe("generateMetadata", () => {
    it("generates correct metadata from Contentful", async () => {
      mockContentful();
      const metadata = await generateMetadata();

      expect(metadata.title).toBe("Home");
      expect(metadata.description).toContain("Welcome to my personal website");
    });

    it("includes OpenGraph metadata", async () => {
      mockContentful();
      const metadata = await generateMetadata();

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe("Home");
      expect(metadata.openGraph?.url).toBe("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((metadata.openGraph as any)?.type).toBe("website");
    });

    it("includes OpenGraph image from Contentful", async () => {
      mockContentful();
      const metadata = await generateMetadata();

      expect(metadata.openGraph?.images).toBeDefined();
      if (Array.isArray(metadata.openGraph?.images)) {
        expect(metadata.openGraph.images[0]).toEqual({
          url: "https://images.ctfassets.net/space/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Home",
        });
      }
    });

    it("includes Twitter Card metadata", async () => {
      mockContentful();
      const metadata = await generateMetadata();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((metadata.twitter as any)?.card).toBe("summary_large_image");
      expect(metadata.twitter?.title).toBe("Home");
    });

    it("uses fallback metadata when Contentful fails", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockRejectedValue(new Error("API Error"));

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();

      const metadata = await generateMetadata();

      expect(metadata.title).toBe("Max Harding - Personal Website");
      expect(metadata.description).toContain(
        "Personal website and portfolio of Max Harding"
      );

      consoleErrorSpy.mockRestore();
    });

    it("uses fallback metadata when page not found", async () => {
      mockContentful({ page: mockEmptyPage });
      const metadata = await generateMetadata();

      expect(metadata.title).toBe("Max Harding - Personal Website");
    });

    it("handles missing ogImage gracefully", async () => {
      const pageWithoutImage = {
        ...mockHomePage,
        items: [
          {
            ...mockHomePage.items[0],
            fields: {
              ...mockHomePage.items[0].fields,
              ogImage: undefined,
            },
          },
        ],
      } as EntryCollection<PageSkeleton>;

      mockContentful({ page: pageWithoutImage });
      const metadata = await generateMetadata();

      expect(metadata.openGraph?.images).toBeUndefined();
      expect(metadata.twitter?.images).toBeUndefined();
    });
  });

  describe("Styling", () => {
    it("uses the page-canvas background", async () => {
      mockContentful();
      const { container } = render(await HomePage());

      const mainDiv = container.querySelector(".min-h-screen");
      expect(mainDiv?.className).toContain("page-canvas");
    });

    it("centers the hero section text", async () => {
      mockContentful();
      const { container } = render(await HomePage());

      const header = container.querySelector("header");
      expect(header?.className).toContain("text-center");
    });
  });
});
