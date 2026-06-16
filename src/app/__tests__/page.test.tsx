/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import HomePage, { generateMetadata } from "../page";
import * as contentful from "@/lib/contentful";
import { Entry, EntryCollection } from "contentful";
import { PageSkeleton } from "@/types/contentful";
import React from "react";

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

describe("Home Page", () => {
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
            sys: {
              id: "page",
              type: "Link",
              linkType: "ContentType",
            },
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
                  image: {
                    width: 1200,
                    height: 630,
                  },
                },
                fileName: "og-image.jpg",
                contentType: "image/jpeg",
              },
            },
            metadata: {
              tags: [],
            },
          },
        },
        metadata: {
          tags: [],
        },
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering with Content", () => {
    it("should render hero section with name", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      render(page);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Max Harding"
      );
    });


    it("should render introduction content from Contentful", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      render(page);

      expect(
        screen.getByText(/Welcome to my personal website/)
      ).toBeInTheDocument();
    });

    it("should render Professional CV navigation card", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      render(page);

      expect(screen.getByText("Professional CV")).toBeInTheDocument();
      expect(
        screen.getByText(/View my work experience, skills/)
      ).toBeInTheDocument();
    });

    it("should render Travel Gallery navigation card", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      render(page);

      expect(screen.getByText("Travel Gallery")).toBeInTheDocument();
      expect(
        screen.getByText(/Explore photos and stories from my adventures/)
      ).toBeInTheDocument();
    });

    it("should render Explore navigation card links", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      render(page);

      // Navigation cards use "Explore" in their link text
      const exploreLinks = screen.getAllByText("Explore");
      expect(exploreLinks.length).toBeGreaterThan(0);
    });
  });

  describe("Rendering with Fallback Content", () => {
    it("should render fallback introduction when Contentful fails", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockRejectedValue(new Error("Contentful error"));

      const page = await HomePage();
      render(page);

      expect(
        screen.getByText(/Welcome to my personal website/)
      ).toBeInTheDocument();
    });

    it("should render hero section even without Contentful", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockEmptyPage);

      const page = await HomePage();
      render(page);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Max Harding"
      );
    });

    it("should render navigation cards even without Contentful", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockEmptyPage);

      const page = await HomePage();
      render(page);

      expect(screen.getByText("Professional CV")).toBeInTheDocument();
      expect(screen.getByText("Travel Gallery")).toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    it("should fetch page by slug 'home'", async () => {
      const getEntriesSpy = jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      await HomePage();

      expect(getEntriesSpy).toHaveBeenCalledWith("page", {
        "fields.slug": "home",
        limit: 1,
      });
    });

    it("should handle Contentful API errors gracefully", async () => {
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

  describe("Navigation Links", () => {
    it("should have correct link to CV page", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const cvLink = container.querySelector('a[href="/cv"]');
      expect(cvLink).toBeInTheDocument();
    });

    it("should have correct link to Travel page", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const travelLink = container.querySelector('a[href="/travel"]');
      expect(travelLink).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have exactly one h1 heading", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const h1Elements = container.querySelectorAll("h1");
      expect(h1Elements).toHaveLength(1);
    });

    it("should have proper heading hierarchy", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const h1 = container.querySelector("h1");
      const h2Elements = container.querySelectorAll("h2");
      const h3Elements = container.querySelectorAll("h3");

      expect(h1).toBeInTheDocument();
      // One h2: the sr-only "Explore" label on the navigation cards section.
      expect(h2Elements.length).toBe(1);
      expect(h3Elements.length).toBe(2); // Two navigation cards
    });

    it("should have semantic header element for hero section", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });

    it("should have semantic section elements", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const sections = container.querySelectorAll("section");
      expect(sections.length).toBeGreaterThanOrEqual(1); // Navigation Cards section (intro is now in header)
    });

    it("should have article elements for navigation cards", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const articles = container.querySelectorAll("article");
      expect(articles).toHaveLength(2); // Two navigation cards
    });

    it("should render introduction text inside hero header", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const header = container.querySelector("header");
      expect(header).toContainElement(
        container.querySelector("p") as HTMLElement
      );
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive container classes", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const mainContainer = container.querySelector(".container");
      expect(mainContainer?.className).toContain("px-4");
      expect(mainContainer?.className).toContain("sm:px-6");
      expect(mainContainer?.className).toContain("lg:px-8");
    });

    it("should have responsive typography on h1", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      render(page);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1.className).toContain("text-4xl");
      expect(h1.className).toContain("sm:text-5xl");
      expect(h1.className).toContain("md:text-6xl");
      expect(h1.className).toContain("lg:text-7xl");
    });


    it("should have responsive grid for navigation cards", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("grid-cols-1");
      expect(grid?.className).toContain("md:grid-cols-2");
    });

    it("should have responsive spacing classes", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const header = container.querySelector("header");
      expect(header?.className).toContain("pt-8");
      expect(header?.className).toContain("sm:pt-12");
      expect(header?.className).toContain("lg:pt-16");
    });
  });

  describe("Structured Data", () => {
    it("should include WebPage structured data", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

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

    it("should include correct WebPage schema properties", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const script = container.querySelector(
        'script[type="application/ld+json"]'
      );

      if (script?.textContent) {
        const jsonLd = JSON.parse(script.textContent);
        expect(jsonLd.name).toBe("Max Harding - Personal Website");
        expect(jsonLd.description).toContain("Welcome to my personal website");
        expect(jsonLd.isPartOf["@id"]).toBe(
          "https://www.maxharding4.com/#website"
        );
        expect(jsonLd.about["@id"]).toBe(
          "https://www.maxharding4.com/#person"
        );
      }
    });
  });

  describe("Security", () => {
    it("should not execute script tags in introduction content", async () => {
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

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(maliciousPage);

      const page = await HomePage();
      render(page);

      expect(screen.getByText(/Safe content/)).toBeInTheDocument();
      // Only JSON-LD script should be present
      const { container } = render(page);
      const scripts = container.querySelectorAll("script");
      const nonJsonLdScripts = Array.from(scripts).filter(
        (s) => s.getAttribute("type") !== "application/ld+json"
      );
      expect(nonJsonLdScripts).toHaveLength(0);
    });

    it("should only have JSON-LD scripts present", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const scripts = container.querySelectorAll("script");
      scripts.forEach((script) => {
        expect(script.getAttribute("type")).toBe("application/ld+json");
      });
    });
  });

  describe("generateMetadata", () => {
    it("should generate correct metadata from Contentful", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const metadata = await generateMetadata();

      expect(metadata.title).toBe("Home");
      expect(metadata.description).toContain(
        "Welcome to my personal website"
      );
    });

    it("should include OpenGraph metadata", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const metadata = await generateMetadata();

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe("Home");
      expect(metadata.openGraph?.description).toContain(
        "Welcome to my personal website"
      );
      expect(metadata.openGraph?.url).toBe("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((metadata.openGraph as any)?.type).toBe("website");
    });

    it("should include OpenGraph image from Contentful", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

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

    it("should include Twitter Card metadata", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const metadata = await generateMetadata();

      expect(metadata.twitter).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((metadata.twitter as any)?.card).toBe("summary_large_image");
      expect(metadata.twitter?.title).toBe("Home");
      expect(metadata.twitter?.description).toContain(
        "Welcome to my personal website"
      );
    });

    it("should use fallback metadata when Contentful fails", async () => {
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

    it("should use fallback metadata when page not found", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockEmptyPage);

      const metadata = await generateMetadata();

      expect(metadata.title).toBe("Max Harding - Personal Website");
      expect(metadata.description).toContain(
        "Personal website and portfolio of Max Harding"
      );
    });

    it("should handle missing ogImage gracefully", async () => {
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

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(pageWithoutImage);

      const metadata = await generateMetadata();

      expect(metadata.openGraph?.images).toBeUndefined();
      expect(metadata.twitter?.images).toBeUndefined();
    });
  });

  describe("Styling", () => {
    it("should have gradient background", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const mainDiv = container.querySelector(".min-h-screen");
      expect(mainDiv?.className).toContain("bg-gradient-to-b");
      expect(mainDiv?.className).toContain("from-gray-50");
      expect(mainDiv?.className).toContain("to-white");
    });

    it("should center hero section text", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const header = container.querySelector("header");
      expect(header?.className).toContain("text-center");
    });

    it("should center introduction text inside hero header", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValueOnce(mockHomePage);

      const page = await HomePage();
      const { container } = render(page);

      const header = container.querySelector("header");
      expect(header?.className).toContain("text-center");
    });
  });
});
