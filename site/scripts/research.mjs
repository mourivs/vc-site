import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
const urls = [
 'https://alataj.com.br/entrevistas/on-air-010-vintage-culture-bra',
 'https://forbes.com.br/colunas/2020/08/teimosia-de-sucesso-dj-vintage-culture-compartilha-sua-jornada-de-insistencia-ate-o-topo/',
 'https://www.letras.mus.br/blog/quem-e-vintage-culture/',
 'https://contigo.com.br/noticias/giro-contigo/o-investimento-milionario-de-lukas-ruiz-o-vintage-culture-que-poucos-conhecem.phtml',
 'https://meuparlamentochillibeans.blogspot.com/2018/08/personalidade-vintage-culture.html',
 'https://vintageculture.komi.io',
 'https://www.tomorrowland.com/artists/vintage-culture/',
 'https://commons.wikimedia.org/wiki/Category:Vintage_Culture',
]
const browser = await chromium.launch({channel:'chrome',headless:true})
const results=[]
for (const url of urls) {
 const page=await browser.newPage()
 try {
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000})
  await page.waitForTimeout(1500)
  const info=await page.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,12000),images:[...document.images].map(i=>({src:i.currentSrc||i.src,alt:i.alt,w:i.naturalWidth,h:i.naturalHeight,srcset:i.srcset})).filter(i=>i.w>400||i.h>400),links:[...document.querySelectorAll('a[href]')].map(a=>({text:a.textContent.trim(),href:a.href})).filter(a=>/ticket|bandsintown|youtu|\.jpg|\.png|\.webp/i.test(a.href))}))
  results.push({url,status:response?.status(),...info});console.log(JSON.stringify(results.at(-1)))
 }catch(e){results.push({url,error:e.message});console.log(url,e.message)}
 await page.close()
}
await fs.mkdir('previews',{recursive:true})
await fs.writeFile('previews/research-sources.json',JSON.stringify(results,null,2))
await browser.close()
