"use client";
import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import HomeMarketingFooter from "@/components/marketing/HomeMarketingFooter";
import { ArrowUpRight, FileText, ShieldCheck, ScanLine, ArrowDown, House } from "lucide-react";

const photo="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=85";
const appStore="https://apps.apple.com/app/id6812090967";
export default function CinematicHome(){
 const scene=useRef<HTMLElement>(null);
 const reduce=useReducedMotion();
 const {scrollYProgress}=useScroll({target:scene,offset:["start start","end end"]});
 const zoom=useTransform(scrollYProgress,[0,.35,.8],[1,1.25,1.6]);
 const dim=useTransform(scrollYProgress,[0,.2,.46,.8,1],[.46,.54,.42,.16,.23]);
 const paperworkOpacity=useTransform(scrollYProgress,[0,.1,.28,.49],[.9,.9,.55,0]);
 const paperworkY=useTransform(scrollYProgress,[0,.45],[0,-125]);
 const cleanGlow=useTransform(scrollYProgress,[.3,.82],[.85,1.17]);
 const titleOpacity=useTransform(scrollYProgress,[0,.12,.23],[1,1,0]);
 const cardOpacity=useTransform(scrollYProgress,[.27,.42,.64,.74],[0,1,1,0]);
 const cardY=useTransform(scrollYProgress,[.25,.5,.8],[90,0,-65]);
 const lastOpacity=useTransform(scrollYProgress,[.79,.93],[0,1]);
 return <main className="cinema">
 <style jsx global>{`
 .cinema{--navy:#142438;--ivory:#f6f2e9;--olive:#78856c;background:var(--ivory);color:var(--navy);overflow:clip}
 .cinema *{box-sizing:border-box}.cinema h1,.cinema h2,.cinema h3{font-family:Georgia,serif;letter-spacing:-.055em;font-weight:400}.cinema a{text-decoration:none}
 .cinema .cinema-nav{height:76px;padding:0 clamp(20px,5vw,84px);display:flex;align-items:center;justify-content:space-between;background:var(--ivory);position:relative;z-index:10}
 .cinema .brand{font-size:15px;letter-spacing:.18em;font-weight:750}.cinema .nav-actions{display:flex;align-items:center;gap:24px;font-size:13px;font-weight:650}
 .cinema .nav-cta,.cinema .cta{background:var(--navy);color:white;padding:15px 23px;border-radius:40px;display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:700}
 .cinema .scene{height:390vh;position:relative;background:#0e1a21}.cinema .scene-sticky{height:100svh;position:sticky;top:0;overflow:hidden;isolation:isolate;display:grid;place-items:center;color:white}
 .cinema .scene-photo{position:absolute;inset:-4%;background-size:cover;background-position:center;z-index:-3}
 .cinema .scene-shade{position:absolute;inset:0;background:#06121a;z-index:-2}
 .cinema .paperwork{position:absolute;inset:0;z-index:-1;pointer-events:none}.cinema .paper{position:absolute;display:block;padding:17px 13px;width:118px;height:145px;background:#f6f2e9e8;color:#34404a;font-size:10px;font-weight:750;letter-spacing:.12em;line-height:1.7;box-shadow:0 15px 45px #0006;border-top:7px solid #78856c}.cinema .paper-a{bottom:16%;left:12%;transform:rotate(-14deg)}.cinema .paper-b{bottom:11%;right:13%;transform:rotate(12deg)}.cinema .paper-c{top:19%;right:16%;transform:rotate(-8deg)}.cinema .scene-content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px}
 .cinema .eyebrow{font-size:11px;letter-spacing:.23em;text-transform:uppercase;font-weight:700;color:#d9d5c6}
 .cinema .hero-title{font-size:clamp(58px,9vw,148px);line-height:.94;max-width:1100px;margin:24px 0}
 .cinema .hero-sub{font-size:clamp(15px,1.6vw,21px);line-height:1.6;max-width:520px;color:#eeeae1}
 .cinema .scroll-hint{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);display:flex;gap:12px;align-items:center;font-size:10px;letter-spacing:.2em}
 .cinema .story-card{width:min(92vw,680px);padding:clamp(26px,5vw,55px);border:1px solid #ffffff55;border-radius:24px;background:#f6f2e9ed;backdrop-filter:blur(22px);color:var(--navy);text-align:left;box-shadow:0 35px 90px #0005}
 .cinema .story-card h2{font-size:clamp(42px,6vw,78px);line-height:1.02;margin:15px 0 20px}.cinema .story-card p{font-size:17px;line-height:1.7;color:#48525b}
 .cinema .device{background:white;border:1px solid #d7ddd5;border-radius:16px;padding:23px;margin-top:30px;box-shadow:0 15px 35px #14243818}
 .cinema .device-top{display:flex;justify-content:space-between;align-items:center;gap:16px}.cinema .device-name{font-weight:700}.cinema .device-status{font-size:11px;background:#e4ebdd;color:#53684b;border-radius:30px;padding:7px 10px}
 .cinema .device-row{display:flex;justify-content:space-between;border-top:1px solid #e9e9e5;margin-top:17px;padding-top:17px;font-size:13px;gap:12px}
 .cinema .scene-end h2{font-size:clamp(48px,8vw,112px);line-height:1;max-width:880px;margin:20px auto}.cinema .scene-end p{font-size:18px;line-height:1.6;max-width:500px;margin:0 auto}
 .cinema .light-section{padding:clamp(85px,11vw,180px) 7%;display:grid;grid-template-columns:1fr 1fr;gap:8%;align-items:center;min-height:90vh}
 .cinema .light-section h2{font-size:clamp(48px,6vw,95px);line-height:1.02;margin:16px 0 25px}.cinema .light-section p{font-size:18px;line-height:1.75;max-width:490px;color:#56606a}
 .cinema .editorial-photo{height:min(70vh,700px);border-radius:4px;background:linear-gradient(#14243810,#14243850),url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1300&q=85') center/cover}
 .cinema .chapter{padding:110px 7%;background:var(--navy);color:var(--ivory);text-align:center}
 .cinema .chapter h2{font-size:clamp(52px,8vw,120px);max-width:950px;line-height:1.02;margin:20px auto 35px}
 .cinema .chapter-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1120px;margin:65px auto 0;text-align:left}
 .cinema .chapter-item{border:1px solid #ffffff35;padding:34px;border-radius:16px}.cinema .chapter-item h3{font-size:30px;margin:25px 0 12px}.cinema .chapter-item p{line-height:1.65;color:#d2d9da;font-size:15px}
 .cinema .final{padding:130px 20px;text-align:center}.cinema .final h2{font-size:clamp(50px,8vw,110px);line-height:1.02;max-width:900px;margin:20px auto}.cinema .final p{max-width:560px;margin:0 auto 32px;line-height:1.7;color:#53606b}
 .cinema .buttons{display:flex;justify-content:center;gap:15px;flex-wrap:wrap}.cinema .outline{border:1px solid var(--navy);color:var(--navy);padding:14px 22px;border-radius:40px;font-size:13px;font-weight:700}
 @media(max-width:720px){.cinema .cinema-nav{height:65px}.cinema .brand{font-size:12px}.cinema .nav-actions{gap:12px}.cinema .nav-actions .login{display:none}.cinema .nav-cta{padding:12px 14px;font-size:11px}.cinema .scene{height:330vh}.cinema .paper{width:76px;height:105px;padding:10px 7px;font-size:7px}.cinema .paper-a{bottom:15%;left:3%}.cinema .paper-b{bottom:13%;right:3%}.cinema .paper-c{top:16%;right:5%}.cinema .scene-photo{background-position:55% center}.cinema .hero-title{font-size:clamp(57px,13vw,90px)}.cinema .story-card p{font-size:14px}.cinema .light-section{grid-template-columns:1fr;gap:45px}.cinema .editorial-photo{height:420px}.cinema .chapter-grid{grid-template-columns:1fr}.cinema .chapter{padding:85px 6%}.cinema .chapter-item{padding:25px}}
 @media(prefers-reduced-motion:reduce){.cinema *{scroll-behavior:auto!important;animation:none!important}.cinema .scene{height:100svh!important}.cinema .scroll-hint{display:none}}
 `}</style>
 <header className="cinema-nav"><Link className="brand" href="/">HOME TECH VAULT</Link><nav className="nav-actions" aria-label="Primary"><Link className="login" href="/login">Log in</Link><Link className="nav-cta" href="/signup">Get started <ArrowUpRight size={15}/></Link></nav></header>
 <section className="scene" ref={scene} aria-label="Discover Home Tech Vault"><div className="scene-sticky">
 <motion.div className="scene-photo" style={{backgroundImage:`url("${photo}")`,scale:reduce?1:zoom,filter:reduce?"brightness(1)":cleanGlow.to(v=>`brightness(${v})`)}}/>
 <motion.div className="scene-shade" style={{opacity:reduce?.45:dim}}/>
 <motion.div className="paperwork" aria-hidden="true" style={{opacity:reduce?0:paperworkOpacity,y:reduce?0:paperworkY}}><span className="paper paper-a">WARRANTY<br/>DOCUMENT</span><span className="paper paper-b">RECEIPT<br/># 00428</span><span className="paper paper-c">APPLIANCE<br/>MANUAL</span></motion.div>
 <motion.div className="scene-content" style={{opacity:reduce?1:titleOpacity}}><span className="eyebrow">A home worth remembering</span><h1 className="hero-title">A beautiful home.<br/>A thousand details.</h1><p className="hero-sub">Manuals in drawers. Receipts in emails. Warranties you can never find. There’s a simpler way.</p><Link href="/signup" className="cta" style={{marginTop:28,background:"#f6f2e9",color:"#142438"}}>Start your free vault <ArrowUpRight size={16}/></Link></motion.div>
 <motion.div className="scene-content" style={{opacity:reduce?0:cardOpacity,y:reduce?0:cardY,pointerEvents:"none",visibility:reduce?"hidden":"visible"}}><div className="story-card"><span className="eyebrow" style={{color:"#78856c"}}>01 / Remember everything</span><h2>Everything finds its place.</h2><p>As the paperwork fades, your appliance details, receipts and warranties come together in one organized vault.</p><div className="device"><div className="device-top"><span className="device-name">Kitchen refrigerator</span><span className="device-status">Warranty saved</span></div><div className="device-row"><span>Model & serial number</span><strong>Saved</strong></div><div className="device-row"><span>Receipt & warranty</span><strong>2 documents</strong></div></div><p style={{fontSize:11,marginTop:12}}>Illustrative example · Not your personal records</p></div></motion.div>
 <motion.div className="scene-content scene-end" style={{opacity:reduce?0:lastOpacity,pointerEvents:"none",visibility:reduce?"hidden":"visible"}}><span className="eyebrow">02 / Make it simple</span><h2>A clearer home.<br/>A calmer mind.</h2><p>The same home. Now you know exactly where its important records live.</p></motion.div>
 <div className="scroll-hint"><ArrowDown size={14}/> SCROLL TO EXPLORE</div>
 </div></section>
 <section className="light-section"><div><span className="eyebrow" style={{color:"#78856c"}}>03 / The details matter</span><h2>Every appliance has a story.</h2><p>From the day you bought it to the last time it was serviced, keep the model number, receipt, warranty and maintenance history together.</p><Link href="/signup" className="cta" style={{marginTop:28}}>Save your first appliance <ArrowUpRight size={16}/></Link></div><div className="editorial-photo" role="img" aria-label="Modern home interior"/></section>
 <section className="chapter"><span className="eyebrow">04 / One place for it all</span><h2>Everything important. Nothing complicated.</h2><div className="chapter-grid"><div className="chapter-item"><ScanLine size={29}/><h3>Devices</h3><p>Know what you own and keep its important details close.</p></div><div className="chapter-item"><ShieldCheck size={29}/><h3>Warranties</h3><p>Find coverage details and proof of purchase when you need them.</p></div><div className="chapter-item"><FileText size={29}/><h3>Documents</h3><p>Keep manuals, receipts and home records organized.</p></div></div></section>
 <section className="final"><House size={28} style={{margin:"auto",color:"#78856c"}}/><h2>A more organized home starts with knowing what you own.</h2><p>Start with one appliance. Build a better-organized home, one detail at a time.</p><div className="buttons"><Link href="/signup" className="cta">Create your free vault <ArrowUpRight size={16}/></Link><a className="outline" href={appStore} target="_blank" rel="noopener noreferrer">Get the iPhone app</a></div></section>
 <HomeMarketingFooter/>
 </main>;
}
