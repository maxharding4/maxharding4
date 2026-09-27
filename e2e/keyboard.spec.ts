import { test, expect } from "@playwright/test";

// Keyboard-only flows for the two components that open over the page.

test.describe("photo lightbox (keyboard)", () => {
  test("opens, navigates, traps focus, closes and restores focus", async ({ page }) => {
    await page.goto("/travel/austria/graz/");

    const thumbnail = page.getByRole("button", { name: /^View photo 1 -/ });
    await thumbnail.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Photo viewer" });
    await expect(dialog).toBeVisible();
    // Focus moves into the dialog.
    await expect(page.getByRole("button", { name: "Close photo viewer" })).toBeFocused();

    // Arrow keys change the photo.
    const counter = dialog.locator("[aria-live]");
    await expect(counter).toHaveText(/^1 \/ \d+$/);
    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText(/^2 \/ \d+$/);
    await page.keyboard.press("ArrowLeft");
    await expect(counter).toHaveText(/^1 \/ \d+$/);

    // Tab never leaves the dialog.
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      expect(
        await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
      ).toBe(true);
    }

    // Esc closes and focus returns to the thumbnail that opened it.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(thumbnail).toBeFocused();
  });
});

test.describe("mobile menu (keyboard)", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("keeps focus in the header while open and Esc restores focus", async ({ page }) => {
    await page.goto("/");

    // Its name flips between "Open menu" and "Close menu", so locate it by
    // what it controls.
    const menuButton = page.locator('button[aria-controls="mobile-menu"]');
    await expect(menuButton).toHaveAccessibleName(/open menu/i);
    await menuButton.focus();
    await page.keyboard.press("Enter");
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Tab through more stops than the header has; focus must stay in it.
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      expect(
        await page.evaluate(() => !!document.activeElement?.closest("header"))
      ).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toBeFocused();
  });
});
