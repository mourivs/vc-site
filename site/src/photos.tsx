import type { Lang } from './i18n'

export type Photo = { src: string; credit: string; source: string; title: Record<Lang, string>; aspect: number }
const tml='https://www.tomorrowland.com/article/tomorrowland-belgium-2024-interview-vintage-culture/'
const doc='https://press.belgium.tomorrowland.com/tomorrowland-and-amazon-music-present-we-are-tomorrow-4mw33w'
const br='https://press.brasil.tomorrowland.com/in-pictures-this-was-the-second-day-of-tomorrowland-brasil-2025'
const photo=(file:string,credit:string,source:string,aspect:number,pt:string,en:string,es:string):Photo=>({src:`/img/real/${file}.webp`,credit,source,aspect,title:{pt,en,es}})
export const photoSrcSet=(src:string)=>src.startsWith('/img/real/')?`${src.replace('.webp','-640.webp')} 640w, ${src} 1600w`:undefined
export const PHOTOS:Photo[]=[
 photo('tml-portrait','Tomorrowland · Bélgica, 2024',tml,.8,'Uma pista, milhares de vozes','One dance floor, thousands of voices','Una pista, miles de voces'),
 photo('tml-live','Tomorrowland · Bélgica, 2024',tml,.8,'Dentro da cabine','Inside the booth','Dentro de la cabina'),
 photo('tml-stage','Tomorrowland · Bélgica, 2024',tml,1.5,'O som ganha o mundo','Taking the sound worldwide','El sonido recorre el mundo'),
 photo('documentary-1','Tomorrowland / Amazon Music · We Are Tomorrow, 2024',doc,4/3,'A conexão com a pista','Connected to the dance floor','La conexión con la pista'),
 photo('documentary-2','Tomorrowland / Amazon Music · We Are Tomorrow, 2024',doc,4/3,'Entre um set e outro','Between sets','Entre un set y otro'),
 photo('documentary-8','Tomorrowland / Amazon Music · We Are Tomorrow, 2024',doc,4/3,'Música em construção','Music in the making','Música en construcción'),
 photo('documentary-4','Tomorrowland / Amazon Music · We Are Tomorrow, 2024',doc,4/3,'Lukas, fora do palco','Lukas, off stage','Lukas, fuera del escenario'),
 photo('documentary-5','Tomorrowland / Amazon Music · We Are Tomorrow, 2024',doc,4/3,'Antes das luzes','Before the lights','Antes de las luces'),
 photo('documentary-6','Tomorrowland / Amazon Music · We Are Tomorrow, 2024',doc,4/3,'A história por trás do som','The story behind the sound','La historia detrás del sonido'),
 photo('brasil-b2b','Tomorrowland Brasil · ANNA b2b Vintage Culture, 2025',br,1.5,'Brasil em frequência máxima','Brazil at full frequency','Brasil en máxima frecuencia'),
 photo('house-paradise','Pablo Diego · House Paradise, 2024 · CC BY-SA 2.0','https://commons.wikimedia.org/wiki/File:Vintage_Culture_-_House_Paradise_2024-04-30_(53693905125).jpg',2216/3936,'House Paradise','House Paradise','House Paradise'),
 photo('deezer-portrait','Deezrt · Vintage Culture in 2026 · CC BY-SA 2.5','https://commons.wikimedia.org/wiki/File:Vintage_Culture_in_2026.jpg',1,'Retrato · 2026','Portrait · 2026','Retrato · 2026'),
 photo('casa-maringa-1','Gabriel Vecchi · reprodução (Globo, 2018)','https://e.glbimg.com/og/ed/f/original/2018/01/16/gabriel-vecchi-04.jpg',620/1021,'Casa em Maringá','Home in Maringá','Casa en Maringá'),
 photo('casa-maringa-2','Gabriel Vecchi · reprodução (Globo, 2018)','https://e.glbimg.com/og/ed/f/original/2018/01/16/gabriel-vecchi-03.jpg',620/406,'Neon e cor, em casa','Neon and colour, at home','Neón y color, en casa'),
]

export function ImageCredits({lang}:{lang:Lang}){
 return <footer id="creditos" className="border-t border-bone/20 px-5 py-16 sm:px-10">
  <div className="mx-auto max-w-6xl">
   <p className="font-display text-3xl uppercase">Vintage Culture</p>
   <h2 className="mt-10 text-lg font-semibold">{{pt:'Créditos das imagens',en:'Image credits',es:'Créditos de las imágenes'}[lang]}</h2>
   <ul className="mt-5 grid gap-x-10 gap-y-3 text-sm leading-relaxed text-bone/80 md:grid-cols-2">
    <li><a href="https://vintageculture.komi.io" target="_blank" rel="noreferrer">Vintage Culture / KOMI — {{pt:'retrato oficial, recortes, logo Affairs e capas dos lançamentos',en:'official portrait, crops, Affairs logo and release artwork',es:'retrato oficial, recortes, logo Affairs y portadas'}[lang]} ↗</a></li>
    {[PHOTOS[0],PHOTOS[3],PHOTOS[9],PHOTOS[10],PHOTOS[11]].map(p=><li key={p.src}><a href={p.source} target="_blank" rel="noreferrer">{p.credit} ↗</a>{p===PHOTOS[10]||p===PHOTOS[11]?<span> · <a href={`https://creativecommons.org/licenses/by-sa/${p===PHOTOS[10]?'2.0':'2.5'}/`} target="_blank" rel="noreferrer">{{pt:'Licença',en:'License',es:'Licencia'}[lang]}</a> · {{pt:'redimensionamento e recorte',en:'resized and cropped',es:'redimensionada y recortada'}[lang]}</span>:null}</li>)}
   </ul>
   <p className="mt-6 text-xs text-bone/70">{{pt:'Fotos da casa em Maringá: Gabriel Vecchi (Globo, 2018), reprodução ampliada digitalmente.',en:'Photos of the home in Maringá: Gabriel Vecchi (Globo, 2018), reproduced and digitally enlarged.',es:'Fotos de la casa en Maringá: Gabriel Vecchi (Globo, 2018), reproducción ampliada digitalmente.'}[lang]}</p>
   <p className="mt-8 text-xs text-bone/70">{{pt:'Ilustrações dos primeiros capítulos: criadas com IA, sem representação do artista. Fotografias contemporâneas têm data indicada.',en:'Early-chapter illustrations: AI-created, without depicting the artist. Contemporary photographs are dated.',es:'Ilustraciones de los primeros capítulos: creadas con IA, sin representar al artista. Las fotografías contemporáneas indican su fecha.'}[lang]}</p>
  </div>
 </footer>
}
