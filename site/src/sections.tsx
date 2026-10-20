import { useEffect, useRef, useState } from "react"
import HoverExpandGallery from "@/components/ui/hover-expand-gallery"
import { useNearViewport } from '@/components/use-near-viewport'
import { isReview } from '@/review'
import { useReducedMotion } from '@/components/use-reduced-motion'
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type { Lang } from "@/i18n"
import CITY_PHOTOS from '@/city-photos.json'

gsap.registerPlugin(ScrollTrigger)

const HUB = "https://komi.io/vintageculture"
const AFFAIRS_LINK = "https://lnk.to/Affairs"

/** Agenda oficial (hub komi.io/vintageculture, conferida em 19/10/2026). Datas e cidades não mudam de idioma. */
const SHOWS: { d: number; m: number; city: string; venue?: string }[] = [
  { d: 29, m: 10, city: "New York", venue: "Pacha NYC" },
  { d: 30, m: 10, city: "Montes Claros" },
  { d: 31, m: 10, city: "Curitiba", venue: "com Solomun" },
  { d: 1, m: 11, city: "Teresina" },
  { d: 1, m: 11, city: "Fortaleza" },
  { d: 6, m: 11, city: "Olinda" },
  { d: 7, m: 11, city: "Vila Velha" },
  { d: 7, m: 11, city: "Joinville" },
  { d: 13, m: 11, city: "San Diego", venue: "Rady Shell" },
  { d: 14, m: 11, city: "Monterrey", venue: "Kappa FuturFestival" },
  { d: 19, m: 11, city: "Caldas Novas" },
  { d: 20, m: 11, city: "São José do Rio Preto" },
  { d: 21, m: 11, city: "Sinop" },
  { d: 21, m: 11, city: "Foz do Iguaçu" },
  { d: 25, m: 11, city: "Boston" },
  { d: 28, m: 11, city: "Porto Alegre" },
  { d: 5, m: 12, city: "Cotia" },
  { d: 18, m: 12, city: "Thailand", venue: "EDC Thailand" },
  { d: 19, m: 12, city: "Bali", venue: "Savaya" },
  { d: 30, m: 12, city: "Balneário Camboriú" },
]

const MONTHS: Record<Lang, string[]> = {
  pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  en: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
}

const COPY = {
  pt: {
    agendaKicker: "Capítulo 03 · Agenda",
    agendaTitle: "Os próximos palcos.",
    agendaSub: "Do Pacha em Nova York ao EDC Tailândia: 20 datas até o fim de 2026.",
    tickets: "Ingressos",
    affairsKicker: "Capítulo 04 · Affairs",
    affairsTitle: "O selo que ele construiu para o que vem depois.",
    affairsText: "Lançado em 2025, o Affairs é selo, rádio e plataforma de som, moda e estilo de vida. Em 2026 ganhou residência no Pacha Ibiza e começou a se espalhar por Nova York, Madri, Lisboa e Chicago.",
    releases: "Lançamentos",
    listen: "Ouvir o Affairs",
    items: ["Upon Your Skin · com Noah Kulaga", "Feel the Rhythm · com Anna · 188 dias no chart do Beatport", "Hands Up · com Volkoder", "Take Me (To the Sunrise) · com Shouse", "Lost · com Gabss"],
    previewAgenda: ["Agenda", "Datas oficiais até dezembro de 2026. Role: cada linha acende quando chega a vez dela."],
    previewAffairs: ["Affairs", "O selo e a residência em Ibiza. Role para ver o logo, o texto e os lançamentos entrarem."],
  },
  en: {
    agendaKicker: "Chapter 03 · Tour dates",
    agendaTitle: "The next stages.",
    agendaSub: "From Pacha New York to EDC Thailand: 20 dates through the end of 2026.",
    tickets: "Tickets",
    affairsKicker: "Chapter 04 · Affairs",
    affairsTitle: "The label he built for what comes next.",
    affairsText: "Launched in 2025, Affairs is a label, a radio and a platform for sound, fashion and lifestyle. In 2026 it won a residency at Pacha Ibiza and began spreading to New York, Madrid, Lisbon and Chicago.",
    releases: "Releases",
    listen: "Listen to Affairs",
    items: ["Upon Your Skin · with Noah Kulaga", "Feel the Rhythm · with Anna · 188 days on the Beatport chart", "Hands Up · with Volkoder", "Take Me (To the Sunrise) · with Shouse", "Lost · with Gabss"],
    previewAgenda: ["Tour dates", "Official dates through December 2026. Scroll: each row lights up as its turn arrives."],
    previewAffairs: ["Affairs", "The label and the Ibiza residency. Scroll to watch the logo, text and releases come in."],
  },
  es: {
    agendaKicker: "Capítulo 03 · Agenda",
    agendaTitle: "Los próximos escenarios.",
    agendaSub: "De Pacha Nueva York a EDC Tailandia: 20 fechas hasta fines de 2026.",
    tickets: "Entradas",
    affairsKicker: "Capítulo 04 · Affairs",
    affairsTitle: "El sello que construyó para lo que viene.",
    affairsText: "Lanzado en 2025, Affairs es sello, radio y plataforma de sonido, moda y estilo de vida. En 2026 consiguió residencia en Pacha Ibiza y empezó a expandirse a Nueva York, Madrid, Lisboa y Chicago.",
    releases: "Lanzamientos",
    listen: "Escuchar Affairs",
    items: ["Upon Your Skin · con Noah Kulaga", "Feel the Rhythm · con Anna · 188 días en el chart de Beatport", "Hands Up · con Volkoder", "Take Me (To the Sunrise) · con Shouse", "Lost · con Gabss"],
    previewAgenda: ["Agenda", "Fechas oficiales hasta diciembre de 2026. Desplázate: cada fila se enciende a su turno."],
    previewAffairs: ["Affairs", "El sello y la residencia en Ibiza. Desplázate para ver entrar el logo, el texto y los lanzamientos."],
  },
}

