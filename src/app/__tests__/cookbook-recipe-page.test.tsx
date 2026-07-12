/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import RecipePage from "../cookbook/[categorySlug]/[recipeSlug]/page";
import * as contentful from "@/lib/contentful";
import { notFound } from "next/navigation";
import { Entry, EntryCollection } from "contentful";
import { RecipeSkeleton } from "@/types/contentful";
import React from "react";

// Mock Next.js Image component
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

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("@/lib/contentful");

const mockGetEntriesByType = contentful.getEntriesByType as jest.MockedFunction<
  typeof contentful.getEntriesByType
>;

const RECIPE = {
  sys: { id: "recipe-1" },
  fields: {
    title: "Spaghetti Bolognese",
    slug: "spaghetti-bolognese",
    category: "mains",
    description: "Healthy weeknight version.",
    image: {
      fields: { file: { url: "//images.ctfassets.net/x/bolognese.jpg" } },
    },
    ingredients: "500g lean beef mince\n1 onion, coarsely grated",
    method: "Brown the mince.\n\nSimmer the sauce.",
    servings: 4,
  },
} as unknown as Entry<RecipeSkeleton>;

function asCollection(items: Entry<RecipeSkeleton>[]) {
  return {
    items,
    total: items.length,
    skip: 0,
    limit: 100,
    sys: { type: "Array" },
  } as unknown as EntryCollection<RecipeSkeleton>;
}

function pageParams(categorySlug: string, recipeSlug: string) {
  return { params: Promise.resolve({ categorySlug, recipeSlug }) };
}

describe("RecipePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title, meta, ingredients list and numbered method steps", async () => {
    mockGetEntriesByType.mockResolvedValue(asCollection([RECIPE]));

    render(await RecipePage(pageParams("mains", "spaghetti-bolognese")));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Spaghetti Bolognese"
    );
    expect(screen.getByText("Serves 4")).toBeInTheDocument();

    const ingredients = screen.getByRole("heading", { name: "Ingredients" });
    expect(ingredients).toBeInTheDocument();
    expect(screen.getByText("500g lean beef mince")).toBeInTheDocument();
    expect(screen.getByText("1 onion, coarsely grated")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Method" })).toBeInTheDocument();
    expect(screen.getByText("Brown the mince.")).toBeInTheDocument();
    expect(screen.getByText("Simmer the sauce.")).toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: "Photo of Spaghetti Bolognese" })
    ).toBeInTheDocument();
  });

  it("renders breadcrumbs back to the category and cookbook", async () => {
    mockGetEntriesByType.mockResolvedValue(asCollection([RECIPE]));

    render(await RecipePage(pageParams("mains", "spaghetti-bolognese")));

    expect(screen.getByRole("link", { name: "Cookbook" })).toHaveAttribute(
      "href",
      "/cookbook"
    );
    expect(screen.getByRole("link", { name: "Mains" })).toHaveAttribute(
      "href",
      "/cookbook/mains"
    );
  });

  it("404s for an unknown recipe slug", async () => {
    mockGetEntriesByType.mockResolvedValue(asCollection([]));

    await expect(
      RecipePage(pageParams("mains", "not-a-recipe"))
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("404s for an unknown category slug", async () => {
    mockGetEntriesByType.mockResolvedValue(asCollection([RECIPE]));

    await expect(
      RecipePage(pageParams("starters", "spaghetti-bolognese"))
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("404s when the recipe exists but under a different category", async () => {
    mockGetEntriesByType.mockResolvedValue(asCollection([RECIPE]));

    await expect(
      RecipePage(pageParams("desserts", "spaghetti-bolognese"))
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
