import { test, expect } from '@playwright/test';

const path = '/cases/omnichannel-performance/';

test('case apresenta dashboard demonstrativo e indicadores sem dados reais', async ({ page }) => {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toContainText('Resultados');
  await expect(page.locator('#csPanelOverview')).toBeVisible();
  await expect(page.locator('#csPanelTech')).toBeHidden();
  await expect(page.locator('#csTotal')).not.toHaveText('—');
  await expect(page.locator('#csStats tr')).toHaveCount(4);
  await expect(page.locator('#csChart polyline')).toHaveCount(4);
  await expect(page.locator('#csDemo')).toContainText('dados fictícios');
  await expect(page.locator('body')).not.toContainText('DE_TOTAL_PORTUGAL_REPORT');
  await expect(page.locator('body')).not.toContainText('Worten');
});

test('filtros atualizam o gráfico, a tabela e os números de forma coerente', async ({ page }) => {
  await page.goto(path);
  const initial = await page.locator('#csTotal').textContent();
  await page.locator('#csJourney').selectOption('cart');
  await page.locator('#csChannel').selectOption('email');
  await expect(page.locator('#csStats tr')).toHaveCount(1);
  await expect(page.locator('#csChart polyline')).toHaveCount(1);
  await expect(page.locator('#csTotal')).not.toHaveText(initial || '');
  await page.locator('#csPeriod').selectOption('90');
  await expect(page.locator('#csChartDescription')).toContainText('90 dias');
});

test('aba técnica explica as duas CloudPages e retorna à demonstração', async ({ page }) => {
  await page.goto(path);
  await page.locator('#csTabTech').click();
  await expect(page.locator('#csPanelTech')).toBeVisible();
  await expect(page.locator('#csPanelOverview')).toBeHidden();
  await expect(page.locator('#csPanelTech')).toContainText('CloudPage AJAX');
  await expect(page.locator('#csPanelTech')).toContainText('CloudPage HTML');
  await page.locator('#csTabOverview').click();
  await expect(page.locator('#csPanelOverview')).toBeVisible();
});

test('exporta somente CSV fictício', async ({ page }) => {
  await page.goto(path);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#csExport').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('dashboard-jornadas-dados-ficticios.csv');
});

for (const width of [360, 390, 768, 1280]) {
  test('case responsivo em ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await page.goto(path, {waitUntil:'domcontentloaded'});
    await expect(page.locator('#csDemo')).toBeVisible();
    const bounds = await page.evaluate(() => ({
      scroll:document.documentElement.scrollWidth,
      viewport:document.documentElement.clientWidth
    }));
    expect(bounds.scroll).toBeLessThanOrEqual(bounds.viewport+2);
    await page.locator('#csTabTech').click();
    await expect(page.locator('#csPanelTech')).toBeVisible();
    if(width===390){
      await page.screenshot({path:'screenshots/case-jornadas-overview-mobile-390.png',fullPage:true});
    }
  });
}
