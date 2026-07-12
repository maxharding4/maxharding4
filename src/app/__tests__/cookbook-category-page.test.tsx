/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import CategoryPage, { generateStaticParams } from "../cookbook/[categorySlug]/page";
import * as contentful from "@/lib/contentful";
import { notFound } from "next/navigation";
import { Entry, EntryCollection } from "contentful";
import { RecipeSkeleton } from "@/types/contentful";
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

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("@/lib/contentful");

const mockGetEntriesByType = contentful.getEntriesByType as jest.MockedFunction<
  typeof contentful.getEntriesByType
>;

function mockRecipe(slug: string, category: string): Entry<RecipeSkeleton> {
  return {
    sys: { id: `id-${slug}` },
    fields: {
      title: slug,
      slug,
      category,
      ingredients: "a",
      method: "b",
    },
  } as unknown as Entry<RecipeSkeleton>;
}

function asCollection(items: Entry<RecipeSkeleton>[]) {
  return {
    items,
    total: items.length,
    skip: 0,
    limit: 100,
    sys: { type: "Array" },
  } as unknown as EntryCollection<RecipeSkeleton>;
}

function pageParams(categorySlug: string) {
  return { params: Promise.resolve({ categorySlug }) };
}

describe("CategoryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates static params for exactly the four configured categories", async () => {
    expect(await generateStaticParams()).toEqual([
      { categorySlug: "mains" },
      { categorySlug: "sides" },
      { categorySlug: "snacks" },
      { categorySlug: "desserts" },
    ]);
  });

  it("renders only the recipes in the requested category", async () => {
    mockGetEntriesByType.mockResolvedValue(
      asCollection([
        mockRecipe("lasagne", "mains"),
        mockRecipe("flapjack", "snacks"),
      ])
    );

    render(await CategoryPage(pageParams("mains")));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mains");
    expect(screen.getByText("lasagne")).toBeInTheDocument();
    expect(screen.queryByText("flapjack")).not.toBeInTheDocument();
    expect(screen.getByText("1 recipe")).toBeInTheDocument();
  });

  it("shows the empty state for a category with no recipes", async () => {
    mockGetEntriesByType.mockResolvedValue(asCollection([]));

    render(await CategoryPage(pageParams("desserts")));

    expect(screen.getByText("Recipes coming soon")).toBeInTheDocument();
    expect(screen.getByText("0 recipes")).toBeInTheDocument();
  });

  it("404s for an unknown category slug", async () => {
    mockGetEntriesByType.mockResolvedValue(asCollection([]));

    await expect(CategoryPage(pageParams("starters"))).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
    expect(notFound).toHaveBeenCalled();
  });
});
