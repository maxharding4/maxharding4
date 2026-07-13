import { test, expect } from "@playwright/test";

test.describe("header navigation", () => {
  test("desktop nav routes to the main sections", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: /main/i });

    await nav.getByRole("link", { name: "Travel" }).click();
    await expect(page).toHaveURL(/\/travel\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /travel gallery/i })
    ).toBeVisible();

    await page
      .getByRole("navigation", { name: /main/i })
      .getByRole("link", { name: "Cookbook" })
      .click();
    await expect(page).toHaveURL(/\/cookbook\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Cookbook" })
    ).toBeVisible();
  });

  test("mobile menu opens and navigates", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");

    const openButton = page.getByRole("button", { name: /open menu/i });
    await expect(openButton).toBeVisible();
    await openButton.click();

    const mobileMenu = page.locator("#mobile-menu");
    await expect(mobileMenu).toBeVisible();

    await mobileMenu.getByRole("link", { name: "Cookbook" }).click();
    await expect(page).toHaveURL(/\/cookbook\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Cookbook" })
    ).toBeVisible();
  });
});
