import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("initial load", async ({ page }) => {
  await login(page);

  await page.getByRole("img", { name: "avatar" }).click();
  await page.getByRole("link", { name: "Profile" }).click();

  await expect(page.getByText("Stats")).toBeVisible();
  await expect(page.getByText("Activity")).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
});
