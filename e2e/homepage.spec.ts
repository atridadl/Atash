import { test, expect } from "@playwright/test";

// This is an example test to get you started. Feel free to delete it.
test("should navigate to the about page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#title")).toContainText("Atash");
});
