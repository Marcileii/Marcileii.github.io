import { test, expect } from '@playwright/test';
import fs from 'node:fs';

fs.mkdirSync('screenshots/mobile', { recursive: true });

const routes = [
  ['home','/'],
  ['contratar','/contratar/'],
  ['leadflow','/demos/leadflow/'],
  ['crm-pro','/demos/crm-pro/'],
  ['agendapro','/demos/agendapro/'],
  ['aurora','/demos/aurora-estetica/'],
  ['nexo','/demos/nexo-contabil/'],
  ['cafe','/demos/cafe-atelier/'],
  ['vista','/demos/vista-imoveis/'],
  ['atlas','/demos/atlas/'],
  ['case-serviceflow','/cases/serviceflow/'],
  ['case-omnichannel','/cases/omnichannel-performance/'],
  ['case-recommendation','/cases/recommendation-engine/']
];

const devices = [
  ['360',{width:360,height:800}],
  ['390',{width:390,height:844}],
  ['430',{width:430,height:932}],
  ['tablet',{width:768,height:1024}]
];

async function assertNoOverflow(page, label){
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(overflow.scrollWidth, `${label}: overflow ${overflow.scrollWidth}px > ${overflow.clientWidth}px`).toBeLessThanOrEqual(overflow.clientWidth + 2);
}

async function assertPrimaryTouchTargets(page, label){
  const bad = await page.locator('button, input, select, textarea, .btn, .pill, .submit, .calc, .portfolio-link, .mobile-menu-toggle').evaluateAll((els) => els.flatMap((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || r.width === 0 || r.height === 0 || el.closest('[hidden]')) return [];
    if (el.matches('input[type="hidden"]')) return [];
    const min = el.matches('textarea') ? 70 : 38;
    return r.height < min ? [{tag:el.tagName,id:el.id,className:el.className,height:Math.round(r.height)}] : [];
  }));
  expect(bad, `${label}: alvos de toque pequenos: ${JSON.stringify(bad)}`).toEqual([]);
}

for (const [device, viewport] of devices) {
  for (const [name, path] of routes) {
    test(`${device}px · ${name} mantém layout mobile estável`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const response = await page.goto(path, { waitUntil:'domcontentloaded' });
      expect(response?.ok(), `${path} deve responder 2xx`).toBeTruthy();
      await page.waitForTimeout(120);
      await assertNoOverflow(page, `${device}/${name}`);
      await assertPrimaryTouchTargets(page, `${device}/${name}`);
      if (device === '390') {
        await page.screenshot({path:`screenshots/mobile/${name}-390.png`,fullPage:true});
      }
    });
  }
}

for (const width of [360,390,430]) {
  test(`home: menu editorial fica íntegro em ${width}px`, async ({ page }) => {
    await page.setViewportSize({width,height:844});
    await page.goto('/', { waitUntil:'domcontentloaded' });
    const toggle=page.locator('.mobile-menu-toggle');
    const nav=page.locator('.top .nav');
    await expect(toggle).toBeVisible();
    await expect(toggle).toContainText('Menu');
    const toggleBox=await toggle.boundingBox();
    expect(toggleBox?.height||0).toBeGreaterThanOrEqual(38);
    expect(toggleBox?.width||999).toBeLessThanOrEqual(100);
    await expect(toggle.locator('.menu-icon i')).toHaveCount(2);
    const iconLines=await toggle.locator('.menu-icon i').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height}}));
    expect(iconLines.every(line=>line.width>=16&&line.height<=3)).toBeTruthy();

    await toggle.click();
    await expect(nav).toHaveClass(/open/);
    await expect(toggle).toContainText('Fechar');
    await expect(page.locator('.mobile-nav-backdrop')).toHaveClass(/open/);
    await expect(page.locator('.top .nav a[href="#work"]')).toBeVisible();
    await expect(page.locator('.top .nav a[href="/contratar/"]')).toBeVisible();
    const navBox=await nav.boundingBox();
    expect(navBox?.x||0).toBeGreaterThanOrEqual(8);
    expect((navBox?.x||0)+(navBox?.width||0)).toBeLessThanOrEqual(width-8);
    await assertNoOverflow(page,`menu aberto ${width}`);
    if(width===390) await page.screenshot({path:'screenshots/mobile/menu-open-390.png',fullPage:false});

    await page.locator('.mobile-nav-backdrop').click({position:{x:2,y:2}});
    await expect(nav).not.toHaveClass(/open/);
    await expect(toggle).toContainText('Menu');
  });
}

test('home: menu mobile fecha com ESC e devolve foco ao botão', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/', { waitUntil:'domcontentloaded' });
  const toggle=page.locator('.mobile-menu-toggle');
  const nav=page.locator('.top .nav');
  await toggle.click();
  await expect(nav).toHaveClass(/open/);
  await page.keyboard.press('Escape');
  await expect(nav).not.toHaveClass(/open/);
  await expect(toggle).toBeFocused();
});

test('cases: menu mobile também permanece utilizável', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/cases/serviceflow/', { waitUntil:'domcontentloaded' });
  const toggle = page.locator('.mobile-menu-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator('.top .nav')).toHaveClass(/open/);
  await expect(page.locator('.top .nav a[href="/contratar/"]')).toBeVisible();
});

