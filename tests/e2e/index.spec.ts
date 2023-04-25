import { expect, test } from "@playwright/test";

test("homepage to have title visible", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Chirp");
});
