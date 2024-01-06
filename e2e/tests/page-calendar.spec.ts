import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("calendar page", async ({ page }, testInfo) => {
  await login(page);
  await page.getByRole("link", { name: "Calendar" }).click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("shopping list", async ({ page }, testInfo) => {
  await login(page);
  await page.getByRole("link", { name: "Calendar" }).click();

  await page.getByTestId("open shopping list modal").click();

  await expect(page.getByTestId("shopping-list-items")).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });

  await page.getByRole("button", { name: "show" }).click();

  await expect(page).toHaveScreenshot({ fullPage: true });

  await page.getByRole("button", { name: "hide" }).click();
  await page.getByTestId("close modal").click();
});

test("calendar nav buttons", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Calendar" }).click();

  await page.getByLabel("previous week").click();
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.getByLabel("current week").click();
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.getByLabel("next week").click();
  await expect(page).toHaveScreenshot({ fullPage: true });
});
