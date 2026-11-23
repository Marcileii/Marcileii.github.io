import { test, expect } from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('screenshots/mobile-audit', { recursive: true });

test('mobile: os previews carregam quando entram na área visível',async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const previews=[
  {name:'crm',selector:'.system-preview iframe'},
  {name:'aurora',selector:'.site-demo-preview iframe'}
 ];
 for(const item of previews){
  const frame=page.locator(item.selector).first();
  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toBeVisible();
  await expect(frame.contentFrame().locator('body')).toBeVisible({timeout:15000});
  await expect.poll(async()=>frame.contentFrame().locator('body').innerText(),{timeout:15000}).not.toBe('');
  await page.waitForTimeout(350);
  await page.screenshot({path:'screenshots/mobile-audit/scroll-'+item.name+'-390.png'});
  const colors=await frame.contentFrame().locator('body').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,html:el.innerText.slice(0,100)}));
  expect(colors.html.length).toBeGreaterThan(10);
 }
});
test('mobile: gráfico de jornadas usa escala legível e não invade a largura',async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/cases/omnichannel-performance/',{waitUntil:'domcontentloaded'});
 const graph=page.locator('#csChart');
 await graph.scrollIntoViewIfNeeded();
 await expect(graph).toHaveAttribute('viewBox','0 0 360 232');
 await expect(graph.locator('text')).toHaveCount(12);
 const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
 expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.view+2);
 await page.screenshot({path:'screenshots/mobile-audit/case-grafico-390.png'});
 await page.setViewportSize({width:1024,height:850});
 await expect(graph).toHaveAttribute('viewBox','0 0 760 232');
});

test('mobile: trajetória da home até o dashboard do case e aba técnica',async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const caseLink=page.locator('a[href="/cases/omnichannel-performance/"]').first();
 await caseLink.scrollIntoViewIfNeeded();
 await page.screenshot({path:'screenshots/mobile-audit/card-jornadas-390.png'});
 await caseLink.click();
 await expect(page).toHaveURL(/\/cases\/omnichannel-performance\//);
 await expect(page.locator('#csDemo')).toBeVisible();
 await page.screenshot({path:'screenshots/mobile-audit/case-hero-390.png'});
 await page.locator('#csTabTech').scrollIntoViewIfNeeded();
 await page.locator('#csTabTech').click();
 await expect(page.locator('#csPanelTech')).toBeVisible();
 await page.screenshot({path:'screenshots/mobile-audit/aba-tecnica-390.png'});
});
