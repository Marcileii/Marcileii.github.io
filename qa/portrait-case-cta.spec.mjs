import {test,expect} from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('screenshots/portrait-cta',{recursive:true});

for(const [label,width] of [['mobile',390],['desktop',1280]]){
 test(`${label}: nova foto aparece com cores naturais e enquadramento correto`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/',{waitUntil:'networkidle'});
  const photo=page.locator('img.portrait');
  await expect(photo).toHaveAttribute('src','/assets/portrait-marcilei-2026.webp');
  await expect(photo).toBeVisible();
  const info=await photo.evaluate(img=>({
   loaded:img.complete&&img.naturalWidth>0,
   naturalWidth:img.naturalWidth,
   naturalHeight:img.naturalHeight,
   grayscale:getComputedStyle(img).filter,
   left:img.getBoundingClientRect().left,
   right:img.getBoundingClientRect().right,
   viewport:document.documentElement.clientWidth
  }));
  expect(info.loaded).toBe(true);
  expect(info.naturalWidth).toBe(440);
  expect(info.naturalHeight).toBe(585);
  expect(info.grayscale).toBe('none');
  expect(info.left).toBeGreaterThanOrEqual(-1);
  expect(info.right).toBeLessThanOrEqual(info.viewport+1);
  await photo.scrollIntoViewIfNeeded();
  await page.screenshot({path:`screenshots/portrait-cta/home-${label}.png`,fullPage:false});
 });
 test(`${label}: CTA Testar dashboard leva para demo interativa`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/cases/omnichannel-performance/',{waitUntil:'domcontentloaded'});
  const link=page.getByRole('link',{name:/Testar dashboard/});
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href','#csDemo');
  await link.click();
  await expect(page).toHaveURL(/#csDemo$/);
  const demo=page.locator('#csDemo');
  await expect(demo).toBeInViewport();
  await expect.poll(()=>demo.evaluate(el=>Math.round(el.getBoundingClientRect().top)),{timeout:5000}).toBeGreaterThanOrEqual(112);
  await page.screenshot({path:`screenshots/portrait-cta/dashboard-${label}.png`,fullPage:false});
 });
}
