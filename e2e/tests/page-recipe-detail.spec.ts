import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("recipe detail page", async ({ page }, testInfo) => {
  await login(page);
  await page.goto(
    "http://localhost:5173/recipes/618-cumin-and-cashew-yogurt-rice"
  );

  await expect(page.getByRole("heading", { name: "Ingredients" })).toBeVisible({
    timeout: 10000,
  });

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("schedule modal", async ({ page }, testInfo) => {
  await login(page);
  await page.goto(
    "http://localhost:5173/recipes/618-cumin-and-cashew-yogurt-rice"
  );
  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("button", { name: "Schedule" }).click();

  await expect(page).toHaveScreenshot({ fullPage: true });

  await page.getByTestId("close modal").click();
});

test("actions > copy ingredients", async ({ page }, testInfo) => {
  await login(page);
  await page.goto(
    "http://localhost:5173/recipes/618-cumin-and-cashew-yogurt-rice"
  );

  await page.getByRole("button", { name: "Actions" }).click();

  await expect(page).toHaveScreenshot({ fullPage: true });

  await page.getByRole("button", { name: "Copy Ingredients" }).click();
  await expect(page.getByText("Copied ingredients to")).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
});
