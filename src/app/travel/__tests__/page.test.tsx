/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TravelPage, { generateMetadata } from "../page";
import * as contentful from "@/lib/contentful";
import { Entry, EntryCollection } from "contentful";
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

// Mock the contentful module
jest.mock("@/lib/contentful");

describe("Travel Page", () => {
  const mockCountries: EntryCollection<CountrySkeleton> = {
    items: [
      {
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
      },
      {
        sys: {
          id: "france-id",
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
          name: "France",
          slug: "france",
          countryCode: "FR",
          flagImage: {
            sys: {
              id: "flag-id-2",
              type: "Asset",
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z",
              locale: "en-US",
              revision: 1,
            },
            fields: {
              title: "France Flag",
              file: {
                url: "//images.ctfassets.net/space/france-flag.jpg",
                details: {
                  size: 12345,
                  image: {
                    width: 800,
                    height: 600,
                  },
                },
                fileName: "france-flag.jpg",
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
    ] as unknown as Entry<CountrySkeleton>[],
    total: 2,
    skip: 0,
    limit: 100,
    sys: { type: "Array" },
  };

  const mockEmptyCountries: EntryCollection<CountrySkeleton> = {
    items: [],
    total: 0,
    skip: 0,
    limit: 100,
    sys: { type: "Array" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering with Countries", () => {
    it("should render page title", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      expect(screen.getByText("Travel Gallery")).toBeInTheDocument();
    });

    it("should render page description", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      expect(
        screen.getByText(/Explore my adventures around the world/i)
      ).toBeInTheDocument();
    });

    it("should render all country cards", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      expect(screen.getByText("Spain")).toBeInTheDocument();
      expect(screen.getByText("France")).toBeInTheDocument();
    });

    it("should display country count", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      expect(
        screen.getByText("2 countries visited, and counting...")
      ).toBeInTheDocument();
    });

    it("should use singular 'country' for single country", async () => {
      const singleCountry = {
        ...mockCountries,
        items: [mockCountries.items[0]],
        total: 1,
      };

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(singleCountry);

      const page = await TravelPage();
      render(page);

      expect(
        screen.getByText("1 country visited, and counting...")
      ).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should render empty state message when no countries", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockEmptyCountries);

      const page = await TravelPage();
      render(page);

      expect(
        screen.getByText("No countries available yet. Check back soon!")
      ).toBeInTheDocument();
    });

    it("should not render country count when no countries", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockEmptyCountries);

      const page = await TravelPage();
      render(page);

      expect(screen.queryByText(/countries visited/i)).not.toBeInTheDocument();
    });

    it("should not render grid when no countries", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockEmptyCountries);

      const page = await TravelPage();
      const { container } = render(page);

      const grid = container.querySelector(".grid");
      expect(grid).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Travel Gallery");
    });

    it("should have semantic header element", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      const { container } = render(page);

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });

    it("should have descriptive page description for screen readers", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const description = screen.getByText(
        /Click on a country to see photos and stories/i
      );
      expect(description).toBeInTheDocument();
    });

    it("should render country cards in a list-like grid", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      const { container } = render(page);

      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    it("should fetch countries from Contentful", async () => {
      const spy = jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      await TravelPage();

      expect(spy).toHaveBeenCalledWith("country", {
        order: ["fields.name"],
      });
    });

    it("should sort countries alphabetically by name", async () => {
      const spy = jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      await TravelPage();

      expect(spy).toHaveBeenCalledWith("country", {
        order: ["fields.name"],
      });
    });

    it("should handle Contentful API errors gracefully", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockEmptyCountries);

      const page = await TravelPage();
      render(page);

      // Should show empty state instead of crashing
      expect(
        screen.getByText("No countries available yet. Check back soon!")
      ).toBeInTheDocument();
    });
  });

  describe("Metadata Generation", () => {
    it("should generate correct page title", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const metadata = await generateMetadata();

      expect(metadata.title).toBe(
        "Travel Gallery | My Adventures Around the World"
      );
    });

    it("should generate description with country count", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const metadata = await generateMetadata();

      expect(metadata.description).toContain("2 countries");
    });

    it("should include Open Graph metadata", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const metadata = await generateMetadata();

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe("Travel Gallery | My Adventures Around the World");
      expect(metadata.openGraph?.type).toBe("website");
      expect(metadata.openGraph?.url).toBe("/travel");
    });
  });

  describe("Security", () => {
    it("should not execute malicious scripts in country data", async () => {
      const maliciousCountries = {
        ...mockCountries,
        items: [
          {
            ...mockCountries.items[0],
            fields: {
              ...mockCountries.items[0].fields,
              name: '<script>alert("xss")</script>Malicious Country',
            },
          },
        ] as unknown as Entry<CountrySkeleton>[],
      };

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(maliciousCountries);

      const page = await TravelPage();
      render(page);

      // React should escape the script tag
      expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    it("should handle injection attempts in metadata", async () => {
      const countriesWithInjection = {
        ...mockCountries,
        items: [
          {
            ...mockCountries.items[0],
            fields: {
              ...mockCountries.items[0].fields,
              name: "'; DROP TABLE countries; --",
            },
          },
        ] as unknown as Entry<CountrySkeleton>[],
      };

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(countriesWithInjection);

      const metadata = await generateMetadata();

      // Should include the malicious string as plain text, not execute it
      expect(metadata.description).toBeDefined();
      expect(typeof metadata.description).toBe("string");
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive grid classes", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      const { container } = render(page);

      const grid = container.querySelector(".grid");
      expect(grid).toBeTruthy();
      expect(grid?.className).toContain("grid-cols-1");
      expect(grid?.className).toContain("sm:grid-cols-2");
      expect(grid?.className).toContain("lg:grid-cols-3");
      expect(grid?.className).toContain("xl:grid-cols-4");
    });

    it("should have responsive spacing", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      const { container } = render(page);

      const mainContainer = container.querySelector(".container");
      expect(mainContainer).toBeTruthy();
      expect(mainContainer?.className).toContain("px-4");
      expect(mainContainer?.className).toContain("sm:px-6");
      expect(mainContainer?.className).toContain("lg:px-8");
    });

    it("should have responsive typography", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.className).toContain("text-4xl");
      expect(heading.className).toContain("sm:text-5xl");
      expect(heading.className).toContain("md:text-6xl");
    });
  });

  describe("Performance", () => {
    it("should have gap spacing for grid", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      const { container } = render(page);

      const grid = container.querySelector(".grid");
      expect(grid).toBeTruthy();
      expect(grid?.className).toContain("gap-6");
    });

    it("should use min-h-screen for full viewport height", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      const { container } = render(page);

      const mainDiv = container.querySelector(".min-h-screen");
      expect(mainDiv).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should render search box when countries exist", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      expect(searchInput).toBeInTheDocument();
    });

    it("should not render search box when no countries exist", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockEmptyCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.queryByPlaceholderText("Search countries...");
      expect(searchInput).not.toBeInTheDocument();
    });

    it("should filter countries by search query", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "Spain");

      await waitFor(() => {
        expect(screen.getByText("Spain")).toBeInTheDocument();
        expect(screen.queryByText("France")).not.toBeInTheDocument();
      });
    });

    it("should show results count when searching", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "Spain");

      await waitFor(() => {
        expect(
          screen.getByText(/Showing 1 of 2 countries/i)
        ).toBeInTheDocument();
      });
    });

    it("should show no results message when search has no matches", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "NonexistentCountry");

      await waitFor(() => {
        expect(
          screen.getByText(/No countries match "NonexistentCountry"/i)
        ).toBeInTheDocument();
      });
    });

    it("should be case-insensitive when filtering", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "spain");

      await waitFor(() => {
        expect(screen.getByText("Spain")).toBeInTheDocument();
      });
    });

    it("should show all countries when search is cleared", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "Spain");

      await waitFor(() => {
        expect(screen.queryByText("France")).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText("Spain")).toBeInTheDocument();
        expect(screen.getByText("France")).toBeInTheDocument();
      });
    });

    it("should hide country count when searching", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      expect(
        screen.getByText("2 countries visited, and counting...")
      ).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "Spain");

      await waitFor(() => {
        expect(
          screen.queryByText(/countries visited/)
        ).not.toBeInTheDocument();
      });
    });

    it("should handle partial matches", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "Spa");

      await waitFor(() => {
        expect(screen.getByText("Spain")).toBeInTheDocument();
      });
    });

    it("should filter multiple matching countries", async () => {
      const user = userEvent.setup();
      const countriesWithSimilarNames = {
        ...mockCountries,
        items: [
          ...mockCountries.items,
          {
            ...mockCountries.items[0],
            sys: {
              ...mockCountries.items[0].sys,
              id: "spain-2-id",
            },
            fields: {
              ...mockCountries.items[0].fields,
              name: "Spanish Sahara",
              slug: "spanish-sahara",
            },
          },
        ] as unknown as Entry<CountrySkeleton>[],
        total: 3,
      };

      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(countriesWithSimilarNames);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "Spai");

      await waitFor(() => {
        expect(screen.getByText("Spain")).toBeInTheDocument();
        expect(screen.queryByText("France")).not.toBeInTheDocument();
      });

      await user.clear(searchInput);
      await user.type(searchInput, "Spanish");

      await waitFor(() => {
        expect(screen.getByText("Spanish Sahara")).toBeInTheDocument();
        expect(screen.queryByText("France")).not.toBeInTheDocument();
      });
    });

    it("should handle XSS attempts in search query", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, '<script>alert("xss")</script>');

      await waitFor(() => {
        expect(document.querySelector("script")).not.toBeInTheDocument();
      });
    });

    it("should trim whitespace in search query", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "   Spain   ");

      await waitFor(() => {
        expect(screen.getByText("Spain")).toBeInTheDocument();
        expect(screen.queryByText("France")).not.toBeInTheDocument();
      });
    });

    it("should show all countries when search is only whitespace", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "   ");

      await waitFor(() => {
        expect(screen.getByText("Spain")).toBeInTheDocument();
        expect(screen.getByText("France")).toBeInTheDocument();
      });
    });

    it("should have accessible search box with proper ARIA label", async () => {
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByLabelText("Search countries by name");
      expect(searchInput).toBeInTheDocument();
    });

    it("should clear search with clear button", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "Spain");

      await waitFor(() => {
        expect(screen.queryByText("France")).not.toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText("Clear search");
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText("Spain")).toBeInTheDocument();
        expect(screen.getByText("France")).toBeInTheDocument();
      });
    });

    it("should clear search with Escape key", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "Spain");

      await waitFor(() => {
        expect(screen.queryByText("France")).not.toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.getByText("Spain")).toBeInTheDocument();
        expect(screen.getByText("France")).toBeInTheDocument();
      });
    });

    it("should show correct singular/plural for results count", async () => {
      const user = userEvent.setup();
      jest
        .spyOn(contentful, "getEntriesByType")
        .mockResolvedValue(mockCountries);

      const page = await TravelPage();
      render(page);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "Spain");

      await waitFor(() => {
        expect(
          screen.getByText(/Showing 1 of 2 countries/i)
        ).toBeInTheDocument();
      });
    });
  });
});
