/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import CategoryCard from "../CategoryCard";
import { CATEGORIES } from "@/lib/cookbook";
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

const mains = CATEGORIES.find((c) => c.slug === "mains")!;

describe("CategoryCard", () => {
  it("names the link with the category label", () => {
    render(<CategoryCard category={mains} recipeCount={3} />);
    expect(screen.getByRole("link", { name: "Mains" })).toHaveAttribute(
      "href",
      "/cookbook/mains"
    );
  });

  it("renders a labelled, non-link card when the category is empty", () => {
    render(<CategoryCard category={mains} recipeCount={0} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(/Mains - Coming soon/)
    ).toBeInTheDocument();
  });
});
