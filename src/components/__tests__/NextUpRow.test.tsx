/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import NextUpRow from "../NextUpRow";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const VISIT_TIME = Date.UTC(2026, 6, 14); // 2026-07-14

function renderRow(overrides?: Partial<Parameters<typeof NextUpRow>[0]>) {
  return render(
    <ul>
      <NextUpRow
        cityName="Valletta"
        countryName="Malta"
        flagUrl="//images.ctfassets.net/space/malta-flag.png"
        visitTime={VISIT_TIME}
        {...overrides}
      />
    </ul>
  );
}

describe("NextUpRow", () => {
  it("renders the city and country name", () => {
    renderRow();

    expect(screen.getByText("Valletta")).toBeInTheDocument();
    expect(screen.getByText(", Malta")).toBeInTheDocument();
  });

  it("shows the visit month and year", () => {
    // Rendered twice: inline for desktop, under the name for mobile.
    renderRow();

    expect(screen.getAllByText("July 2026")).toHaveLength(2);
  });

  it("shows a Coming soon badge", () => {
    renderRow();

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("renders the country flag with empty alt (decorative)", () => {
    const { container } = renderRow();

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "");
    expect(img?.getAttribute("src")).toContain("images.ctfassets.net");
  });

  it("renders a placeholder circle when no flag is available", () => {
    const { container } = renderRow({ flagUrl: null });

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("formats the date in UTC regardless of local timezone", () => {
    // Midnight UTC on the 1st: a west-of-UTC timezone would show the
    // previous month if formatting used local time.
    renderRow({ visitTime: Date.UTC(2026, 0, 1) });

    expect(screen.getAllByText("January 2026")).toHaveLength(2);
  });

  it("is not a link", () => {
    renderRow();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
