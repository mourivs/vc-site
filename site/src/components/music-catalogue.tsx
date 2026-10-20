import { useEffect, useRef, useState } from 'react'
import type { Lang } from '@/i18n'
type Track={id:number;title:string;artists:string;date:string;cover:string|null;url:string;readable:boolean}
type Manifest={total:number;pages:string[];retrieved:string;artistUrl:string}
const COPY={pt:{title:'Além dos nove discos.',sub:'Lançamentos, colaborações e remixes encontrados no catálogo público Deezer. A cobertura varia por território e créditos; esta seleção não é uma discografia completa.',close:'Voltar aos discos',more:'Carregar mais',loading:'Carregando catálogo…',error:'Não foi possível carregar esta página.',retry:'Tentar novamente',listen:'Ouvir na Deezer',unavailable:'Disponibilidade varia por região',source:'Fonte e capas: Deezer / respectivos titulares.',loaded:'faixas exibidas de',missing:'Capa indisponível'},en:{title:'Beyond the nine records.',sub:'Releases, collaborations and remixes found in the public Deezer catalogue. Coverage varies by territory and credits; this is not a complete discography.',close:'Back to records',more:'Load more',loading:'Loading catalogue…',error:'This page could not be loaded.',retry:'Try again',listen:'Listen on Deezer',unavailable:'Availability varies by region',source:'Metadata and artwork: Deezer / respective rights holders.',loaded:'tracks shown of',missing:'Artwork unavailable'},es:{title:'Más allá de los nueve discos.',sub:'Lanzamientos, colaboraciones y remixes encontrados en el catálogo público de Deezer. La cobertura varía por territorio y créditos; no es una discografía completa.',close:'Volver a los discos',more:'Cargar más',loading:'Cargando catálogo…',error:'No se pudo cargar esta página.',retry:'Reintentar',listen:'Escuchar en Deezer',unavailable:'Disponibilidad según la región',source:'Datos y portadas: Deezer / titulares correspondientes.',loaded:'pistas mostradas de',missing:'Portada no disponible'}}
export default function MusicCatalogue({lang,onClose}:{lang:Lang;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),abort=useRef<AbortController|null>(null)
 const [manifest,setManifest]=useState<Manifest|null>(null),[tracks,setTracks]=useState<Track[]>([]),[page,setPage]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(false)
 const c=COPY[lang]
 useEffect(()=>{dialog.current?.showModal();return()=>{abort.current?.abort()}},[])
 async function load(){
  if(busy)return;setBusy(true);setError(false);const controller=new AbortController();abort.current=controller
  try{const read=async(path:string)=>{const r=await fetch(`/data/catalogue/${path}`,{signal:controller.signal});if(!r.ok)throw Error('catalogue');return r.json()};const m:Manifest=manifest??await read('index.json');if(!m||!Array.isArray(m.pages)||!m.pages[page])throw Error('manifest');const data:Track[]=await read(m.pages[page]);if(!Array.isArray(data)||data.some(t=>!t||typeof t.id!=='number'||typeof t.title!=='string'||!/^https:\/\/www.deezer.com\/track\/\d+$/.test(t.url)))throw Error('page');setManifest(m);setTracks(prev=>{const ids=new Set(prev.map(t=>t.id));return [...prev,...data.filter(t=>!ids.has(t.id))]});setPage(p=>p+1)}catch(e){if((e as Error).name!=='AbortError')setError(true)}finally{if(!controller.signal.aborted)setBusy(false)}
 }
 // One initial request sequence; subsequent pages are explicitly requested by the visitor.
 useEffect(()=>{void load()},[]) // eslint-disable-line react-hooks/exhaustive-deps
 return <dialog ref={dialog} className="music-catalogue" data-lenis-prevent onClose={onClose} aria-labelledby="catalogue-title">
  <header><div><p className="text-xs tracking-widest text-red">VINTAGE CULTURE · CATALOGUE</p><h2 id="catalogue-title">{c.title}</h2></div><button autoFocus className="catalogue-close" onClick={()=>dialog.current?.close()}>{c.close} ×</button></header>
  <p className="catalogue-description">{c.sub}</p>
  <div className="catalogue-grid">{tracks.map(t=><article key={t.id}>
   <div className="catalogue-cover"><span aria-hidden>♪</span>{t.cover&&<img src={t.cover} alt={`${t.title} — ${t.artists}`} loading="lazy" decoding="async" width="250" height="250" onError={e=>{e.currentTarget.hidden=true}}/>}</div>
   <p className="catalogue-date">{t.date.slice(0,4)}</p><h3>{t.title}</h3><p className="catalogue-artists">{t.artists}</p><a href={t.url} target="_blank" rel="noreferrer">{c.listen} ↗</a>{!t.readable&&<p className="catalogue-availability">{c.unavailable}</p>}
  </article>)}</div>
  <div className="catalogue-status" aria-live="polite">{busy?<p>{c.loading}</p>:error?<><p>{c.error}</p><button onClick={()=>void load()}>{c.retry}</button></>:(!manifest||page<manifest.pages.length)?<button onClick={()=>void load()}>{c.more} +</button>:null}{manifest&&<p>{tracks.length} {c.loaded} {manifest.total}</p>}</div>
  <footer>{c.source} {manifest?.retrieved} · <a href={manifest?.artistUrl??'https://www.deezer.com/artist/4782876'} target="_blank" rel="noreferrer">Deezer ↗</a> · <a href="https://music.apple.com/us/artist/vintage-culture/649942687" target="_blank" rel="noreferrer">Apple Music ↗</a></footer>
 </dialog>
}
