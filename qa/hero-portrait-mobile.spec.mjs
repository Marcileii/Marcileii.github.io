import { test, expect } from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('screenshots/hero-portrait', {recursive:true});

for (const width of [360,390,430,720]) {
 test('foto pequena ao lado do titulo, sem sobreposicao em '+width+'px', async ({page})=>{
  await page.setViewportSize({width,height:850});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('link[href^="/assets/mobile.css"]')).toBeAttached();
  await expect(page.locator('.portrait')).toBeVisible();
  const layout=await page.evaluate(()=>{
   const bounds=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
   return {title:bounds('.hero-grid h1'),portrait:bounds('.portrait'),wrap:bounds('.portrait-wrap'),intro:bounds('.hero-bottom'),viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,portraitNote:getComputedStyle(document.querySelector('.portrait-note')).display};
  });
  expect(layout.portrait.x).toBeGreaterThanOrEqual(layout.title.right-2);
  expect(Math.abs(layout.portrait.y-layout.title.y)).toBeLessThanOrEqual(12);
  expect(layout.portrait.width).toBeLessThanOrEqual(142);
  expect(Math.abs(layout.portrait.height-layout.portrait.width)).toBeLessThanOrEqual(2);
  expect(layout.portrait.width).toBeGreaterThanOrEqual(95);
  expect(layout.intro.y).toBeGreaterThanOrEqual(Math.max(layout.title.bottom,layout.portrait.bottom)-1);
  expect(layout.portrait.right).toBeLessThanOrEqual(width+1);
  expect(layout.scroll).toBeLessThanOrEqual(layout.viewport+2);
  expect(layout.portraitNote).toBe('none');
  await expect(page.locator('.portrait')).toHaveJSProperty('complete',true);
  await page.screenshot({path:'screenshots/hero-portrait/home-'+width+'.png'});
 });
}
test('foto mantem dimensoes e layout lateral no desktop',async ({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const placement=await page.evaluate(()=>{
   const t=document.querySelector('.hero-grid h1').getBoundingClientRect();
   const p=document.querySelector('.portrait').getBoundingClientRect();
   return {titleRight:t.right,portraitLeft:p.left,photoWidth:p.width,noteDisplay:getComputedStyle(document.querySelector('.portrait-note')).display};
 });
 expect(placement.portraitLeft).toBeGreaterThanOrEqual(placement.titleRight-2);
 expect(placement.photoWidth).toBeGreaterThan(200);
 expect(placement.noteDisplay).not.toBe('none');
});
