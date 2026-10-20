import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { T, Lang } from '@/i18n'
import { PHOTOS } from '@/photos'
import { useReducedMotion } from './use-reduced-motion'

export const RANK_DATA: [number,number][]=[[2015,118],[2016,54],[2017,31],[2018,19],[2019,47],[2020,30],[2021,17],[2022,11],[2023,10],[2024,9],[2025,11],[2026,10]]
const M:Record<Lang,string[]>={
 pt:['Os primeiros grandes festivais','Drinkee encontra o mundo','Forbes Under 30','I Will Find','30 mil pessoas no Mineirão','Coffee, com Tiësto','You Give Me A Feeling','O topo do Beatport','A chegada ao Top 10','Promised Land. A melhor posição.','Nasce o Affairs','Affairs, Pacha Ibiza e Cercle'],
 en:['The first major festivals','Drinkee goes global','Forbes Under 30','I Will Find','30,000 people at Mineirão','Coffee, with Tiësto','You Give Me A Feeling','At the top of Beatport','Entering the Top 10','Promised Land. A career best.','Affairs is born','Affairs, Pacha Ibiza and Cercle'],
 es:['Los primeros grandes festivales','Drinkee llega al mundo','Forbes Under 30','I Will Find','30 mil personas en el Mineirão','Coffee, con Tiësto','You Give Me A Feeling','En lo más alto de Beatport','La llegada al Top 10','Promised Land. Su mejor puesto.','Nace Affairs','Affairs, Pacha Ibiza y Cercle'],
}
const C={pt:{kicker:'Ranking DJ Mag Top 100 dos melhores DJs do mundo',chart:'Voltar à curva',table:'Tabela acessível',rank:'Posição',year:'Ano',context:'Fotografia de contexto — não é um registro deste ano',hint:'Role para revelar.',source:'DJ Mag · trajetória documentada de 2015 a 2026, incluindo o #118 da estreia.',reading:'Trajetória completa',progress:'Revelação da trajetória'},en:{kicker:'DJ Mag Top 100 ranking of the best DJs in the world',chart:'Back to chart',table:'Accessible table',rank:'Rank',year:'Year',context:'Context photograph — not a record from this year',hint:'Scroll to reveal.',source:'DJ Mag · documented history, 2015–2026, including the #118 debut.',reading:'Complete trajectory',progress:'Trajectory reveal'},es:{kicker:'Ranking DJ Mag Top 100 de los mejores DJs del mundo',chart:'Volver a la curva',table:'Tabla accesible',rank:'Puesto',year:'Año',context:'Fotografía de contexto — no es un registro de este año',hint:'Desliza para revelar.',source:'DJ Mag · trayectoria documentada de 2015 a 2026, incluido el debut en #118.',reading:'Trayectoria completa',progress:'Revelación de la trayectoria'}}
const x=(i:number)=>48+i*76, y=(r:number)=>48+(r-1)/119*210

