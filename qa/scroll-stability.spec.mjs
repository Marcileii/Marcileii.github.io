import { test, expect } from '@playwright/test';

for (const viewport of [
  { name:'desktop', width:1440, height:900 },
  { name:'mobile', width:390, height:844 }
]) {
  test(`home não salta de seção no primeiro scroll · ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width:viewport.width, height:viewport.height });
    const response=await page.goto('/', { waitUntil:'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('#systems')).toHaveCount(1);
    await expect(page.locator('.nav a[href="#systems"]')).toHaveCount(1);

    // Depois do carregamento e dos scripts auxiliares, a página deve continuar no topo.
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(2);

    const beforeSites=await page.locator('#sites-lps').evaluate(el=>el.getBoundingClientRect().top);
    expect(beforeSites).toBeGreaterThan(viewport.height * 1.5);

    // Simula exatamente o relato: primeiro giro curto da rodinha do mouse.
    await page.mouse.move(Math.floor(viewport.width/2),Math.floor(viewport.height/2));
    await page.mouse.wheel(0,120);
    await page.waitForTimeout(350);

    const after=await page.evaluate(() => window.scrollY);
    expect(after).toBeGreaterThan(0);
    expect(after,`primeiro wheel não pode saltar a página; scrollY=${after}`).toBeLessThan(700);

    const sitesTop=await page.locator('#sites-lps').evaluate(el=>el.getBoundingClientRect().top);
    expect(sitesTop,`Sites & LPs não pode ser puxado para a viewport no primeiro wheel`).toBeGreaterThan(viewport.height);
  });
}
