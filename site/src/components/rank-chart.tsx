import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type { T } from "@/i18n"

gsap.registerPlugin(ScrollTrigger)

type Copy = (typeof T)["pt"]

/** Posição do Vintage Culture no DJ Mag Top 100 (fonte: DJ Mag / Wikipedia). */
const DATA: [number, number][] = [
  [2015, 118], [2016, 54], [2017, 31], [2018, 19], [2019, 47], [2020, 30],
  [2021, 17], [2022, 11], [2023, 10], [2024, 9], [2025, 11], [2026, 10],
]

// no celular o gráfico ganha outra proporção, senão o texto do SVG encolhe junto com a tela
const LAYOUT = {
  wide: { W: 1000, H: 460, PAD: { l: 56, r: 40, t: 40, b: 56 }, font: 1, yearEvery: 1 },
  compact: { W: 420, H: 420, PAD: { l: 38, r: 14, t: 34, b: 44 }, font: 1.25, yearEvery: 2 },
}

function useWidth() {
  const [w, setW] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth))
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener("resize", on)
    return () => window.removeEventListener("resize", on)
  }, [])
  return w
}

function smooth(pts: [number, number][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const cx = (x0 + x1) / 2
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`
  }
  return d
}

export function RankChart({ t }: { t: Copy }) {
  const root = useRef<HTMLElement>(null)
  const path = useRef<SVGPathElement>(null)
  const vw = useWidth()
  const compact = vw < 640
  const base = compact ? LAYOUT.compact : LAYOUT.wide
  // em telas médias o SVG de 1000 de largura encolhe: compensa o texto para não ficar ilegível
  const font = compact ? base.font : Math.min(1.5, Math.max(1, 1000 / (vw - 64)))
  const { W, H, PAD, yearEvery } = base
  const x = (i: number) => PAD.l + (i / (DATA.length - 1)) * (W - PAD.l - PAD.r)
  // rank 1 no topo: quanto melhor, mais alto
  const y = (rank: number) => PAD.t + ((rank - 1) / 119) * (H - PAD.t - PAD.b)
  const pts = DATA.map(([, r], i) => [x(i), y(r)] as [number, number])
  const d = smooth(pts)
  const area = `${d} L${x(DATA.length - 1)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`

  useEffect(() => {
    const el = root.current
    const p = path.current
    if (!el || !p) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const len = p.getTotalLength()

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      if (reduced) return
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      gsap.set(q("[data-area]"), { opacity: 0 })
      gsap.set(q("[data-dot]"), { scale: 0, transformOrigin: "50% 50%" })
      gsap.set(q("[data-lab]"), { opacity: 0, y: 8 })

      const tl = gsap.timeline({
        // termina antes do fim da seção, para o último ponto (2026) sempre aparecer completo
        scrollTrigger: { trigger: el, start: "top 65%", end: "center 35%", scrub: 0.8 },
      })
      tl.to(p, { strokeDashoffset: 0, ease: "none", duration: DATA.length }, 0)
      tl.to(q("[data-area]"), { opacity: 1, ease: "none", duration: 3 }, DATA.length - 3)
      DATA.forEach((_, i) => {
        tl.to(q(`[data-dot="${i}"]`), { scale: 1, duration: 0.5, ease: "back.out(2)" }, i * (DATA.length - 1) / (DATA.length - 1) * 0.92)
        tl.to(q(`[data-lab="${i}"]`), { opacity: 1, y: 0, duration: 0.5 }, i * 0.92)
      })
      gsap.from(q("[data-in]"), { y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 80%" } })
    }, el)
    return () => ctx.revert()
  }, [compact])

  const best = DATA.findIndex(([, r]) => r === 9)
  const last = DATA.length - 1

  return (
    <section ref={root} className="relative overflow-hidden bg-ink py-28">
      <div className="mx-auto max-w-[1300px] px-5 sm:px-8">
        <p data-in className="text-[11px] font-semibold tracking-[0.3em] text-red uppercase">{t.home.chartKicker}</p>
        <h2 data-in className="mt-4 max-w-3xl font-display text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] uppercase">{t.home.chartTitle}</h2>
        <p data-in className="mt-5 max-w-xl text-bone/70">{t.home.chartSub}</p>

        <div className="relative mt-14">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label={t.home.chartTitle}>
            <defs>
              <linearGradient id="rc-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f70505" stopOpacity=".38" />
                <stop offset="1" stopColor="#f70505" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[1, 10, 25, 50, 100].map((r) => (
              <g key={r}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(r)} y2={y(r)} stroke="#f2efe9" strokeOpacity={r === 10 ? 0.35 : 0.1} strokeDasharray={r === 10 ? "4 6" : undefined} />
                <text x={PAD.l - 10} y={y(r) + 4} textAnchor="end" fontSize={11 * font} fill="#8a8a85">#{r}</text>
              </g>
            ))}

            <path data-area d={area} fill="url(#rc-area)" />
            <path ref={path} d={d} fill="none" stroke="#f70505" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

            {DATA.map(([yr, r], i) => {
              const isBest = i === best
              const isNow = i === last
              return (
                <g key={yr}>
                  <circle data-dot={i} cx={x(i)} cy={y(r)} r={isBest || isNow ? 8 : 5} fill={isBest || isNow ? "#f2efe9" : "#0a0a0a"} stroke="#f70505" strokeWidth="3" />
                  <g data-lab={i}>
                    {(i % yearEvery === 0 || isNow) && (
                      <text x={x(i)} y={H - PAD.b + 28} textAnchor="middle" fontSize={12 * font} fill="#8a8a85">{compact ? `’${String(yr).slice(2)}` : yr}</text>
                    )}
                    <text x={x(i)} y={y(r) - 14} textAnchor="middle" fontSize={(isBest || isNow ? 18 : 13) * (compact ? 0.95 : font)} fontWeight="400" fill="#f2efe9" fontFamily="Anton, sans-serif">
                      #{r}
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-bone/15 pt-8 text-center sm:gap-10">
            <div><p className="font-display text-3xl sm:text-5xl">#{DATA[0][1]}</p><p className="mt-1 text-[11px] tracking-[0.2em] text-ash uppercase">{t.home.first} · {DATA[0][0]}</p></div>
            <div><p className="font-display text-3xl text-red sm:text-5xl">#{DATA[best][1]}</p><p className="mt-1 text-[11px] tracking-[0.2em] text-ash uppercase">{t.home.best} · {DATA[best][0]}</p></div>
            <div><p className="font-display text-3xl sm:text-5xl">#{DATA[last][1]}</p><p className="mt-1 text-[11px] tracking-[0.2em] text-ash uppercase">{t.home.now} · {DATA[last][0]}</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}
