import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("login page", async ({ page }, testInfo) => {
  await page.goto("/login");
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });

  await login(page, testInfo);
});
