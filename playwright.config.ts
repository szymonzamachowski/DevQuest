import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Specs share one seeded database: the sandbox spec clones the template project
  // that the campaign spec mutates, so they must not run at the same time.
  workers: 1,
  globalSetup: require.resolve("./e2e/global-setup.ts"),
  webServer: {
    command: "npm run dev -- --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
