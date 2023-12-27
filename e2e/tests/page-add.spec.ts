import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("add recipe page", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Add" }).click();

  await expect(page.getByRole("button", { name: "Import" })).toBeVisible();
  await expect(
    page.getByPlaceholder("https://cooking.nytimes.com...")
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Add Manually" })
  ).toBeVisible();
  await expect(page.getByPlaceholder("Butternutt Squash Soup")).toBeVisible();
});
