import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type { T } from "@/i18n"
import { useReducedMotion } from './use-reduced-motion'
import KineticGrid from "@/components/ui/kinetic-grid"

gsap.registerPlugin(ScrollTrigger)

type Copy = (typeof T)["pt"]

/**
 * Abertura: o nome em tipografia gigante passa por trás do recorte do retrato
 * (camadas: nome sólido → retrato → nome em contorno), com parallax no mouse e no scroll.
 */
export function Hero({ t }: { t: Copy }) {
  const root = useRef<HTMLElement>(null)
  const reduced=useReducedMotion()

  // layout effect: o estado inicial da entrada é aplicado antes da primeira pintura (sem piscar na posição final)
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)

      if (!reduced) {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
        // só anima o que existe no hero atual (o hero enxuto não tem linhas/fade/glow: alvo vazio = aviso e trabalho à toa)
        const enter = (sel: string, vars: gsap.TweenVars, at: number) => { const t = q(sel); if (t.length) tl.from(t, vars, at) }
        enter("[data-line]", { yPercent: 90, duration: .8, stagger: 0.08 }, 0.05)
        enter("[data-cut]", { yPercent: 6, scale: 1.03, duration: 1 }, 0)
        enter("[data-fade]", { y: 16, duration: .8, stagger: 0.06 }, 0.1)
        enter("[data-glow]", { opacity: 0, duration: 2 }, 0)

        // parallax no scroll: cada camada anda numa velocidade
        // o retrato usa `y` (px) no scroll: a entrada já usa yPercent e as duas animações na mesma propriedade davam um pulo no primeiro scroll
        const cut = q("[data-cut]")[0] as HTMLElement
        gsap.fromTo(cut, { y: 0 }, { y: () => -0.03 * cut.offsetHeight, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } })
        gsap.to(q("[data-words]"), { yPercent: 5, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } })
        gsap.to(q("[data-front]"), { yPercent: 5, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } })

        // parallax no mouse
        const cutX = gsap.quickTo(q("[data-cut-m]")[0], "x", { duration: 1.1, ease: "power3.out" })
        const cutY = gsap.quickTo(q("[data-cut-m]")[0], "y", { duration: 1.1, ease: "power3.out" })
        const wordX = gsap.quickTo(q("[data-words-m]")[0], "x", { duration: 1.4, ease: "power3.out" })
        const frontX = gsap.quickTo(q("[data-front-m]")[0], "x", { duration: 0.9, ease: "power3.out" })
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          cutX(nx * -26)
          cutY(ny * -14)
          wordX(nx * 38)
          frontX(nx * -52)
        }
        window.addEventListener("pointermove", onMove)
        return () => window.removeEventListener("pointermove", onMove)
      }
    }, el)

    return () => ctx.revert()
  }, [reduced])

  // sem bloco de texto na base: o nome ocupa mais da altura
  const size = "text-[clamp(5.4rem,min(26vw,39svh),25rem)] max-sm:text-[clamp(5.4rem,29vw,9rem)]"
  const word = "font-display uppercase leading-[0.78] tracking-[-0.01em]"

  return (
    <section id="home" ref={root} className="hero-section relative isolate h-svh min-h-[720px] overflow-hidden bg-ink">
      {/* luz vermelha + grão */}
      <div data-glow className="absolute inset-0 -z-0 bg-[radial-gradient(60%_55%_at_62%_46%,rgba(247,5,5,.34),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 z-[60] opacity-[.07] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%22.9%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />

      <KineticGrid contained still={reduced} globalColor="vc" className="!absolute inset-0 z-[5]" />

      {/* nome sólido, atrás do retrato */}
      <div data-words className="absolute inset-x-0 top-[11svh] z-10">
        <div data-words-m className="mx-auto select-none text-center">
          <div className={`overflow-hidden pt-[0.1em] pb-[0.06em] -mb-[0.06em] ${size}`}><div data-line className={`${word} text-bone`}>Vintage</div></div>
          <div className={`overflow-hidden pt-[0.1em] pb-[0.06em] -mb-[0.06em] ${size}`}><div data-line className={`${word} text-bone`}>Culture</div></div>
        </div>
      </div>

      {/* retrato recortado */}
      <div data-cut className="absolute inset-x-0 bottom-0 z-20 flex justify-center">
        <div data-cut-m className="relative h-[106svh] min-h-[700px] translate-x-[9vw]">
          <img
            src="/img/vc-cutout.webp"
            srcSet="/img/vc-cutout-900.webp 900w, /img/vc-cutout-1200.webp 1200w, /img/vc-cutout.webp 1800w"
            sizes="(max-width:767px) 160vw, 76vh"
            fetchPriority="high"
            decoding="async"
            alt="Vintage Culture"
            className="h-full w-auto max-w-none object-contain [mask-image:linear-gradient(to_bottom,#000_66%,transparent_96%)]"
            draggable={false}
          />
        </div>
      </div>

      {/* nome em contorno, na frente */}
      <div data-front className="pointer-events-none absolute inset-x-0 top-[11svh] z-30">
        <div data-front-m className="mx-auto select-none text-center" aria-hidden>
          <div className={`pt-[0.1em] ${size}`}><div className={`${word} text-transparent [-webkit-text-stroke:1.5px_rgba(242,239,233,.32)]`}>Vintage</div></div>
          <div className={`pt-[0.1em] ${size}`}><div className={`${word} text-transparent [-webkit-text-stroke:1.5px_rgba(242,239,233,.32)]`}>Culture</div></div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-40 h-[17svh] bg-gradient-to-t from-ink via-ink/75 to-transparent" />

      <h1 className="sr-only">{t.heroLine}</h1>
    </section>
  )
}
