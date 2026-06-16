import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { usePathname } from "next/navigation";
import Header from "../Header";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("next/link", () => {
  return function Link({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/");
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    document.body.style.overflow = "unset";
  });

  describe("Rendering and Structure", () => {
    it("renders the header with navigation", () => {
      render(<Header />);
      expect(
        screen.getByRole("banner", { hidden: true })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("navigation", { name: "Main navigation" })
      ).toBeInTheDocument();
    });

    it("renders the site logo/name", () => {
      render(<Header />);
      const logo = screen.getByRole("link", { name: "Max Harding" });
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("href", "/");
    });

    it("renders all navigation links", () => {
      render(<Header />);
      expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "CV" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Travel" })).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Daily Photo" })
      ).toBeInTheDocument();
    });

    it("has correct href attributes for navigation links", () => {
      render(<Header />);
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
        "href",
        "/"
      );
      expect(screen.getByRole("link", { name: "CV" })).toHaveAttribute(
        "href",
        "/cv"
      );
      expect(screen.getByRole("link", { name: "Travel" })).toHaveAttribute(
        "href",
        "/travel"
      );
      expect(screen.getByRole("link", { name: "Daily Photo" })).toHaveAttribute(
        "href",
        "/photo-of-the-day"
      );
    });

    it("applies sticky positioning and shadow to header", () => {
      render(<Header />);
      const header = screen.getByRole("banner", { hidden: true });
      expect(header).toHaveClass("sticky", "top-0", "shadow-lg");
    });
  });

  describe("Active Page Highlighting", () => {
    it("highlights the home link when on home page", () => {
      (usePathname as jest.Mock).mockReturnValue("/");
      render(<Header />);
      const homeLink = screen.getByRole("link", { name: "Home" });
      expect(homeLink).toHaveAttribute("aria-current", "page");
      expect(homeLink).toHaveClass("border-b-2");
    });

    it("highlights the CV link when on CV page", () => {
      (usePathname as jest.Mock).mockReturnValue("/cv");
      render(<Header />);
      const cvLink = screen.getByRole("link", { name: "CV" });
      expect(cvLink).toHaveAttribute("aria-current", "page");
      expect(cvLink).toHaveClass("border-b-2");
    });

    it("highlights the Travel link when on travel page", () => {
      (usePathname as jest.Mock).mockReturnValue("/travel");
      render(<Header />);
      const travelLink = screen.getByRole("link", { name: "Travel" });
      expect(travelLink).toHaveAttribute("aria-current", "page");
      expect(travelLink).toHaveClass("border-b-2");
    });

    it("highlights the Travel link when on travel subpage", () => {
      (usePathname as jest.Mock).mockReturnValue("/travel/spain/barcelona");
      render(<Header />);
      const travelLink = screen.getByRole("link", { name: "Travel" });
      expect(travelLink).toHaveAttribute("aria-current", "page");
    });

    it("only home link is exact match, others are prefix match", () => {
      (usePathname as jest.Mock).mockReturnValue("/cv/education");
      render(<Header />);
      const homeLink = screen.getByRole("link", { name: "Home" });
      const cvLink = screen.getByRole("link", { name: "CV" });

      expect(homeLink).not.toHaveAttribute("aria-current", "page");
      expect(cvLink).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Mobile Menu Functionality", () => {
    it("renders mobile menu button", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it("mobile menu is closed by default", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
      expect(document.getElementById("mobile-menu")).not.toBeInTheDocument();
    });

    it("opens mobile menu when button is clicked", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      fireEvent.click(menuButton);

      expect(menuButton).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("Close menu")).toBeInTheDocument();
    });

    it("closes mobile menu when button is clicked again", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });

      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
    });

    it("closes mobile menu when backdrop is clicked", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      fireEvent.click(menuButton);

      const backdrop = document.querySelector(".bg-black\\/50");
      expect(backdrop).toBeInTheDocument();

      fireEvent.click(backdrop!);
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
    });

    it("prevents body scroll when mobile menu is open", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });

      expect(document.body.style.overflow).toBe("unset");

      fireEvent.click(menuButton);
      expect(document.body.style.overflow).toBe("hidden");

      fireEvent.click(menuButton);
      expect(document.body.style.overflow).toBe("unset");
    });

    it("mobile menu contains all navigation links", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      fireEvent.click(menuButton);

      const mobileMenu = document.getElementById("mobile-menu");
      expect(mobileMenu).toBeInTheDocument();

      const links = mobileMenu!.querySelectorAll("a");
      expect(links).toHaveLength(4);
      expect(links[0]).toHaveTextContent("Home");
      expect(links[1]).toHaveTextContent("CV");
      expect(links[2]).toHaveTextContent("Travel");
      expect(links[3]).toHaveTextContent("Daily Photo");
    });
  });

  describe("Keyboard Navigation", () => {
    it("closes mobile menu on Escape key", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });

      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute("aria-expanded", "true");

      fireEvent.keyDown(document, { key: "Escape" });
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
    });

    it("does not close menu on other keys", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });

      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute("aria-expanded", "true");

      fireEvent.keyDown(document, { key: "Enter" });
      expect(menuButton).toHaveAttribute("aria-expanded", "true");

      fireEvent.keyDown(document, { key: "Tab" });
      expect(menuButton).toHaveAttribute("aria-expanded", "true");
    });

    it("menu button is keyboard focusable", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      menuButton.focus();
      expect(menuButton).toHaveFocus();
    });

    it("navigation links are keyboard focusable", () => {
      render(<Header />);
      const homeLink = screen.getByRole("link", { name: "Home" });
      homeLink.focus();
      expect(homeLink).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels on navigation", () => {
      render(<Header />);
      expect(
        screen.getByRole("navigation", { name: "Main navigation" })
      ).toBeInTheDocument();
    });

    it("mobile menu button has aria-expanded attribute", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toHaveAttribute("aria-expanded");
    });

    it("mobile menu button has aria-controls attribute", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toHaveAttribute("aria-controls", "mobile-menu");
    });

    it("uses semantic HTML header element", () => {
      render(<Header />);
      expect(
        screen.getByRole("banner", { hidden: true })
      ).toBeInTheDocument();
    });

    it("uses semantic HTML nav element", () => {
      render(<Header />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("screen reader text for menu button is correct", () => {
      render(<Header />);
      expect(screen.getByText("Open menu")).toHaveClass("sr-only");
    });

    it("SVG icons have aria-hidden attribute", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      const svg = menuButton.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("active links have aria-current=page", () => {
      (usePathname as jest.Mock).mockReturnValue("/travel");
      render(<Header />);
      const travelLink = screen.getByRole("link", { name: "Travel" });
      expect(travelLink).toHaveAttribute("aria-current", "page");
    });

    it("backdrop has aria-hidden attribute", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      fireEvent.click(menuButton);

      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("desktop navigation is hidden on mobile", () => {
      render(<Header />);
      const desktopNav = screen
        .getByRole("navigation")
        .querySelector(".hidden.md\\:flex");
      expect(desktopNav).toBeInTheDocument();
    });

    it("mobile menu button is hidden on desktop", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toHaveClass("md:hidden");
    });
  });

  describe("Security Tests", () => {
    it("sanitizes potential XSS in navigation text", () => {
      render(<Header />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.textContent).not.toContain("<script>");
        expect(link.textContent).not.toContain("javascript:");
      });
    });

    it("uses relative URLs for navigation (no external redirects)", () => {
      render(<Header />);
      const homeLink = screen.getByRole("link", { name: "Home" });
      const cvLink = screen.getByRole("link", { name: "CV" });
      const travelLink = screen.getByRole("link", { name: "Travel" });

      expect(homeLink.getAttribute("href")).toBe("/");
      expect(cvLink.getAttribute("href")).toBe("/cv");
      expect(travelLink.getAttribute("href")).toBe("/travel");
      expect(homeLink.getAttribute("href")).not.toContain("http");
      expect(cvLink.getAttribute("href")).not.toContain("http");
      expect(travelLink.getAttribute("href")).not.toContain("http");
    });

    it("has no inline JavaScript event handlers", () => {
      const { container } = render(<Header />);
      const elements = container.querySelectorAll("*");
      elements.forEach((element) => {
        expect(element.getAttribute("onclick")).toBeNull();
        expect(element.getAttribute("onerror")).toBeNull();
        expect(element.getAttribute("onload")).toBeNull();
      });
    });
  });

  describe("Styling and Visual Design", () => {
    it("has hover effects on navigation links", () => {
      render(<Header />);
      const homeLink = screen.getByRole("link", { name: "Home" });
      expect(homeLink).toHaveClass("hover:text-white");
    });

    it("has transition effects for smooth interactions", () => {
      render(<Header />);
      const homeLink = screen.getByRole("link", { name: "Home" });
      expect(homeLink).toHaveClass("transition-colors");
    });

    it("has focus ring styles for accessibility", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toHaveClass("focus:ring-2");
    });

    it("uses the bold ink surface", () => {
      render(<Header />);
      const header = screen.getByRole("banner", { hidden: true });
      expect(header).toHaveClass("bg-ink", "text-white");
    });
  });

  describe("Route Change Behavior", () => {
    it("closes mobile menu when pathname changes", async () => {
      const { rerender } = render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });

      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute("aria-expanded", "true");

      (usePathname as jest.Mock).mockReturnValue("/travel");
      rerender(<Header />);

      await waitFor(() => {
        expect(menuButton).toHaveAttribute("aria-expanded", "false");
      });
    });
  });

  describe("Component Cleanup", () => {
    it("restores body scroll on unmount", () => {
      const { unmount } = render(<Header />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });

      fireEvent.click(menuButton);
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("unset");
    });

    it("removes event listeners on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener"
      );
      const { unmount } = render(<Header />);

      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe("Breakpoint Responsiveness", () => {
    it("shows desktop navigation on large screens (1024px+)", () => {
      render(<Header />);
      const desktopNav = screen.getByRole("navigation").querySelector(".hidden.md\\:flex");
      expect(desktopNav).toBeInTheDocument();
      expect(desktopNav).toHaveClass("hidden", "md:flex");
    });

    it("shows mobile menu button on small/medium screens", () => {
      render(<Header />);
      const mobileButton = screen.getByRole("button", { name: /menu/i });
      expect(mobileButton).toHaveClass("md:hidden");
    });

    it("applies responsive padding at all breakpoints", () => {
      render(<Header />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("px-4", "sm:px-6", "lg:px-8");
    });

    it("container has responsive structure", () => {
      render(<Header />);
      const container = screen.getByRole("navigation").querySelector("div");
      expect(container).toHaveClass("flex", "h-16", "items-center", "justify-between");
    });
  });
});
