import { expect, test } from "@playwright/test";
import { login } from "./authUtils";

test("modal recipe search box", async ({ page }, testInfo) => {
  await login(page);
  await page.getByPlaceholder("search your recipes...").fill("pulledpork");

  await expect(page).toHaveScreenshot({ fullPage: true });

  // don't click anything, instead use the browse link
  await page.getByTestId("search browse").click();
});
