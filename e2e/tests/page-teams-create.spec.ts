import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("initial load", async ({ page }) => {
  await login(page);

  await page.getByRole("img", { name: "avatar" }).click();
  await page.getByRole("link", { name: "Teams" }).click();

  await page.getByRole("link", { name: "Create a Team" }).click();
  await expect(
    page.getByRole("heading", { name: "Create Team" })
  ).toBeVisible();
  await expect(page.getByText("Invite Team Members")).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
});
