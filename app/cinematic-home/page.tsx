"use client";
import {useRef} from "react";
import {motion,useScroll,useTransform,useReducedMotion} from "framer-motion";
import Link from "next/link";
import {ArrowUpRight,ArrowDown,Check,FileText,ShieldCheck,Refrigerator,House} from "lucide-react";
import HomeMarketingFooter from "@/components/marketing/HomeMarketingFooter";

const room="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=85";
const store="https://apps.apple.com/app/id6812090967";
export default function CinematicHome(){
 const scene=useRef<HTMLElement>(null);
 const reduce=useReducedMotion();
 const {scrollYProgress:p}=useScroll({target:scene,offset:["start start","end end"]});
 const camera=useTransform(p,[0,.28,.55,1],[1,1.13,1.26,1.07]);
 const brightness=useTransform(p,[0,.35,.75,1],[.68,.75,.96,1.12]);
 const filter=useTransform(brightness,(v:number)=>`brightness(${v})`);
 const opening=useTransform(p,[0,.12,.22],[1,1,0]);
 const first=useTransform(p,[.22,.32,.45,.53],[0,1,1,0]);
 const second=useTransform(p,[.51,.6,.72,.8],[0,1,1,0]);
 const ending=useTransform(p,[.79,.9],[0,1]);
 const progress=useTransform(p,[0,1],["0%","100%"]);
 return <main className="htv-cinema">
 <style jsx global>{`
 .htv-cinema{--navy:#142438;--ivory:#f6f2e9;--olive:#87967b;background:var(--ivory);color:var(--navy);overflow:clip}
 .htv-cinema *{box-sizing:border-box}.htv-cinema a{text-decoration:none}.htv-cinema h1,.htv-cinema h2{font-family:Georgia,serif;font-weight:400;letter-spacing:-.055em}
 .htv-cinema .topbar{height:70px;padding:0 clamp(18px,5vw,80px);display:flex;justify-content:space-between;align-items:center;background:var(--ivory);gap:15px}
 .htv-cinema .wordmark{font-size:13px;font-weight:800;letter-spacing:.16em}.htv-cinema .top-actions{display:flex;align-items:center;gap:20px;font-size:12px;font-weight:700}
 .htv-cinema .top-actions a:last-child,.htv-cinema .action{background:var(--navy);color:white;padding:13px 19px;border-radius:30px;display:inline-flex;align-items:center;gap:9px;font-size:12px;font-weight:700}
 .htv-cinema .scene{height:410vh;position:relative;background:#111d23}.htv-cinema .sticky{position:sticky;top:0;height:100svh;overflow:hidden;isolation:isolate;color:#fff}
 .htv-cinema .room{position:absolute;inset:-5%;background-position:center;background-size:cover;z-index:-2;transform-origin:center center}
 .htv-cinema .room-shade{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#07111b85,#07111b12 65%),linear-gradient(0deg,#07111b66,transparent 55%)}
 .htv-cinema .frame{position:absolute;inset:0;padding:clamp(24px,6vw,100px);display:flex;flex-direction:column;justify-content:center;pointer-events:none}
 .htv-cinema .frame a{pointer-events:auto}.htv-cinema .kicker{font-size:10px;letter-spacing:.25em;text-transform:uppercase;font-weight:800;color:#d9e0d0}
 .htv-cinema .opening{align-items:flex-start}.htv-cinema .opening h1{font-size:clamp(45px,6.5vw,108px);line-height:1.04;max-width:620px;margin:18px 0}
 .htv-cinema .opening p{font-size:clamp(15px,1.5vw,20px);line-height:1.6;max-width:420px;color:#e7e8e5}
 .htv-cinema .opening .action{margin-top:24px;background:var(--ivory);color:var(--navy)}
 .htv-cinema .spot{align-items:flex-end}.htv-cinema .spot-inner{width:min(390px,90%);padding:24px;background:#f6f2e9f2;color:var(--navy);border-radius:5px;box-shadow:0 20px 60px #0003;backdrop-filter:blur(12px)}
 .htv-cinema .spot h2{font-size:clamp(30px,3.6vw,48px);line-height:1.1;margin:12px 0}.htv-cinema .spot p{font-size:14px;line-height:1.6;color:#4f5c62}
 .htv-cinema .record{border-top:1px solid #d6dbd1;padding:15px 0;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px}.htv-cinema .record:first-of-type{margin-top:17px}.htv-cinema .record strong{font-size:12px}.htv-cinema .saved{color:#56744c;display:flex;align-items:center;gap:5px;font-weight:750}
 .htv-cinema .hotspot{position:absolute;left:62%;top:42%;width:14px;height:14px;background:#e5f1dd;border:3px solid white;border-radius:50%;box-shadow:0 0 0 13px #ffffff2b,0 0 0 30px #ffffff12;pointer-events:none}
 .htv-cinema .hotspot.second{left:28%;top:62%}
 .htv-cinema .finish{align-items:flex-start}.htv-cinema .finish h2{font-size:clamp(49px,7vw,105px);line-height:1.04;max-width:700px;margin:18px 0}.htv-cinema .finish p{font-size:17px;line-height:1.65;max-width:440px;color:#f1f2ec}
 .htv-cinema .progress-track{position:absolute;bottom:0;left:0;right:0;height:3px;background:#ffffff4d}.htv-cinema .progress-fill{height:100%;background:#c4d7b7}
 .htv-cinema .scene-label{position:absolute;left:clamp(24px,6vw,100px);bottom:32px;font-size:10px;letter-spacing:.2em;display:flex;align-items:center;gap:12px}
 .htv-cinema .outro{background:var(--ivory);padding:clamp(90px,12vw,170px) 7%;text-align:center}.htv-cinema .outro h2{font-size:clamp(43px,7vw,100px);line-height:1.06;max-width:850px;margin:18px auto}.htv-cinema .outro p{line-height:1.7;color:#53616a;max-width:510px;margin:0 auto 30px}
 .htv-cinema .buttons{display:flex;justify-content:center;gap:13px;flex-wrap:wrap}.htv-cinema .outline{border:1px solid var(--navy);border-radius:30px;padding:13px 19px;color:var(--navy);font-size:12px;font-weight:750}
 @media(max-width:720px){.htv-cinema .topbar{height:62px}.htv-cinema .wordmark{font-size:11px}.htv-cinema .top-actions{gap:10px}.htv-cinema .top-actions .login{display:none}.htv-cinema .top-actions a:last-child{padding:11px 13px}.htv-cinema .scene{height:360vh}.htv-cinema .room{background-position:56% center}.htv-cinema .frame{padding:30px 24px 70px}.htv-cinema .opening{justify-content:flex-start;padding-top:16svh}.htv-cinema .opening h1{font-size:clamp(46px,12vw,70px);max-width:360px}.htv-cinema .opening p{max-width:310px;font-size:15px}.htv-cinema .spot{justify-content:flex-end;align-items:center;padding-bottom:15svh}.htv-cinema .spot-inner{width:min(100%,370px);padding:20px}.htv-cinema .spot h2{font-size:34px}.htv-cinema .finish{justify-content:center}.htv-cinema .finish h2{font-size:clamp(48px,12vw,70px)}.htv-cinema .hotspot{left:65%;top:31%}.htv-cinema .hotspot.second{left:24%;top:43%}}
 @media(prefers-reduced-motion:reduce){.htv-cinema .scene{height:100svh}.htv-cinema .scene-label{display:none}}
 `}</style>
 <header className="topbar"><Link className="wordmark" href="/">HOME TECH VAULT</Link><nav className="top-actions" aria-label="Primary navigation"><Link className="login" href="/login">Log in</Link><Link href="/signup">Get started <ArrowUpRight size={14}/></Link></nav></header>
 <section className="scene" ref={scene} aria-label="A home with everything in its place"><div className="sticky">
 <motion.div className="room" style={{backgroundImage:`url("${room}")`,scale:reduce?1:camera,filter:reduce?"brightness(.85)":filter}}/>
 <div className="room-shade"/>
 <motion.div className="frame opening" style={{opacity:reduce?1:opening}}><span className="kicker">HOME TECH VAULT / 01</span><h1>Know your home.<br/>Down to the details.</h1><p>Receipts in emails. Manuals in drawers. Warranty information you can never find.</p><Link href="/signup" className="action">Organize your home <ArrowUpRight size={15}/></Link></motion.div>
 {!reduce&&<><motion.div className="hotspot" style={{opacity:first}}/><motion.div className="frame spot" style={{opacity:first}}><div className="spot-inner"><span className="kicker" style={{color:"#78856c"}}>02 / YOUR APPLIANCES</span><h2>One appliance.<br/>Every detail.</h2><p>Everything about your refrigerator, exactly where you'd expect to find it.</p><div className="record"><span>Model & serial number</span><span className="saved"><Check size={14}/> Saved</span></div><div className="record"><span>Warranty</span><span className="saved"><ShieldCheck size={14}/> Saved</span></div><div className="record"><span>Purchase receipt</span><span className="saved"><FileText size={14}/> Saved</span></div><p style={{fontSize:10,marginTop:12}}>Illustrative example of an organized appliance record.</p></div></motion.div>
 <motion.div className="hotspot second" style={{opacity:second}}/><motion.div className="frame spot" style={{opacity:second}}><div className="spot-inner"><span className="kicker" style={{color:"#78856c"}}>03 / HOME RECORDS</span><h2>Nothing lost.<br/>Nothing forgotten.</h2><p>Manuals, maintenance history and documents, organized around the home you already know.</p><div className="record"><span>Appliance manuals</span><span className="saved"><Check size={14}/> Organized</span></div><div className="record"><span>Maintenance records</span><span className="saved"><Check size={14}/> Organized</span></div><div className="record"><span>Important documents</span><span className="saved"><Check size={14}/> Organized</span></div></div></motion.div>
 <motion.div className="frame finish" style={{opacity:ending}}><span className="kicker">04 / EVERYTHING IN ITS PLACE</span><h2>Peace of mind,<br/>built into your home.</h2><p>The same home. Now you know where its important details live.</p></motion.div></>}
 <div className="scene-label"><ArrowDown size={14}/> SCROLL TO EXPLORE</div><div className="progress-track"><motion.div className="progress-fill" style={{width:progress}}/></div>
 </div></section>
 <section className="outro"><House size={28} style={{margin:"auto",color:"#78856c"}}/><h2>Everything in its place.<br/>Even the things you can't see.</h2><p>Start with one appliance. Give your home a place for every receipt, warranty, manual and record.</p><div className="buttons"><Link className="action" href="/signup">Create your free vault <ArrowUpRight size={15}/></Link><a className="outline" href={store} target="_blank" rel="noopener noreferrer">Get the iPhone app</a></div></section>
 <HomeMarketingFooter/>
 </main>;
}