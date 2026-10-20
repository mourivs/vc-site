import { useEffect, useRef, useState, type ReactNode } from "react"

/** Monta o filho só enquanto está perto da tela: evita vários contextos WebGL rodando ao mesmo tempo. */
export function LazyMount({ children, height, margin = "200px" }: { children: ReactNode; height: string; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])

  return (
    <div ref={ref} style={{ height }}>
      {on ? children : null}
    </div>
  )
}
