// Public Deezer metadata, no credentials or paid API. Run manually to refresh the snapshot.
import fs from 'node:fs/promises'
const ARTIST=4782876,base='https://api.deezer.com/',sources=[],failures=[]
async function get(url){for(let n=0;n<3;n++){try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(`HTTP ${r.status}`);const d=await r.json();if(d.error)throw Error(d.error.message);return d}catch(e){if(n===2){failures.push({url,error:e.message});return null}await new Promise(r=>setTimeout(r,600*(n+1)))}}}
async function pages(url){const all=[];let next=url;const visited=new Set();while(next&&!visited.has(next)){visited.add(next);const d=await get(next);if(!d)break;sources.push({url:next,total:d.total,received:d.data?.length??0});all.push(...(d.data??[]));next=d.next}return all}
async function pool(items,fn){let index=0;await Promise.all(Array.from({length:6},async()=>{while(index<items.length){const item=items[index++];await fn(item)}}))}
const albums=await pages(`${base}artist/${ARTIST}/albums?limit=100`),candidates=new Map()
await pool(albums,async album=>{for(const track of await pages(`${base}album/${album.id}/tracks?limit=100`))candidates.set(track.id,{...track,album:{...album,cover_medium:album.cover_medium}})})
for(const query of ['Vintage Culture','Vintage Culture Remix','Vintage Culture feat'])for(const t of await pages(`${base}search?q=${encodeURIComponent(query)}&limit=100`))if(!candidates.has(t.id))candidates.set(t.id,t)
console.log(`${albums.length} releases, ${candidates.size} track candidates; checking contributor credits`)
const verified=[]
await pool([...candidates.values()],async t=>{
 const full=await get(`${base}track/${t.id}`);if(!full)return
 const artists=full.contributors??[full.artist],credit=artists.some(a=>a.id===ARTIST||/^Vintage Culture(?:\s*[,&]|$)/i.test(a.name)),titleCredit=/vintage culture/i.test(full.title)
 if(!credit&&!titleCredit)return
 verified.push({id:full.id,isrc:full.isrc??null,title:full.title,artists:artists.map(a=>a.name).join(' · '),date:full.release_date??'',duration:full.duration,cover:full.album?.cover_medium??t.album?.cover_medium??null,url:full.link,readable:full.readable,credit:titleCredit?'title-and/or-contributors':'contributors',source:`${base}track/${full.id}`})
})
// Prefer an available version, retain distinct edits/remixes. ISRC identifies recordings.
verified.sort((a,b)=>Number(b.readable)-Number(a.readable)||b.date.localeCompare(a.date))
const unique=new Map();for(const t of verified){const key=t.isrc||`${t.title.toLowerCase().replace(/\s+/g,' ')}|${t.artists}|${t.duration}`;if(!unique.has(key))unique.set(key,t)}
const tracks=[...unique.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title)),out='public/data/catalogue'
await fs.mkdir(out,{recursive:true});const size=36,pageFiles=[]
for(let i=0;i<tracks.length;i+=size){const file=`page-${i/size+1}.json`;pageFiles.push(file);await fs.writeFile(`${out}/${file}`,JSON.stringify(tracks.slice(i,i+size)))}
const manifest={retrieved:'2026-10-19',artist:ARTIST,artistUrl:`https://www.deezer.com/artist/${ARTIST}`,total:tracks.length,pages:pageFiles,releaseCount:albums.length,candidates:candidates.size,verifiedBeforeDedup:verified.length,remixes:tracks.filter(t=>/remix/i.test(t.title)).length,unavailable:tracks.filter(t=>!t.readable).length,coverage:'Public Deezer artist releases plus paginated searches; contributor or explicit title credit required. Not an exhaustive discography. Territory, metadata and search limits apply.',failures}
await fs.writeFile(`${out}/index.json`,JSON.stringify(manifest,null,2));await fs.mkdir('../pesquisa/catalogo',{recursive:true});await fs.writeFile('../pesquisa/catalogo/consulta-deezer.json',JSON.stringify({manifest,sources},null,2));console.log(JSON.stringify(manifest,null,2))
