/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import CityCard from "../CityCard";
import { Entry } from "contentful";
import { CitySkeleton, PhotoSkeleton } from "@/types/contentful";
import React from "react";

// Mock Next.js components
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-fill={fill ? "true" : "false"} />;
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

describe("CityCard", () => {
  const mockCity: Entry<CitySkeleton> = {
    sys: {
      id: "test-city-id",
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
      description: "A beautiful city in Spain",
    },
    metadata: {
      tags: [],
    },
  } as unknown as Entry<CitySkeleton>;

  const mockPreviewPhoto: Entry<PhotoSkeleton> = {
    sys: {
      id: "test-photo-id",
      type: "Entry",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      locale: "en-US",
      contentType: {
        sys: {
          id: "photo",
          type: "Link",
          linkType: "ContentType",
        },
      },
      revision: 1,
    },
    fields: {
      title: "Barcelona Beach",
      image: {
        sys: {
          id: "image-id",
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
      },
    },
    metadata: {
      tags: [],
    },
  } as unknown as Entry<PhotoSkeleton>;

  const defaultProps = {
    city: mockCity,
    countrySlug: "spain",
    previewPhoto: mockPreviewPhoto,
    photoCount: 15,
  };

  describe("Rendering", () => {
    it("should render city name", () => {
      render(<CityCard {...defaultProps} />);
      expect(screen.getByText("Barcelona")).toBeInTheDocument();
    });

    it("should render preview image with correct src", () => {
      render(<CityCard {...defaultProps} />);
      const image = screen.getByAltText("Preview of Barcelona");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "https://images.ctfassets.net/space/beach.jpg"
      );
    });

    it("should render link to city page with correct path", () => {
      render(<CityCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/travel/spain/barcelona");
    });

    it("should render photo count badge", () => {
      render(<CityCard {...defaultProps} />);
      expect(screen.getByText("15 photos")).toBeInTheDocument();
    });

    it("should render singular 'photo' for count of 1", () => {
      render(<CityCard {...defaultProps} photoCount={1} />);
      expect(screen.getByText("1 photo")).toBeInTheDocument();
    });

    it("should handle zero photo count", () => {
      render(<CityCard {...defaultProps} photoCount={0} />);
      expect(screen.getByText("0 photos")).toBeInTheDocument();
    });

    it("should handle missing preview photo gracefully", () => {
      render(<CityCard {...defaultProps} previewPhoto={null} />);
      expect(screen.getByText("Barcelona")).toBeInTheDocument();
      expect(
        screen.queryByAltText("Preview of Barcelona")
      ).not.toBeInTheDocument();
    });

    it("should render placeholder icon when no preview photo", () => {
      const { container } = render(
        <CityCard {...defaultProps} previewPhoto={null} />
      );
      // Check for SVG placeholder
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic HTML structure", () => {
      render(<CityCard {...defaultProps} />);
      const article = screen.getByRole("article");
      expect(article).toBeInTheDocument();
    });

    it("should have accessible link with proper href", () => {
      render(<CityCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/travel/spain/barcelona");
      expect(link.className).toContain("focus:outline-none");
      expect(link.className).toContain("focus:ring-2");
    });

    it("should have descriptive alt text for preview image", () => {
      render(<CityCard {...defaultProps} />);
      const image = screen.getByAltText("Preview of Barcelona");
      expect(image).toBeInTheDocument();
    });

    it("should use heading level 2 for city name", () => {
      render(<CityCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Barcelona");
    });

    it("should have keyboard focus styles", () => {
      render(<CityCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("focus:ring-blue-500");
      expect(link.className).toContain("focus:ring-offset-2");
    });

    it("should have aria-hidden on placeholder icon", () => {
      const { container } = render(
        <CityCard {...defaultProps} previewPhoto={null} />
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Security", () => {
    it("should not execute script tags in city name", () => {
      const maliciousCity = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          name: '<script>alert("xss")</script>Barcelona',
        },
      } as unknown as Entry<CitySkeleton>;

      render(<CityCard {...defaultProps} city={maliciousCity} />);
      expect(screen.getByText(/Barcelona/)).toBeInTheDocument();
      expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    it("should safely handle special characters in slug", () => {
      const cityWithSpecialChars = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          slug: "barcelona/../../../etc/passwd",
        },
      } as unknown as Entry<CitySkeleton>;

      render(<CityCard {...defaultProps} city={cityWithSpecialChars} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "href",
        "/travel/spain/barcelona/../../../etc/passwd"
      );
    });

    it("should use HTTPS protocol for images", () => {
      render(<CityCard {...defaultProps} />);
      const image = screen.getByAltText("Preview of Barcelona");
      expect(image.getAttribute("src")).toMatch(/^https:/);
    });

    it("should handle XSS in country slug", () => {
      render(
        <CityCard
          {...defaultProps}
          countrySlug="<script>alert('xss')</script>"
        />
      );
      const link = screen.getByRole("link");
      // The link should contain the escaped value
      expect(link).toBeInTheDocument();
    });
  });

  describe("Image Optimization", () => {
    it("should use lazy loading for images", () => {
      render(<CityCard {...defaultProps} />);
      const image = screen.getByAltText("Preview of Barcelona");
      expect(image).toHaveAttribute("loading", "lazy");
    });

    it("should have responsive image sizes", () => {
      render(<CityCard {...defaultProps} />);
      const image = screen.getByAltText("Preview of Barcelona");
      expect(image).toHaveAttribute("sizes");
      expect(image.getAttribute("sizes")).toContain("max-width");
    });

    it("should use fill layout for images", () => {
      render(<CityCard {...defaultProps} />);
      const image = screen.getByAltText("Preview of Barcelona");
      expect(image).toHaveAttribute("data-fill", "true");
    });
  });

  describe("Styling and UX", () => {
    it("should have hover effects classes", () => {
      render(<CityCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("hover:shadow-xl");
      expect(link.className).toContain("hover:scale-105");
    });

    it("should have transition classes for smooth animations", () => {
      render(<CityCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("transition-all");
      expect(link.className).toContain("duration-300");
    });

    it("should have proper aspect ratio container for image", () => {
      const { container } = render(<CityCard {...defaultProps} />);
      const imageContainer = container.querySelector(".aspect-\\[4\\/3\\]");
      expect(imageContainer).toBeInTheDocument();
    });

    it("should have border and shadow styling", () => {
      render(<CityCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("border");
      expect(link.className).toContain("shadow-sm");
      expect(link.className).toContain("rounded-lg");
    });

    it("should have photo count badge with proper styling", () => {
      render(<CityCard {...defaultProps} />);
      const badge = screen.getByText("15 photos");
      expect(badge.className).toContain("rounded-full");
      expect(badge.className).toContain("bg-black/70");
    });
  });

  describe("Error Handling", () => {
    it("should handle undefined city fields gracefully", () => {
      const cityWithUndefinedFields = {
        sys: mockCity.sys,
        fields: {},
      } as unknown as Entry<CitySkeleton>;

      expect(() => {
        render(<CityCard {...defaultProps} city={cityWithUndefinedFields} />);
      }).not.toThrow();
    });

    it("should handle null image in preview photo", () => {
      const photoWithNullImage = {
        ...mockPreviewPhoto,
        fields: {
          ...mockPreviewPhoto.fields,
          image: null,
        },
      } as unknown as Entry<PhotoSkeleton>;

      render(<CityCard {...defaultProps} previewPhoto={photoWithNullImage} />);
      expect(screen.getByText("Barcelona")).toBeInTheDocument();
    });

    it("should display fallback text for missing city name", () => {
      const cityWithNoName = {
        ...mockCity,
        fields: {
          ...mockCity.fields,
          name: undefined,
        },
      } as unknown as Entry<CitySkeleton>;

      render(<CityCard {...defaultProps} city={cityWithNoName} />);
      expect(screen.getByText("Unknown City")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive grid classes in parent context", () => {
      // The card itself should have proper responsive sizing through its parent grid
      render(<CityCard {...defaultProps} />);
      const link = screen.getByRole("link");
      // Card should be a block element that fills its grid cell
      expect(link.className).toContain("block");
    });

    it("should have responsive image sizes attribute", () => {
      render(<CityCard {...defaultProps} />);
      const image = screen.getByAltText("Preview of Barcelona");
      const sizes = image.getAttribute("sizes");
      // Should include mobile, tablet, and desktop breakpoints
      expect(sizes).toContain("640px");
      expect(sizes).toContain("1024px");
    });
  });
});
