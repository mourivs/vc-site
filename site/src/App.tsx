import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"
import type { DiscCascadeItem, DiscPositionStore } from "@/components/ui/disc-cascade-carousel"
import type { MoltenRingItem } from "@/components/ui/molten-ring-carousel"
import type { LiquidGlassCarouselItem } from "@/components/ui/liquid-glass-carousel"
import { WebGLFallback } from '@/components/ui/liquid-glass-carousel-utils/webgl-error-boundary'
import { useReducedMotion } from '@/components/use-reduced-motion'
import { LazyMount } from "@/components/lazy-mount"
import { Hero } from "@/components/hero"
import { RankChart } from "@/components/rank-explorer"
import { LANGS, T, type Lang } from "@/i18n"
import { STORY } from "@/story"
import { PHOTOS, ImageCredits, photoSrcSet } from "@/photos"
import { useSpotify, TRACKS, PlayIcon, PauseIcon, SPOTIFY_ARTIST } from "@/spotify"
import { Agenda, Affairs, sectionPreview } from "@/sections"
import { isReview } from '@/review'
import { WinGraphic } from '@/components/win-graphic'
import { applyMetadata } from '@/seo'

gsap.registerPlugin(ScrollTrigger)
const DiscCascadeCarousel=lazy(()=>import('@/components/ui/disc-cascade-carousel'))
const MoltenRingCarousel=lazy(()=>import('@/components/ui/molten-ring-carousel'))
const LiquidGlassCarousel=lazy(()=>import('@/components/ui/liquid-glass-carousel'))
const MusicCatalogue=lazy(()=>import('@/components/music-catalogue'))

// aquece os módulos 3D em tempo ocioso: quando a cena entra na tela, o código já está pronto (sem travada de carregamento)
if (typeof window !== 'undefined') {
  const warm = () => { void import('@/components/ui/disc-cascade-carousel'); void import('@/components/ui/molten-ring-carousel'); void import('@/components/ui/liquid-glass-carousel'); void import('three') }
  window.addEventListener('load', () => window.setTimeout(() => ('requestIdleCallback' in window ? window.requestIdleCallback(warm, { timeout: 3000 }) : globalThis.setTimeout(warm, 500)), 3500), { once: true })
}

const FONTS = '/fonts/fonts.css'

/** Instância única do Lenis: todo o site anda por ela (roda, trackpad, teclado, menu e âncoras). */
let lenis: Lenis | null = null

const NAV_TARGETS = ["#biografia", "#hits", "#palco", "#agenda", "#affairs"]
const VENUES: Record<string,string>={Tomorrowland:'https://www.tomorrowland.com/',EDC:'https://lasvegas.electricdaisycarnival.com/',Coachella:'https://www.coachella.com/',Glastonbury:'https://www.glastonburyfestivals.co.uk/',Creamfields:'https://creamfields.com/','Burning Man':'https://burningman.org/',Cercle:'https://www.cercle.io/','Time Warp':'https://www.time-warp.de/','Pacha Ibiza':'https://pacha.com/','Ushuaïa':'https://www.theushuaiaexperience.com/'}
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

function goTo(target: string) {
  if (lenis) lenis.scrollTo(target, { duration: matchMedia('(prefers-reduced-motion: reduce)').matches?0:1.4, easing: easeOutQuart, offset: 0 })
  else document.querySelector(target)?.scrollIntoView()
}

function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth))
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener("resize", on)
    return () => window.removeEventListener("resize", on)
  }, [])
  return w
}

function PreviewTag({ n, title, text, approve }: { n: number; title: string; text: string; approve: string }) {
  if(!isReview)return null
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 pt-20 pb-6 sm:px-8">
      <div className="flex items-center gap-3 font-sans text-[11px] font-semibold tracking-[0.2em] text-red uppercase">
        <span className="rounded-full border border-red px-2.5 py-1">{String(n).padStart(2, "0")}</span>
        <span>{title}</span>
      </div>
      <p className="max-w-2xl text-sm text-ash">{text}</p>
      <p className="text-xs text-ash/70 italic">{approve}</p>
    </div>
  )
}

