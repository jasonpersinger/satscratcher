'use strict';

const { test, expect } = require('@playwright/test');

test('home page renders core storefront elements', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Mine Bitcoin/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Grab One/ })).toBeVisible();
  await expect(page.getByText(/Hashrate: basically nothing/)).toBeVisible();
});

test('guide page renders', async ({ page }) => {
  await page.goto('/guide/');
  await expect(page.getByRole('heading', { name: /Five minutes/ })).toBeVisible();
});
