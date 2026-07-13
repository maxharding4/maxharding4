import { test, expect } from "@playwright/test";

test.describe("cookbook", () => {
  test("shows the four fixed categories", async ({ page }) => {
    await page.goto("/cookbook/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Cookbook" })
    ).toBeVisible();
    for (const category of ["Mains", "Sides", "Snacks", "Desserts"]) {
      await expect(
        page.getByRole("heading", { level: 2, name: category })
      ).toBeVisible();
    }
  });

  test("drills from index to a recipe detail page", async ({ page }) => {
    await page.goto("/cookbook/");

    // Mains has recipes, so its card is a link into the category.
    await page.locator('a[href^="/cookbook/mains"]').first().click();
    await expect(page).toHaveURL(/\/cookbook\/mains\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Mains" })
    ).toBeVisible();

    // Recipe cards link to /cookbook/mains/<slug>/ (the "Mains" breadcrumb is
    // the current page, not a link, so this only matches recipe cards).
    const firstRecipe = page.locator('a[href^="/cookbook/mains/"]').first();
    await expect(firstRecipe).toBeVisible();
    await firstRecipe.click();

    await expect(page).toHaveURL(/\/cookbook\/mains\/[^/]+\/$/);
    await expect(
      page.getByRole("heading", { name: "Ingredients" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Method" })).toBeVisible();
    // Ingredients render as a list, method as an ordered list.
    await expect(page.getByRole("list").first()).toBeVisible();
  });
});
