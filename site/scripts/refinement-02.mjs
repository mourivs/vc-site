import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const stage=process.argv[2]||'ranking',base=process.env.QA_URL||'http://127.0.0.1:5173',dir='previews/refinamento-02'
await fs.mkdir(dir,{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),results=[]
async function go(page,selector,offset=0){
 const target=selector.includes('affairs')||selector==='#galeria'?'#affairs':selector==='#agenda'?'#agenda':selector.includes('cinema')?'#hits':selector.includes('story')||selector==='#conquistas'?'#palco':selector.includes('rank')?'#biografia':null
 if(target&&await page.locator('.site-header:not([inert])').count()){
  const nav=page.locator(`header [data-nav-target="${target}"]`)
  if(await nav.isVisible())await nav.click()
  else if(await page.locator('.menu-toggle').isVisible()){await page.locator('.menu-toggle').click();await page.locator(`dialog [data-nav-target="${target}"]`).click()}
  await page.waitForTimeout(1900)
 }
 for(let n=0;n<65;n++){
  const delta=await page.locator(selector).first().evaluate((e,o)=>e.getBoundingClientRect().top+o,offset)
  if(Math.abs(delta)<5)break
  await page.mouse.wheel(0,Math.sign(delta)*Math.min(1100,Math.abs(delta)));await page.waitForTimeout(180)
 }
 await page.waitForTimeout(900)
}
try{for(const [width,height] of [[1440,900],[820,1180],[390,844]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<600}),errors=[]
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
 await page.goto(base);await page.waitForTimeout(1200)
 const shot=async name=>page.screenshot({path:`${dir}/${stage}-${name}-${width}.png`,animations:'disabled',timeout:60000})
 if(stage==='ranking'){
  await go(page,'.rank-section');await shot('start')
  await page.mouse.wheel(0,1400);await page.waitForTimeout(1500);await shot('middle')
  const middle=await page.locator('.rank-scene').evaluate(e=>e.getBoundingClientRect().top);assert(Math.abs(middle)<5,'Rank must remain pinned')
  await page.mouse.wheel(0,1300);await page.waitForTimeout(1500);await shot('complete')
  await page.getByRole('button',{name:'2022, #11',exact:true}).click();await page.waitForTimeout(750);assert(await page.locator('.rank-detail').isVisible());await shot('detail')
  for(const year of ['2019, #47','2020, #30','2026, #10']){await page.getByRole('button',{name:year,exact:true}).click();await page.waitForTimeout(70)}
  await page.waitForTimeout(850);assert((await page.locator('.rank-detail').innerText()).includes('2026'));await page.keyboard.press('Escape');assert.equal(await page.locator('.rank-detail').count(),0)
  await page.mouse.wheel(0,-1500);await page.waitForTimeout(1500);await shot('reverse')
  await page.getByRole('button',{name:/Tabela acessível/}).click();assert.equal(await page.locator('.rank-table tbody tr').count(),12);await shot('table');await page.keyboard.press('Escape')
 }
 if(stage==='discos'){
  await go(page,'[data-cinema]');await page.waitForTimeout(1300);await shot('initial')
  assert.equal(await page.locator('.dcc-head .dcc-stars').count(),1);assert.equal(await page.locator('.dcc-revs .dcc-stars').count(),0)
  await page.locator('.dcc-menubtn').click();await page.locator('.dcc-opt').filter({hasText:'Coffee'}).click()
  await page.waitForTimeout(1400);console.log(JSON.stringify(await page.locator('.dcc-root').evaluate(e=>({title:e.querySelector('.dcc-head')?.textContent,rect:e.getBoundingClientRect().toJSON(),scrollX,scrollY,parents:[e.parentElement.scrollLeft,e.parentElement.parentElement.scrollLeft]}))));await shot('long-title');assert((await page.locator('.dcc-head').textContent()).toLowerCase().includes('coffee'))
 }
 if(stage==='catalogo'){
  await go(page,'[data-cinema]');await page.waitForTimeout(1100);await page.locator('.dcc-menubtn').click();await page.locator('.dcc-opt').filter({hasText:'Take Me'}).click();await page.waitForTimeout(1100)
  assert(await page.locator('.catalogue-launch').isVisible());const before=await page.evaluate(()=>scrollY)
  await page.locator('.catalogue-launch').click();await page.locator('.catalogue-grid article').first().waitFor();assert.equal(await page.locator('.catalogue-grid article').count(),36);await shot('open')
  await page.getByRole('button',{name:/Carregar mais/}).click();await page.waitForFunction(()=>document.querySelectorAll('.catalogue-grid article').length===72)
  await page.route('**/data/catalogue/page-3.json',r=>r.fulfill({status:200,contentType:'application/json',body:'null'}));await page.getByRole('button',{name:/Carregar mais/}).click();await page.getByRole('button',{name:'Tentar novamente',exact:true}).waitFor();await shot('retry')
  await page.unroute('**/data/catalogue/page-3.json');await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.catalogue-grid article').length===108)
  await page.keyboard.press('Escape');await page.waitForTimeout(300);assert.equal(await page.locator('.music-catalogue').count(),0);assert(Math.abs((await page.evaluate(()=>scrollY))-before)<5);await shot('return')
 }
 if(stage==='palco'){
  await go(page,'[data-story-scroll]');await page.waitForTimeout(1800);await page.mouse.move(0,0);await page.waitForTimeout(400)
  const canvas=page.locator('[data-story-scroll] canvas');assert(Number(await canvas.getAttribute('data-strands'))>0);await shot('rest')
  await page.getByRole('button',{name:'Próximo capítulo',exact:true}).click();await page.waitForTimeout(1200);assert(Number(await canvas.getAttribute('data-strands'))>0);await shot('next')
  const before=await page.evaluate(()=>scrollY);await page.mouse.move(width*.7,height*.3);await page.mouse.down();await page.mouse.move(width*.6,height*.18,{steps:8});await page.mouse.up();await page.mouse.move(0,0);await page.waitForTimeout(600);assert(Number(await canvas.getAttribute('data-strands'))>0);assert((await page.evaluate(()=>scrollY))>before,'Controlled drag should advance the owning scroll');await shot('no-hover')
  await canvas.focus();const keyBefore=await page.evaluate(()=>scrollY);await page.keyboard.press('ArrowDown');await page.waitForTimeout(600);assert((await page.evaluate(()=>scrollY))>keyBefore);await shot('keyboard')
 }
 if(stage==='conquistas'){
  await go(page,'#conquistas');assert.equal(await page.locator('.win-composition').count(),8)
  for(let i=0;i<8;i++){
   const left=await page.locator(`.win-${i}`).evaluate(e=>e.getBoundingClientRect().left)
   if(left>45){await page.mouse.wheel(0,(left-40)/.9);await page.waitForTimeout(1400)}
   await shot(`composition-${i}`)
   const layout=await page.locator(`.win-${i}`).evaluate(e=>({height:e.clientHeight,content:e.scrollHeight}));assert(layout.content<=layout.height+1,`Composition ${i} clips content`)
  }
 }
 if(stage==='agenda'){
  await go(page,'#agenda');const buttons=page.locator('.agenda-city');assert.equal(await buttons.count(),20);assert.equal(await page.locator('.city-preview img').count(),0)
  await buttons.first().hover();await page.waitForTimeout(500);await shot('hover');assert.equal(await buttons.first().getAttribute('aria-expanded'),'true')
  await page.mouse.move(0,80);await page.waitForTimeout(200);assert.equal(await page.locator('.city-preview img').count(),0)
  await buttons.nth(2).focus();await page.waitForTimeout(400);assert.equal(await buttons.nth(2).getAttribute('aria-expanded'),'true');await shot('focus');await page.keyboard.press('Escape');assert.equal(await page.locator('.city-preview img').count(),0)
  assert.equal(await page.locator('#agenda .agenda-row > a[href="https://komi.io/vintageculture"]').count(),20)
  if(width<1100){await buttons.first().dispatchEvent('pointerdown',{pointerType:'touch'});await buttons.first().dispatchEvent('click');await page.waitForTimeout(400);assert(await page.locator('.city-preview-inline').isVisible());await shot('touch');await page.locator('.city-preview-close').click();assert.equal(await page.locator('.city-preview img').count(),0)}
 }
 if(stage==='affairs'){
  await go(page,'.affairs-releases',-120);const panels=page.locator('.affairs-releases li > button');assert.equal(await panels.count(),5);assert.equal(await page.locator('.affairs-releases [aria-expanded=true]').count(),0);await shot('closed')
  await panels.first().hover();await page.waitForTimeout(650);assert.equal(await panels.first().getAttribute('aria-expanded'),'true');await shot('upon')
  await page.mouse.move(0,80);await page.waitForTimeout(600);assert.equal(await page.locator('.affairs-releases [aria-expanded=true]').count(),0)
  await panels.nth(1).focus();await page.waitForTimeout(550);assert.equal(await panels.nth(1).getAttribute('aria-expanded'),'true');await shot('focus');await page.keyboard.press('Escape');assert.equal(await page.locator('.affairs-releases [aria-expanded=true]').count(),0)
  if(width<600){await panels.first().tap();await page.waitForTimeout(600);assert.equal(await panels.first().getAttribute('aria-expanded'),'true');await shot('touch');await page.locator('.hx-close').tap();assert.equal(await page.locator('.affairs-releases [aria-expanded=true]').count(),0);await panels.first().tap();await page.waitForTimeout(500);await panels.first().tap();assert.equal(await page.locator('.affairs-releases [aria-expanded=true]').count(),0)}
  const contrast=await page.evaluate(()=>{const lum=rgb=>{const v=rgb.map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]};return [['body',[242,239,233],[10,10,10]],['rails',[242,239,233],[23,23,23]],['brand',[10,10,10],[247,5,5]]].map(([name,a,b])=>({name,ratio:(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05)}))});assert(contrast.every(c=>c.ratio>=4.5));results.push({width,contrast})
 }
 if(stage==='galeria'){
  await go(page,'#galeria');await page.waitForTimeout(2200);await shot('preserved');assert((await page.locator('#galeria h2').textContent()).includes('Luz, cabine, multidão.'))
  const region=page.locator('#galeria [aria-roledescription=carousel]');await region.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(700);await page.keyboard.press('Enter');await page.waitForTimeout(1100);await shot('enlarged');await page.keyboard.press('Escape');await page.waitForTimeout(500);await shot('return')
 }
 const health=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));assert(health.overflow<=0);assert.equal(health.broken.length,0);assert.equal(errors.length,0,errors.join('\n'))
 results.push({width,height,health,errors});console.log(`${stage}: ${width}×${height} OK`);await page.close()
}
if(stage==='ranking'){
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await page.goto(base);await go(page,'.rank-section');assert.equal(await page.locator('.rank-reduced').count(),1);await page.screenshot({path:`${dir}/ranking-reduced-390.png`});await page.close()
}
}finally{await browser.close();await fs.writeFile(`${dir}/${stage}-verification.json`,JSON.stringify(results,null,2))}
