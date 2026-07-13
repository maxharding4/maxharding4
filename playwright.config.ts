import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Tests run against the *static export* (`out/`) served locally —
 * the exact artifact that ships to S3 — not the dev server, so routing and
 * output match production. The build is expected to use placeholder images and
 * no GA id (see the `test:e2e` script / CI), which makes pages fully hermetic
 * (no external requests) and keeps Contentful asset bandwidth untouched.
 */
const PORT = Number(process.env.E2E_PORT ?? 4321);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Serve the built static export. `serve` maps /travel/ -> /travel/index.html
    // and returns 404.html for unknown paths, mirroring the hosting behaviour.
    command: `npx serve out --listen ${PORT} --no-port-switching`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
