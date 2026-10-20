import fs from 'node:fs/promises'
const app=await fs.readFile('src/App.tsx','utf8')
const urls=[...new Set(['https://komi.io/vintageculture','https://lnk.to/Affairs',...app.matchAll(/https:\/\/[^'"\s<>]+/g)].map(x=>typeof x==='string'?x:x[0]))].filter(u=>!u.includes('googleapis'))
const results=await Promise.allSettled(urls.map(async url=>{try{const r=await fetch(url,{signal:AbortSignal.timeout(15000)});return{url,status:r.status,destination:r.url,assessment:r.ok?'respondendo':r.status===403?'acesso automatizado bloqueado, não é evidência de link morto':'revisar'}}catch(e){return{url,error:e.message,assessment:'não verificável nesta execução'}}}))
const records=results.map(r=>r.status==='fulfilled'?r.value:{error:String(r.reason)})
await fs.writeFile('previews/cp4-links.json',JSON.stringify(records,null,2));console.log(JSON.stringify(records,null,2))