export const sectionPreview = (lang: Lang) => ({ agenda: COPY[lang].previewAgenda, affairs: COPY[lang].previewAffairs })

/** Cada linha acende (e as demais esmaecem) conforme passa pelo centro da tela, guiada pelo scroll. */
export function Agenda({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null)
  const near=useNearViewport(root)
  const reduced=useReducedMotion()
  const c = COPY[lang]
  const [city,setCity]=useState<string|null>(null)
  const ignoreCityFocus=useRef(false)
  function closeCity(){const button=root.current?.querySelector<HTMLButtonElement>('.agenda-city[aria-expanded="true"]');setCity(null);if(button&&document.activeElement!==button){ignoreCityFocus.current=true;button.focus({preventScroll:true})}}
  const photo=city?CITY_PHOTOS[city as keyof typeof CITY_PHOTOS]:null
  const photoWords={pt:{view:'Ver foto de',close:'Fechar foto',credits:'Fotografias das cidades · fontes e licenças',hint:'Foto'},en:{view:'View photo of',close:'Close photo',credits:'City photography · sources and licenses',hint:'Photo'},es:{view:'Ver foto de',close:'Cerrar foto',credits:'Fotografías de ciudades · fuentes y licencias',hint:'Foto'}}[lang]
  const cityFigure=(inline=false)=><figure className={`city-preview ${inline?'city-preview-inline':''}`} key={city}>
   {photo&&<><img src={photo.src} width="800" height="500" alt={photo.label} loading="lazy" decoding="async" onError={e=>{e.currentTarget.hidden=true}}/><figcaption><strong>{photo.label}</strong><span>{photo.author} · {photo.license}</span></figcaption>{inline&&<button className="city-preview-close" aria-label={photoWords.close} onClick={closeCity}>×</button>}</>}
  </figure>

  useEffect(() => {
    const el = root.current
    if (!el || !near) return
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.from("[data-head] > *", { y: 24, duration: .7, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } })
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
        gsap.fromTo(
          row,
          { opacity: 0.6, x: -14 },
          {
            opacity: 1,
            x: 0,
            ease: "none",
            scrollTrigger: { trigger: row, start: "top 88%", end: "top 52%", scrub: true },
          },
        )
        gsap.to(row.querySelector("[data-date]"), {
          color: "#f70505",
          ease: "none",
          scrollTrigger: { trigger: row, start: "top 58%", end: "top 48%", scrub: true },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [lang,near,reduced])

  return (
    <section id="agenda" ref={root} className="mx-auto max-w-7xl px-5 py-24 sm:px-8" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeCity()}}}>
      <div data-head>
        <p className="text-[11px] font-semibold tracking-[0.3em] text-red uppercase">{isReview?c.agendaKicker:{pt:'Agenda',en:'Tour dates',es:'Agenda'}[lang]}</p>
        <h2 className="mt-4 font-display text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] uppercase">{c.agendaTitle}</h2>
        <p className="mt-5 max-w-xl text-bone/70">{c.agendaSub}</p>
      </div>

      <div className="agenda-layout mt-14"><ul className="divide-y divide-bone/15 border-y border-bone/15">
        {SHOWS.map((s) => (
          <li key={`${s.d}-${s.m}-${s.city}`} data-row className="agenda-row grid grid-cols-[3.4rem_minmax(0,1fr)_auto] items-center gap-3 py-5 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-8 sm:py-6" onPointerLeave={e=>{if(!e.currentTarget.contains(document.activeElement))setCity(current=>current===s.city?null:current)}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setCity(current=>current===s.city?null:current)}}>
            <p data-date className="font-display text-3xl leading-none text-bone sm:text-5xl">
              {String(s.d).padStart(2, "0")}
              <span className="ml-1.5 align-top font-sans text-[11px] font-semibold tracking-[0.2em] text-ash uppercase">{MONTHS[lang][s.m - 1]}</span>
            </p>
            <div className="min-w-0">
              <button className="agenda-city" aria-expanded={city===s.city} aria-label={`${photoWords.view} ${s.city}`} onPointerEnter={e=>{if(e.pointerType==='mouse')setCity(s.city)}} onFocus={e=>{if(ignoreCityFocus.current){ignoreCityFocus.current=false;return}if(e.currentTarget.matches(':focus-visible'))setCity(s.city)}} onClick={()=>setCity(current=>current===s.city?null:s.city)}><span className="font-display text-xl leading-tight uppercase sm:text-3xl">{CITY_PHOTOS[s.city as keyof typeof CITY_PHOTOS]?.label??s.city}</span></button>
              {s.venue ? <p className="mt-1 text-xs tracking-[0.18em] text-ash uppercase sm:text-sm">{s.venue}</p> : null}
            </div>
            <a
              href={HUB}
              target="_blank"
              rel="noreferrer"
              aria-label={`${c.tickets} · ${s.city} · ${s.d}/${s.m}/2026`}
              onPointerEnter={e=>{if(e.pointerType==='mouse')setCity(s.city)}}
              onFocus={e=>{if(e.currentTarget.matches(':focus-visible'))setCity(s.city)}}
              className="shrink-0 rounded-full border border-bone/50 px-3 py-3 text-xs font-semibold transition hover:bg-bone hover:text-ink sm:px-6 sm:text-sm"
            >
              {c.tickets}
            </a>
            {city===s.city&&<div className="city-inline-cell">{cityFigure(true)}</div>}
          </li>
        ))}
      </ul><aside className="city-preview-rail" aria-live="polite">{photo?cityFigure():null}</aside></div>
      <details className="city-credits"><summary>{photoWords.credits}</summary><ul>{Object.entries(CITY_PHOTOS).map(([name,p])=><li key={name}>{p.label} — {p.author}. <a href={p.source} target="_blank" rel="noreferrer">Commons ↗</a> · <a href={p.licenseUrl||p.source} target="_blank" rel="noreferrer">{p.license} ↗</a></li>)}</ul></details>
    </section>
  )
}

