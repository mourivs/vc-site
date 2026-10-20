export type Lang = "pt" | "en" | "es"

export const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
]

type Dict = {
  nav: string[]
  tag: string
  heroLine: string
  heroSub: string
  cta: string
  ctaTwo: string
  stats: { v: string; l: string }[]
  marquee: string[]
  previewLabel: string
  preview: { hero: [string, string]; hits: [string, string]; stage: [string, string]; gallery: [string, string]; system: [string, string] }
  hitsHint: string
  hitsIndex: string
  hitCredits: { label: string; feat: string; year: string }
  quotes: { forbes: string; billboard: string; djmag: string }
  stageItems: { title: string; meta: string }[]
  galleryItems: string[]
  palette: string
  type: string
  approve: string
  home: { side: string; next: string; nextShow: string; scroll: string; chartKicker: string; chartTitle: string; chartSub: string; best: string; now: string; first: string }
}

export const T: Record<Lang, Dict> = {
  pt: {
    nav: ["Biografia", "Hits", "Palco", "Agenda", "Affairs"],
    tag: "DJ & PRODUTOR · BRASIL",
    heroLine: "Do garoto de Mundo Novo ao número 10 do mundo.",
    heroSub: "Um computador no quarto. Remixes que atravessaram fronteiras. Lukas Ruiz fez da curiosidade uma vida na estrada — e da pista, o seu lugar no mundo.",
    cta: "Ouvir agora",
    ctaTwo: "Ver agenda",
    stats: [
      { v: "#10", l: "DJ Mag Top 100 · 2026" },
      { v: "2,8 bi", l: "streams no Spotify" },
      { v: "6 mi", l: "ouvintes mensais" },
      { v: "11,6 mi", l: "seguidores no Instagram" },
    ],
    marquee: ["Tomorrowland", "EDC", "Coachella", "Glastonbury", "Creamfields", "Burning Man", "Cercle", "Time Warp", "Pacha Ibiza", "Ushuaïa"],
    previewLabel: "Pré-visualização",
    preview: {
      hero: ["Abertura", "Retrato oficial em tela cheia, tipografia gigante, números que provam a escala. Animação de entrada em cascata."],
      hits: ["Hits", "Carrossel de discos (Disc Cascade): cada música é um disco; arraste, use as setas ou o menu Índice."],
      stage: ["Palco", "Carrossel líquido (Molten Ring): os cards se fundem como gotas. Role, arraste ou passe o mouse."],
      gallery: ["Galeria", "Carrossel de vidro líquido (Liquid Glass): lente WebGL com dispersão. Clique no centro para abrir."],
      system: ["Sistema visual", "Paleta e tipografia propostas."],
    },
    hitsHint: "Arraste · ← →",
    hitsIndex: "Índice",
    hitCredits: { label: "Artista", feat: "Com", year: "Ano" },
    quotes: {
      forbes: "O palco é o meu lugar favorito no mundo.",
      billboard: "Venho do underground, e isso sempre fará parte do meu DNA.",
      djmag: "Uma paixão 24/7 pela música.",
    },
    stageItems: [
      { title: "Retrato", meta: "Oficial · 2026" },
      { title: "Preto & branco", meta: "Rosto" },
      { title: "Olhar", meta: "Ibiza" },
      { title: "Vermelho", meta: "Duotone" },
      { title: "Tribal", meta: "Tattoo" },
      { title: "Sleeve", meta: "Detalhe" },
      { title: "Sombra", meta: "Luz de dia" },
      { title: "Affairs red", meta: "Rosto" },
      { title: "Noite", meta: "P&B" },
      { title: "Preto", meta: "Torso" },
      { title: "Affairs", meta: "Selo · 2025" },
    ],
    galleryItems: ["Retrato", "Preto & branco", "Olhar", "Vermelho", "Tribal", "Sleeve", "Sombra", "Affairs red", "Noite", "Preto", "Affairs"],
    palette: "Paleta",
    type: "Tipografia",
    approve: "Aprova este bloco? Diga o número e o que mudar.",
    home: { side: "LUKAS RUIZ · 1993 · MUNDO NOVO → IBIZA", next: "Próximo show", nextShow: "Pacha New York · 29 out", scroll: "Role", chartKicker: "Capítulo 01 · A subida", chartTitle: "De 118º a 10º melhor DJ do mundo em onze anos.", chartSub: "Posição no DJ Mag Top 100, o ranking votado pelo público do mundo inteiro.", best: "Melhor posição", now: "Posição em", first: "Estreia" },
  },
  en: {
    nav: ["Biography", "Hits", "Stage", "Tour", "Affairs"],
    tag: "DJ & PRODUCER · BRAZIL",
    heroLine: "From a small town in Mato Grosso do Sul to number 10 in the world.",
    heroSub: "A computer in a bedroom. Remixes that crossed borders. Lukas Ruiz turned curiosity into a life on the road — and found his place in the world on the dance floor.",
    cta: "Listen now",
    ctaTwo: "See tour",
    stats: [
      { v: "#10", l: "DJ Mag Top 100 · 2026" },
      { v: "2.8B", l: "Spotify streams" },
      { v: "6M", l: "monthly listeners" },
      { v: "11.6M", l: "Instagram followers" },
    ],
    marquee: ["Tomorrowland", "EDC", "Coachella", "Glastonbury", "Creamfields", "Burning Man", "Cercle", "Time Warp", "Pacha Ibiza", "Ushuaïa"],
    previewLabel: "Preview",
    preview: {
      hero: ["Opening", "Full-bleed official portrait, giant type, numbers that prove the scale. Staggered entrance animation."],
      hits: ["Hits", "Disc carousel (Disc Cascade): every track is a record; drag, use the arrows or the Index menu."],
      stage: ["Stage", "Liquid carousel (Molten Ring): cards fuse like drops. Scroll, drag or hover."],
      gallery: ["Gallery", "Liquid glass carousel: a WebGL lens with dispersion. Click the centre card to open it."],
      system: ["Visual system", "Proposed palette and typography."],
    },
    hitsHint: "Drag · ← →",
    hitsIndex: "Index",
    hitCredits: { label: "Artist", feat: "With", year: "Year" },
    quotes: {
      forbes: "The stage is my favourite place in the world.",
      billboard: "I come from the underground, and that will always be part of my DNA.",
      djmag: "A 24/7 passion for music.",
    },
    stageItems: [
      { title: "Portrait", meta: "Official · 2026" },
      { title: "Black & white", meta: "Face" },
      { title: "Gaze", meta: "Ibiza" },
      { title: "Red", meta: "Duotone" },
      { title: "Tribal", meta: "Tattoo" },
      { title: "Sleeve", meta: "Detail" },
      { title: "Shadow", meta: "Daylight" },
      { title: "Affairs red", meta: "Face" },
      { title: "Night", meta: "B&W" },
      { title: "Black", meta: "Torso" },
      { title: "Affairs", meta: "Label · 2025" },
    ],
    galleryItems: ["Portrait", "Black & white", "Gaze", "Red", "Tribal", "Sleeve", "Shadow", "Affairs red", "Night", "Black", "Affairs"],
    palette: "Palette",
    type: "Typography",
    approve: "Approve this block? Tell me the number and what to change.",
    home: { side: "LUKAS RUIZ · 1993 · MUNDO NOVO → IBIZA", next: "Next show", nextShow: "Pacha New York · Oct 29", scroll: "Scroll", chartKicker: "Chapter 01 · The climb", chartTitle: "From world's 118th to 10th best DJ in eleven years.", chartSub: "Position in the DJ Mag Top 100, the world's biggest fan-voted ranking.", best: "Career best", now: "Rank in", first: "Debut" },
  },
  es: {
    nav: ["Biografía", "Éxitos", "Escenario", "Gira", "Affairs"],
    tag: "DJ Y PRODUCTOR · BRASIL",
    heroLine: "Del niño de Mundo Novo al número 10 del mundo.",
    heroSub: "Una computadora en un cuarto. Remixes que cruzaron fronteras. Lukas Ruiz convirtió la curiosidad en una vida en la carretera — y encontró su lugar en el mundo en la pista.",
    cta: "Escuchar ahora",
    ctaTwo: "Ver gira",
    stats: [
      { v: "#10", l: "DJ Mag Top 100 · 2026" },
      { v: "2.800 M", l: "streams en Spotify" },
      { v: "6 M", l: "oyentes mensuales" },
      { v: "11,6 M", l: "seguidores en Instagram" },
    ],
    marquee: ["Tomorrowland", "EDC", "Coachella", "Glastonbury", "Creamfields", "Burning Man", "Cercle", "Time Warp", "Pacha Ibiza", "Ushuaïa"],
    previewLabel: "Vista previa",
    preview: {
      hero: ["Apertura", "Retrato oficial a pantalla completa, tipografía gigante, números que prueban la escala. Animación de entrada escalonada."],
      hits: ["Éxitos", "Carrusel de discos (Disc Cascade): cada canción es un disco; arrastra, usa las flechas o el menú Índice."],
      stage: ["Escenario", "Carrusel líquido (Molten Ring): las tarjetas se funden como gotas. Desplaza, arrastra o pasa el ratón."],
      gallery: ["Galería", "Carrusel de cristal líquido (Liquid Glass): lente WebGL con dispersión. Haz clic en el centro para abrir."],
      system: ["Sistema visual", "Paleta y tipografía propuestas."],
    },
    hitsHint: "Arrastra · ← →",
    hitsIndex: "Índice",
    hitCredits: { label: "Artista", feat: "Con", year: "Año" },
    quotes: {
      forbes: "El escenario es mi lugar favorito del mundo.",
      billboard: "Vengo del underground, y eso siempre será parte de mi ADN.",
      djmag: "Una pasión 24/7 por la música.",
    },
    stageItems: [
      { title: "Retrato", meta: "Oficial · 2026" },
      { title: "Blanco y negro", meta: "Rostro" },
      { title: "Mirada", meta: "Ibiza" },
      { title: "Rojo", meta: "Duotono" },
      { title: "Tribal", meta: "Tatuaje" },
      { title: "Sleeve", meta: "Detalle" },
      { title: "Sombra", meta: "Luz de día" },
      { title: "Affairs red", meta: "Rostro" },
      { title: "Noche", meta: "B&N" },
      { title: "Negro", meta: "Torso" },
      { title: "Affairs", meta: "Sello · 2025" },
    ],
    galleryItems: ["Retrato", "Blanco y negro", "Mirada", "Rojo", "Tribal", "Sleeve", "Sombra", "Affairs red", "Noche", "Negro", "Affairs"],
    palette: "Paleta",
    type: "Tipografía",
    approve: "¿Apruebas este bloque? Dime el número y qué cambiar.",
    home: { side: "LUKAS RUIZ · 1993 · MUNDO NOVO → IBIZA", next: "Próximo show", nextShow: "Pacha New York · 29 oct", scroll: "Desliza", chartKicker: "Capítulo 01 · El ascenso", chartTitle: "De 118.º a 10.º mejor DJ del mundo en once años.", chartSub: "Posición en el DJ Mag Top 100, el ranking votado por el público de todo el mundo.", best: "Mejor posición", now: "Puesto en", first: "Debut" },
  },
}
