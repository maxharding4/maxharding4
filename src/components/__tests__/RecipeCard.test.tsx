/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import RecipeCard from "../RecipeCard";
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

function mockRecipe(
  overrides: Record<string, unknown> = {}
): Entry<RecipeSkeleton> {
  return {
    sys: { id: "recipe-1" },
    fields: {
      title: "Asparagus, Pea & Pancetta Pasta",
      slug: "asparagus-pea-and-pancetta-pasta",
      category: "mains",
      description: "A speedy midweek dinner with a creamy lemon sauce.",
      image: {
        fields: {
          file: { url: "//images.ctfassets.net/space/recipe.jpg" },
        },
      },
      ingredients: "175g pasta",
      method: "Cook it.",
      servings: 2,
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      ...overrides,
    },
  } as unknown as Entry<RecipeSkeleton>;
}

describe("RecipeCard", () => {
  it("links to the recipe page under its category", () => {
    render(<RecipeCard recipe={mockRecipe()} categorySlug="mains" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/cookbook/mains/asparagus-pea-and-pancetta-pasta"
    );
  });

  it("renders title, description teaser and meta line", () => {
    render(<RecipeCard recipe={mockRecipe()} categorySlug="mains" />);
    expect(
      screen.getByRole("heading", { name: "Asparagus, Pea & Pancetta Pasta" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("A speedy midweek dinner with a creamy lemon sauce.")
    ).toBeInTheDocument();
    // 10 prep + 15 cook
    expect(screen.getByText("25 min")).toBeInTheDocument();
    expect(screen.getByText("Serves 2")).toBeInTheDocument();
  });

  it("renders the photo uncropped in a 3:2 frame", () => {
    const { container } = render(
      <RecipeCard recipe={mockRecipe()} categorySlug="mains" />
    );
    expect(container.querySelector(".aspect-\\[3\\/2\\]")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      "Photo of Asparagus, Pea & Pancetta Pasta"
    );
  });

  it("renders a placeholder when the recipe has no image", () => {
    render(
      <RecipeCard recipe={mockRecipe({ image: undefined })} categorySlug="mains" />
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("omits the meta line when servings and times are absent", () => {
    render(
      <RecipeCard
        recipe={mockRecipe({
          servings: undefined,
          prepTimeMinutes: undefined,
          cookTimeMinutes: undefined,
        })}
        categorySlug="mains"
      />
    );
    expect(screen.queryByText(/min/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Serves/)).not.toBeInTheDocument();
  });
});
