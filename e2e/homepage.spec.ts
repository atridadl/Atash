import { test, expect } from "@playwright/test";

test.describe("Happy Path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test("title page - contains correct text", async ({ page }) => {
    const title = await page.locator("#title").innerText();
    expect(title).toEqual("Atash");
  });

  test("sign in", async ({ page }) => {
    await page.locator("#signin-button").click();
    await page.waitForURL("**/sign-in");
    await page.getByText("to continue to Atash");
    await page
      .locator("#identifier-field")
      .fill(process.env.E2E_TEST_USER_EMAIL!);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForURL("**/sign-in/factor-one");
    await page
      .locator("#password-field")
      .fill(process.env.E2E_TEST_USER_PASSWORD!);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForURL("/");
    await page.locator("#dashboard-button").isVisible();
  });
});
