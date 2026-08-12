import { test, expect } from '@playwright/test';
import fs from 'node:fs';

fs.mkdirSync('screenshots/mobile', { recursive: true });

async function warmLazyPreviews(page) {
  const frames = page.locator('.site-demo-preview iframe, .system-preview iframe');
  const count = await frames.count();
  for (let i = 0; i < count; i += 1) {
    const frame = frames.nth(i);
    await frame.scrollIntoViewIfNeeded();
    await expect.poll(
      () => frame.evaluate((el) => el.contentDocument?.body?.innerText?.trim().length || 0),
      { timeout: 5000 }
    ).toBeGreaterThan(20);
  }
}

for (const width of [360,390,430]) {
  test(`home: previews mobile não cortam texto nem recebem CTA sobreposto em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);

    const sitePreview = page.locator('.site-demo-preview').last();
    const siteBody = sitePreview.locator('xpath=following-sibling::*[contains(@class,"site-demo-body")]').first();
    await expect(sitePreview).toBeVisible();
    await expect(siteBody).toBeVisible();

    const previewBox = await sitePreview.boundingBox();
    const bodyBox = await siteBody.boundingBox();
    expect(previewBox?.height || 0).toBeGreaterThanOrEqual(width <= 380 ? 280 : 300);
    expect((bodyBox?.y || 0) + 1).toBeGreaterThanOrEqual((previewBox?.y || 0) + (previewBox?.height || 0));

    const action = sitePreview.locator('.preview-open');
    await expect(action).toBeVisible();

    const iframe = sitePreview.locator('iframe');
    const iframeBox = await iframe.boundingBox();
    const actionBox = await action.boundingBox();
    expect(iframeBox?.height || 0).toBeGreaterThanOrEqual(width <= 380 ? 230 : 255);
    expect(actionBox?.height || 0).toBeGreaterThanOrEqual(46);
    expect((actionBox?.y || 0) + 1).toBeGreaterThanOrEqual((iframeBox?.y || 0) + (iframeBox?.height || 0));
    expect((previewBox?.height || 0) + 2).toBeGreaterThanOrEqual((iframeBox?.height || 0) + (actionBox?.height || 0));

    const description = siteBody.locator('p').first();
    await expect(description).toBeVisible();
    const descriptionState = await description.evaluate((el) => ({
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
      overflow: getComputedStyle(el).overflow,
      maxHeight: getComputedStyle(el).maxHeight,
    }));
    expect(descriptionState.scrollHeight).toBeLessThanOrEqual(descriptionState.clientHeight + 1);
    expect(descriptionState.overflow).not.toBe('hidden');
    expect(descriptionState.maxHeight).toBe('none');

    const systemPreview = page.locator('.system-preview').first();
    await expect(systemPreview).toBeVisible();
    const systemBox = await systemPreview.boundingBox();
    expect(systemBox?.height || 0).toBeGreaterThanOrEqual(width <= 380 ? 395 : 420);
    const systemAfter = await systemPreview.evaluate((el) => getComputedStyle(el, '::after').display);
    expect(systemAfter).toBe('none');

    if (width === 390) {
      await warmLazyPreviews(page);
      await page.locator('#sites-lps').scrollIntoViewIfNeeded();
      await page.locator('#sites-lps').screenshot({ path: 'screenshots/mobile/sites-lps-preview-fix-390.png' });
    }
  });
}
