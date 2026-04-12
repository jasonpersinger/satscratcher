'use strict';
const { test, expect } = require('@playwright/test');

test('clicking add-to-cart triggers Snipcart lazy-load', async ({ page }) => {
  await page.goto('/');

  // Before interaction, the Snipcart script should NOT yet be in the DOM.
  const before = await page.locator('script[src^="https://cdn.snipcart.com"]').count();
  expect(before).toBe(0);

  // Click the buy button. This is a "user interaction" and should kick the lazy-loader.
  await page.locator('.snipcart-add-item').first().click();

  // The lazy-loader appends a script to <head>. Wait for it (script tags are never
  // "visible" in the Playwright sense, so we wait for state: 'attached').
  await page.waitForSelector('script[src^="https://cdn.snipcart.com"]', { state: 'attached', timeout: 10000 });
  const after = await page.locator('script[src^="https://cdn.snipcart.com"]').count();
  expect(after).toBeGreaterThan(0);
});

test('Snipcart settings block is present in the rendered HTML with correct values', async ({ page }) => {
  await page.goto('/');
  const html = await page.content();
  // We read the inline <script> body that declares window.SnipcartSettings.
  // Reading via content() (not a JS context call) keeps the test purely observational.
  expect(html).toContain('loadStrategy: "on-user-interaction"');
  expect(html).toContain('modalStyle: "side"');
  expect(html).toContain('currency: "usd"');
  expect(html).toContain('timeoutDuration: 2750');
});
