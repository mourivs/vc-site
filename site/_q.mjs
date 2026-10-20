import { chromium } from 'playwright';
const b = await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
const p = await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text().slice(0,140)));
await p.goto('http://localhost:5173/',{waitUntil:'load'});
await p.waitForTimeout(7000); await p.mouse.move(700,450);
const info=await p.evaluate(()=>{const e=document.getElementById('conquistas');const tr=document.querySelector('.wins-track');return {top:Math.round(e.getBoundingClientRect().top+scrollY),len:tr.scrollWidth-innerWidth}});
console.log(info);
async function go(t){for(let i=0;i<300;i++){const y=await p.evaluate(()=>scrollY);const d=t-y;if(Math.abs(d)<12)break;await p.mouse.wheel(0,Math.max(-800,Math.min(800,d)));await p.waitForTimeout(90)}await p.waitForTimeout(1300)}
for(const f of [0.55,0.72,0.8,0.86,0.92,0.97,1.0]){
 await go(info.top+Math.round(info.len*f));
 const st=await p.evaluate(()=>getComputedStyle(document.querySelector('[data-stb-cube]')).transform);
 console.log(f,st.slice(0,60));
 await p.screenshot({path:`previews/stb-${String(Math.round(f*100)).padStart(3,'0')}.png`});
}
console.log(errs);
await b.close();
