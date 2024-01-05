import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("initial load", async ({ page }) => {
  await login(page);

  await page.getByRole("img", { name: "avatar" }).click();
  await page.getByRole("menuitem", { name: "Teams" }).click();

  // first team
  await page.getByTestId("team-2").click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});