export function RankChart({t,lang}:{t:(typeof T)['pt'];lang:Lang}){
 const [table,setTable]=useState(false),[complete,setComplete]=useState(false)
 const root=useRef<HTMLElement>(null),scene=useRef<HTMLDivElement>(null),camera=useRef<HTMLDivElement>(null),zoom=useRef<HTMLDivElement>(null),scroller=useRef<HTMLDivElement>(null)
 const reduced=useReducedMotion(),c=C[lang]
 useLayoutEffect(()=>{
  if(reduced){setComplete(true);return}
  const ctx=gsap.context(()=>{
   const points=gsap.utils.toArray<SVGGElement>('[data-rank-point]',root.current!),segments=gsap.utils.toArray<SVGPathElement>('[data-rank-segment]',root.current!)
   gsap.set(points,{autoAlpha:0})
   const tl=gsap.timeline({scrollTrigger:{id:'rank-reveal',trigger:root.current,start:'top top',end:()=>`+=${Math.max(innerHeight*4.2,3400)}`,pin:scene.current,scrub:.35,invalidateOnRefresh:true,onUpdate:s=>{setComplete(s.progress>.78);if(scroller.current&&innerWidth<768)scroller.current.scrollLeft=Math.max(0,(scroller.current.scrollWidth-scroller.current.clientWidth)*Math.min(1,s.progress/.78))}}})
   tl.to(points[0],{autoAlpha:1,duration:.25})
   segments.forEach((segment,i)=>{const length=segment.getTotalLength();gsap.set(segment,{strokeDasharray:length,strokeDashoffset:length});tl.to(segment,{strokeDashoffset:0,duration:1,ease:'none'}).to(points[i+1],{autoAlpha:1,duration:.28},'<.7')})
   tl.to({},{duration:3.5})
   // câmera: zoom que acompanha a ponta da curva (só ≥768 px; no celular o gráfico já anda por scrollLeft)
   const wrap=zoom.current,svg=wrap?.querySelector('svg') as SVGSVGElement|null
   if(wrap&&svg&&innerWidth>=768){
    const STRONG=2.4,MID=1.5
    const sc=(p:number)=>p<=5?STRONG:p<=8?MID:STRONG
    const vp=wrap.closest('.rank-stage') as HTMLElement
    gsap.set(wrap,{force3D:false})
    // posição do ponto no quadro da câmera, medida compensando o transform atual (funciona em qualquer momento do scrub)
    const focus=(p:number,s:number)=>{
     const W=vp.clientWidth,H=vp.clientHeight
     const cs=Number(gsap.getProperty(wrap,'scale'))||1,cx=Number(gsap.getProperty(wrap,'x'))||0,cy=Number(gsap.getProperty(wrap,'y'))||0
     const vr=vp.getBoundingClientRect(),wr=wrap.getBoundingClientRect(),sr=svg.getBoundingClientRect()
     // origem do contêiner no quadro (o scale gira em torno do canto dele) e do svg dentro do contêiner, sem o transform atual
     const L=wr.left-vr.left-cx,T=wr.top-vr.top-cy
     const ql=(sr.left-wr.left)/cs,qt=(sr.top-wr.top)/cs,w0=sr.width/cs,h0=sr.height/cs,k=Math.min(w0/936,h0/310)
     const qx=ql+(w0-936*k)/2+x(p)*k,qy=qt+(h0-310*k)/2+y(RANK_DATA[p][1])*k
     const fit=(c:number,origin:number,lo:number,size:number,view:number)=>{const min=view-origin-s*(lo+size),max=-origin-s*lo;return min>max?(min+max)/2:Math.min(max,Math.max(min,c))}
     return{scale:s,x:fit(W/2-L-s*qx,L,ql,w0,W),y:fit(H/2-T-s*qy,T,qt,h0,H)}
    }
    const rest={scale:1,x:0,y:0}
    tl.fromTo(wrap,rest,{...focus(0,STRONG),duration:.25,ease:'power2.inOut'} as gsap.TweenVars,0)
    for(let i=0;i<RANK_DATA.length-1;i++){
     const ramp=sc(i)!==sc(i+1)
     tl.fromTo(wrap,{...focus(i,sc(i))} as gsap.TweenVars,{...focus(i+1,sc(i+1)),duration:1,ease:ramp?'power1.inOut':'none',immediateRender:false} as gsap.TweenVars,.25+i)
    }
    tl.fromTo(wrap,{...focus(11,STRONG)} as gsap.TweenVars,{...rest,duration:1.6,ease:'power2.inOut',immediateRender:false} as gsap.TweenVars,11.35)
   }
  },root)
  return()=>ctx.revert()
 },[reduced])
 function close(){setTable(false)}
 return <section ref={root} className={`rank-section ${reduced?'rank-reduced':''}`} aria-labelledby="rank-title" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();close()}}}>
  <div ref={scene} className="rank-scene">
   <header className="rank-heading"><div><p className="text-xs tracking-widest text-bone/70 uppercase">{c.kicker} · 2015—2026</p><h2 id="rank-title" className="font-display uppercase">{t.home.chartTitle}</h2></div><div className="rank-current"><strong>#10</strong><span>{t.home.now}<br/>2026</span></div></header>
   <div className="rank-tools"><p>{complete||reduced?c.reading:c.hint}</p><button aria-expanded={table} onClick={()=>setTable(!table)}>{table?c.chart:c.table} ↗</button></div>
   <div className="rank-stage">
    <div ref={scroller} className="rank-scroll" role="region" aria-label={t.home.chartSub} tabIndex={0}>
     <div ref={camera} className="rank-camera"><div ref={zoom} className="rank-zoom"><svg viewBox="0 0 936 310" className="rank-svg" role="group" aria-label={t.home.chartSub}>
      <defs>{RANK_DATA.map(([yr,r],i)=><clipPath key={yr} id={`rank-photo-${yr}`}><circle cx={x(i)} cy={y(r)} r="18"/></clipPath>)}</defs>
      {[10,50,100].map(r=><g key={r}><line x1="25" x2="910" y1={y(r)} y2={y(r)} stroke="#f2efe9" strokeOpacity=".14" strokeDasharray="3 6"/><text x="2" y={y(r)+4} fill="#bdbbb5" fontSize="11">{r}</text></g>)}
      {RANK_DATA.slice(1).map(([yr,r],i)=><path key={yr} data-rank-segment d={`M${x(i)},${y(RANK_DATA[i][1])}L${x(i+1)},${y(r)}`} stroke="#ff514d" strokeWidth="3" fill="none"/>)}
      {RANK_DATA.map(([yr,r],i)=><g key={yr} data-rank-point={i}>
       <text x={x(i)} y={y(r)-31} textAnchor="middle" fill="#f2efe9" fontSize="20" fontWeight="600">#{r}</text><circle cx={x(i)} cy={y(r)} r="21" fill="#0a0a0a" stroke="#ff514d"/>
       <image href={PHOTOS[i].src.replace('.webp','-640.webp')} x={x(i)-18} y={y(r)-18} width="36" height="36" preserveAspectRatio="xMidYMid slice" clipPath={`url(#rank-photo-${yr})`}/>
       <text x={x(i)} y="302" textAnchor="middle" fill="#bdbbb5" fontSize="14">{yr}</text>
      </g>)}
     </svg></div></div>
    </div>
    {table&&<div className="rank-table"><table><caption>DJ Mag · 2015—2026</caption><thead><tr><th>{c.year}</th><th>{c.rank}</th><th>Vintage Culture</th></tr></thead><tbody>{RANK_DATA.map(([yr,r],i)=><tr key={yr}><td>{yr}</td><td>#{r}</td><td>{M[lang][i]}</td></tr>)}</tbody></table></div>}
   </div>
   <div className="rank-years" aria-label={c.progress}>{RANK_DATA.map(([yr,r])=><div key={yr} aria-label={`${yr}, #${r}`}>{yr}<span>#{r}</span></div>)}</div>
   <p className="rank-source">{c.source} <a href="https://djmag.com/top100djs/2026/10/vintage-culture" target="_blank" rel="noreferrer">DJ Mag ↗</a></p>
  </div>
 </section>
}
