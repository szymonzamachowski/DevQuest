import { expect, test } from "@playwright/test";

test("play the demo opens a private sandbox copy of the campaign", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/");
  await page.getByTestId("play-demo").click();
  await page.waitForURL(/\/app\/projects\/[0-9a-f-]{36}$/, { timeout: 60_000 });

  await expect(page.getByRole("heading", { level: 1, name: "Booking Crisis" })).toBeVisible();
  await expect(page.getByText(/private demo|prywatne demo/i)).toBeVisible();

  // The guest plays as leader of their own copy, so they can open the board.
  await page.getByRole("link", { name: /open quest board|otwórz tablicę/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /quest board|tablica/i })).toBeVisible();

  // The shared template project stays out of reach (streamed pages render not-found with 200).
  await page.goto("/app/projects/demo-team-active-project");
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
});
