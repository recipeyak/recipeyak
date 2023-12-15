import "dotenv/config";
import { expect, Page } from "@playwright/test";

import assert from "node:assert";

import process from "node:process";

export async function login(page: Page) {
  //
  // TODO: there's some stuff we can do to auth at the beginning and get that
  // resused across tests
  //
  // see: https://playwright.dev/docs/auth
  await page.goto("http://localhost:5173/login");
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();

  const email = process.env["RECIPEYAK_E2E_AUTH_EMAIL"];
  assert(email != null, "missing auth email");
  const password = process.env["RECIPEYAK_E2E_AUTH_PASSWORD"];
  assert(password != null, "missing auth password");

  await page.getByLabel("email").fill(email!);
  await page.getByLabel("password").fill(password!);
  await page.getByLabel("password").press("Enter");

  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
}
