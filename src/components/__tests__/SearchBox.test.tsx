/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBox from "../SearchBox";
import React from "react";

describe("SearchBox", () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render search input", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should render with default placeholder", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText("Search...");
      expect(input).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      render(
        <SearchBox onSearch={mockOnSearch} placeholder="Search countries..." />
      );
      const input = screen.getByPlaceholderText("Search countries...");
      expect(input).toBeInTheDocument();
    });

    it("should render search icon", () => {
      const { container } = render(<SearchBox onSearch={mockOnSearch} />);
      const searchIcon = container.querySelector('svg[aria-hidden="true"]');
      expect(searchIcon).toBeInTheDocument();
    });

    it("should not render clear button initially", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const clearButton = screen.queryByLabelText("Clear search");
      expect(clearButton).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <SearchBox onSearch={mockOnSearch} className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("custom-class");
    });
  });

  describe("Search Functionality", () => {
    it("should call onSearch when user types", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith("Spain");
      });
    });

    it("should call onSearch with empty string initially", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("should update input value as user types", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox") as HTMLInputElement;

      await user.type(input, "France");

      expect(input.value).toBe("France");
    });

    it("should call onSearch for each character typed", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "It");

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith("I");
        expect(mockOnSearch).toHaveBeenCalledWith("It");
      });
    });

    it("should handle special characters safely", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "<script>alert('xss')</script>");

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          "<script>alert('xss')</script>"
        );
      });
    });

    it("should handle numbers in search query", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "123");

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith("123");
      });
    });

    it("should handle Unicode characters", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "日本");

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith("日本");
      });
    });
  });

  describe("Clear Button", () => {
    it("should show clear button when input has text", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton).toBeInTheDocument();
    });

    it("should clear input when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox") as HTMLInputElement;

      await user.type(input, "Spain");
      const clearButton = screen.getByLabelText("Clear search");
      await user.click(clearButton);

      expect(input.value).toBe("");
    });

    it("should call onSearch with empty string when cleared", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");
      mockOnSearch.mockClear();
      const clearButton = screen.getByLabelText("Clear search");
      await user.click(clearButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith("");
      });
    });

    it("should focus input after clearing", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");
      const clearButton = screen.getByLabelText("Clear search");
      await user.click(clearButton);

      expect(input).toHaveFocus();
    });

    it("should hide clear button after clearing", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");
      const clearButton = screen.getByLabelText("Clear search");
      await user.click(clearButton);

      expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should clear input when Escape key is pressed", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox") as HTMLInputElement;

      await user.type(input, "Spain");
      await user.keyboard("{Escape}");

      expect(input.value).toBe("");
    });

    it("should call onSearch with empty string when Escape is pressed", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");
      mockOnSearch.mockClear();
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith("");
      });
    });

    it("should focus input after Escape key press", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");
      await user.keyboard("{Escape}");

      expect(input).toHaveFocus();
    });

    it("should be keyboard accessible with Tab", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);

      await user.tab();

      const input = screen.getByRole("textbox");
      expect(input).toHaveFocus();
    });

    it("should navigate to clear button with Tab when visible", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");
      await user.tab();

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    it("should have default ARIA label", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByLabelText("Search");
      expect(input).toBeInTheDocument();
    });

    it("should have custom ARIA label", () => {
      render(
        <SearchBox onSearch={mockOnSearch} ariaLabel="Search countries" />
      );
      const input = screen.getByLabelText("Search countries");
      expect(input).toBeInTheDocument();
    });

    it("should have aria-hidden on decorative icons", () => {
      const { container } = render(<SearchBox onSearch={mockOnSearch} />);
      const icons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should have accessible clear button label", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton).toHaveAttribute("aria-label", "Clear search");
    });

    it("should have proper focus styles on input", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("focus:outline-none");
      expect(input.className).toContain("focus:ring-2");
      expect(input.className).toContain("focus:ring-blue-500");
    });

    it("should have proper focus styles on clear button", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton.className).toContain("focus:outline-none");
      expect(clearButton.className).toContain("focus:ring-2");
      expect(clearButton.className).toContain("focus:ring-blue-500");
    });

    it("should have role textbox", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should have type text", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "text");
    });
  });

  describe("Security", () => {
    it("should not execute script tags in input", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, '<script>alert("xss")</script>');

      // React should escape the content automatically
      expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    it("should handle SQL injection attempts safely", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "'; DROP TABLE countries; --");

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          "'; DROP TABLE countries; --"
        );
      });
      // Should be treated as plain text
      expect(input).toHaveValue("'; DROP TABLE countries; --");
    });

    it("should handle HTML injection attempts", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, '<img src=x onerror="alert(1)">');

      // Should not create actual img element
      expect(document.querySelector("img[src='x']")).not.toBeInTheDocument();
    });

    it("should sanitize event handlers in input", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, 'onclick="alert(1)"');

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('onclick="alert(1)"');
      });
    });
  });

  describe("Styling and UX", () => {
    it("should have hover styles on input", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("hover:border-gray-400");
    });

    it("should have transition classes", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("transition");
      expect(input.className).toContain("duration-200");
    });

    it("should have responsive max width", () => {
      const { container } = render(<SearchBox onSearch={mockOnSearch} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("max-w-2xl");
    });

    it("should center the search box", () => {
      const { container } = render(<SearchBox onSearch={mockOnSearch} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("mx-auto");
    });

    it("should have proper padding on input", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("pl-11");
      expect(input.className).toContain("pr-11");
      expect(input.className).toContain("py-4");
    });

    it("should have rounded corners", () => {
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("rounded-xl");
    });

    it("should have hover effect on clear button", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton.className).toContain("hover:text-gray-600");
    });

    it("should have transition on clear button", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton.className).toContain("transition-colors");
      expect(clearButton.className).toContain("duration-200");
    });
  });

  describe("Error Handling", () => {
    it("should handle rapid typing", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "abcdefghijklmnopqrstuvwxyz");

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalled();
      });
    });

    it("should handle empty string input", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "Spain");
      await user.clear(input);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith("");
      });
    });

    it("should handle very long input strings", async () => {
      const user = userEvent.setup();
      render(<SearchBox onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox") as HTMLInputElement;

      const longString = "a".repeat(1000);
      await user.type(input, longString);

      expect(input.value).toBe(longString);
    });
  });

  describe("Integration", () => {
    it("should work with multiple instances", () => {
      const mockOnSearch1 = jest.fn();
      const mockOnSearch2 = jest.fn();

      render(
        <>
          <SearchBox onSearch={mockOnSearch1} ariaLabel="Search 1" />
          <SearchBox onSearch={mockOnSearch2} ariaLabel="Search 2" />
        </>
      );

      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(2);
    });

    it("should maintain independent state across instances", async () => {
      const user = userEvent.setup();
      const mockOnSearch1 = jest.fn();
      const mockOnSearch2 = jest.fn();

      render(
        <>
          <SearchBox onSearch={mockOnSearch1} ariaLabel="Search 1" />
          <SearchBox onSearch={mockOnSearch2} ariaLabel="Search 2" />
        </>
      );

      const input1 = screen.getByLabelText("Search 1");
      const input2 = screen.getByLabelText("Search 2");

      await user.type(input1, "Spain");
      await user.type(input2, "France");

      expect(input1).toHaveValue("Spain");
      expect(input2).toHaveValue("France");
    });
  });
});