/** Affairs: logo que gira devagar com o scroll, texto e lançamentos que entram em sequência. */
export function Affairs({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null)
  const near=useNearViewport(root)
  const reduced=useReducedMotion()
  const logo = useRef<HTMLDivElement>(null)
  const c = COPY[lang]
  const [active, setActive] = useState(-1)
  // fundo de cada lançamento: malha de gradiente nas cores da capa (upon-your-skin, feel-the-rhythm, hands-up, take-me, lost).
  // Trocar por um fundo do 21st.dev é só substituir estas strings CSS.
  const releaseBg=[
   'radial-gradient(120% 90% at 18% 12%,#e1a70e 0%,transparent 46%),radial-gradient(110% 100% at 88% 32%,#a3361d 0%,transparent 62%),radial-gradient(90% 90% at 50% 105%,#8b6143 0%,transparent 66%),#1d1613',
   'radial-gradient(120% 90% at 82% 10%,#bccc0d 0%,transparent 38%),radial-gradient(110% 100% at 15% 40%,#c3294a 0%,transparent 62%),radial-gradient(90% 90% at 60% 105%,#5a503f 0%,transparent 64%),#1e1618',
   'radial-gradient(120% 90% at 20% 8%,#e8ebd4 0%,transparent 34%),radial-gradient(110% 100% at 85% 40%,#0a7fc2 0%,transparent 64%),radial-gradient(90% 90% at 40% 105%,#54829d 0%,transparent 66%),#0e1a22',
   'radial-gradient(120% 90% at 78% 10%,#e3cf9f 0%,transparent 42%),radial-gradient(110% 100% at 12% 45%,#9c7650 0%,transparent 64%),radial-gradient(90% 90% at 55% 105%,#6b370f 0%,transparent 66%),#2a1c10',
   'radial-gradient(120% 90% at 82% 14%,#f09212 0%,transparent 40%),radial-gradient(110% 100% at 16% 38%,#4b7c99 0%,transparent 62%),radial-gradient(90% 90% at 50% 105%,#493e39 0%,transparent 66%),#0b0b09',
  ]

  useEffect(() => {
    const el = root.current
    if (!el || !near) return
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.from("[data-in]", { y: 24, duration: .8, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } })
      if (reduced || !logo.current) return
      gsap.fromTo(
        logo.current,
        { rotate: -7, yPercent: 8, scale: 0.94 },
        { rotate: 5, yPercent: -8, scale: 1.04, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      )
    }, el)
    return () => ctx.revert()
  }, [lang,near,reduced])

  return (
    <section id="affairs" ref={root} className="affairs-world relative overflow-hidden bg-red py-20 text-ink sm:py-28">
      <div className="affairs-wordmark" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 md:grid-cols-[.8fr_1.2fr]">
        <div ref={logo} className="mx-auto w-full max-w-sm will-change-transform">
          <img src="/img/affairs-logo.jpg" alt="Affairs" loading="lazy" decoding="async" className="aspect-square w-full object-cover mix-blend-multiply" draggable={false} />
        </div>

        <div>
          <p data-in className="text-[11px] font-semibold tracking-[0.3em] uppercase">{isReview?c.affairsKicker:'Affairs'}</p>
          <h2 data-in className="mt-4 font-display text-[clamp(2.2rem,5vw,4.6rem)] leading-[0.95] uppercase">{c.affairsTitle}</h2>
          <p data-in className="affairs-intro mt-6 max-w-xl text-base leading-relaxed sm:text-lg">{c.affairsText}</p>

          <a data-in href={AFFAIRS_LINK} target="_blank" rel="noreferrer" className="mt-8 inline-block rounded-full bg-ink px-8 py-4 text-sm font-semibold text-bone transition hover:bg-bone hover:text-ink">
            {c.listen}
          </a>
        </div>
      </div>
      <div className="relative mx-auto mt-16 max-w-6xl px-5 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4 border-t border-ink/40 pt-6"><h3 className="font-display text-3xl uppercase sm:text-5xl">{c.releases}</h3><span className="text-sm font-semibold tabular-nums">{active<0?'—':`0${active+1}`} / 05</span></div>
        <HoverExpandGallery className="affairs-releases" defaultIndex={-1} closeLabel={{pt:'Fechar lançamento',en:'Close release',es:'Cerrar lanzamiento'}[lang]} height="500px" maxOpenWidth={650} railWidth={72} mobileImageHeight={270} duration={450} onChange={i=>setActive(i)} items={c.items.map((it,i)=>({title:it.split(' · ')[0],meta:it.split(' · ').slice(1).join(' · '),alt:it,accent:releaseBg[i]}))} />
        <div className="affairs-release-summary mt-5 flex flex-wrap items-center justify-between gap-4 text-sm"><p>{active<0?{pt:'Explore um lançamento para ver os detalhes.',en:'Explore a release to see its details.',es:'Explora un lanzamiento para ver sus detalles.'}[lang]:c.items[active]}</p><a className="font-semibold underline underline-offset-4" href={AFFAIRS_LINK} target="_blank" rel="noreferrer">{c.listen} ↗</a></div>
      </div>
    </section>
  )
}
