import { expect, test } from "@playwright/test";

test("homepage to have title visible", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Chirp");
});

test("that user can SignIn", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).first().click();
  await page
    .getByRole("button", { name: "Sign in with GitHub Continue with GitHub" })
    .click();
  await page.getByLabel("Username or email address").click();
  await page.getByLabel("Username or email address").fill("galifornia");
  await page.getByLabel("Username or email address").press("Tab");
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("wrongpass");
  await page.getByRole("button", { name: "Sign in" }).click();
  const errorMessage = await page.getByText("Incorrect username or password.");

  expect(errorMessage).toBeDefined();
});

test("that user can SignUp", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign up" }).first().click();
  await page
    .getByRole("button", { name: "Sign in with GitHub Continue with GitHub" })
    .click();
  await page.getByLabel("Username or email address").click();
  await page.getByLabel("Username or email address").fill("galifornia");
  await page.getByLabel("Username or email address").press("Tab");
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("badpassword");
  await page.getByRole("button", { name: "Sign in" }).click();
  const errorMessage = await page.getByText("Incorrect username or password.");

  expect(errorMessage).toBeDefined();
});

test("user use pagination", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL("/?page=1");

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page).toHaveURL("/?page=0");
});

// test("that a logged user can sign out", async ({ page }) => {
//   await page.goto("/");
//   // if user is logged in the SignIn button is not visible
//   let signInBtn = await page.getByRole("button", { name: "Sign in" }).first();
//   expect(signInBtn).toBeFalsy();

//   // if user is logged in the SignOut button is visible
//   const signOutBtn = await page.getByText("Sign out");
//   expect(signOutBtn).toBeDefined();
//   signOutBtn.click();

//   // After signing out the buttons to sign in must be present in Nav
//   signInBtn = await page.getByRole("button", { name: "Sign in" }).first();
//   expect(signInBtn).toBeDefined();
// });
