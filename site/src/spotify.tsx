import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

/** Perfil oficial no Spotify (botão "Seguir"). */
export const SPOTIFY_ARTIST = 'https://open.spotify.com/artist/28uJnu5EsrGml2tBd7y8ts'

/** Faixa de cada capa (slug de /img/covers) no Spotify. IDs conferidos pelo oEmbed oficial do Spotify. */
export const TRACKS: Record<string, string> = {
  'slow-down': '5PNvgiKSwMdjBsDsgFCFLX',
  'i-will-find': '2bbfiUnH4CATlekDS1dxNr',
  weak: '37uMiu52DbSIx3SJ3sGDow',
  'you-give-me-a-feeling': '2qRKTg13LJGHO4fmQTWT7x',
  'intro-rework': '27py1Q0fMmpuSYiOAKBZPb',
  coffee: '4DBLAy03Xk88LOVtrOQ1RD',
  'under-pressure': '0w4rgmmiFefmIRVD2Ucrmy',
  'upon-your-skin': '6Igb5HZLFlC0Wla2Qgsivy',
  'take-me': '58Rox6okpp75KxqeW68qj2',
}

type EmbedController = {
  loadUri(uri: string): void
  play(): void
  pause(): void
  togglePlay(): void
  destroy(): void
  addListener(event: string, cb: (e: { data: { isPaused: boolean; isBuffering: boolean } }) => void): void
}
type IFrameAPI = {
  createController(el: HTMLElement, opts: { uri: string; width?: string | number; height?: string | number; theme?: string }, cb: (c: EmbedController) => void): void
}
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void
  }
}

let apiPromise: Promise<IFrameAPI> | null = null
function loadApi(): Promise<IFrameAPI> {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      window.onSpotifyIframeApiReady = resolve
      const s = document.createElement('script')
      s.src = 'https://open.spotify.com/embed/iframe-api/v1'
      s.async = true
      document.body.appendChild(s)
    })
  }
  return apiPromise
}

type Ctx = { current: string | null; playing: boolean; toggle: (slug: string) => void; stop: () => void }
const SpotifyContext = createContext<Ctx>({ current: null, playing: false, toggle: () => {}, stop: () => {} })
export const useSpotify = () => useContext(SpotifyContext)

/**
 * Um único player do Spotify (iFrame API) para o site todo: os botões de play dos discos e da lista
 * "Populares" apenas comandam este player. Ele só é carregado no primeiro play e mostra o mini-player
 * oficial (com os controles e o aviso de prévia/faixa completa conforme o login do visitante).
 */
export function SpotifyProvider({ children }: { children: ReactNode }) {
  const dock = useRef<HTMLDivElement>(null)
  const controller = useRef<EmbedController | null>(null)
  const creating = useRef(false)
  const [current, setCurrent] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [open, setOpen] = useState(false)

  const attach = useCallback((c: EmbedController) => {
    controller.current = c
    c.addListener('playback_update', (e) => setPlaying(!e.data.isPaused))
  }, [])

  const toggle = useCallback((slug: string) => {
    const id = TRACKS[slug]
    if (!id) return
    const uri = `spotify:track:${id}`
    setOpen(true)
    if (controller.current) {
      if (current === slug) { controller.current.togglePlay(); return }
      setCurrent(slug)
      controller.current.loadUri(uri)
      controller.current.play()
      return
    }
    if (creating.current || !dock.current) return
    creating.current = true
    setCurrent(slug)
    void loadApi().then((api) => {
      const holder = document.createElement('div')
      dock.current?.appendChild(holder)
      api.createController(holder, { uri, width: '100%', height: 80, theme: 'dark' }, (c) => {
        attach(c)
        creating.current = false
        c.play()
      })
    })
  }, [attach, current])

  const stop = useCallback(() => {
    controller.current?.pause()
    setOpen(false)
    setPlaying(false)
  }, [])

  useEffect(() => {
    document.body.toggleAttribute('data-spotify-open', open)
  }, [open])

  const value = useMemo(() => ({ current, playing, toggle, stop }), [current, playing, toggle, stop])
  const htmlLang = (typeof document !== 'undefined' ? document.documentElement.lang : 'pt').slice(0, 2) as 'pt' | 'en' | 'es'
  const label = { pt: { close: 'Fechar player do Spotify' }, en: { close: 'Close Spotify player' }, es: { close: 'Cerrar reproductor de Spotify' } }[htmlLang] ?? { close: 'Fechar player do Spotify' }

  return (
    <SpotifyContext.Provider value={value}>
      {children}
      <div className="spotify-dock" data-open={open} aria-hidden={!open}>
        <div ref={dock} className="spotify-dock-frame" />
        <button className="spotify-dock-close" aria-label={label.close} onClick={stop} tabIndex={open ? 0 : -1}>×</button>
      </div>
    </SpotifyContext.Provider>
  )
}

export const PlayIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
export const PauseIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
