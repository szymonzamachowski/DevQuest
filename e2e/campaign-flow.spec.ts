import { expect, test } from "@playwright/test";

const DEMO_PASSWORD = "devquestdemo";
const ACTIVE_PROJECT_ID = "demo-team-active-project";
const PUBLIC_SLUG = "brightlane-booking";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /log in|zaloguj/i }).click();
  await page.waitForURL(/\/app/);
}

/** Quest and inbox actions reload the page when the server action succeeds. */
async function clickAndWaitForReload(
  page: import("@playwright/test").Page,
  locator: import("@playwright/test").Locator,
) {
  await Promise.all([page.waitForEvent("load", { timeout: 30_000 }), locator.click()]);
}

test.describe("Phase 5 campaign flow", () => {
  test("public completed project is visible", async ({ page }) => {
    await page.goto(`/projects/${PUBLIC_SLUG}`);
    await expect(page.getByRole("heading", { name: "BrightLane Booking" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /view repository|zobacz repozytorium/i }),
    ).toBeVisible();
  });

  test("full team campaign path", async ({ browser }) => {
    test.setTimeout(120_000);

    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    await login(memberPage, "demo.member@devquest.local");

    await memberPage.goto(`/app/projects/${ACTIVE_PROJECT_ID}/quests`);
    await memberPage.getByRole("link", { name: /publish the application/i }).click();
    await memberPage
      .getByLabel(/github commit url/i)
      .fill(
        "https://github.com/octocat/Hello-World/commit/b1e63fae1e0c6f569b1a43d2b37632d5d0b1ce06",
      );
    await memberPage
      .locator("#description")
      .fill(
        "Deployed the booking application to production with verified booking flow and rollback notes.",
      );
    await clickAndWaitForReload(memberPage, memberPage.getByTestId("quest-submit"));
    await expect(memberPage.getByText("REVIEW", { exact: true })).toBeVisible();
    await memberContext.close();

    const leaderContext = await browser.newContext();
    const leaderPage = await leaderContext.newPage();
    await login(leaderPage, "demo.leader@devquest.local");

    await leaderPage.goto(`/app/projects/${ACTIVE_PROJECT_ID}/quests`);
    await leaderPage.getByRole("link", { name: /publish the application/i }).click();
    await clickAndWaitForReload(leaderPage, leaderPage.getByTestId("quest-accept"));
    await expect(leaderPage.getByText("COMPLETED", { exact: true })).toBeVisible();

    await leaderPage.goto(`/app/projects/${ACTIVE_PROJECT_ID}/client-inbox`);
    await clickAndWaitForReload(
      leaderPage,
      leaderPage.getByRole("button", { name: /choose this option|wybierz tę opcję/i }).first(),
    );

    await leaderPage.goto(`/app/projects/${ACTIVE_PROJECT_ID}/report`);
    await expect(
      leaderPage.getByRole("heading", { name: /complete campaign|zakończ kampanię/i }),
    ).toBeVisible();

    await leaderPage
      .locator("#solutionDescription")
      .fill(
        "BrightLane Booking delivers online scheduling with conflict-safe reservations, staff dashboards, and a production-ready deployment pipeline.",
      );
    await leaderPage
      .locator("#repositoryUrl")
      .fill("https://github.com/example/brightlane-booking-e2e");
    await leaderPage.locator("#liveDemoUrl").fill("https://brightlane-booking-e2e.example.com");
    await leaderPage.getByLabel(/publish a public|opublikuj publiczną/i).check();
    await leaderPage.locator("#publicSlug").fill("brightlane-booking-e2e");
    await leaderPage.getByRole("button", { name: /complete campaign|zakończ kampanię/i }).click();

    await expect(
      leaderPage.getByRole("heading", { name: /final report|raport końcowy/i }),
    ).toBeVisible({
      timeout: 15000,
    });

    const [publicPage] = await Promise.all([
      leaderPage.context().waitForEvent("page"),
      leaderPage.getByRole("link", { name: /view public page|zobacz stronę publiczną/i }).click(),
    ]);
    await publicPage.waitForLoadState("domcontentloaded");
    await expect(publicPage.getByRole("heading", { name: /brightlane team sprint/i })).toBeVisible({
      timeout: 15_000,
    });
    await publicPage.close();

    await leaderContext.close();
  });
});