/** Faixa vermelha: corre sozinha e ganha velocidade (e inclinação) com a velocidade do scroll. */
function Marquee({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null)
  const animation=useRef<gsap.core.Tween|null>(null)
  const reduced=useReducedMotion()

  useEffect(() => {
    const el = track.current
    if (!el) return
    const loop = gsap.to(el, { xPercent: -33.333, ease: "none", duration: 32, repeat: -1 })
    animation.current=loop
    if (reduced) loop.pause()
    const skew = gsap.quickTo(el, "skewX", { duration: 0.5, ease: "power3.out" })
    const on = ({ velocity }: { velocity: number }) => {
      if (reduced) return
      const v = Math.min(Math.abs(velocity), 40)
      gsap.to(loop, { timeScale: (velocity < 0 ? -1 : 1) * (1 + v * 0.45), duration: 0.5, overwrite: true })
      skew(Math.max(-9, Math.min(9, -velocity * 0.35)))
    }
    lenis?.on("scroll", on)
    return () => {
      lenis?.off("scroll", on)
      loop.kill()
    }
  }, [reduced])

  return (
    <div id="festivais" className="overflow-hidden border-y border-bone/15 bg-red py-4 text-ink" onMouseEnter={()=>animation.current?.pause()} onMouseLeave={()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)animation.current?.resume()}} onFocusCapture={()=>animation.current?.pause()} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget)&&!matchMedia('(prefers-reduced-motion: reduce)').matches)animation.current?.resume()}}>
      <div ref={track} className="flex w-max gap-10 font-display text-3xl uppercase">
        {[...items, ...items, ...items].map((m, i) => (
          <span key={i} className="flex items-center gap-10" aria-hidden={i>=items.length}><a href={VENUES[m]} target="_blank" rel="noreferrer" tabIndex={i>=items.length?-1:0} className="transition-colors hover:text-white focus-visible:text-white">{m}</a><span aria-hidden>✦</span></span>
        ))}
      </div>
    </div>
  )
}

/** Fixa o bloco na tela e devolve o progresso (0–1) do scroll sobre ele. */
function useScrollProgress(outer: React.RefObject<HTMLElement | null>, onProgress: (p: number) => void) {
  const cb = useRef(onProgress)
  cb.current = onProgress
  useEffect(() => {
    const el = outer.current
    if (!el) return
    const st = ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom", onUpdate: (s) => cb.current(s.progress) })
    return () => st.kill()
  }, [outer])
}

/** Os discos andam com o scroll: cada faixa ocupa um trecho da rolagem. */
function ScrollDiscs({ items, t, lang }: { items: DiscCascadeItem[]; t: (typeof T)["pt"]; lang:Lang }) {
  const outer = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const posStore = useRef<DiscPositionStore>({ v: 0, subs: new Set() }).current
  const sp = useSpotify()
  const [catalogue,setCatalogue]=useState(false)
  const slug = items[i]?.src?.match(/covers\/([^./]+)\.jpg/)?.[1] ?? ''
  const isPlaying = sp.playing && sp.current === slug
  useScrollProgress(outer, (p) => { setI(Math.round(p * (items.length - 1))); posStore.v = p * (items.length - 1); posStore.subs.forEach((f) => f(posStore.v)) })

  return (
    <div ref={outer} style={{ height: `calc(100svh + ${(items.length - 1) * 55}svh)` }}>
      <div data-cinema className="discs-scene sticky top-0 h-svh">
        <LazyMount height="100svh" margin="1400px"><Suspense fallback={null}><DiscCascadeCarousel
          items={items}
          height="100svh"
          indexLabel={t.hitsIndex}
          index={i}
          positionStore={posStore}
          onIndexChange={setI}
          background="radial-gradient(120% 90% at 50% 40%, #1d1d1d, #050505)"
          color="#f2efe9"
          fontHref={FONTS}
          hint={t.hitsHint}
          ariaLabel={t.nav[1]}
          locale={lang}
          sheen={0.45}
        /></Suspense></LazyMount>
        <div className="now-playing" aria-live="polite" aria-atomic="true">
          <img src={items[i].src?.replace('.jpg','-128.webp')} alt="" width="64" height="64" loading="lazy" decoding="async" />
          <div><p className="text-xs text-bone/75">{t.hitCredits.label} · {i+1} / {items.length}</p><p className="mt-1 text-base font-semibold">{items[i].title}</p></div>
          {slug&&TRACKS[slug]?<button type="button" className="np-play" aria-pressed={isPlaying} aria-label={`${isPlaying?{pt:'Pausar',en:'Pause',es:'Pausar'}[lang]:{pt:'Tocar',en:'Play',es:'Reproducir'}[lang]} ${items[i].title}`} onClick={()=>sp.toggle(slug)}>{isPlaying?<PauseIcon/>:<PlayIcon/>}</button>:null}
          <a href={SPOTIFY_ARTIST} target="_blank" rel="noreferrer" aria-label={t.cta} className="ml-2 grid size-11 place-items-center rounded-full border border-bone/50">↗</a>
        </div>
        <button className="discs-exit" onClick={()=>goTo('#palco')}>{t.nav[2]} ↓</button>
        {i===items.length-1&&<button className="catalogue-launch" onClick={()=>{lenis?.stop();setCatalogue(true)}}>{{pt:'Ver mais',en:'Explore more',es:'Ver más'}[lang]} <span aria-hidden>↗</span></button>}
        {catalogue&&<Suspense fallback={<div className="catalogue-loading" role="status">…</div>}><MusicCatalogue lang={lang} onClose={()=>{setCatalogue(false);lenis?.start()}}/></Suspense>}
      </div>
    </div>
  )
}

