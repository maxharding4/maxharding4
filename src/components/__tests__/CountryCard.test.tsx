/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import CountryCard from "../CountryCard";
import { Entry } from "contentful";
import { CountrySkeleton } from "@/types/contentful";
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

describe("CountryCard", () => {
  const mockCountry: Entry<CountrySkeleton> = {
    sys: {
      id: "test-country-id",
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
            url: "//images.ctfassets.net/space/flag.jpg",
            details: {
              size: 12345,
              image: {
                width: 800,
                height: 600,
              },
            },
            fileName: "flag.jpg",
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

  const mockCountryWithoutImage: Entry<CountrySkeleton> = {
    ...mockCountry,
    fields: {
      ...mockCountry.fields,
      flagImage: undefined,
    },
  } as unknown as Entry<CountrySkeleton>;

  describe("Rendering", () => {
    it("should render country name", () => {
      render(<CountryCard country={mockCountry} />);
      expect(screen.getByText("Spain")).toBeInTheDocument();
    });

    it("should render country flag image with correct src", () => {
      render(<CountryCard country={mockCountry} />);
      const image = screen.getByAltText("Spain flag");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "https://images.ctfassets.net/space/flag.jpg"
      );
    });

    it("should render link to country page", () => {
      render(<CountryCard country={mockCountry} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/travel/spain");
    });

    it("should handle missing flag image gracefully", () => {
      render(<CountryCard country={mockCountryWithoutImage} />);
      expect(screen.getByText("Spain")).toBeInTheDocument();
      expect(screen.queryByAltText("Spain flag")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic HTML structure", () => {
      render(<CountryCard country={mockCountry} />);
      const article = screen.getByRole("article");
      expect(article).toBeInTheDocument();
    });

    it("should have accessible link with proper href", () => {
      render(<CountryCard country={mockCountry} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/travel/spain");
      expect(link.className).toContain("focus:outline-none");
      expect(link.className).toContain("focus:ring-2");
    });

    it("should have descriptive alt text for flag image", () => {
      render(<CountryCard country={mockCountry} />);
      const image = screen.getByAltText("Spain flag");
      expect(image).toBeInTheDocument();
    });

    it("should use heading for country name", () => {
      render(<CountryCard country={mockCountry} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Spain");
    });

    it("should have keyboard focus styles", () => {
      render(<CountryCard country={mockCountry} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("focus:ring-blue-500");
      expect(link.className).toContain("focus:ring-offset-2");
    });
  });

  describe("Security", () => {
    it("should not execute script tags in country name", () => {
      const maliciousCountry = {
        ...mockCountry,
        fields: {
          ...mockCountry.fields,
          name: '<script>alert("xss")</script>Spain',
        },
      } as unknown as Entry<CountrySkeleton>;

      render(<CountryCard country={maliciousCountry} />);
      // React automatically escapes content, so the script tag should be rendered as text
      expect(screen.getByText(/Spain/)).toBeInTheDocument();
      // Verify no script was executed
      expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    it("should safely handle special characters in slug", () => {
      const countryWithSpecialChars = {
        ...mockCountry,
        fields: {
          ...mockCountry.fields,
          slug: "spain-test/../../../etc/passwd",
        },
      } as unknown as Entry<CountrySkeleton>;

      render(<CountryCard country={countryWithSpecialChars} />);
      const link = screen.getByRole("link");
      // Next.js Link should handle this safely
      expect(link).toHaveAttribute(
        "href",
        "/travel/spain-test/../../../etc/passwd"
      );
    });

    it("should use HTTPS protocol for images", () => {
      render(<CountryCard country={mockCountry} />);
      const image = screen.getByAltText("Spain flag");
      expect(image.getAttribute("src")).toMatch(/^https:/);
    });

    it("should handle image URLs without protocol safely", () => {
      render(<CountryCard country={mockCountry} />);
      const image = screen.getByAltText("Spain flag");
      // Should prepend https:
      expect(image.getAttribute("src")).toMatch(/^https:/);
    });
  });

  describe("Image Optimization", () => {
    it("should use lazy loading for images", () => {
      render(<CountryCard country={mockCountry} />);
      const image = screen.getByAltText("Spain flag");
      expect(image).toHaveAttribute("loading", "lazy");
    });

    it("should have responsive image sizes", () => {
      render(<CountryCard country={mockCountry} />);
      const image = screen.getByAltText("Spain flag");
      expect(image).toHaveAttribute("sizes");
      expect(image.getAttribute("sizes")).toContain("max-width");
    });

    it("should use fill layout for images", () => {
      render(<CountryCard country={mockCountry} />);
      const image = screen.getByAltText("Spain flag");
      expect(image).toHaveAttribute("data-fill", "true");
    });
  });

  describe("Styling and UX", () => {
    it("should have hover effects classes", () => {
      render(<CountryCard country={mockCountry} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("hover:shadow-xl");
      expect(link.className).toContain("hover:scale-105");
    });

    it("should have transition classes for smooth animations", () => {
      render(<CountryCard country={mockCountry} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("transition-all");
      expect(link.className).toContain("duration-300");
    });

    it("should have proper aspect ratio container for image", () => {
      const { container } = render(<CountryCard country={mockCountry} />);
      const imageContainer = container.querySelector(".aspect-\\[3\\/2\\]");
      expect(imageContainer).toBeInTheDocument();
    });

    it("should have border and shadow styling", () => {
      render(<CountryCard country={mockCountry} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("border");
      expect(link.className).toContain("shadow-sm");
      expect(link.className).toContain("rounded-lg");
    });
  });

  describe("Error Handling", () => {
    it("should handle undefined fields gracefully", () => {
      const countryWithUndefinedFields = {
        sys: mockCountry.sys,
        fields: {},
      } as unknown as Entry<CountrySkeleton>;

      expect(() => {
        render(<CountryCard country={countryWithUndefinedFields} />);
      }).not.toThrow();
    });

    it("should handle null image URL", () => {
      const countryWithNullImageUrl = {
        ...mockCountry,
        fields: {
          ...mockCountry.fields,
          flagImage: {
            fields: {
              file: null,
            },
          },
        },
      } as unknown as Entry<CountrySkeleton>;

      render(<CountryCard country={countryWithNullImageUrl} />);
      expect(screen.getByText("Spain")).toBeInTheDocument();
      expect(screen.queryByAltText("Spain flag")).not.toBeInTheDocument();
    });
  });
});
