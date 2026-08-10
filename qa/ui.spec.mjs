import { test, expect } from '@playwright/test';
import fs from 'node:fs';

fs.mkdirSync('screenshots', { recursive: true });

const pages = [
  ['home','/'],
  ['contratar','/contratar/'],
  ['leadflow','/demos/leadflow/'],
  ['crm-pro','/demos/crm-pro/'],
  ['agendapro','/demos/agendapro/'],
  ['aurora','/demos/aurora-estetica/'],
  ['nexo','/demos/nexo-contabil/'],
  ['cafe','/demos/cafe-atelier/'],
  ['vista','/demos/vista-imoveis/']
];
const viewports = [
  ['desktop',{width:1440,height:900}],
  ['mobile',{width:390,height:844}]
];

async function revealPage(page){
  await page.evaluate(async()=>{
    const max=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
    for(let y=0;y<max;y+=Math.max(320,window.innerHeight*.7)){
      window.scrollTo(0,y);
      await new Promise(r=>setTimeout(r,45));
    }
    window.scrollTo(0,0);
  });
  await page.waitForTimeout(120);
}

for (const [mode, viewport] of viewports) {
  for (const [name, path] of pages) {
    test(`${mode}: ${name} sem overflow e controles utilizaveis`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const response = await page.goto(path, { waitUntil:'domcontentloaded' });
      expect(response?.ok(), `${path} deve responder 2xx`).toBeTruthy();
      if (name === 'home') await expect(page.locator('#systems')).toBeVisible();
      const overflow = await page.evaluate(() => ({ sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth }));
      expect(overflow.sw, `${path} tem overflow horizontal: ${overflow.sw} > ${overflow.cw}`).toBeLessThanOrEqual(overflow.cw + 2);
      const tinyControls = await page.locator('button:not(.link):not(.text-btn), input, select, textarea').evaluateAll(els => els.filter(el => {
        const s=getComputedStyle(el), r=el.getBoundingClientRect();
        if (s.display==='none'||s.visibility==='hidden'||r.width===0||r.height===0) return false;
        if (el.closest('[hidden]')) return false;
        return (el.tagName==='BUTTON' && r.height<28) || (['INPUT','SELECT'].includes(el.tagName) && r.height<34);
      }).map(el => ({tag:el.tagName,id:el.id,height:Math.round(el.getBoundingClientRect().height),text:(el.textContent||el.getAttribute('placeholder')||'').trim().slice(0,40)})));
      expect(tinyControls, `${path} possui controles pequenos demais: ${JSON.stringify(tinyControls)}`).toEqual([]);
      await revealPage(page);
      await page.screenshot({path:`screenshots/${name}-${mode}.png`,fullPage:true});
    });
  }
}

test('home expõe sistemas e caminho de contratação', async ({ page }) => {
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await expect(page.locator('#systems')).toBeVisible();
  await expect(page.locator('a[href="/demos/crm-pro/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/demos/agendapro/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/contratar/"]').first()).toBeVisible();
});

test('CRM Pro: login, estados, cadastro, pipeline e navegação mobile', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/demos/crm-pro/', { waitUntil:'domcontentloaded' });
  await expect(page.locator('#login')).toBeVisible();
  await expect(page.locator('#app')).toBeHidden();
  await page.locator('#loginForm button').click();
  await expect(page.locator('#login')).toBeHidden();
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('.app > aside .nav')).toBeVisible();
  await page.locator('#clientBtn').click();
  await page.locator('#cname').fill('Cliente QA');
  await page.locator('#company').fill('Empresa QA');
  await page.locator('#cemail').fill('qa@example.com');
  await page.locator('#clientForm .primary').click();
  await page.locator('[data-v="clients"]').click();
  await expect(page.locator('#clientsBody')).toContainText('Empresa QA');
  await page.locator('[data-v="pipeline"]').click();
  await expect(page.locator('#kanban .col')).toHaveCount(4);
});

test('AgendaPro: fluxo completo até confirmação e painel', async ({ page }) => {
  await page.goto('/demos/agendapro/', { waitUntil:'domcontentloaded' });
  await page.locator('[data-service-start]').first().click();
  await page.locator('[data-professional]').first().click();
  await page.locator('.slot:not([disabled])').first().click();
  await page.locator('#bookName').fill('Cliente QA');
  await page.locator('#bookPhone').fill('(11) 99999-9999');
  await page.locator('#bookEmail').fill('qa@example.com');
  await page.locator('#bookingForm button[type="submit"]').click();
  await expect(page.locator('.success-step')).toBeVisible();
  await expect(page.locator('#successCopy')).toContainText('Cliente QA');
  await page.locator('#viewAdmin').click();
  await expect(page.locator('#adminDialog')).toBeVisible();
  await expect(page.locator('#adminList')).toContainText('Cliente QA');
});

test('LeadFlow: formulário produz resultado da automação', async ({ page }) => {
  await page.goto('/demos/leadflow/', { waitUntil:'domcontentloaded' });
  await page.locator('#run').click();
  await expect(page.locator('#result')).toHaveClass(/show/, { timeout:10000 });
  await expect(page.locator('#payload')).toContainText('routing');
  await expect(page.locator('#crmName')).not.toHaveText('—');
});

test('Contratar: briefing gera email revisável sem envio automático', async ({ page }) => {
  await page.goto('/contratar/', { waitUntil:'domcontentloaded' });
  await page.locator('[name="name"]').fill('Cliente QA');
  await page.locator('[name="email"]').fill('qa@example.com');
  await page.locator('[name="type"]').selectOption({label:'Sistema Web'});
  await page.locator('[name="budget"]').selectOption({label:'R$ 3.000 – 5.000'});
  await page.locator('[name="deadline"]').selectOption({label:'Até 1 mês'});
  await page.locator('#briefingForm textarea[name="description"]').fill('Preciso de um sistema para organizar clientes, oportunidades, tarefas e acompanhar o funil comercial.');
  await page.locator('#briefingForm button[type="submit"]').click();
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#preview')).toContainText('Cliente QA');
  await expect(page.locator('#emailLink')).toHaveAttribute('href', /^mailto:marcileibrandao922@gmail.com/);
});
