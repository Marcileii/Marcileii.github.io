import { test, expect } from '@playwright/test';
const API='https://br-shiny-king-bbqddpnl-engagement.compute.c-15.us-east-1.aws.neon.tech/**';
const url='/cases/omnichannel-performance/';
test('visitante vê curtidas e comentários públicos, podendo deixar um comentário',async({page})=>{
 let likes=5, comments=[{id:1,author_name:'Profissional CRM',body:'Ótima demonstração técnica.',created_at:'2026-11-23T13:00:00Z'}];
 await page.route(API, async route=>{
  const req=route.request();
  if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'Content-Type'}});return;}
  if(req.method()==='POST'){
   const payload=req.postDataJSON();
   if(payload.action==='like')likes++;
   if(payload.action==='comment')comments.unshift({id:2,author_name:payload.name,body:payload.comment,created_at:'2026-11-23T14:00:00Z'});
  }
  await route.fulfill({status:req.method()==='POST'?201:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({ok:true,likes,liked:likes>5,comments,accepted:true})});
 });
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#engCount')).toHaveText('5');
 await expect(page.locator('.eng-comment')).toHaveCount(1);
 await page.locator('#engLike').click();
 await expect(page.locator('#engCount')).toHaveText('6');
 await page.locator('#engName').fill('Visitante Teste');
 await page.locator('#engText').fill('Gostei muito de entender a separação das duas CloudPages.');
 await page.locator('#engSubmit').click();
 await expect(page.locator('.eng-comment')).toHaveCount(2);
 await expect(page.locator('.eng-comment').first()).toContainText('Visitante Teste');
});
test('comentário é renderizado como texto sem executar HTML',async({page})=>{
 await page.route(API,async route=>route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({ok:true,likes:0,liked:false,comments:[{id:4,author_name:'<img src=x onerror=alert(1)>',body:'<script>alert(1)</script>',created_at:'2026-11-23T14:00:00Z'}]})}));
 await page.goto(url);
 await expect(page.locator('.eng-comment')).toContainText(['<script>alert(1)</script>']);
 await expect(page.locator('.eng-comment img')).toHaveCount(0);
 await expect(page.locator('.eng-comment script')).toHaveCount(0);
});
