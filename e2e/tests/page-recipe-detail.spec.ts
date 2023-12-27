import { test, expect } from "@playwright/test";
import { login } from "./authUtils";

test("recipe detail page", async ({ page }, testInfo) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");

  await expect(page.getByRole("heading", { name: "Ingredients" })).toBeVisible({
    timeout: 10000,
  });

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("schedule modal", async ({ page }, testInfo) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");
  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("button", { name: "Schedule" }).click();

  await expect(page).toHaveScreenshot({ fullPage: true });

  await page.getByTestId("close modal").click();
});

test("actions > copy ingredients", async ({ page }, testInfo) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");

  await page.getByRole("button", { name: "Actions" }).click();

  await expect(page).toHaveScreenshot({ fullPage: true });

  await page.getByRole("button", { name: "Copy Ingredients" }).click();
  await expect(page.getByText("Copied ingredients to")).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("actions > edit", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");
  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("button", { name: "Enable Editing" }).click();

  await expect(page.getByLabel("exit edit mode")).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("edit mode > edit step", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");
  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("button", { name: "Enable Editing" }).click();

  await page.getByLabel("add step").click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("edit mode > edit ingredient", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");
  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("button", { name: "Enable Editing" }).click();

  await page.getByLabel("add ingredient").click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("edit mode > edit metadata", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");
  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("button", { name: "Enable Editing" }).click();

  await page.getByLabel("edit metadata").click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("note > open add note text area", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");

  await page.getByPlaceholder("Add a note...").click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("note > open add reaction modal", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");

  await page.getByLabel("open reactions").click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("note > edit", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");

  await page.getByTestId("edit-note-1157").click();

  // ensure we have the edit buttons
  await expect(page.getByLabel("save note")).toBeVisible();
  await expect(page.getByLabel("cancel note")).toBeVisible();
  await expect(page.getByLabel("delete note")).toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("gallery view", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");

  await page.getByLabel("open primary image").click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("detail print media", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/618-cumin-and-cashew-yogurt-rice");
  await expect(page.getByRole("heading", { name: "Ingredients" })).toBeVisible({
    timeout: 10000,
  });

  await page.emulateMedia({ media: "print" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});
