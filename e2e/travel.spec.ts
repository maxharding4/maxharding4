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
    // Country cards are links named after the country (aria-label).
    await search.fill("");
    const firstCountryName = (
      await page.locator('main a[href^="/travel/"]').first().getAttribute("aria-label")
    )?.trim();
    expect(firstCountryName, "expected at least one country card").toBeTruthy();

    const fragment = firstCountryName!.slice(0, 3);
    await search.fill(fragment);
    await expect(page.getByText(/showing \d+ of \d+/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: firstCountryName!, exact: true })
    ).toBeVisible();
  });
});

test.describe("travel cards", () => {
  test("country and city cards are named links that drill down", async ({ page }) => {
    await page.goto("/travel/");
    await page
      .getByRole("main")
      .getByRole("link", { name: "Austria", exact: true })
      .click();
    await expect(page).toHaveURL(/\/travel\/austria\/?$/);

    await page
      .getByRole("main")
      .getByRole("link", { name: "Graz", exact: true })
      .click();
    await expect(page).toHaveURL(/\/travel\/austria\/graz\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Graz/ })
    ).toBeVisible();
  });
});
