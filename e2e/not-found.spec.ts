import { test, expect } from "@playwright/test";

// `serve` answers unknown paths with out/404.html and a 404 status, mirroring
// the CloudFront custom error responses in production.
const MISSING = "/definitely-not-a-real-page/";

test.describe("404 page", () => {
  test("a missing URL returns 404 with the site-styled page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      // The browser logs the 404 document response itself as a console error.
      if (msg.type() === "error" && !/status of 404/.test(msg.text()))
        errors.push(`console.error: ${msg.text()}`);
    });

    const response = await page.goto(MISSING);
    expect(response!.status()).toBe(404);

    await expect(page).toHaveTitle("Page not found | Max Harding");
    await expect(
      page.getByRole("heading", { level: 1, name: "Off the map" })
    ).toBeVisible();
    // Site chrome is still present.
    await expect(page.getByRole("navigation", { name: /main/i })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("recovery links lead back into the site", async ({ page }) => {
    await page.goto(MISSING);

    const links = page.getByRole("region", { name: "Try one of these instead" });
    for (const [name, href] of [
      ["Travel", "/travel"],
      ["Cookbook", "/cookbook"],
      ["CV", "/cv"],
    ]) {
      await expect(links.getByRole("link", { name, exact: true })).toHaveAttribute(
        "href",
        new RegExp(`^${href}/?$`)
      );
    }

    await links.getByRole("link", { name: "Travel", exact: true }).click();
    await expect(page).toHaveURL(/\/travel\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /travel gallery/i })
    ).toBeVisible();
  });
});
