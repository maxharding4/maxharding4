import { test, expect } from "@playwright/test";

test.describe("travel search", () => {
  test("filters the country list by name", async ({ page }) => {
    await page.goto("/travel/");

    const search = page.getByRole("textbox", { name: /search countries/i });
    await expect(search).toBeVisible();

    // A nonsense query hits the explicit empty state.
    await search.fill("zzq-not-a-country");
    await expect(
      page.getByText("No countries match your search")
    ).toBeVisible();

    // A real fragment (taken from the first country card) filters positively.
    // Country names render as <h3> in each CountryCard.
    await search.fill("");
    const firstCountryName = (
      await page.locator("main h3").first().textContent()
    )?.trim();
    expect(firstCountryName, "expected at least one country card").toBeTruthy();

    const fragment = firstCountryName!.slice(0, 3);
    await search.fill(fragment);
    await expect(page.getByText(/showing \d+ of \d+/i)).toBeVisible();
    await expect(
      page.locator("main h3", { hasText: firstCountryName! })
    ).toBeVisible();
  });
});