/** Palco: o anel anda com o scroll e cada card é um capítulo da história. */
function ScrollRing({ items, lang }: { items: MoltenRingItem[]; lang: Lang }) {
  const outer = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)
  const [on, setOn] = useState(false)
  const vw = useViewportWidth()
  const reduced=useReducedMotion()
  const story = STORY[lang]
  const active = Math.min(items.length - 1, Math.max(0, Math.round(p * (items.length - 1))))
  const ch = story.chapters[active]
  const chapterStep=(direction:number)=>{
    const el=outer.current;if(!el)return
    const index=Math.min(items.length-1,Math.max(0,active+direction))
    lenis?.scrollTo(el.getBoundingClientRect().top+window.scrollY+(el.offsetHeight-window.innerHeight)*index/(items.length-1),{duration:reduced?0:.7})
  }
  // o tamanho do cartão é relativo à largura do palco: no celular precisa de bem mais
  const cardSize = vw < 640 ? 0.62 : vw < 1024 ? 0.42 : 0.3

  useScrollProgress(outer, setP)
  useEffect(() => {
    const el = outer.current
    if (!el) return
    const vis = ScrollTrigger.create({
      trigger: el,
      start: "top bottom+=1400",
      end: "bottom top-=300",
      onToggle: (s) => setOn(s.isActive),
    })
    return () => vis.kill()
  }, [])

  return (
    <div ref={outer} data-story-scroll style={{ height: `calc(100svh + ${(items.length - 1) * 40}svh)` }}>
      <div className="sticky top-0 h-svh">
        {on ? reduced ? <img src={items[active].image} alt={ch.title} className="absolute inset-0 h-full w-full object-cover opacity-50" decoding="async"/> : (
          <Suspense fallback={null}><MoltenRingCarousel items={items} brand="VINTAGE CULTURE" arc={vw < 640 ? 1.4 : 1.05} cardSize={cardSize} cardRatio={0.8} fuse={0.09} position={p} onPositionChange={value=>{const el=outer.current;if(el)lenis?.scrollTo(el.getBoundingClientRect().top+window.scrollY+(el.offsetHeight-window.innerHeight)*value,{immediate:true})}} /></Suspense>
        ) : null}
        <div className="story-navigation absolute top-24 right-5 z-20 flex gap-2"><button disabled={active===0} aria-label={{pt:'Capítulo anterior',en:'Previous chapter',es:'Capítulo anterior'}[lang]} onClick={()=>chapterStep(-1)}>←</button><button disabled={active===items.length-1} aria-label={{pt:'Próximo capítulo',en:'Next chapter',es:'Próximo capítulo'}[lang]} onClick={()=>chapterStep(1)}>→</button></div>

        {/* texto do capítulo (o título e a tag já aparecem nos rótulos do anel) */}
        <div className="story-panel absolute inset-x-0 bottom-14 z-10 px-5 sm:px-10">
          <div key={ch.year} className="story-copy">
            {ch.photo ? <figure className="story-photo">
              <img src={ch.photo.src} srcSet={photoSrcSet(ch.photo.src)} sizes="(max-width:767px) 90vw, 210px" alt={ch.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <figcaption>{ch.photo.credit}</figcaption>
            </figure> : null}
            <div className="story-words">
              <p className="font-display text-4xl leading-none text-red sm:text-5xl">{ch.year}</p>
              <h3 className="mt-2 font-display text-2xl uppercase sm:text-3xl">{ch.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-bone sm:text-lg">{ch.text}</p>
              {!ch.photo?<p className="mt-3 text-xs text-bone/70">{{pt:'Ilustração conceitual · IA · não retrata o artista',en:'Concept illustration · AI · does not depict the artist',es:'Ilustración conceptual · IA · no representa al artista'}[lang]}</p>:null}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 mx-auto flex w-52 items-center gap-3 rounded-full bg-ink/80 px-4 py-2 backdrop-blur">
          <div className="h-0.5 flex-1 bg-bone/25"><div className="h-full origin-left bg-red" style={{ transform: `scaleX(${p})` }} /></div>
          <span className="w-9 text-right text-[11px] font-semibold tracking-[0.12em] text-bone tabular-nums">{Math.round(p * 100)}%</span>
        </div>
      </div>
    </div>
  )
}

/** Conquistas: o scroll vertical vira movimento horizontal (a direção muda, o conceito não). */
function WinsTrack({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const story = STORY[lang]
  const reduced=useReducedMotion()

  useEffect(() => {
    const el = root.current
    const tr = track.current
    if (!el || !tr || reduced) return
    const ctx = gsap.context(() => {
      const slide = gsap.to(tr, {
        x: () => -(tr.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${tr.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      // Só Track Boa: o card vira como um cubo (de lado) enquanto atravessa a tela, preso ao mesmo scroll horizontal
      const cube = tr.querySelector<HTMLElement>("[data-stb-cube]")
      const card = cube?.closest<HTMLElement>(".win-card")
      const host = cube?.closest<HTMLElement>(".stb-host")
      if (cube && card && host) {
        const setW = () => host.style.setProperty("--stb-w", `${card.clientWidth}px`)
        setW()
        const from = () => window.innerWidth * 0.86
        const to = () => Math.min(from() - 120, Math.max(0, card.offsetLeft - (tr.scrollWidth - window.innerWidth)) + 4)
        gsap.fromTo(cube, { rotateY: 0 }, { rotateY: -270, ease: "none", immediateRender: false, scrollTrigger: { trigger: card, containerAnimation: slide, start: () => `left ${from()}px`, end: () => `left ${to()}px`, scrub: true, invalidateOnRefresh: true, onRefresh: setW } })
      }
    }, el)
    // fontes e imagens mudam a largura da trilha: recalcula quando tudo carregar
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener("load", refresh)
    return () => {
      window.removeEventListener("load", refresh)
      ctx.revert()
    }
  }, [reduced])

  return (
    <section id="conquistas" ref={root} className={`relative h-svh overflow-hidden bg-ink ${reduced?'wins-reduced':''}`}>
      <div ref={track} className="wins-track flex h-full w-max items-center gap-5 pr-[12vw] pl-5 sm:gap-8 sm:pl-10">
        <div className="w-[82vw] shrink-0 sm:w-[44vw] lg:w-[34vw]">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-red uppercase">{story.winsKicker}</p>
          <h2 className="mt-4 font-display text-[clamp(2.6rem,6.5vw,6rem)] leading-[0.95] uppercase">{story.winsTitle}</h2>
          <p className="mt-6 flex items-center gap-3 text-xs tracking-[0.25em] text-ash uppercase">
            <span className="h-px w-10 bg-ash" /> {T[lang].home.scroll}
          </p>
        </div>

        {story.wins.map((w, i) => (
          <article
            key={i}
            className="win-card h-[min(72svh,38rem)] w-[82vw] shrink-0 sm:w-[40vw] lg:w-[29vw]"
          >
            <WinGraphic index={i} lang={lang} value={w.v} label={w.l}/>
          </article>
        ))}

        <div className="flex h-[min(60svh,30rem)] w-[82vw] shrink-0 flex-col justify-center sm:w-[42vw] lg:w-[30vw]">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-red uppercase">{story.headlines}</p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-tight uppercase">
            {story.headlinesList.map((h) => (
              <li key={h} className="text-bone/90">{h}</li>
            ))}
          </ul>
        </div>
      </div>
      {!reduced?<div className="wins-controls absolute right-5 bottom-6 flex items-center gap-3"><button aria-label={{pt:'Conquista anterior',en:'Previous achievement',es:'Logro anterior'}[lang]} onClick={()=>lenis?.scrollTo(window.scrollY-window.innerWidth*.8,{duration:.7})}>←</button><button aria-label={{pt:'Próxima conquista',en:'Next achievement',es:'Próximo logro'}[lang]} onClick={()=>lenis?.scrollTo(window.scrollY+window.innerWidth*.8,{duration:.7})}>→</button></div>:null}
    </section>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>(()=>{const value=new URLSearchParams(location.search).get('lang');return value==='en'||value==='es'?value:'pt'})
  const t = T[lang]
  const reduced=useReducedMotion()
  const bar = useRef<HTMLDivElement>(null)
  const booted=useRef(false)
  const menu = useRef<HTMLDialogElement>(null)
  const [activeSection,setActiveSection]=useState('')
  const [cinema,setCinema]=useState(false)
  const menuText={pt:{open:'Abrir menu',close:'Fechar menu',title:'Explore a história'},en:{open:'Open menu',close:'Close menu',title:'Explore the story'},es:{open:'Abrir menú',close:'Cerrar menú',title:'Explora la historia'}}[lang]

  function closeMenu(){menu.current?.close();lenis?.start()}
  function navigate(target:string){closeMenu();goTo(target)}
  function selectLanguage(code:Lang){setLang(code);const url=new URL(location.href);if(code==='pt')url.searchParams.delete('lang');else url.searchParams.set('lang',code);history.replaceState(history.state,'',url)}

  useEffect(()=>{
    const triggers=NAV_TARGETS.map(target=>ScrollTrigger.create({trigger:target,start:'top 35%',end:'bottom 35%',onEnter:()=>setActiveSection(target),onEnterBack:()=>setActiveSection(target),onLeave:()=>setActiveSection(current=>current===target?'':current),onLeaveBack:()=>setActiveSection(current=>current===target?'':current)}))
    const scene=document.querySelector('[data-cinema]')?.parentElement
    if(scene)triggers.push(ScrollTrigger.create({trigger:scene,start:'top top+=1',end:'bottom bottom-=1',onToggle:s=>setCinema(s.isActive)}))
    return()=>triggers.forEach(t=>t.kill())
  },[])

  useEffect(()=>applyMetadata(lang),[lang])
  useEffect(()=>{
    if(reduced)return
    const ctx=gsap.context(()=>{gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>gsap.from(el,{y:20,duration:.65,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}))})
    return()=>ctx.revert()
  },[lang,reduced])

  // Lenis: scroll suave e leve, único motor de rolagem do site, ligado ao GSAP
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const instance = new Lenis({
      lerp: reduced ? 1 : 0.075, // quanto menor, mais macio e longo o deslize
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      smoothWheel: !reduced,
      anchors: false,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    })
    lenis = instance
    instance.on("scroll", ScrollTrigger.update)
    instance.on("scroll", ({ progress }: { progress: number }) => {
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`
    })
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    // sempre abre no topo, sem restaurar a posição da visita anterior
    if ("scrollRestoration" in history) history.scrollRestoration = "manual"
    instance.scrollTo(booted.current?window.scrollY:0, { immediate: true, force: true })
    booted.current=true
    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis = null
    }
  }, [reduced])

  // as pistas de texto mudam de tamanho com o idioma: recalcula os gatilhos de scroll
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(id)
  }, [lang])

  const hits = useMemo<DiscCascadeItem[]>(() => {
    const q = t.quotes
    const mk = (
      title: string,
      cover: string,
      who: string,
      year: string,
      review: { source: string; quote: string },
    ): DiscCascadeItem => ({
      title,
      src: `/img/covers/${cover}.jpg`,
      alt: `${title} — ${{pt:'capa oficial',en:'official artwork',es:'portada oficial'}[lang]}`,
      label: "",
      fine: "",
      credits: [
        { label: t.hitCredits.label, value: "Vintage Culture" },
        { label: t.hitCredits.feat, value: who.split(", ") },
        { label: t.hitCredits.year, value: year },
      ],
      reviews: [review],
    })
    const fb = { source: "Forbes Brasil", quote: q.forbes }
    const bb = { source: "Billboard Brasil", quote: q.billboard }
    const dj = { source: "DJ Mag", quote: q.djmag }
    return [
      mk("Slow Down", "slow-down", "Maverick Sabre, Jorja Smith", "2020", fb),
      mk("I Will Find", "i-will-find", "Rooftime", "2018", bb),
      mk("Weak", "weak", "Maverick Sabre, Tom Breu", "2024", dj),
      mk("You Give Me A Feeling", "you-give-me-a-feeling", "James Hype", "2021", fb),
      mk("Intro (Rework)", "intro-rework", "Bruno Be, Öwnboss, Ashibah", "2019", bb),
      mk("Coffee (Give Me Something)", "coffee", "Tiësto", "2020", dj),
      mk("Under Pressure", "under-pressure", "Meduza", "2022", fb),
      mk("Upon Your Skin", "upon-your-skin", "Noah Kulaga", "2025", bb),
      mk("Take Me (To the Sunrise)", "take-me", "Shouse", "2025", dj),
    ]
  }, [t,lang])

  // cada card do Palco é um capítulo: pôster com o ano (neutro de idioma) + título e meta localizados
  const ring = useMemo<MoltenRingItem[]>(
    () => STORY[lang].chapters.map((c, i) => ({ image: c.photo?.src ?? `/img/story/s${String(i + 1).padStart(2, "0")}.jpg`, title: c.title, meta: c.tag })),
    [lang],
  )

  const glass = useMemo<LiquidGlassCarouselItem[]>(() => {
    const imgs: [string, number][] = [
      ["vc-portrait-1400", 2857 / 4000],
      ["r02", 1100 / 1467],
      ["r03", 1.2],
      ["r04", 0.75],
      ["r05", 1],
      ["r06", 1.4],
      ["r07", 0.833],
      ["r08", 0.75],
      ["r09", 1.2],
      ["r10", 0.75],
      ["affairs-logo", 1],
    ]
    return [...PHOTOS.map(p=>({title:p.title[lang],src:p.src,aspect:p.aspect})), ...t.galleryItems.slice(0,1).map((title, i) => ({ title, src: `/img/${imgs[i][0]}.jpg`, aspect: imgs[i][1] }))]
  }, [t, lang])

  return (
    <main className="min-h-screen overflow-x-clip">
      {/* progresso global do scroll */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px]">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-red" />
      </div>

      <header data-cinema-hidden={cinema} inert={cinema} className="site-header fixed inset-x-0 top-0 z-[70] flex items-center justify-between bg-gradient-to-b from-ink/85 via-ink/55 to-transparent max-md:from-ink max-md:via-ink/90 px-5 py-4 sm:px-8">
        <button onClick={() => lenis?.scrollTo(0, { duration: 2.2, easing: easeOutQuart })} className="font-display text-xl tracking-wide text-white uppercase">
          Vintage Culture
        </button>
        <nav className="hidden gap-6 text-xs font-medium tracking-[0.14em] text-white uppercase md:flex">
          {t.nav.map((n, i) => (
            <button key={n} data-nav-target={NAV_TARGETS[i]} aria-current={activeSection===NAV_TARGETS[i]?'location':undefined} onClick={() => navigate(NAV_TARGETS[i])} className="nav-link uppercase transition">{n}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3"><div className="flex gap-1 rounded-full border border-white/40 p-1 text-[11px] font-semibold text-white">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => selectLanguage(l.code)}
              aria-pressed={lang === l.code}
              className={`rounded-full px-3 py-1 transition ${lang === l.code ? "bg-white text-black" : "opacity-70 hover:opacity-100"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button aria-label={menuText.open} aria-haspopup="dialog" aria-controls="mobile-menu" className="menu-toggle grid size-11 place-items-center border border-white/50 text-white md:hidden" onClick={()=>{menu.current?.showModal();lenis?.stop()}}><span aria-hidden="true">☰</span></button>
        </div>
      </header>
      <dialog ref={menu} id="mobile-menu" className="mobile-menu" aria-label={menuText.title} onCancel={()=>lenis?.start()} onClose={()=>lenis?.start()}>
        <div className="flex items-center justify-between gap-5"><p className="font-display text-xl uppercase">Vintage Culture</p><button className="size-12 border border-bone/50 text-2xl" aria-label={menuText.close} onClick={closeMenu}>×</button></div>
        <p className="mt-12 text-sm text-bone/75">{menuText.title}</p>
        <nav className="mt-6 flex flex-col items-start gap-5">{t.nav.map((n,i)=><button key={n} data-nav-target={NAV_TARGETS[i]} aria-current={activeSection===NAV_TARGETS[i]?'location':undefined} className="font-display text-[clamp(2rem,10vw,4rem)] uppercase" onClick={()=>navigate(NAV_TARGETS[i])}>{n}</button>)}</nav>
        <a className="mt-12 inline-block border-b border-bone pb-2" href="https://open.spotify.com/artist/28uJnu5EsrGml2tBd7y8ts" target="_blank" rel="noreferrer">{t.cta} ↗</a>
      </dialog>

      {/* 01 HOME */}
      <Hero t={t} />

      <Marquee items={t.marquee} />

      <div id="biografia">
        <RankChart t={t} lang={lang} />
      </div>

      <PreviewTag n={1} title={t.preview.hero[0]} text={t.preview.hero[1]} approve={t.approve} />

      {/* 02 HITS */}
      <div id="hits">
        <PreviewTag n={2} title={t.preview.hits[0]} text={t.preview.hits[1]} approve={t.approve} />
        <ScrollDiscs items={hits} t={t} lang={lang} />
      </div>

      {/* 03 PALCO: a trajetória */}
      <div id="palco">
        <PreviewTag n={3} title={t.preview.stage[0]} text={t.preview.stage[1]} approve={t.approve} />
        <div data-reveal className="mx-auto max-w-6xl px-5 pt-16 pb-10 sm:px-8">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-red uppercase">{isReview?STORY[lang].stageKicker:t.nav[2]}</p>
          <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] uppercase">{STORY[lang].stageTitle}</h2>
        </div>
        <ScrollRing items={ring} lang={lang} />
      </div>

      {/* 04 CONQUISTAS: a rolagem muda de direção */}
      <WinsTrack lang={lang} />

      {/* 05 AGENDA */}
      <PreviewTag n={4} title={sectionPreview(lang).agenda[0]} text={sectionPreview(lang).agenda[1]} approve={t.approve} />
      <Agenda lang={lang} />

      {/* 06 AFFAIRS */}
      <PreviewTag n={5} title={sectionPreview(lang).affairs[0]} text={sectionPreview(lang).affairs[1]} approve={t.approve} />
      <Affairs lang={lang} />

      {/* 07 GALERIA (aprovada) */}
      <div id="galeria">
        <PreviewTag n={6} title={t.preview.gallery[0]} text={t.preview.gallery[1]} approve={t.approve} />
        <div data-reveal className="bg-bone px-5 pt-16 pb-6 text-ink sm:px-10"><h2 className="mx-auto max-w-6xl font-display text-4xl uppercase sm:text-6xl">{{pt:'Luz, cabine, multidão.',en:'Lights, booth, crowd.',es:'Luz, cabina, multitud.'}[lang]}</h2></div>
        <LazyMount height="92svh" margin="1200px">
          {reduced?<WebGLFallback items={glass} className="h-full bg-bone text-ink"/>:<Suspense fallback={<WebGLFallback items={glass} className="h-full bg-bone text-ink"/>}><LiquidGlassCarousel items={glass} background="#f2efe9" entry={false} autoplay={60} outside="clip" panelHeight={520} locale={lang} /></Suspense>}
        </LazyMount>
      </div>

      {/* SISTEMA */}
      <div id="sistema" hidden={!isReview}>
        <PreviewTag n={7} title={t.preview.system[0]} text={t.preview.system[1]} approve={t.approve} />
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-28 sm:px-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-ash uppercase">{t.palette}</h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {[
                ["#0A0A0A", "Ink", "text-bone"],
                ["#161616", "Graphite", "text-bone"],
                ["#F2EFE9", "Bone", "text-ink"],
                ["#F70505", "Affairs Red", "text-white"],
                ["#8A8A85", "Ash", "text-ink"],
              ].map(([c, n, tc]) => (
                <div key={n} className={`flex aspect-[3/4] flex-col justify-end rounded-lg border border-bone/15 p-2 ${tc}`} style={{ background: c }}>
                  <span className="text-[11px] font-semibold">{n}</span>
                  <span className="text-[10px] opacity-70">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-ash uppercase">{t.type}</h3>
            <p className="font-display text-6xl uppercase leading-none">Anton</p>
            <p className="mt-3 font-serif text-4xl italic">Instrument Serif</p>
            <p className="mt-3 text-lg">Inter — texto corrido, UI e legendas.</p>
          </div>
        </section>
      </div>
      <ImageCredits lang={lang} />
    </main>
  )
}
