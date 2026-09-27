/// <reference types="@testing-library/jest-dom" />
import { render, screen, within } from "@testing-library/react";
import NotFound, { metadata } from "../not-found";
import React from "react";

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

describe("NotFound page", () => {
  it("renders the 404 heading and explanation", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Off the map" })
    ).toBeInTheDocument();
    expect(screen.getByText(/this page doesn.t exist/i)).toBeInTheDocument();
  });

  it("links back into each main section", () => {
    render(<NotFound />);

    const section = screen.getByRole("region", {
      name: "Try one of these instead",
    });
    const hrefs = within(section)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/travel", "/cookbook", "/cv"]);

    for (const title of ["Travel", "Cookbook", "CV"]) {
      expect(
        within(section).getByRole("heading", { level: 3, name: title })
      ).toBeInTheDocument();
    }
  });

  it("links back to the homepage", () => {
    render(<NotFound />);

    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("sets a page title for the layout's title template", () => {
    expect(metadata.title).toBe("Page not found");
  });
});
