import { expect, test } from "@playwright/test";

test("home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "DevQuest" })).toBeVisible();
  await expect(page.getByRole("link", { name: /play the demo|zagraj w demo/i })).toBeVisible();
});
