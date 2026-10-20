import fs from 'node:fs/promises'
const out='public/img/real'
await fs.mkdir(out,{recursive:true})
const source='https://www.tomorrowland.com/article/tomorrowland-belgium-2024-interview-vintage-culture/'
const doc='https://press.belgium.tomorrowland.com/tomorrowland-and-amazon-music-present-we-are-tomorrow-4mw33w'
const assets=[
 ['tml-portrait','https://www.tomorrowland.com/home/media/ZpqD8R5LeNNTxT5l_VintageCulture02.jpg',source],
 ['tml-live','https://www.tomorrowland.com/home/media/ZpqD8h5LeNNTxT5m_VintageCulture01.jpg',source],
 ['tml-stage','https://www.tomorrowland.com/home/media/Zpq9Hh5LeNNTxUMo_240719-181310-TML2024-KO4A9488-PW.jpg',source],
]
const html=await fs.readFile('previews/photo-source-2.html','utf8')
for(const m of html.matchAll(/href="(https:\/\/cdn.assets.prezly.com\/[^"/]+\/WEATEROMORROW24_STILL_VINTAGECULTURE(\d+)\.jpg)"/g))assets.push([`documentary-${m[2]}`,m[1],doc])
for(const [name,url] of assets){
 try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(r.status);await fs.writeFile(`${out}/${name}.jpg`,Buffer.from(await r.arrayBuffer()));console.log(name,'OK')}catch(e){console.log(name,e.message)}
}
await fs.writeFile('previews/downloaded-photos.json',JSON.stringify(assets.map(([name,url,source])=>({name,url,source})),null,2))
