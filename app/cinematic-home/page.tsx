"use client";
import Link from "next/link";
import {useRef} from "react";
import {motion,useReducedMotion,useScroll,useTransform} from "framer-motion";
import {ArrowUpRight,ArrowDown,Menu,ShieldCheck,FileText,House} from "lucide-react";
import HomeMarketingFooter from "@/components/marketing/HomeMarketingFooter";

const photographs={
 exterior:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2200&q=85",
 kitchen:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=85",
 living:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=85",
};
const appStore="https://apps.apple.com/app/id6812090967";
export default function CinematicHome(){
 const reduced=useReducedMotion();
 const heroRef=useRef<HTMLElement>(null);
 const {scrollYProgress:heroProgress}=useScroll({target:heroRef,offset:["start start","end start"]});
 const heroScale=useTransform(heroProgress,[0,1],[1.03,1.24]);
 const heroTextY=useTransform(heroProgress,[0,1],[0,105]);
 const heroFade=useTransform(heroProgress,[0,.85],[1,.12]);
 const reveal={initial:reduced?false:{opacity:0,y:42},whileInView:{opacity:1,y:0},viewport:{once:true,amount:.25},transition:{duration:.8,ease:"easeOut" as const}};
 return <main className="editorial-htv">
 <style jsx global>{`
 .editorial-htv{--ink:#152637;--cream:#f4f0e7;--sage:#78866f;background:var(--cream);color:var(--ink);overflow:clip}
 .editorial-htv *{box-sizing:border-box}.editorial-htv a{text-decoration:none}.editorial-htv h1,.editorial-htv h2,.editorial-htv h3{font-family:Georgia,"Times New Roman",serif;font-weight:400;letter-spacing:-.055em}
 .editorial-htv .nav{height:78px;display:flex;justify-content:space-between;align-items:center;padding:0 clamp(22px,5vw,86px);gap:15px}
 .editorial-htv .logo{font-weight:800;letter-spacing:.16em;font-size:12px}.editorial-htv .nav-links{display:flex;gap:28px;align-items:center;font-size:12px;font-weight:700}
 .editorial-htv .pill{display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:white;padding:14px 22px;border-radius:40px;font-size:12px;font-weight:700}
 .editorial-htv .hero{position:relative;height:min(850px,calc(100svh - 78px));min-height:610px;color:white;overflow:hidden;background:#34433f}
 .editorial-htv .hero-img{position:absolute;inset:0;background-size:cover;background-position:center;transform:scale(1.015)}
 .editorial-htv .hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,#0b1922b5 0%,#0b19224d 54%,#0b192218 100%),linear-gradient(0deg,#0b192280,transparent 40%)}
 .editorial-htv .hero-content{position:absolute;left:clamp(25px,7vw,112px);right:25px;top:50%;transform:translateY(-50%);max-width:820px}
 .editorial-htv .eyebrow{font-size:11px;letter-spacing:.25em;text-transform:uppercase;font-weight:750}.editorial-htv .hero h1{font-size:clamp(52px,8vw,124px);line-height:1.03;margin:20px 0 27px}
 .editorial-htv .hero p{font-size:clamp(15px,1.7vw,20px);max-width:460px;line-height:1.65;color:#f1f0e9}.editorial-htv .hero .pill{margin-top:22px;background:var(--cream);color:var(--ink)}
 .editorial-htv .hero-bottom{position:absolute;bottom:26px;left:clamp(25px,7vw,112px);right:clamp(25px,7vw,112px);display:flex;justify-content:space-between;gap:20px;align-items:center;font-size:10px;letter-spacing:.2em}
 .editorial-htv .hero-bottom span{display:flex;align-items:center;gap:10px}
 .editorial-htv .intro{padding:clamp(95px,13vw,190px) 7%;display:grid;grid-template-columns:1fr 1.3fr;gap:12%;align-items:start}
 .editorial-htv .intro h2{font-size:clamp(44px,5.3vw,82px);line-height:1.08;margin:0}.editorial-htv .intro p{font-size:clamp(16px,1.6vw,20px);line-height:1.75;color:#52616a;max-width:520px}
 .editorial-htv .scene{min-height:780px;display:grid;grid-template-columns:1.12fr .88fr;background:#e7e5db}
 .editorial-htv .scene.reverse{grid-template-columns:.88fr 1.12fr;background:#e1e6dc}
 .editorial-htv .scene-image{min-height:620px;background-size:cover;background-position:center;position:relative;overflow:hidden}.editorial-htv .scene-image:after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,#14243824,transparent 55%);pointer-events:none}
 .editorial-htv .scene-copy{padding:clamp(50px,7vw,125px);display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
 .editorial-htv .scene-copy h2{font-size:clamp(45px,5.3vw,83px);line-height:1.07;margin:22px 0}.editorial-htv .scene-copy p{line-height:1.75;font-size:17px;max-width:420px;color:#48545c}
 .editorial-htv .chapter-num{font-size:12px;letter-spacing:.2em;font-weight:700;color:#687f67}
 .editorial-htv .record-preview{margin-top:34px;border-top:1px solid #b9c4b5;width:min(100%,430px)}
 .editorial-htv .record-line{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 0;border-bottom:1px solid #b9c4b5;font-size:13px}
 .editorial-htv .record-line strong{display:flex;align-items:center;gap:6px;color:#536c4f;font-size:12px}
 .editorial-htv .statement{background:var(--ink);color:var(--cream);text-align:center;padding:clamp(105px,15vw,210px) 7%}
 .editorial-htv .statement h2{font-size:clamp(52px,8vw,130px);line-height:1.03;max-width:1000px;margin:23px auto}.editorial-htv .statement p{max-width:540px;margin:25px auto 0;line-height:1.75;color:#cbd5d6;font-size:17px}
 .editorial-htv .closing{padding:clamp(95px,13vw,190px) 7%;text-align:center}.editorial-htv .closing h2{font-size:clamp(48px,7vw,105px);line-height:1.04;margin:20px auto;max-width:850px}.editorial-htv .closing p{max-width:500px;margin:0 auto 30px;color:#52616a;line-height:1.7}
 .editorial-htv .app-store-badge{display:inline-flex;align-items:center;justify-content:center;min-height:44px}.editorial-htv .app-store-badge img{width:156px;height:auto;display:block}.editorial-htv .cta-row{display:flex;justify-content:center;gap:15px;flex-wrap:wrap}.editorial-htv .outline{border:1px solid var(--ink);border-radius:40px;padding:13px 22px;font-size:12px;font-weight:700;color:var(--ink)}
 @media(max-width:750px){.editorial-htv .nav{height:65px;padding:0 20px}.editorial-htv .logo{font-size:10px}.editorial-htv .nav-links{gap:12px}.editorial-htv .nav-links .login{display:none}.editorial-htv .nav-links .pill{padding:12px 15px}.editorial-htv .hero{height:calc(100svh - 65px);min-height:570px}.editorial-htv .hero-img{background-position:58% center}.editorial-htv .hero-overlay{background:linear-gradient(90deg,#0b1922b0,#0b192245),linear-gradient(0deg,#0b192280,transparent 60%)}.editorial-htv .hero-content{left:25px;right:25px;top:47%}.editorial-htv .hero h1{font-size:clamp(49px,11vw,75px)}.editorial-htv .hero-bottom{left:25px;right:25px}.editorial-htv .intro{grid-template-columns:1fr;gap:25px;padding:85px 7%}.editorial-htv .scene,.editorial-htv .scene.reverse{grid-template-columns:1fr}.editorial-htv .scene-image{min-height:450px}.editorial-htv .scene-copy{padding:70px 7% 85px}.editorial-htv .scene-copy h2{font-size:clamp(45px,10vw,70px)}.editorial-htv .statement{padding:110px 7%}.editorial-htv .statement h2{font-size:clamp(50px,11vw,75px)}}
 .editorial-htv .hero .pill,.editorial-htv .pill,.editorial-htv .outline{transition:transform .3s ease,background .3s ease,box-shadow .3s ease}.editorial-htv .pill:hover,.editorial-htv .outline:hover{transform:translateY(-3px);box-shadow:0 10px 25px #15263725}.editorial-htv .hero-bottom svg{animation:htv-bob 2.2s ease-in-out infinite}@keyframes htv-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
 @media(prefers-reduced-motion:reduce){.editorial-htv .hero-img{transform:none}.editorial-htv .hero-bottom svg{animation:none}.editorial-htv .pill,.editorial-htv .outline{transition:none}}
 `}</style>
 <header className="nav"><Link href="/" className="logo">HOME TECH VAULT</Link><nav className="nav-links" aria-label="Primary navigation"><Link href="/login" className="login">Log in</Link><Link href="/signup" className="pill">Get started <ArrowUpRight size={14}/></Link></nav></header>
 <section className="hero" ref={heroRef}><motion.div className="hero-img" style={{backgroundImage:`url("${photographs.exterior}")`,scale:reduced?1:heroScale}}/><div className="hero-overlay"/><motion.div className="hero-content" style={{y:reduced?0:heroTextY,opacity:reduced?1:heroFade}}><span className="eyebrow">A more thoughtful way to own a home</span><h1>Everything that makes a house yours.</h1><p>Appliance details, warranties, manuals and home records. All together, beautifully organized.</p><Link href="/signup" className="pill">Start your free vault <ArrowUpRight size={15}/></Link></motion.div><div className="hero-bottom"><span><ArrowDown size={14}/> SCROLL TO EXPLORE</span><span>01 — 04</span></div></section>
 <motion.section className="intro" {...reveal}><span className="eyebrow" style={{color:"#78866f"}}>THE HOME, REMEMBERED</span><div><h2>Your home has a story.<br/>Keep every detail.</h2><p>The important things about your home shouldn't live in scattered emails, drawers and forgotten folders. Home Tech Vault gives them a place to belong.</p></div></motion.section>
 <section className="scene"><motion.div className="scene-image" role="img" aria-label="Modern kitchen interior" style={{backgroundImage:`url("${photographs.kitchen}")`}} initial={reduced?false:{clipPath:"inset(0 100% 0 0)",scale:1.08}} whileInView={{clipPath:"inset(0 0% 0 0)",scale:1}} viewport={{once:true,amount:.18}} transition={{duration:1.25,ease:[.22,1,.36,1]}}/><motion.div className="scene-copy" {...reveal}><span className="chapter-num">01 / APPLIANCES</span><h2>Know what you own.</h2><p>The model number, purchase details and warranty for your refrigerator should never be a guessing game.</p><motion.div className="record-preview" aria-label="Illustrative appliance record" initial={reduced?false:{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.85,delay:.3}}><div className="record-line"><span>Model & serial number</span><strong><ShieldCheck size={14}/> Saved</strong></div><div className="record-line"><span>Warranty details</span><strong><ShieldCheck size={14}/> Saved</strong></div><div className="record-line"><span>Purchase receipt</span><strong><FileText size={14}/> Saved</strong></div></motion.div><p style={{fontSize:11}}>Illustrative example, not a live account.</p></motion.div></section>
 <section className="scene reverse"><motion.div className="scene-copy" {...reveal}><span className="chapter-num">02 / YOUR RECORDS</span><h2>A place for everything important.</h2><p>Receipts, manuals, maintenance history and documents, organized so you can find what matters when it matters.</p><Link href="/signup" className="pill" style={{marginTop:25}}>Get organized <ArrowUpRight size={15}/></Link></motion.div><motion.div className="scene-image" role="img" aria-label="Warm contemporary living room" style={{backgroundImage:`url("${photographs.living}")`}} initial={reduced?false:{clipPath:"inset(0 0 0 100%)",scale:1.08}} whileInView={{clipPath:"inset(0 0 0 0)",scale:1}} viewport={{once:true,amount:.18}} transition={{duration:1.25,ease:[.22,1,.36,1]}}/></section>
 <section className="statement"><motion.div {...reveal}><span className="eyebrow">A DIFFERENT KIND OF PEACE OF MIND</span><h2>Everything in its place.<br/>Even the things you can't see.</h2><p>When you know where your home's information lives, there's one less thing to worry about.</p></motion.div></section>
 <section className="closing"><House size={27} style={{margin:"auto",color:"#78866f"}}/><h2>Make room for peace of mind.</h2><p>Start with one appliance and build a more organized home, one detail at a time.</p><div className="cta-row"><Link href="/signup" className="pill">Create your free vault <ArrowUpRight size={15}/></Link><a href={appStore} className="app-store-badge" target="_blank" rel="noopener noreferrer" aria-label="Download Home Tech Vault on the App Store"><img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" width="156" height="52" alt="Download on the App Store" loading="lazy"/></a></div></section>
 <HomeMarketingFooter/>
 </main>;
}