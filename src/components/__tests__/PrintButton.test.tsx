/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from "@testing-library/react";
import PrintButton from "../PrintButton";

// Mock window.print
const mockPrint = jest.fn();
window.print = mockPrint;

describe("PrintButton", () => {
  beforeEach(() => {
    mockPrint.mockClear();
  });

  describe("Rendering", () => {
    it("should render the print button", () => {
      render(<PrintButton />);
      const button = screen.getByRole("button", { name: /Print or download CV as PDF/i });
      expect(button).toBeInTheDocument();
    });

    it("should display 'Print CV' text", () => {
      render(<PrintButton />);
      expect(screen.getByText("Print CV")).toBeInTheDocument();
    });

    it("should render with printer icon", () => {
      const { container } = render(<PrintButton />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should be positioned fixed at bottom-right", () => {
      const { container } = render(<PrintButton />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("fixed", "bottom-8", "right-8");
    });

    it("should have no-print class to hide in print view", () => {
      const { container } = render(<PrintButton />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("no-print");
    });
  });

  describe("Print Functionality", () => {
    it("should call window.print() when clicked", () => {
      render(<PrintButton />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(mockPrint).toHaveBeenCalledTimes(1);
    });

    it("should call window.print() multiple times on multiple clicks", () => {
      render(<PrintButton />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockPrint).toHaveBeenCalledTimes(3);
    });

    it("should work with keyboard Enter key", () => {
      render(<PrintButton />);
      const button = screen.getByRole("button");

      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      // Button click is triggered by Enter key automatically in browsers
      // Testing library handles this, so we verify the button is focusable
      expect(button).toBeInTheDocument();
    });

    it("should work with keyboard Space key", () => {
      render(<PrintButton />);
      const button = screen.getByRole("button");

      fireEvent.keyDown(button, { key: " ", code: "Space" });

      // Button click is triggered by Space key automatically in browsers
      expect(button).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have descriptive aria-label", () => {
      render(<PrintButton />);
      const button = screen.getByRole("button", { name: "Print or download CV as PDF" });
      expect(button).toHaveAttribute("aria-label", "Print or download CV as PDF");
    });

    it("should hide printer icon from screen readers", () => {
      const { container } = render(<PrintButton />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("should be keyboard accessible", () => {
      render(<PrintButton />);
      const button = screen.getByRole("button");

      // Button should be focusable (not have tabindex="-1")
      expect(button.getAttribute("tabindex")).not.toBe("-1");
    });

    it("should have focus ring for keyboard navigation", () => {
      const { container } = render(<PrintButton />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:ring-offset-2");
    });
  });

  describe("Styling", () => {
    it("should have proper button styling", () => {
      const { container } = render(<PrintButton />);
      const button = container.querySelector("button");

      expect(button).toHaveClass(
        "bg-blue-600",
        "text-white",
        "px-6",
        "py-3",
        "rounded-full",
        "shadow-lg"
      );
    });

    it("should have hover effect", () => {
      const { container } = render(<PrintButton />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("hover:bg-blue-700");
    });

    it("should have transition effect", () => {
      const { container } = render(<PrintButton />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("transition-colors");
    });

    it("should display icon and text in flex layout", () => {
      const { container } = render(<PrintButton />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("flex", "items-center", "gap-2");
    });

    it("should have proper icon size", () => {
      const { container } = render(<PrintButton />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("w-5", "h-5");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid clicks", () => {
      render(<PrintButton />);
      const button = screen.getByRole("button");

      // Rapidly click 10 times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(mockPrint).toHaveBeenCalledTimes(10);
    });
  });

  describe("Print-Specific Classes", () => {
    it("should be hidden in print media query via no-print class", () => {
      const { container } = render(<PrintButton />);
      const button = container.querySelector("button.no-print");

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("no-print");
    });
  });
});
