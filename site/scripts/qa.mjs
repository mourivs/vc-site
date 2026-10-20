import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
const cp=process.argv[2]||'cp0'
const base=process.env.QA_URL||'http://127.0.0.1:5173'
await fs.mkdir('previews',{recursive:true})
if(cp==='lighthouse'){
 const lighthouse=(await import('lighthouse')).default
 const desktopConfig=(await import('lighthouse/core/config/desktop-config.js')).default
 const chromeLauncher=await import('chrome-launcher')
 const chrome=await chromeLauncher.launch({chromeFlags:['--headless=new','--no-sandbox','--disable-gpu']})
 const metrics=[]
 try{for(const mode of ['desktop','mobile']){
  const result=await lighthouse(process.env.QA_URL||'http://127.0.0.1:4173',{port:chrome.port,output:['json','html'],logLevel:'error',onlyCategories:['performance','accessibility']},mode==='desktop'?desktopConfig:undefined)
  await fs.writeFile(`previews/cp5-lighthouse-${mode}.json`,result.report[0]);await fs.writeFile(`previews/cp5-lighthouse-${mode}.html`,result.report[1])
  const lhr=result.lhr
  metrics.push({mode,performance:lhr.categories.performance.score*100,accessibility:lhr.categories.accessibility.score*100,LCP:lhr.audits['largest-contentful-paint'].displayValue,CLS:lhr.audits['cumulative-layout-shift'].displayValue,failures:Object.values(lhr.audits).filter(a=>a.score===0&&a.details?.items?.length).map(a=>({id:a.id,title:a.title,items:a.details.items.slice(0,5)}))})
  console.log(JSON.stringify({...metrics.at(-1),failures:metrics.at(-1).failures.map(f=>f.id)},null,2))
 }}finally{await chrome.kill()}
 await fs.writeFile('previews/cp5-lighthouse-summary.json',JSON.stringify(metrics,null,2))
 process.exit(metrics.some(m=>m.performance<80||m.accessibility<95)?1:0)
}
const browser=await chromium.launch({channel:'chrome',headless:true})
const results=[]
async function scroll(page,selector,offset=0){
 if(cp!=='cp2'&&cp!=='cp6'&&offset===0&&['#biografia','#hits','#palco','#agenda','#affairs'].includes(selector)){
  if(await page.locator('header[data-cinema-hidden="true"]').count())await page.locator('.discs-exit').click()
  const desktop=page.locator(`header [data-nav-target="${selector}"]`)
  if(await desktop.isVisible()){await desktop.click();await page.waitForTimeout(2400);return}
  const toggle=page.locator('.menu-toggle')
  if(await toggle.isVisible()){
   await toggle.click();await page.locator(`dialog [data-nav-target="${selector}"]`).click();await page.waitForTimeout(2400);return
  }
 }
 let previous=null,still=0
 for(let n=0;n<55;n++){
  const delta=await page.locator(selector).first().evaluate((e,o)=>e.getBoundingClientRect().top+o,offset)
  if(Math.abs(delta)<5)break
  if(previous!==null&&Math.abs(previous-delta)<2)still++;else still=0
  if(still>=3)break
  previous=delta
  await page.mouse.wheel(0,Math.sign(delta)*Math.min(1200,Math.abs(delta)))
  await page.waitForTimeout(220)
 }
 await page.waitForTimeout(1200)
}
if(cp==='cp6-film'){
 const page=await browser.newPage({viewport:{width:960,height:640}})
 await fs.mkdir('previews/cp6-frames',{recursive:true})
 await page.goto(base);await page.waitForTimeout(1500)
 for(const [name,target,delta] of [['hero','#home',0],['marquee','#festivais',0],['ranking','#biografia',55],['hits','#hits',180],['palco','#palco',180],['conquistas','#conquistas',180],['agenda','#agenda',70],['affairs','#affairs',70],['galeria','#galeria',0]]){
  await scroll(page,target)
  if(name==='hits')await scroll(page,'[data-cinema]')
  if(name==='palco')await scroll(page,'[data-story-scroll]')
  for(let frame=0;frame<8;frame++){
   if(name==='conquistas'&&(frame===0||frame===4)){await page.locator('.wins-controls button').last().click();await page.waitForTimeout(750)}
   else if(delta)await page.mouse.wheel(0,delta)
   else if(name==='galeria')await page.mouse.wheel(150,0)
   else await page.mouse.move(120+frame*90,150+frame*25)
   await page.waitForTimeout(140)
   await page.screenshot({path:`previews/cp6-frames/${name}-${frame}.png`})
  }
  console.log(`Frames: ${name}`)
 }
 await browser.close();process.exit(0)
}
const sizes=(cp==='cp0'?[[1440,900]]:[[1440,900],[820,1180],[390,844],[360,800]]).filter(([w])=>!process.argv[3]||process.argv[3].split(',').includes(String(w)))
for(const [width,height] of sizes){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:cp==='cp5-reduced'?'reduce':'no-preference'})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text())})
 await page.goto(base);await page.waitForTimeout(2500)
 const initialResources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/three|disc-cascade|molten-ring|liquid-glass-carousel\.tsx/.test(r.name)).map(r=>r.name))
 if(['cp5','cp7'].includes(cp)&&initialResources.length)errors.push('Carrossel pesado carregado antes de entrar na área visível')
 async function shot(name){await page.screenshot({path:`previews/${cp}-${name}-${width}.png`})}
 if(cp==='cp0')await shot('hero')
 if(cp==='cp3'){
  await shot('hero')
  if(width<768){
   await page.locator('.menu-toggle').click();await shot('mobile-menu')
   await page.keyboard.press('Escape')
   if(await page.locator('dialog').evaluate(e=>e.open))errors.push('Escape não fechou o menu')
  }
 }
 if(cp==='cp1'){
  await scroll(page,'#palco');
  const story=page.locator('[data-story-scroll]')
  if(await story.count()){
   for(const index of [5,7,9]){
    const dist=await story.evaluate((el,i)=>(el.offsetHeight-innerHeight)*i/9,index)
    await scroll(page,'[data-story-scroll]',dist)
    await shot(`chapter-${index+1}`)
   }
  }
  await scroll(page,'#galeria');await shot('gallery')
  await scroll(page,'#creditos');await shot('credits')
 }
 if(['cp2','cp3','cp4','cp5','cp5-reduced','cp6','cp7','cp7-ui'].includes(cp)){
  const targets=cp==='cp2'?['#agenda','#affairs']:cp==='cp3'?['#biografia','#hits','#palco']:cp==='cp4'?['#biografia','#creditos']:cp==='cp5'||cp==='cp7-ui'?['#hits','#galeria']:cp==='cp5-reduced'?['#home','#palco','#galeria']:cp==='cp6'?['#biografia','#hits','#palco','#conquistas','#affairs']:['#home','#agenda','#affairs','#galeria','#creditos']
  for(const target of targets){
   await scroll(page,target)
   if(target==='#hits')await scroll(page,'[data-cinema]')
   await shot(target.slice(1))
   if(cp==='cp3'&&target==='#hits'&&await page.locator('header').getAttribute('data-cinema-hidden')!=='true')errors.push('Navbar permaneceu visível nos discos')
   if(cp==='cp7-ui'&&target==='#hits'){
    await page.getByRole('button',{name:'Próxima faixa',exact:true}).click();await page.waitForTimeout(500)
    if(!(await page.locator('.now-playing').innerText()).includes('I Will Find'))errors.push('Controle de faixa não atualizou a identificação')
    await shot('next-track')
   }
   if(cp==='cp3'&&target==='#palco'&&await page.locator('header [aria-current="location"]').count()!==1&&width>=768)errors.push('Estado ativo incorreto')
   if(cp==='cp4'&&target==='#biografia'){
    await page.getByRole('button',{name:'2015, #118',exact:true}).click()
    if(!(await page.locator('.rank-detail').innerText()).includes('118'))errors.push('Seleção de ano falhou')
    await scroll(page,'.rank-detail',-100);await shot('rank-selection')
    await page.getByRole('button',{name:'Tabela',exact:true}).click()
    if(await page.locator('.rank-section tbody tr').count()!==12)errors.push('Tabela incompleta')
    await scroll(page,'.rank-section table',-100);await shot('rank-table')
   }
  }
  if(cp==='cp2'){
   await scroll(page,'.affairs-releases',-100);await shot('releases')
   await scroll(page,'#agenda [data-row]:nth-child(12)',-100);await shot('agenda-long-city')
  }
 }
 const checks=[]
 if(cp==='cp4'&&await page.getByText('Aprova este bloco?',{exact:false}).count())errors.push('Texto de aprovação fora do modo review')
 for(const lang of ['pt','en','es']){
  if(lang!=='pt')await page.getByRole('button',{name:lang.toUpperCase(),exact:true}).click()
  await page.waitForTimeout(250)
  checks.push({requestedLang:lang,...await page.evaluate(()=>({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth-innerWidth,brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src)}))})
  if(cp==='cp7-ui'){
   const label={pt:'Fechar foto',en:'Close photo',es:'Cerrar foto'}[lang]
   if(await page.locator(`#galeria button[aria-label="${label}"]`).count()!==1)errors.push(`Rótulo da galeria não localizado: ${lang}`)
   await shot(`${lang}-gallery`)
  }
  if(cp==='cp7'&&width===360&&lang!=='pt'){
   await page.locator('header > button').click();await page.waitForTimeout(2300);await shot(`${lang}-home`)
   for(const selector of ['#biografia','#agenda','#affairs']){await scroll(page,selector);await shot(`${lang}-${selector.slice(1)}`)}
  }
 }
 if(cp==='cp7'){
  if(await page.locator('#sistema').isVisible())errors.push('Sistema de aprovação visível no modo limpo')
  if(!await page.locator('meta[name="description"]').getAttribute('content'))errors.push('Meta description ausente')
  if(width===1440){
   await page.goto(base+'?review=1');await page.waitForTimeout(1000)
   if(await page.getByText('Aprova este bloco?',{exact:false}).count()!==7)errors.push('Flag review não exibiu os sete blocos')
   await scroll(page,'#hits');await shot('review')
  }
 }
 results.push({width,height,errors,checks,initialResources})
 await fs.writeFile(`previews/${cp}-verification.json`,JSON.stringify(results,null,2))
 console.log(`${cp}: ${width}×${height} verificado`)
 await page.close()
}
await browser.close()
await fs.writeFile(`previews/${cp}-verification.json`,JSON.stringify(results,null,2))
console.log(JSON.stringify(results,null,2))
if(results.some(r=>r.errors.length||r.checks.some(c=>c.overflow>0||c.brokenImages.length)))process.exitCode=1
