import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/contratar/',
  '/cases/serviceflow/',
  '/cases/omnichannel-performance/',
  '/cases/recommendation-engine/',
  '/demos/crm-pro/',
  '/demos/agendapro/',
  '/demos/leadflow/',
  '/demos/aurora-estetica/',
  '/demos/nexo-contabil/',
  '/demos/cafe-atelier/',
  '/demos/vista-imoveis/',
  '/demos/atlas/'
];

for (const route of routes) {
  test(`favicon compartilhado: ${route}`, async ({ page, request }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const favicon = page.locator('head link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href', '/favicon.svg?v=3');
    await expect(favicon).toHaveAttribute('type', 'image/svg+xml');
    const response = await request.get('/favicon.svg?v=3');
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain('viewBox="0 0 64 64"');
  });
}
