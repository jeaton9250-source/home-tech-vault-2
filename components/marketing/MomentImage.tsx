"use client";
export default function MomentImage({src, alt}: {src:string; alt:string}) {
  return <img src={src} alt={alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={event => {const image=event.currentTarget; image.onerror=null; image.src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85";}}/>;
}
