import type { Lang } from './i18n'
const SEO={
 pt:{title:'Vintage Culture — A história, o som e os próximos palcos',description:'A trajetória de Lukas Ruiz, de Mundo Novo aos palcos do mundo. Música, shows, conquistas e o universo Affairs. Em português, inglês e espanhol.',locale:'pt_BR'},
 en:{title:'Vintage Culture — The story, the sound and the next stages',description:'The journey of Lukas Ruiz from Mundo Novo to stages around the world. Music, tour dates, achievements and the world of Affairs. In English, Portuguese and Spanish.',locale:'en_US'},
 es:{title:'Vintage Culture — La historia, el sonido y los próximos escenarios',description:'La trayectoria de Lukas Ruiz, de Mundo Novo a los escenarios del mundo. Música, fechas, logros y el universo Affairs. En español, portugués e inglés.',locale:'es_ES'},
}
export function applyMetadata(lang:Lang){
 const data=SEO[lang]
 document.documentElement.lang=lang==='pt'?'pt-BR':lang
 document.title=data.title
 for(const [selector,content] of [['meta[name="description"]',data.description],['meta[property="og:title"]',data.title],['meta[property="og:description"]',data.description],['meta[property="og:locale"]',data.locale]])document.querySelector(selector)?.setAttribute('content',content)
}
