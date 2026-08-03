/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryRecipeGrid from "../CategoryRecipeGrid";
import { Entry } from "contentful";
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

function mockRecipe(slug: string, tags?: string[]): Entry<RecipeSkeleton> {
  return {
    sys: { id: `id-${slug}` },
    fields: {
      title: slug,
      slug,
      category: "mains",
      ingredients: "a",
      method: "b",
      ...(tags ? { tags } : {}),
    },
  } as unknown as Entry<RecipeSkeleton>;
}

const recipes = [
  mockRecipe("sausage-fusilloni", ["sausage", "pasta"]),
  mockRecipe("lamb-tagine", ["lamb"]),
  mockRecipe("mystery-stew"), // untagged
];

describe("CategoryRecipeGrid", () => {
  it("derives one pill per tag present, plus All first", () => {
    render(<CategoryRecipeGrid recipes={recipes} categorySlug="mains" />);

    const pills = screen.getAllByRole("button");
    expect(pills.map((b) => b.textContent)).toEqual([
      "All",
      "lamb",
      "pasta",
      "sausage",
    ]);
    expect(pills[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("shows everything (untagged included) under the default All state", () => {
    render(<CategoryRecipeGrid recipes={recipes} categorySlug="mains" />);

    expect(screen.getByText("sausage-fusilloni")).toBeInTheDocument();
    expect(screen.getByText("lamb-tagine")).toBeInTheDocument();
    expect(screen.getByText("mystery-stew")).toBeInTheDocument();
    expect(screen.getByText("3 recipes")).toBeInTheDocument();
  });

  it("filters to recipes carrying the selected tag and updates the count", async () => {
    const user = userEvent.setup();
    render(<CategoryRecipeGrid recipes={recipes} categorySlug="mains" />);

    await user.click(screen.getByRole("button", { name: "sausage" }));

    expect(screen.getByText("sausage-fusilloni")).toBeInTheDocument();
    expect(screen.queryByText("lamb-tagine")).not.toBeInTheDocument();
    expect(screen.queryByText("mystery-stew")).not.toBeInTheDocument();
    expect(screen.getByText("1 recipe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "sausage" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("a multi-tagged recipe appears under each of its tags", async () => {
    const user = userEvent.setup();
    render(<CategoryRecipeGrid recipes={recipes} categorySlug="mains" />);

    await user.click(screen.getByRole("button", { name: "pasta" }));
    expect(screen.getByText("sausage-fusilloni")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "sausage" }));
    expect(screen.getByText("sausage-fusilloni")).toBeInTheDocument();
  });

  it("restores the full grid via All, or by re-clicking the active pill", async () => {
    const user = userEvent.setup();
    render(<CategoryRecipeGrid recipes={recipes} categorySlug="mains" />);

    await user.click(screen.getByRole("button", { name: "lamb" }));
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("3 recipes")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "lamb" }));
    await user.click(screen.getByRole("button", { name: "lamb" }));
    expect(screen.getByText("3 recipes")).toBeInTheDocument();
  });

  it("renders no pill row when no recipe has tags", () => {
    render(
      <CategoryRecipeGrid
        recipes={[mockRecipe("plain-1"), mockRecipe("plain-2")]}
        categorySlug="mains"
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Filter recipes by tag" })
    ).not.toBeInTheDocument();
  });

  it("renders the empty state (and no pills) for an empty category", () => {
    render(<CategoryRecipeGrid recipes={[]} categorySlug="desserts" />);

    expect(screen.getByText("Recipes coming soon")).toBeInTheDocument();
    expect(screen.getByText("0 recipes")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
