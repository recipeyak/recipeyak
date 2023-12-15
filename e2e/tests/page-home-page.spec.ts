import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("landing page", async ({ page }, testInfo) => {
  await login(page);

  await expect(page.getByText("Recently Viewed")).toBeVisible();
  await expect(page.getByText("Recently Created")).toBeVisible();
  await expect(page.getByRole("link", { name: "Schedule" })).toBeVisible();

  await expect(page).toHaveScreenshot();
});
