import { test, expect, type Page } from "@playwright/test";

// The E2E build uses placeholder images and no GA id, so pages make no external
// requests — any console/page error is therefore a real regression.
function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}

const CORE_PAGES = [
  { path: "/", name: "home" },
  { path: "/travel/", name: "travel gallery" },
  { path: "/cookbook/", name: "cookbook" },
  { path: "/cv/", name: "cv" },
  { path: "/photo-of-the-day/", name: "photo of the day" },
];

test.describe("core pages render cleanly", () => {
  for (const { path, name } of CORE_PAGES) {
    test(`${name} loads with a heading, nav, and no errors`, async ({ page }) => {
      const errors = collectPageErrors(page);
      const response = await page.goto(path);
      expect(response, `${path} should respond`).not.toBeNull();
      expect(response!.status(), `${path} status`).toBeLessThan(400);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.getByRole("navigation", { name: /main/i })).toBeVisible();
      expect(errors, `errors on ${path}`).toEqual([]);
    });
  }
});

test("an unknown route serves the site-styled 404 page", async ({ page }) => {
  await page.goto("/definitely-not-a-real-page/");
  await expect(page.getByText(/could not be found/i)).toBeVisible();
  // Site chrome (nav) is still present on the 404.
  await expect(page.getByRole("navigation", { name: /main/i })).toBeVisible();
});
