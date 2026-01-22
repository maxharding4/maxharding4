import { render, screen, fireEvent } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollTo = jest.fn();
  });

  describe("Rendering and Structure", () => {
    it("renders the footer element", () => {
      render(<Footer />);
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("renders copyright notice with current year", () => {
      const currentYear = new Date().getFullYear();
      render(<Footer />);
      expect(
        screen.getByText(`© ${currentYear} Max Harding. All rights reserved.`)
      ).toBeInTheDocument();
    });

    it("renders back to top button", () => {
      render(<Footer />);
      expect(
        screen.getByRole("button", { name: "Back to top" })
      ).toBeInTheDocument();
    });

    it("updates copyright year dynamically", () => {
      const realDate = Date;
      const mockDate = new Date("2030-01-01");
      global.Date = jest.fn(() => mockDate) as unknown as DateConstructor;
      global.Date.now = realDate.now;

      render(<Footer />);
      expect(
        screen.getByText("© 2030 Max Harding. All rights reserved.")
      ).toBeInTheDocument();

      global.Date = realDate;
    });
  });

  describe("Back to Top Functionality", () => {
    it("scrolls to top when button is clicked", () => {
      render(<Footer />);
      const backToTopButton = screen.getByRole("button", {
        name: "Back to top",
      });

      fireEvent.click(backToTopButton);

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: "smooth",
      });
    });

    it("button is keyboard accessible", () => {
      render(<Footer />);
      const backToTopButton = screen.getByRole("button", {
        name: "Back to top",
      });

      backToTopButton.focus();
      expect(backToTopButton).toHaveFocus();
    });

    it("back to top button contains arrow icon", () => {
      render(<Footer />);
      const backToTopButton = screen.getByRole("button", {
        name: "Back to top",
      });
      const svg = backToTopButton.querySelector("svg");

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("back to top button shows text and icon", () => {
      render(<Footer />);
      const backToTopButton = screen.getByRole("button", {
        name: "Back to top",
      });

      expect(backToTopButton.textContent).toContain("Back to top");
      expect(backToTopButton.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic footer element", () => {
      render(<Footer />);
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("back to top button has aria-label", () => {
      render(<Footer />);
      const button = screen.getByRole("button", { name: "Back to top" });
      expect(button).toHaveAttribute("aria-label", "Back to top");
    });

    it("SVG icon has aria-hidden attribute", () => {
      render(<Footer />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("has focus visible styles on back to top button", () => {
      render(<Footer />);
      const button = screen.getByRole("button", { name: "Back to top" });
      expect(button).toHaveClass("focus:outline-none", "focus:ring-2");
    });
  });

  describe("Responsive Design", () => {
    it("uses flexbox for responsive layout", () => {
      const { container } = render(<Footer />);
      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toBeInTheDocument();
      expect(flexContainer).toHaveClass("flex-col", "sm:flex-row");
    });

    it("applies responsive padding and spacing", () => {
      const { container } = render(<Footer />);
      const innerContainer = container.querySelector(".container");
      expect(innerContainer).toHaveClass("px-4", "sm:px-6", "lg:px-8");
    });

    it("centers items on mobile, space-between on desktop", () => {
      const { container } = render(<Footer />);
      const flexContainer = container.querySelector(
        ".flex.flex-col.sm\\:flex-row"
      );
      expect(flexContainer).toHaveClass("items-center", "justify-between");
    });
  });

  describe("Styling and Visual Design", () => {
    it("has distinct background color", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveClass("bg-gray-50", "dark:bg-gray-900");
    });

    it("has border to separate from content", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveClass(
        "border-t",
        "border-gray-200",
        "dark:border-gray-800"
      );
    });

    it("has hover effects on back to top button", () => {
      render(<Footer />);
      const button = screen.getByRole("button", { name: "Back to top" });
      expect(button).toHaveClass("hover:text-gray-900");
    });

    it("has transition effects for smooth interactions", () => {
      render(<Footer />);
      const button = screen.getByRole("button", { name: "Back to top" });
      expect(button).toHaveClass("transition-colors");
    });

    it("applies dark mode styles", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveClass("dark:bg-gray-900");

      const copyright = screen.getByText(/Max Harding/);
      expect(copyright).toHaveClass("dark:text-gray-400");
    });

    it("has icon animation on hover", () => {
      render(<Footer />);
      const button = screen.getByRole("button", { name: "Back to top" });
      const svg = button.querySelector("svg");
      expect(svg).toHaveClass("group-hover:-translate-y-1");
    });
  });

  describe("Security Tests", () => {
    it("copyright text does not contain script tags", () => {
      render(<Footer />);
      const copyright = screen.getByText(/Max Harding/);
      expect(copyright.textContent).not.toContain("<script>");
      expect(copyright.textContent).not.toContain("javascript:");
    });

    it("has no inline JavaScript event handlers", () => {
      const { container } = render(<Footer />);
      const elements = container.querySelectorAll("*");
      elements.forEach((element) => {
        expect(element.getAttribute("onclick")).toBeNull();
        expect(element.getAttribute("onerror")).toBeNull();
        expect(element.getAttribute("onload")).toBeNull();
      });
    });

    it("button uses React onClick handler, not inline", () => {
      render(<Footer />);
      const button = screen.getByRole("button", { name: "Back to top" });
      expect(button.getAttribute("onclick")).toBeNull();
    });
  });

  describe("Content Validation", () => {
    it("displays correct copyright format", () => {
      const currentYear = new Date().getFullYear();
      render(<Footer />);
      const copyright = screen.getByText(
        `© ${currentYear} Max Harding. All rights reserved.`
      );
      expect(copyright).toHaveClass("text-sm");
    });

    it("does not include social media links", () => {
      const { container } = render(<Footer />);
      const links = container.querySelectorAll("a");
      expect(links).toHaveLength(0);
    });

    it("does not include email address", () => {
      const { container } = render(<Footer />);
      const text = container.textContent;
      expect(text).not.toContain("@");
      expect(text).not.toContain("email");
    });
  });

  describe("Layout Structure", () => {
    it("uses container for max-width constraint", () => {
      const { container } = render(<Footer />);
      const innerContainer = container.querySelector(".container");
      expect(innerContainer).toBeInTheDocument();
      expect(innerContainer).toHaveClass("mx-auto");
    });

    it("has appropriate padding", () => {
      const { container } = render(<Footer />);
      const innerContainer = container.querySelector(".container");
      expect(innerContainer).toHaveClass("py-8");
    });

    it("positions copyright and button correctly", () => {
      const { container } = render(<Footer />);
      const flexContainer = container.querySelector(
        ".flex.flex-col.sm\\:flex-row"
      );
      expect(flexContainer).toHaveClass("justify-between");
    });
  });

  describe("User Interactions", () => {
    it("can be clicked multiple times", () => {
      render(<Footer />);
      const button = screen.getByRole("button", { name: "Back to top" });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(window.scrollTo).toHaveBeenCalledTimes(3);
    });

    it("maintains focus after click", () => {
      render(<Footer />);
      const button = screen.getByRole("button", { name: "Back to top" });

      button.focus();
      fireEvent.click(button);

      expect(button).toHaveFocus();
    });
  });

});
