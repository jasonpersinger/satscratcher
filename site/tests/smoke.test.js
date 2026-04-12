'use strict';
const { test, expect } = require('@playwright/test');

test('homepage loads and contains key sections', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SatScratcher/);
  await expect(page.locator('.hero__headline')).toContainText('Mine Bitcoin');
  await expect(page.locator('#what-it-is')).toBeVisible();
  await expect(page.locator('#product')).toBeVisible();
  await expect(page.locator('#how-it-works')).toBeVisible();
  await expect(page.locator('#faq')).toBeVisible();
  await expect(page.locator('.footer')).toBeVisible();
});

test('topbar is sticky and nav has the four anchors', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topbar')).toBeVisible();
  const navLinks = page.locator('.topbar__nav a');
  await expect(navLinks).toHaveCount(4);
  await expect(navLinks.nth(0)).toHaveAttribute('href', '/#what-it-is');
});

test('FAQ accordion opens on click', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('.faq__item').first();
  await expect(first).not.toHaveAttribute('open', '');
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
});

test('add-to-cart button has all required Snipcart data attributes', async ({ page }) => {
  await page.goto('/');
  const buy = page.locator('.snipcart-add-item').first();
  await expect(buy).toHaveAttribute('data-item-id', 'satscratcher-v1');
  await expect(buy).toHaveAttribute('data-item-price', '39.00');
  await expect(buy).toHaveAttribute('data-item-name', 'SatScratcher');
});
