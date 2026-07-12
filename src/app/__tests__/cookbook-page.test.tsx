/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import CookbookPage from "../cookbook/page";
import * as contentful from "@/lib/contentful";
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
      image: { fields: { file: { url: `//images.ctfassets.net/x/${slug}.jpg` } } },
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

describe("CookbookPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all four category cards in order", async () => {
    mockGetEntriesByType.mockResolvedValue(asCollection([]));

    render(await CookbookPage());

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual([
      "Mains",
      "Sides",
      "Snacks",
      "Desserts",
    ]);
  });

  it("links populated categories and shows their recipe count", async () => {
    mockGetEntriesByType.mockResolvedValue(
      asCollection([
        mockRecipe("lasagne", "mains"),
        mockRecipe("carbonara", "mains"),
      ])
    );

    render(await CookbookPage());

    expect(screen.getByRole("link", { name: /Mains/ })).toHaveAttribute(
      "href",
      "/cookbook/mains"
    );
    expect(screen.getByText("2 recipes")).toBeInTheDocument();
  });

  it("renders empty categories as non-clickable coming-soon cards", async () => {
    mockGetEntriesByType.mockResolvedValue(
      asCollection([mockRecipe("lasagne", "mains")])
    );

    render(await CookbookPage());

    // Mains is a link; the three empty categories are not.
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getAllByRole("status")).toHaveLength(3);
    expect(
      screen.getByLabelText(/Desserts - Coming soon/)
    ).toBeInTheDocument();
  });

  it("uses the first recipe's photo as the category preview image", async () => {
    mockGetEntriesByType.mockResolvedValue(
      asCollection([mockRecipe("lasagne", "mains")])
    );

    render(await CookbookPage());

    const img = screen.getByRole("img", { name: "Mains recipes" });
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("lasagne.jpg")
    );
  });
});
