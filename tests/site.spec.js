const { test, expect } = require('@playwright/test');

const SITE = 'https://sonalboraste.github.io';
const PASSWORD = 'BollywoodFitness2025#';

test('password gate hides content on load', async ({ page }) => {
  await page.goto(SITE);
  await expect(page.locator('#site-content')).toBeHidden();
  await expect(page.locator('#gate')).toBeVisible();
});

test('wrong password shows an error', async ({ page }) => {
  await page.goto(SITE);
  await page.fill('#gate-input', 'wrongpassword');
  await page.click('#gate-box button');
  await expect(page.locator('#gate-error')).toHaveText('Incorrect password, try again.');
  await expect(page.locator('#site-content')).toBeHidden();
});

test('correct password reveals the videos', async ({ page }) => {
  await page.goto(SITE);
  await page.fill('#gate-input', PASSWORD);
  await page.click('#gate-box button');
  await expect(page.locator('#site-content')).toBeVisible();
});

test('nav bar has all nine categories', async ({ page }) => {
  await page.goto(SITE);
  await page.fill('#gate-input', PASSWORD);
  await page.click('#gate-box button');
  await expect(page.locator('nav a')).toHaveCount(9);
});