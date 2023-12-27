import { test, expect } from "@playwright/test";

test("landing page", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A place to store, share, and" })
  ).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
});
