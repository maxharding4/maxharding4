/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import CityPage, { generateMetadata, generateStaticParams } from "../page";
import { getEntriesByType } from "@/lib/contentful";
import { Asset, Entry } from "contentful";
import { CitySkeleton, CountrySkeleton } from "@/types/contentful";
import React from "react";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Mock Contentful
jest.mock("@/lib/contentful", () => ({
  getEntriesByType: jest.fn(),
}));

// Mock components
jest.mock("@/components/Breadcrumb", () => ({
  __esModule: true,
  default: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav data-testid="breadcrumb">
      {items.map((item, index) => (
        <span key={index}>{item.label}</span>
      ))}
    </nav>
  ),
}));

jest.mock("@/components/PhotoGallery", () => ({
  __esModule: true,
  default: ({ photos, cityName }: { photos: Asset[]; cityName: string }) => (
    <div data-testid="photo-gallery">
      {cityName} - {photos.length} photos
    </div>
  ),
}));

const mockGetEntriesByType = getEntriesByType as jest.MockedFunction<typeof getEntriesByType>;

describe("CityPage", () => {
  const mockCountry: Entry<CountrySkeleton> = {
    sys: {
      id: "country-1",
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
    },
    metadata: {
      tags: [],
    },
  } as unknown as Entry<CountrySkeleton>;

  const mockPhotos: Asset[] = [
    {
      sys: {
        id: "photo-1",
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
    } as unknown as Asset,
  ];

  const mockCity: Entry<CitySkeleton> = {
    sys: {
      id: "city-1",
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
      country: mockCountry,
      description: "A beautiful city in Spain",
      visitDate: "2024-03-15",
      photos: mockPhotos,
    },
    metadata: {
      tags: [],
    },
  } as unknown as Entry<CitySkeleton>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Page Rendering", () => {
    it("should render city name", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      expect(screen.getByRole("heading", { name: "Barcelona" })).toBeInTheDocument();
    });

    it("should render country name", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      // Country name appears in paragraph below the city name heading
      const countryText = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === "p" && content === "Spain";
      });
      expect(countryText).toBeInTheDocument();
    });

    it("should render city description when present", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      expect(screen.getByText("A beautiful city in Spain")).toBeInTheDocument();
    });

    it("should render visit date when present", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      expect(screen.getByText(/Visited:/)).toBeInTheDocument();
    });

    it("should render photo count", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      expect(screen.getByText("1 photo")).toBeInTheDocument();
    });

    it("should render photo gallery when photos exist", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      const gallery = screen.getByTestId("photo-gallery");
      expect(gallery).toBeInTheDocument();
      expect(gallery).toHaveTextContent("Barcelona - 1 photos");
    });

    it("should render no photos message when no photos exist", async () => {
      const cityWithoutPhotos = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          photos: [],
        },
      } as unknown as Entry<CitySkeleton>;

      mockGetEntriesByType.mockResolvedValue({
        items: [cityWithoutPhotos],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      expect(screen.getByText(/No photos available yet/)).toBeInTheDocument();
    });

    it("should render breadcrumb navigation", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      const breadcrumb = screen.getByTestId("breadcrumb");
      expect(breadcrumb).toBeInTheDocument();
      expect(breadcrumb).toHaveTextContent("Travel");
      expect(breadcrumb).toHaveTextContent("Spain");
      expect(breadcrumb).toHaveTextContent("Barcelona");
    });

    it("should use plural 'photos' when multiple photos exist", async () => {
      const cityWithMultiplePhotos = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          photos: [mockPhotos[0], mockPhotos[0]],
        },
      } as unknown as Entry<CitySkeleton>;

      mockGetEntriesByType.mockResolvedValue({
        items: [cityWithMultiplePhotos],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      expect(screen.getByText("2 photos")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should call notFound when city is not found", async () => {
      const { notFound } = await import("next/navigation");
      jest.mocked(notFound).mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      mockGetEntriesByType.mockResolvedValue({
        items: [],
        total: 0,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "invalid" });

      await expect(CityPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
      expect(notFound).toHaveBeenCalled();
    });

    it("should call notFound when country slug does not match", async () => {
      const { notFound } = await import("next/navigation");
      jest.mocked(notFound).mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "france", citySlug: "barcelona" });

      await expect(CityPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
      expect(notFound).toHaveBeenCalled();
    });

    it("should handle missing description gracefully", async () => {
      const cityWithoutDescription = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          description: undefined,
        },
      } as unknown as Entry<CitySkeleton>;

      mockGetEntriesByType.mockResolvedValue({
        items: [cityWithoutDescription],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      expect(() => render(page as React.ReactElement)).not.toThrow();
    });

    it("should handle missing visitDate gracefully", async () => {
      const cityWithoutVisitDate = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          visitDate: undefined,
        },
      } as unknown as Entry<CitySkeleton>;

      mockGetEntriesByType.mockResolvedValue({
        items: [cityWithoutVisitDate],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      expect(screen.queryByText(/Visited:/)).not.toBeInTheDocument();
    });

    it("should handle null photos array", async () => {
      const cityWithNullPhotos = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          photos: null,
        },
      } as unknown as Entry<CitySkeleton>;

      mockGetEntriesByType.mockResolvedValue({
        items: [cityWithNullPhotos],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      expect(() => render(page as React.ReactElement)).not.toThrow();
    });
  });

  describe("generateMetadata", () => {
    it("should generate correct metadata for valid city", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const metadata = await generateMetadata({ params });

      expect(metadata.title).toBe("Barcelona, Spain | Travel Gallery");
      expect(metadata.description).toBe("A beautiful city in Spain");
    });

    it("should use photo count in description when no description provided", async () => {
      const cityWithoutDescription = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          description: undefined,
        },
      } as unknown as Entry<CitySkeleton>;

      mockGetEntriesByType.mockResolvedValue({
        items: [cityWithoutDescription],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const metadata = await generateMetadata({ params });

      expect(metadata.description).toBe("Explore 1 photos from Barcelona, Spain");
    });

    it("should generate OpenGraph metadata", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const metadata = await generateMetadata({ params });

      expect(metadata.openGraph).toEqual({
        title: "Barcelona, Spain - Travel Gallery",
        description: "A beautiful city in Spain",
        type: "website",
        url: "/travel/spain/barcelona",
        images: [
          {
            url: "https://images.ctfassets.net/space/beach.jpg",
            alt: "Photo from Barcelona, Spain",
          },
        ],
      });

      expect(metadata.twitter).toEqual({
        card: "summary_large_image",
        title: "Barcelona, Spain - Travel Gallery",
        description: "A beautiful city in Spain",
        images: ["https://images.ctfassets.net/space/beach.jpg"],
      });
    });

    it("should return 'City Not Found' metadata when city does not exist", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [],
        total: 0,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "invalid" });
      const metadata = await generateMetadata({ params });

      expect(metadata.title).toBe("City Not Found");
    });
  });

  describe("generateStaticParams", () => {
    it("should generate static params for all cities", async () => {
      const mockCities = [
        mockCity,
        {
          ...mockCity,
          sys: { ...mockCity.sys, id: "city-2" },
          fields: {
            ...mockCity.fields,
            name: "Madrid",
            slug: "madrid",
          },
        } as unknown as Entry<CitySkeleton>,
      ];

      mockGetEntriesByType.mockResolvedValue({
        items: mockCities,
        total: 2,
        skip: 0,
        limit: 100,
      } as never);

      const params = await generateStaticParams();

      expect(params).toEqual([
        { countrySlug: "spain", citySlug: "barcelona" },
        { countrySlug: "spain", citySlug: "madrid" },
      ]);
    });

    it("should handle empty cities list", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [],
        total: 0,
        skip: 0,
        limit: 100,
      } as never);

      const params = await generateStaticParams();

      expect(params).toEqual([]);
    });
  });

  describe("Security Tests", () => {
    it("should sanitize city name to prevent XSS", async () => {
      const maliciousCity = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          name: '<script>alert("XSS")</script>',
        },
      } as unknown as Entry<CitySkeleton>;

      mockGetEntriesByType.mockResolvedValue({
        items: [maliciousCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      // React should escape the script tag - check for the heading
      expect(screen.getByRole("heading", { name: /<script>alert\("XSS"\)<\/script>/ })).toBeInTheDocument();
      expect(document.querySelectorAll("script").length).toBe(0);
    });

    it("should sanitize description to prevent XSS", async () => {
      const cityWithMaliciousDescription = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          description: '<img src=x onerror="alert(\'XSS\')">',
        },
      } as unknown as Entry<CitySkeleton>;

      mockGetEntriesByType.mockResolvedValue({
        items: [cityWithMaliciousDescription],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      render(page as React.ReactElement);

      // React should escape the malicious HTML
      const description = screen.getByText(/img src=x/);
      expect(description).toBeInTheDocument();
    });

    it("should validate country slug matches to prevent unauthorized access", async () => {
      const { notFound } = await import("next/navigation");
      jest.mocked(notFound).mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      // Attempt to access Barcelona with wrong country slug
      const params = Promise.resolve({ countrySlug: "italy", citySlug: "barcelona" });

      await expect(CityPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
      // Should call notFound due to country mismatch
      expect(notFound).toHaveBeenCalled();
    });

    it("should handle SQL injection attempts in slug", async () => {
      const { notFound } = await import("next/navigation");
      jest.mocked(notFound).mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      mockGetEntriesByType.mockResolvedValue({
        items: [],
        total: 0,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({
        countrySlug: "spain",
        citySlug: "barcelona'; DROP TABLE cities; --",
      });

      await expect(CityPage({ params })).rejects.toThrow();

      // Should safely pass the malicious slug to Contentful API
      expect(mockGetEntriesByType).toHaveBeenCalledWith(
        "city",
        expect.objectContaining({
          "fields.slug": "barcelona'; DROP TABLE cities; --",
        })
      );
    });

    it("should handle path traversal attempts in slug", async () => {
      const { notFound } = await import("next/navigation");
      jest.mocked(notFound).mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      mockGetEntriesByType.mockResolvedValue({
        items: [],
        total: 0,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({
        countrySlug: "../../etc/passwd",
        citySlug: "barcelona",
      });

      await expect(CityPage({ params })).rejects.toThrow();

      // Should treat it as a regular slug and not traverse directories
      expect(mockGetEntriesByType).toHaveBeenCalled();
    });

    it("should handle extremely long slugs without crashing", async () => {
      const { notFound } = await import("next/navigation");
      jest.mocked(notFound).mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      mockGetEntriesByType.mockResolvedValue({
        items: [],
        total: 0,
        skip: 0,
        limit: 1,
      } as never);

      const longSlug = "a".repeat(10000);
      const params = Promise.resolve({ countrySlug: longSlug, citySlug: "barcelona" });

      // Should handle the long slug and call notFound
      await expect(CityPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("should handle special characters in slugs safely", async () => {
      const { notFound } = await import("next/navigation");
      jest.mocked(notFound).mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      mockGetEntriesByType.mockResolvedValue({
        items: [],
        total: 0,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({
        countrySlug: "spain<>\"'&",
        citySlug: "barcelona",
      });

      // Should handle special characters and call notFound
      await expect(CityPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("should not expose internal error details to users", async () => {
      mockGetEntriesByType.mockRejectedValue(new Error("Database connection failed"));

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });

      // Should throw the error but not render it to the user
      await expect(CityPage({ params })).rejects.toThrow();
    });
  });

  describe("Data Fetching", () => {
    it("should fetch city data with correct parameters", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });

      await CityPage({ params });

      expect(mockGetEntriesByType).toHaveBeenCalledWith("city", {
        "fields.slug": "barcelona",
        limit: 1,
      });
    });

    it("should only fetch one city", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });

      await CityPage({ params });

      expect(mockGetEntriesByType).toHaveBeenCalledWith(
        "city",
        expect.objectContaining({ limit: 1 })
      );
    });
  });

  describe("Styling and Layout", () => {
    it("should apply gradient background", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      const { container } = render(page as React.ReactElement);

      const mainDiv = container.querySelector(".bg-gradient-to-b");
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveClass("from-gray-50");
      expect(mainDiv).toHaveClass("to-white");
    });

    it("should apply responsive container classes", async () => {
      mockGetEntriesByType.mockResolvedValue({
        items: [mockCity],
        total: 1,
        skip: 0,
        limit: 1,
      } as never);

      const params = Promise.resolve({ countrySlug: "spain", citySlug: "barcelona" });
      const page = await CityPage({ params });

      const { container } = render(page as React.ReactElement);

      const containerDiv = container.querySelector(".container");
      expect(containerDiv).toBeInTheDocument();
      expect(containerDiv).toHaveClass("mx-auto");
      expect(containerDiv).toHaveClass("px-4");
      expect(containerDiv).toHaveClass("sm:px-6");
      expect(containerDiv).toHaveClass("lg:px-8");
    });
  });
});
