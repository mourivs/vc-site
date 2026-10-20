import type { Lang } from "@/i18n"
import { PHOTOS } from "@/photos"

export type Chapter = { year: string; title: string; text: string; tag: string; photo?: { src: string; credit: string } }
export type Win = { v: string; l: string }

type Story = {
  stageKicker: string
  stageTitle: string
  chapters: Chapter[]
  winsKicker: string
  winsTitle: string
  wins: Win[]
  headlines: string
  headlinesList: string[]
}

/** Fatos conferidos em Wikipedia, Forbes Brasil, Rolling Stone Brasil, DJ Mag e Billboard Brasil (ver pesquisa/DOSSIE.md). */
export const STORY: Record<Lang, Story> = {
  pt: {
    stageKicker: "Capítulo 02 · O palco",
    stageTitle: "Antes do palco, houve um quarto.",
    chapters: [
      { year: "1993", title: "Antes das luzes", tag: "Mundo Novo → Katueté", text: "Lukas nasce em Mundo Novo, em 7 de julho. A infância acontece no campo, em Katueté, no Paraguai. Antes da cabine, o horizonte era o da fazenda." },
      { year: "2005", title: "Uma janela se abre", tag: "O primeiro computador", text: "Da fazenda à lan house: um colega lhe apresenta a música eletrônica. Aos 12, ganha da mãe um computador e começa a procurar como produzir. A curiosidade encontra uma ferramenta." },
      { year: "2012", title: "Do quarto ao SoundCloud", tag: "Maringá · primeiras produções", text: "A mudança para Maringá era para estudar Direito. Entre as aulas e o computador, publica um remix de “Blue Monday”, ainda como Lukas Ruiz. As experiências do quarto começam a circular." },
      { year: "2013", title: "Um nome para o som", tag: "Nasce Vintage Culture", text: "Para se distinguir de outro DJ, adota Vintage Culture. O remix de sete minutos de “Another Brick in the Wall” viraliza. Aquilo que circulava online começa a trazer convites para tocar." },
      { year: "2014", title: "O quarto vira estrada", tag: "160 shows", text: "Os convites se tornam uma agenda de 160 shows no ano. O remix de “Bete Balanço” leva seu som a mais gente. A produção continua; agora, entre uma cidade e outra." },
      { year: "2015", title: "O mapa se amplia", tag: "Brasil → primeira turnê internacional", text: "A estrada chega ao Lollapalooza, Tomorrowland Brasil e Rock in Rio, além da primeira turnê internacional. No ranking da DJ Mag, estreia em #118, na lista Next 50 — ainda fora do Top 100." },
      { year: "2016", title: "O som cruza fronteiras", tag: "Drinkee · Beatport #4", text: "O remix de “Drinkee”, com Slow Motion!, alcança o #4 no Beatport. A Spinnin’ Records entra na história. No DJ Mag, o #118 de 2015 dá lugar ao #54 em 2016 e ao #31 no ano seguinte." },
      { year: "2019", title: "Uma pista de 30 mil", tag: "Só Track Boa · Mineirão", text: "A escala muda de novo: 30 mil pessoas se reúnem no Mineirão para a Só Track Boa. O encontro entre artista e público passa a ocupar estádios, sem perder a ideia de uma pista compartilhada." },
      { year: "2020–24", title: "Das faixas a um álbum", tag: "Promised Land · DJ Mag #9", text: "“Slow Down”, “Coffee” e “Under Pressure” ampliam o repertório. Em 2022, dois lançamentos ocupam #1 e #2 do Beatport ao mesmo tempo. Em 2024 chegam Promised Land e a melhor posição na DJ Mag: #9." },
      { year: "2025–26", title: "Um novo capítulo, Affairs", tag: "Selo próprio · Ibiza · Cercle", text: "Affairs nasce em 2025 como espaço para novos lançamentos. A trajetória segue pelo Pacha Ibiza e Cercle. Em 2026, o #10 da DJ Mag marca o presente de uma história que continua na estrada." },
    ],
    winsKicker: "Títulos e conquistas",
    winsTitle: "O que a estrada deu em troca.",
    wins: [
      { v: "#9", l: "melhor posição no DJ Mag Top 100 · 2024" },
      { v: "12", l: "edições documentadas do ranking DJ Mag · 2015–2026" },
      { v: "2,8 bi", l: "streams no Spotify" },
      { v: "#1", l: "DJ do Brasil · House Mag · 2017" },
      { v: "Big Room", l: "melhor DJ · Rio Music Conference · 2015" },
      { v: "Under 30", l: "lista da Forbes · 2017" },
      { v: "#1 e #2", l: "no Beatport ao mesmo tempo · 2022" },
      { v: "40 mil", l: "pessoas na Só Track Boa em São Paulo · 2022" },
    ],
    headlines: "Já foi atração em",
    headlinesList: ["Tomorrowland", "EDC", "Coachella", "Glastonbury", "Creamfields", "Burning Man", "Cercle", "Time Warp"],
  },
  en: {
    stageKicker: "Chapter 02 · The stage",
    stageTitle: "Before the stage, there was a bedroom.",
    chapters: [
      { year: "1993", title: "Before the lights", tag: "Mundo Novo → Katueté", text: "Lukas is born in Mundo Novo on 7 July. Childhood unfolds in the countryside of Katueté, Paraguay. Before the booth, his horizon was the farm." },
      { year: "2005", title: "A window opens", tag: "The first computer", text: "From the farm to an internet café: a friend introduces him to electronic music. At 12, his mother gives him a computer and he starts looking into production. Curiosity finds a tool." },
      { year: "2012", title: "Bedroom to SoundCloud", tag: "Maringá · first productions", text: "The move to Maringá was meant for Law school. Between classes and his computer, he posts a “Blue Monday” remix as Lukas Ruiz. His bedroom experiments begin to travel." },
      { year: "2013", title: "A name for the sound", tag: "Vintage Culture is born", text: "To distinguish himself from another DJ, he adopts Vintage Culture. His seven-minute “Another Brick in the Wall” remix goes viral. Online circulation turns into invitations to play." },
      { year: "2014", title: "The bedroom hits the road", tag: "160 shows", text: "The invitations become a schedule of 160 shows in a year. His “Bete Balanço” remix reaches new listeners. Production continues, now between one city and the next." },
      { year: "2015", title: "The map grows", tag: "Brazil → first international tour", text: "The road reaches Lollapalooza, Tomorrowland Brasil and Rock in Rio, followed by a first international tour. His DJ Mag debut is No. 118 in the Next 50, still outside the Top 100." },
      { year: "2016", title: "The sound crosses borders", tag: "Drinkee · Beatport #4", text: "His “Drinkee” remix with Slow Motion! reaches No. 4 on Beatport. Spinnin’ Records enters the story. The DJ Mag No. 118 of 2015 becomes No. 54 in 2016, then No. 31 the following year." },
      { year: "2019", title: "A floor for 30,000", tag: "Só Track Boa · Mineirão", text: "The scale changes again: 30,000 people gather at Mineirão for Só Track Boa. Artist and audience now meet in stadiums, carrying the idea of a shared dance floor with them." },
      { year: "2020–24", title: "From tracks to an album", tag: "Promised Land · DJ Mag #9", text: "“Slow Down”, “Coffee” and “Under Pressure” expand the repertoire. Two releases hold Beatport's No. 1 and No. 2 simultaneously in 2022. In 2024 come Promised Land and a DJ Mag career best: No. 9." },
      { year: "2025–26", title: "A new chapter, Affairs", tag: "His own label · Ibiza · Cercle", text: "Affairs launches in 2025 as a home for new releases. The journey continues through Pacha Ibiza and Cercle. In 2026, DJ Mag's No. 10 marks the present of a story still on the road." },
    ],
    winsKicker: "Titles and achievements",
    winsTitle: "What the road gave back.",
    wins: [
      { v: "#9", l: "best DJ Mag Top 100 position · 2024" },
      { v: "12", l: "documented editions of the DJ Mag ranking · 2015–2026" },
      { v: "2.8 bn", l: "Spotify streams" },
      { v: "#1", l: "DJ in Brazil · House Mag · 2017" },
      { v: "Big Room", l: "best DJ · Rio Music Conference · 2015" },
      { v: "Under 30", l: "Forbes list · 2017" },
      { v: "#1 & #2", l: "on Beatport at the same time · 2022" },
      { v: "40,000", l: "people at Só Track Boa in São Paulo · 2022" },
    ],
    headlines: "Has headlined",
    headlinesList: ["Tomorrowland", "EDC", "Coachella", "Glastonbury", "Creamfields", "Burning Man", "Cercle", "Time Warp"],
  },
  es: {
    stageKicker: "Capítulo 02 · El escenario",
    stageTitle: "Antes del escenario, hubo un cuarto.",
    chapters: [
      { year: "1993", title: "Antes de las luces", tag: "Mundo Novo → Katueté", text: "Lukas nace en Mundo Novo el 7 de julio. Su infancia transcurre en el campo de Katueté, Paraguay. Antes de la cabina, su horizonte era la granja." },
      { year: "2005", title: "Se abre una ventana", tag: "La primera computadora", text: "Del campo al cibercafé: un compañero le presenta la música electrónica. A los 12, su madre le regala una computadora y empieza a investigar cómo producir. La curiosidad encuentra una herramienta." },
      { year: "2012", title: "Del cuarto a SoundCloud", tag: "Maringá · primeras producciones", text: "La mudanza a Maringá era para estudiar Derecho. Entre las clases y la computadora, publica un remix de “Blue Monday” como Lukas Ruiz. Los experimentos del cuarto empiezan a circular." },
      { year: "2013", title: "Un nombre para el sonido", tag: "Nace Vintage Culture", text: "Para distinguirse de otro DJ, adopta Vintage Culture. Su remix de siete minutos de “Another Brick in the Wall” se vuelve viral. La circulación online se convierte en invitaciones para tocar." },
      { year: "2014", title: "El cuarto se hace carretera", tag: "160 shows", text: "Las invitaciones se convierten en una agenda de 160 shows al año. Su remix de “Bete Balanço” llega a más oyentes. La producción continúa, ahora entre una ciudad y otra." },
      { year: "2015", title: "El mapa se amplía", tag: "Brasil → primera gira internacional", text: "La carretera llega a Lollapalooza, Tomorrowland Brasil y Rock in Rio, además de la primera gira internacional. Debuta en DJ Mag en el #118 de Next 50, todavía fuera del Top 100." },
      { year: "2016", title: "El sonido cruza fronteras", tag: "Drinkee · Beatport #4", text: "Su remix de “Drinkee” con Slow Motion! alcanza el #4 de Beatport. Spinnin’ Records entra en la historia. El #118 de DJ Mag de 2015 se convierte en #54 en 2016 y en #31 al año siguiente." },
      { year: "2019", title: "Una pista para 30 mil", tag: "Só Track Boa · Mineirão", text: "La escala vuelve a cambiar: 30 mil personas se reúnen en el Mineirão para Só Track Boa. Artista y público pasan a encontrarse en estadios, manteniendo la idea de una pista compartida." },
      { year: "2020–24", title: "De las canciones al álbum", tag: "Promised Land · DJ Mag #9", text: "“Slow Down”, “Coffee” y “Under Pressure” amplían el repertorio. En 2022, dos lanzamientos ocupan #1 y #2 de Beatport a la vez. En 2024 llegan Promised Land y su mejor puesto en DJ Mag: #9." },
      { year: "2025–26", title: "Un nuevo capítulo, Affairs", tag: "Sello propio · Ibiza · Cercle", text: "Affairs nace en 2025 como espacio para nuevos lanzamientos. El viaje sigue por Pacha Ibiza y Cercle. En 2026, el #10 de DJ Mag marca el presente de una historia que continúa en la carretera." },
    ],
    winsKicker: "Títulos y logros",
    winsTitle: "Lo que la carretera devolvió.",
    wins: [
      { v: "#9", l: "mejor puesto en el DJ Mag Top 100 · 2024" },
      { v: "12", l: "ediciones documentadas del ranking DJ Mag · 2015–2026" },
      { v: "2,8 mil M", l: "reproducciones en Spotify" },
      { v: "#1", l: "DJ de Brasil · House Mag · 2017" },
      { v: "Big Room", l: "mejor DJ · Rio Music Conference · 2015" },
      { v: "Under 30", l: "lista de Forbes · 2017" },
      { v: "#1 y #2", l: "en Beatport a la vez · 2022" },
      { v: "40 mil", l: "personas en Só Track Boa en São Paulo · 2022" },
    ],
    headlines: "Ha sido cabeza de cartel en",
    headlinesList: ["Tomorrowland", "EDC", "Coachella", "Glastonbury", "Creamfields", "Burning Man", "Cercle", "Time Warp"],
  },
}

// Fotos contemporâneas com data indicada; não são arquivos dos anos narrados.
for (const lang of ['pt', 'en', 'es'] as const) {
  ;[0, 1, 10, 2, 9].forEach((photoIndex, index) => {
    STORY[lang].chapters[index + 5].photo = PHOTOS[photoIndex]
  })
}
