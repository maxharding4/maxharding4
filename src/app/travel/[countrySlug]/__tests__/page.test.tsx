/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import CountryPage, { generateStaticParams, generateMetadata } from "../page";
import * as contentful from "@/lib/contentful";
import { Asset, Entry, EntryCollection } from "contentful";
import { CountrySkeleton, CitySkeleton } from "@/types/contentful";
import React from "react";

// Mock Next.js components
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        {...rest}
        data-fill={fill ? "true" : "false"}
        data-priority={priority ? "true" : "false"}
      />
    );
  },
}));

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

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Mock the contentful module
jest.mock("@/lib/contentful");

describe("Country Page", () => {
  const mockCountry: Entry<CountrySkeleton> = {
    sys: {
      id: "spain-id",
      type: "Entry",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      locale: "en-US",
      contentType: {
        sys: {
          id: "country",
          type: "Link",
          linkType: "ContentType",
        },
      },
      revision: 1,
    },
    fields: {
      name: "Spain",
      slug: "spain",
      countryCode: "ES",
      description: "A beautiful country in Europe with rich culture and history.",
      flagImage: {
        sys: {
          id: "flag-id",
          type: "Asset",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          locale: "en-US",
          revision: 1,
        },
        fields: {
          title: "Spain Flag",
          file: {
            url: "//images.ctfassets.net/space/spain-flag.jpg",
            details: {
              size: 12345,
              image: {
                width: 800,
                height: 600,
              },
            },
            fileName: "spain-flag.jpg",
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
  } as unknown as Entry<CountrySkeleton>;

  const mockPhotoAsset: Asset = {
    sys: {
      id: "photo-id",
      type: "Asset",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      locale: "en-US",
      revision: 1,
    },
    fields: {
      title: "Beach Photo",
      file: {
        url: "//images.ctfassets.net/space/beach.jpg",
        details: {
          size: 12345,
          image: {
            width: 1200,
            height: 800,
          },
        },
        fileName: "beach.jpg",
        contentType: "image/jpeg",
      },
    },
    metadata: {
      tags: [],
    },
  } as unknown as Asset;

  const mockCity: Entry<CitySkeleton> = {
    sys: {
      id: "barcelona-id",
      type: "Entry",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      locale: "en-US",
      contentType: {
        sys: {
          id: "city",
          type: "Link",
          linkType: "ContentType",
        },
      },
      revision: 1,
    },
    fields: {
      name: "Barcelona",
      slug: "barcelona",
      description: "A vibrant coastal city in Catalonia",
      photos: [mockPhotoAsset, mockPhotoAsset, mockPhotoAsset], // 3 photos
    },
    metadata: {
      tags: [],
    },
  } as unknown as Entry<CitySkeleton>;

  const mockCity2: Entry<CitySkeleton> = {
    sys: {
      id: "madrid-id",
      type: "Entry",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      locale: "en-US",
      contentType: {
        sys: {
          id: "city",
          type: "Link",
          linkType: "ContentType",
        },
      },
      revision: 1,
    },
    fields: {
      name: "Madrid",
      slug: "madrid",
      description: "The capital of Spain",
      photos: [], // No photos
    },
    metadata: {
      tags: [],
    },
  } as unknown as Entry<CitySkeleton>;

  const createCountryCollection = (
    items: Entry<CountrySkeleton>[]
  ): EntryCollection<CountrySkeleton> => ({
    items,
    total: items.length,
    skip: 0,
    limit: 100,
    sys: { type: "Array" },
  });

  const createCityCollection = (
    items: Entry<CitySkeleton>[]
  ): EntryCollection<CitySkeleton> => ({
    items,
    total: items.length,
    skip: 0,
    limit: 100,
    sys: { type: "Array" },
  });

  const mockParams = Promise.resolve({ countrySlug: "spain" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering with Country Data", () => {
    beforeEach(() => {
      // Setup default mocks for a country with cities
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([mockCity, mockCity2]));
          }
          return Promise.resolve(createCountryCollection([]));
        });
    });

    it("should render country name", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      expect(
        screen.getByRole("heading", { level: 1, name: "Spain" })
      ).toBeInTheDocument();
    });

    it("should render country description", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      expect(
        screen.getByText(/A beautiful country in Europe/i)
      ).toBeInTheDocument();
    });

    it("should render flag image with correct src", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      const flagImage = screen.getByAltText("Spain flag");
      expect(flagImage).toBeInTheDocument();
      // src carries the Images-API transform params (see IMAGE_TRANSFORMS.flag).
      const flagSrc = flagImage.getAttribute("src") ?? "";
      expect(flagSrc).toContain(
        "https://images.ctfassets.net/space/spain-flag.jpg"
      );
      expect(flagSrc).toContain("fm=webp");
    });

    it("should render breadcrumb navigation", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Travel" })).toBeInTheDocument();
      // Spain appears in both breadcrumb and h1
      expect(screen.getAllByText("Spain")).toHaveLength(2);
    });

    it("should render breadcrumb link to travel page", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      const travelLink = screen.getByRole("link", { name: "Travel" });
      expect(travelLink).toHaveAttribute("href", "/travel");
    });

    it("should render city cards", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      expect(screen.getByText("Barcelona")).toBeInTheDocument();
      expect(screen.getByText("Madrid")).toBeInTheDocument();
    });

    it("should display city count", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      expect(screen.getByText("2 cities to explore")).toBeInTheDocument();
    });

    it("should use singular 'city' for one city", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([mockCity]));
          }
          return Promise.resolve(createCountryCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      render(page);

      expect(screen.getByText("1 city to explore")).toBeInTheDocument();
    });

    it("should display total photo count in footer", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      // Barcelona has 3 photos, Madrid has 0 = 3 photos total across 2 cities
      expect(screen.getByText(/3 photos across 2 cities/i)).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("should render empty state when no cities", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([]));
          }
          return Promise.resolve(createCountryCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      render(page);

      expect(
        screen.getByText("No cities added yet. Check back soon!")
      ).toBeInTheDocument();
    });

    it("should not render photo count footer when no cities", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([]));
          }
          return Promise.resolve(createCountryCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      render(page);

      expect(screen.queryByText(/photos across/i)).not.toBeInTheDocument();
    });

    it("should not render grid when no cities", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([]));
          }
          return Promise.resolve(createCountryCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const grid = container.querySelector(".grid");
      expect(grid).not.toBeInTheDocument();
    });
  });

  describe("404 Handling", () => {
    it("should call notFound when country not found", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { notFound } = require("next/navigation");
      // Make notFound throw an error to stop execution (simulating Next.js behavior)
      notFound.mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(createCountryCollection([]));

      await expect(async () => {
        await CountryPage({ params: mockParams });
      }).rejects.toThrow("NEXT_NOT_FOUND");

      expect(notFound).toHaveBeenCalled();
    });

    it("should call notFound for invalid slug", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { notFound } = require("next/navigation");
      // Make notFound throw an error to stop execution (simulating Next.js behavior)
      notFound.mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(createCountryCollection([]));

      await expect(async () => {
        await CountryPage({
          params: Promise.resolve({ countrySlug: "nonexistent-country" }),
        });
      }).rejects.toThrow("NEXT_NOT_FOUND");

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([mockCity]));
          }
          return Promise.resolve(createCountryCollection([]));
        });
    });

    it("should have proper heading hierarchy", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Spain");
    });

    it("should have visually hidden h2 for cities section", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      const h2 = screen.getByRole("heading", { level: 2, name: /Cities in Spain/i });
      expect(h2).toBeInTheDocument();
      expect(h2.className).toContain("sr-only");
    });

    it("should have semantic header element", async () => {
      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });

    it("should have semantic section element for cities", async () => {
      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
    });

    it("should have accessible flag image alt text", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      const flagImage = screen.getByAltText("Spain flag");
      expect(flagImage).toBeInTheDocument();
    });

    it("should use priority loading for flag image", async () => {
      const page = await CountryPage({ params: mockParams });
      render(page);

      const flagImage = screen.getByAltText("Spain flag");
      expect(flagImage).toHaveAttribute("data-priority", "true");
    });
  });

  describe("Data Fetching", () => {
    it("should fetch country by slug", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          return Promise.resolve(createCityCollection([]));
        });

      await CountryPage({ params: mockParams });

      expect(contentful.getEntriesByType).toHaveBeenCalledWith("country", {
        "fields.slug": "spain",
        limit: 1,
      });
    });

    it("should fetch cities for country", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([]));
          }
          return Promise.resolve(createCountryCollection([]));
        });

      await CountryPage({ params: mockParams });

      expect(contentful.getEntriesByType).toHaveBeenCalledWith("city", {
        "fields.country.sys.id": "spain-id",
        order: ["fields.name"],
      });
    });

    it("should sort cities alphabetically by name", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([]));
          }
          return Promise.resolve(createCountryCollection([]));
        });

      await CountryPage({ params: mockParams });

      expect(contentful.getEntriesByType).toHaveBeenCalledWith(
        "city",
        expect.objectContaining({ order: ["fields.name"] })
      );
    });
  });

  describe("generateStaticParams", () => {
    it("should return array of country slugs", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(
          createCountryCollection([
            mockCountry,
            {
              ...mockCountry,
              sys: { ...mockCountry.sys, id: "france-id" },
              fields: { ...mockCountry.fields, name: "France", slug: "france" },
            } as unknown as Entry<CountrySkeleton>,
          ])
        );

      const params = await generateStaticParams();

      expect(params).toEqual([
        { countrySlug: "spain" },
        { countrySlug: "france" },
      ]);
    });

    it("should return empty array when no countries", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(createCountryCollection([]));

      const params = await generateStaticParams();

      expect(params).toEqual([]);
    });

    it("should fetch all countries from contentful", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(createCountryCollection([]));

      await generateStaticParams();

      expect(contentful.getEntriesByType).toHaveBeenCalledWith("country");
    });
  });

  describe("generateMetadata", () => {
    it("should generate correct page title", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(createCountryCollection([mockCountry]));

      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata.title).toBe("Spain | Travel Gallery");
    });

    it("should use country description when available", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(createCountryCollection([mockCountry]));

      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata.description).toContain("A beautiful country in Europe");
    });

    it("should use fallback description when country has no description", async () => {
      const countryWithoutDescription = {
        ...mockCountry,
        fields: { ...mockCountry.fields, description: undefined },
      } as unknown as Entry<CountrySkeleton>;

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(createCountryCollection([countryWithoutDescription]));

      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata.description).toBe("Explore photos from Spain");
    });

    it("should return 'Country Not Found' for invalid slug", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(createCountryCollection([]));

      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata.title).toBe("Country Not Found");
    });

    it("should include Open Graph metadata", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(createCountryCollection([mockCountry]));

      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe("Spain - Travel Gallery");
      expect(metadata.openGraph?.type).toBe("website");
    });
  });

  describe("Responsive Design", () => {
    beforeEach(() => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([mockCity, mockCity2]));
          }
          return Promise.resolve(createCountryCollection([]));
        });
    });

    it("should have responsive grid classes for cities", async () => {
      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const grid = container.querySelector(".grid");
      expect(grid).toBeTruthy();
      expect(grid?.className).toContain("grid-cols-1");
      expect(grid?.className).toContain("sm:grid-cols-2");
      expect(grid?.className).toContain("lg:grid-cols-3");
    });

    it("should have responsive spacing", async () => {
      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const mainContainer = container.querySelector(".container");
      expect(mainContainer).toBeTruthy();
      expect(mainContainer?.className).toContain("px-4");
      expect(mainContainer?.className).toContain("sm:px-6");
      expect(mainContainer?.className).toContain("lg:px-8");
    });

    it("should have responsive header layout", async () => {
      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const headerContent = container.querySelector("header .flex");
      expect(headerContent?.className).toContain("flex-col");
      expect(headerContent?.className).toContain("sm:flex-row");
    });
  });

  describe("Security", () => {
    it("should not execute script tags in country name", async () => {
      const maliciousCountry = {
        ...mockCountry,
        fields: {
          ...mockCountry.fields,
          name: '<script>alert("xss")</script>Spain',
        },
      } as unknown as Entry<CountrySkeleton>;

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([maliciousCountry]));
          }
          return Promise.resolve(createCityCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      render(page);

      // JSON-LD scripts are allowed, but check there are no executable scripts
      expect(document.querySelector("script:not([type='application/ld+json'])")).not.toBeInTheDocument();
      // The text should contain Spain (React escapes the script tag)
      expect(screen.getAllByText(/Spain/)[0]).toBeInTheDocument();
    });

    it("should use HTTPS for flag image", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          return Promise.resolve(createCityCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      render(page);

      const flagImage = screen.getByAltText("Spain flag");
      expect(flagImage.getAttribute("src")).toMatch(/^https:/);
    });

    it("should handle XSS attempts in description", async () => {
      const maliciousCountry = {
        ...mockCountry,
        fields: {
          ...mockCountry.fields,
          description: '<img src="x" onerror="alert(\'xss\')">Test description',
        },
      } as unknown as Entry<CountrySkeleton>;

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([maliciousCountry]));
          }
          return Promise.resolve(createCityCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      render(page);

      // React should escape the content
      expect(screen.getByText(/Test description/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle country without flag image", async () => {
      const countryWithoutFlag = {
        ...mockCountry,
        fields: {
          ...mockCountry.fields,
          flagImage: undefined,
        },
      } as unknown as Entry<CountrySkeleton>;

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([countryWithoutFlag]));
          }
          return Promise.resolve(createCityCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      render(page);

      // Spain appears in both breadcrumb and h1
      expect(screen.getAllByText("Spain")).toHaveLength(2);
      expect(screen.queryByAltText("Spain flag")).not.toBeInTheDocument();
    });

    it("should handle country without description", async () => {
      const countryWithoutDescription = {
        ...mockCountry,
        fields: {
          ...mockCountry.fields,
          description: undefined,
        },
      } as unknown as Entry<CountrySkeleton>;

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(
              createCountryCollection([countryWithoutDescription])
            );
          }
          return Promise.resolve(createCityCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      render(page);

      // Spain appears in both breadcrumb and h1
      expect(screen.getAllByText("Spain")).toHaveLength(2);
    });

    it("should handle cities with zero photos", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([mockCity2])); // Use mockCity2 which has no photos
          }
          return Promise.resolve(createCountryCollection([]));
        });

      const page = await CountryPage({ params: mockParams });
      render(page);

      expect(screen.getByText("Madrid")).toBeInTheDocument();
      expect(screen.getByText(/0 photos across 1 city/i)).toBeInTheDocument();
    });

    it("should handle unicode characters in country name", async () => {
      const unicodeCountry = {
        ...mockCountry,
        fields: {
          ...mockCountry.fields,
          name: "日本",
          slug: "japan",
        },
      } as unknown as Entry<CountrySkeleton>;

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([unicodeCountry]));
          }
          return Promise.resolve(createCityCollection([]));
        });

      const page = await CountryPage({
        params: Promise.resolve({ countrySlug: "japan" }),
      });
      render(page);

      // Unicode appears in both breadcrumb and h1
      expect(screen.getAllByText("日本")).toHaveLength(2);
    });
  });

  describe("Styling", () => {
    beforeEach(() => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockImplementation((contentType: string) => {
          if (contentType === "country") {
            return Promise.resolve(createCountryCollection([mockCountry]));
          }
          if (contentType === "city") {
            return Promise.resolve(createCityCollection([mockCity]));
          }
          return Promise.resolve(createCountryCollection([]));
        });
    });

    it("should have the page-canvas background", async () => {
      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const mainDiv = container.querySelector(".page-canvas");
      expect(mainDiv).toBeInTheDocument();
    });

    it("should have min-height screen", async () => {
      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const mainDiv = container.querySelector(".min-h-screen");
      expect(mainDiv).toBeInTheDocument();
    });

    it("should have proper flag image container styling", async () => {
      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const flagContainer = container.querySelector(".h-24.w-36");
      expect(flagContainer).toBeInTheDocument();
      expect(flagContainer?.className).toContain("rounded-lg");
      expect(flagContainer?.className).toContain("border");
      expect(flagContainer?.className).toContain("shadow-sm");
    });

    it("should have gap between grid items", async () => {
      const page = await CountryPage({ params: mockParams });
      const { container } = render(page);

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("gap-6");
    });
  });
});
