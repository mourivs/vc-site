import fs from 'node:fs/promises'
const css=await fs.readFile('previews/font-source.css','utf8')
const blocks=[...css.matchAll(/\/\* (latin(?:-ext)?) \*\/\s*(@font-face\s*\{[^}]+\})/g)]
await fs.mkdir('public/fonts',{recursive:true})
const files=new Map(),out=[]
for(const [,subset,block] of blocks){
 const family=block.match(/font-family: '([^']+)'/)[1].toLowerCase().replaceAll(' ','-')
 const url=block.match(/url\(([^)]+)\)/)[1]
 let filename=files.get(url)
 if(!filename){filename=`${family}-${subset}-${files.size}.woff2`;files.set(url,filename);const r=await fetch(url);if(!r.ok)throw Error(r.status);await fs.writeFile(`public/fonts/${filename}`,Buffer.from(await r.arrayBuffer()))}
 out.push(block.replace(url,`/fonts/${filename}`))
}
await fs.writeFile('public/fonts/fonts.css',out.join('\n'))
await fs.writeFile('public/fonts/LICENSE.md','# Fontes locais\n\nAnton, Inter e Instrument Serif, distribuídas sob a SIL Open Font License.\nOrigem: Google Fonts (fonts.googleapis.com / fonts.gstatic.com). Subsets Latin e Latin Extended, sem alteração de desenho.\n\n'+['anton','inter','instrumentserif'].map(n=>`- https://github.com/google/fonts/blob/main/ofl/${n}/OFL.txt`).join('\n'))
console.log([...files.values()])
