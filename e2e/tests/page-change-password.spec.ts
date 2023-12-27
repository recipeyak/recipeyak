import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("initial load", async ({ page }, testInfo) => {
  await login(page);
  await page.goto("/password");

  await expect(page.getByLabel("old password")).toBeVisible();
  await expect(page.getByLabel("new password", { exact: true })).toBeVisible();
  await expect(page.getByLabel("new password again")).toBeVisible();
  await expect(page.getByRole("button", { name: "Update" })).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
});
