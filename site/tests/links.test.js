'use strict';
const { test, expect } = require('@playwright/test');

const PAGES = [
  '/',
  '/guide/',
  '/guide/quickstart.html',
  '/guide/get-a-bitcoin-address.html',
  '/guide/what-if-i-win.html',
  '/guide/troubleshooting.html',
  '/faq.html',
  '/terms.html',
  '/privacy.html',
  '/shipping-and-returns.html',
];

for (const pagePath of PAGES) {
  test(`page loads: ${pagePath}`, async ({ page }) => {
    const response = await page.goto(pagePath);
    expect(response.status()).toBe(200);
    // The footer is on every page — if it's missing, the layout broke.
    await expect(page.locator('.footer')).toBeVisible();
  });
}

test('every internal link on the homepage resolves to a 200', async ({ page, request }) => {
  await page.goto('/');

  // Enumerate anchors via locator.all() — no JS-context calls.
  const anchors = await page.locator('a[href]').all();
  const hrefs = [];
  for (const a of anchors) {
    const href = await a.getAttribute('href');
    if (href) hrefs.push(href);
  }

  // Internal = relative or root-relative. Skip mailto:, http(s)://, and pure hash fragments.
  const internal = hrefs.filter(h =>
    !h.startsWith('mailto:') &&
    !h.startsWith('http://') &&
    !h.startsWith('https://') &&
    !h.startsWith('#')
  );

  for (const href of internal) {
    const bare = href.split('#')[0];
    if (!bare) continue;
    const resp = await request.get(bare);
    expect(resp.status(), `${href} → ${bare}`).toBe(200);
  }
});
