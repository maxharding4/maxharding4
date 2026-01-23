/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import ContactInfo from "../ContactInfo";

describe("ContactInfo", () => {
  const mockContactInfo = {
    email: "test@example.com",
    phone: "+44 1234 567890",
    location: "London, UK",
    linkedin: "https://linkedin.com/in/testuser",
    github: "https://github.com/testuser",
    website: "https://example.com",
  };

  describe("Rendering", () => {
    it("should render all contact information when provided", () => {
      render(<ContactInfo {...mockContactInfo} />);

      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("+44 1234 567890")).toBeInTheDocument();
      expect(screen.getByText("London, UK")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /LinkedIn/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /GitHub/i })).toBeInTheDocument();
    });

    it("should render in a responsive grid", () => {
      const { container } = render(<ContactInfo {...mockContactInfo} />);
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-4");
    });

    it("should render nothing when all fields are undefined", () => {
      const { container } = render(<ContactInfo />);
      expect(container.firstChild).toBeNull();
    });

    it("should render nothing when all fields are empty strings", () => {
      const emptyContact = {
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
      };
      const { container } = render(<ContactInfo {...emptyContact} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render partial contact information", () => {
      render(<ContactInfo email="test@example.com" location="London, UK" />);

      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("London, UK")).toBeInTheDocument();
      expect(screen.queryByRole("link")).toBeInTheDocument(); // Email link
    });
  });

  describe("Email Link", () => {
    it("should render email as mailto link", () => {
      render(<ContactInfo email="test@example.com" />);
      const link = screen.getByRole("link", { name: /Email test@example.com/i });
      expect(link).toHaveAttribute("href", "mailto:test@example.com");
    });

    it("should have correct ARIA label for email", () => {
      render(<ContactInfo email="test@example.com" />);
      const link = screen.getByRole("link", { name: "Email test@example.com" });
      expect(link).toBeInTheDocument();
    });

    it("should apply correct hover styles to email link", () => {
      const { container } = render(<ContactInfo email="test@example.com" />);
      const link = container.querySelector('a[href^="mailto:"]');
      expect(link).toHaveClass("hover:text-blue-600", "transition-colors");
    });

    it("should truncate long email addresses", () => {
      const longEmail = "verylongemailaddress@verylongdomainname.com";
      render(<ContactInfo email={longEmail} />);
      const span = screen.getByText(longEmail);
      expect(span).toHaveClass("truncate");
    });
  });

  describe("Phone Link", () => {
    it("should render phone as tel link", () => {
      render(<ContactInfo phone="+44 1234 567890" />);
      const link = screen.getByRole("link", { name: /Phone/i });
      expect(link).toHaveAttribute("href", "tel:+44 1234 567890");
    });

    it("should have correct ARIA label for phone", () => {
      render(<ContactInfo phone="+44 1234 567890" />);
      const link = screen.getByRole("link", { name: "Phone +44 1234 567890" });
      expect(link).toBeInTheDocument();
    });

    it("should handle phone numbers with spaces", () => {
      render(<ContactInfo phone="+1 (555) 123-4567" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "tel:+1 (555) 123-4567");
    });
  });

  describe("Location Display", () => {
    it("should render location as static text (not a link)", () => {
      render(<ContactInfo location="London, UK" />);
      const locationText = screen.getByText("London, UK");
      expect(locationText).toBeInTheDocument();
      expect(locationText.tagName).not.toBe("A");
    });

    it("should show location icon", () => {
      const { container } = render(<ContactInfo location="London, UK" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("w-5", "h-5");
    });
  });

  describe("External Links (LinkedIn, GitHub, Website)", () => {
    it("should render LinkedIn link with correct attributes", () => {
      render(<ContactInfo linkedin="https://linkedin.com/in/testuser" />);
      const link = screen.getByRole("link", { name: /LinkedIn/i });
      expect(link).toHaveAttribute("href", "https://linkedin.com/in/testuser");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should render GitHub link with correct attributes", () => {
      render(<ContactInfo github="https://github.com/testuser" />);
      const link = screen.getByRole("link", { name: /GitHub/i });
      expect(link).toHaveAttribute("href", "https://github.com/testuser");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should render website link with correct attributes", () => {
      render(<ContactInfo website="https://example.com" />);
      const link = screen.getByRole("link", { name: /Website/i });
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should hide SVG icons from screen readers", () => {
      const { container } = render(<ContactInfo {...mockContactInfo} />);
      const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("URL Validation", () => {
    it("should not render links with javascript: protocol", () => {
      render(<ContactInfo website="javascript:alert('XSS')" />);
      expect(screen.queryByRole("link", { name: /Website/i })).not.toBeInTheDocument();
    });

    it("should not render links with data: protocol", () => {
      render(<ContactInfo linkedin="data:text/html,<script>alert('XSS')</script>" />);
      expect(screen.queryByRole("link", { name: /LinkedIn/i })).not.toBeInTheDocument();
    });

    it("should render valid http URLs", () => {
      render(<ContactInfo website="http://example.com" />);
      const link = screen.getByRole("link", { name: /Website/i });
      expect(link).toHaveAttribute("href", "http://example.com");
    });

    it("should render valid https URLs", () => {
      render(<ContactInfo github="https://github.com/testuser" />);
      const link = screen.getByRole("link", { name: /GitHub/i });
      expect(link).toHaveAttribute("href", "https://github.com/testuser");
    });

    it("should not render malformed URLs", () => {
      render(<ContactInfo linkedin="not-a-valid-url" />);
      expect(screen.queryByRole("link", { name: /LinkedIn/i })).not.toBeInTheDocument();
    });

    it("should validate all external URLs simultaneously", () => {
      const maliciousContact = {
        linkedin: "javascript:void(0)",
        github: "https://github.com/validuser",
        website: "data:text/html,<h1>XSS</h1>",
      };
      render(<ContactInfo {...maliciousContact} />);

      expect(screen.queryByRole("link", { name: /LinkedIn/i })).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: /GitHub/i })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /Website/i })).not.toBeInTheDocument();
    });
  });

  describe("Security", () => {
    it("should sanitize XSS attempts in email", () => {
      const xssEmail = '<script>alert("XSS")</script>@example.com';
      render(<ContactInfo email={xssEmail} />);
      expect(screen.getByText(xssEmail)).toBeInTheDocument();
      expect(document.querySelectorAll("script").length).toBe(0);
    });

    it("should sanitize XSS attempts in phone", () => {
      const xssPhone = '+1<img src=x onerror="alert(1)">555-1234';
      render(<ContactInfo phone={xssPhone} />);
      expect(screen.getByText(xssPhone)).toBeInTheDocument();
      expect(document.querySelectorAll("img[onerror]").length).toBe(0);
    });

    it("should sanitize XSS attempts in location", () => {
      const xssLocation = '<svg onload="alert(1)">London';
      render(<ContactInfo location={xssLocation} />);
      expect(screen.getByText(xssLocation)).toBeInTheDocument();
      expect(document.querySelectorAll("svg[onload]").length).toBe(0);
    });

    it("should prevent onclick injection in links", () => {
      const { container } = render(<ContactInfo {...mockContactInfo} />);
      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        expect(link.getAttribute("onclick")).toBeNull();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long location names", () => {
      const longLocation = "Very Long City Name, Very Long State Name, Very Long Country Name";
      render(<ContactInfo location={longLocation} />);
      expect(screen.getByText(longLocation)).toBeInTheDocument();
    });

    it("should handle special characters in contact fields", () => {
      const specialContact = {
        email: "test+tag@example.com",
        phone: "+1 (555) 123-4567 ext. 890",
        location: "São Paulo, Brasil",
      };
      render(<ContactInfo {...specialContact} />);

      expect(screen.getByText("test+tag@example.com")).toBeInTheDocument();
      expect(screen.getByText("+1 (555) 123-4567 ext. 890")).toBeInTheDocument();
      expect(screen.getByText("São Paulo, Brasil")).toBeInTheDocument();
    });

    it("should handle URLs with query parameters", () => {
      const websiteWithParams = "https://example.com?utm_source=cv&ref=portfolio";
      render(<ContactInfo website={websiteWithParams} />);
      const link = screen.getByRole("link", { name: /Website/i });
      expect(link).toHaveAttribute("href", websiteWithParams);
    });

    it("should handle URLs with fragments", () => {
      const websiteWithFragment = "https://example.com/page#section";
      render(<ContactInfo website={websiteWithFragment} />);
      const link = screen.getByRole("link", { name: /Website/i });
      expect(link).toHaveAttribute("href", websiteWithFragment);
    });

    it("should handle null values in contact fields", () => {
      const nullContact = {
        email: null as unknown as string,
        phone: null as unknown as string,
        location: null as unknown as string,
        linkedin: null as unknown as string,
        github: null as unknown as string,
        website: null as unknown as string,
      };
      const { container } = render(<ContactInfo {...nullContact} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Styling and Layout", () => {
    it("should apply consistent flex layout to contact items", () => {
      const { container } = render(<ContactInfo email="test@example.com" phone="+1234567890" />);
      const items = container.querySelectorAll("a, div");
      items.forEach((item) => {
        if (item.classList.contains("flex")) {
          expect(item).toHaveClass("items-center", "gap-3");
        }
      });
    });

    it("should apply hover effects to all links", () => {
      const { container } = render(<ContactInfo {...mockContactInfo} />);
      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).toHaveClass("hover:text-blue-600");
      });
    });

    it("should have proper icon sizing", () => {
      const { container } = render(<ContactInfo {...mockContactInfo} />);
      const svgs = container.querySelectorAll("svg");
      svgs.forEach((svg) => {
        expect(svg).toHaveClass("w-5", "h-5");
      });
    });

    it("should use truncate class for text overflow", () => {
      const { container } = render(<ContactInfo email="test@example.com" />);
      const truncateElements = container.querySelectorAll(".truncate");
      expect(truncateElements.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have descriptive ARIA labels for all links", () => {
      render(<ContactInfo {...mockContactInfo} />);

      expect(screen.getByRole("link", { name: "Email test@example.com" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Phone +44 1234 567890" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /LinkedIn/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /GitHub/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Website/i })).toBeInTheDocument();
    });

    it("should hide decorative icons from screen readers", () => {
      const { container } = render(<ContactInfo {...mockContactInfo} />);
      const decorativeIcons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(decorativeIcons.length).toBeGreaterThan(0);
    });

    it("should have proper color contrast for text", () => {
      const { container } = render(<ContactInfo email="test@example.com" />);
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-gray-600"); // Default state
    });
  });
});
