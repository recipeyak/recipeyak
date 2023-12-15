import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("initial load", async ({ page }) => {
  await login(page);

  await page.getByRole("img", { name: "avatar" }).click();
  await page.getByRole("link", { name: "Teams" }).click();

  await expect(page.getByText("Teams")).toBeVisible();
  await expect(page.getByText("Invites")).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
});