test('home: previews usam viewport mobile real, não desktop reduzido', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await expect(page.locator('#systems')).toBeVisible();
  for (const selector of ['.system-preview iframe','.site-demo-preview iframe']) {
    const frame = page.locator(selector).first();
    await expect(frame).toBeVisible();
    const values = await frame.evaluate((el) => ({
      transform:getComputedStyle(el).transform,
      width:el.getBoundingClientRect().width,
      parentWidth:el.parentElement.getBoundingClientRect().width
    }));
    expect(['none','matrix(1, 0, 0, 1, 0, 0)']).toContain(values.transform);
    expect(Math.abs(values.width-values.parentWidth)).toBeLessThanOrEqual(2);
  }
});

for (const width of [360,390,430]) {
  test(`home: cards de Sites & LPs não cortam descrição nem sobrepõem CTA em ${width}px`, async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/', { waitUntil:'domcontentloaded' });
    const cards=page.locator('#sites-lps .site-demo');
    expect(await cards.count()).toBeGreaterThanOrEqual(5);

    for(let i=0;i<await cards.count();i++){
      const card=cards.nth(i);
      const iframe=card.locator('.site-demo-preview iframe');
      const action=card.locator('.preview-open');
      const description=card.locator('.site-demo-body p');
      await expect(iframe).toBeVisible();
      await expect(action).toBeVisible();
      await expect(description).toBeVisible();

      const iframeBox=await iframe.boundingBox();
      const actionBox=await action.boundingBox();
      const descriptionBox=await description.boundingBox();
      expect((actionBox?.y||0), `card ${i}: CTA não pode cobrir o iframe`).toBeGreaterThanOrEqual((iframeBox?.y||0)+(iframeBox?.height||0)-1);
      expect((descriptionBox?.height||0), `card ${i}: descrição precisa ter altura visível`).toBeGreaterThan(35);

      const clipping=await description.evaluate((el)=>({
        clientHeight:el.clientHeight,
        scrollHeight:el.scrollHeight,
        overflow:getComputedStyle(el).overflow,
        maxHeight:getComputedStyle(el).maxHeight
      }));
      expect(clipping.scrollHeight, `card ${i}: descrição não pode ser truncada`).toBeLessThanOrEqual(clipping.clientHeight+1);
      expect(clipping.overflow).not.toBe('hidden');
      expect(clipping.maxHeight).toBe('none');
    }

    if(width===390){
      await page.locator('#sites-lps').screenshot({path:'screenshots/mobile/sites-lps-fixed-390.png'});
    }
  });
}

test('LPs recebem a camada mobile compartilhada e identidade específica', async ({ page }) => {
  const demos = [
    ['/demos/aurora-estetica/','demo-aurora'],
    ['/demos/nexo-contabil/','demo-nexo'],
    ['/demos/cafe-atelier/','demo-cafe'],
    ['/demos/vista-imoveis/','demo-vista'],
    ['/demos/atlas/','demo-atlas'],
    ['/demos/leadflow/','demo-leadflow']
  ];
  await page.setViewportSize({width:390,height:844});
  for (const [path, cls] of demos) {
    await page.goto(path, { waitUntil:'domcontentloaded' });
    await expect(page.locator('body')).toHaveClass(new RegExp(cls));
    const hasStylesheet = await page.locator('link[href^="/assets/demo-mobile.css"]').count();
    expect(hasStylesheet, `${path} deve carregar demo-mobile.css`).toBe(1);
  }
});

test('CRM Pro: navegação inferior fica visível sem cobrir a operação', async ({ page }) => {
  await page.setViewportSize({width:360,height:800});
  await page.goto('/demos/crm-pro/', { waitUntil:'domcontentloaded' });
  await page.locator('#loginForm button').click();
  const nav = page.locator('.app > aside .nav');
  await expect(nav).toBeVisible();
  const box = await nav.boundingBox();
  expect(box?.height || 0).toBeGreaterThanOrEqual(45);
  await page.locator('[data-v="pipeline"]').click();
  await expect(page.locator('#kanban .col')).toHaveCount(4);
  await assertNoOverflow(page,'crm mobile pipeline');
});

test('AgendaPro: booking mantém controles confortáveis no menor viewport', async ({ page }) => {
  await page.setViewportSize({width:360,height:800});
  await page.goto('/demos/agendapro/', { waitUntil:'domcontentloaded' });
  await page.locator('#startBooking').click();
  await expect(page.locator('.booking-card')).toBeVisible();
  await page.locator('[data-service-start]').first().click();
  await expect(page.locator('[data-professional]').first()).toBeVisible();
  await assertNoOverflow(page,'AgendaPro booking 360');
});

test('Atlas não exibe métrica comercial fictícia', async ({ page }) => {
  await page.goto('/demos/atlas/', { waitUntil:'domcontentloaded' });
  await expect(page.locator('body')).not.toContainText('+37%');
  await expect(page.locator('body')).toContainText('Brand + Web');
});
