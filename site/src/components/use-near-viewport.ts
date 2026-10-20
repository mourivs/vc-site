import { useEffect, useState, type RefObject } from 'react'
export function useNearViewport(ref:RefObject<HTMLElement|null>){
 const [near,setNear]=useState(false)
 useEffect(()=>{const el=ref.current;if(!el)return;const io=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setNear(true);io.disconnect()}},{rootMargin:'600px'});io.observe(el);return()=>io.disconnect()},[ref])
 return near
}
