"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileText, ShieldCheck, Sparkles } from "lucide-react";

export default function LiquidGlassHero() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -right-24 top-[12%] hidden h-72 w-72 rounded-full bg-[#e3d9a0]/25 blur-3xl lg:block"
        animate={reduceMotion ? undefined : { x: [0, -34, 0], y: [0, 25, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[5%] top-[20%] hidden w-[310px] rounded-[30px] border border-white/65 bg-white/25 p-5 shadow-[0_22px_85px_rgba(16,33,53,0.13),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl lg:block xl:right-[9%]"
        initial={reduceMotion ? false : { opacity: 0, y: 30 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: [0, -9, 0] }}
        transition={reduceMotion ? undefined : { opacity: { duration: 0.8, delay: 0.3 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.13em] text-[#18283b]/70">YOUR HOME VAULT</span>
          <Sparkles className="h-4 w-4 text-[#a5a052]" />
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/35 p-3">
          <div className="rounded-xl bg-white/55 p-2"><FileText className="h-5 w-5 text-[#18283b]" /></div>
          <div><p className="text-sm font-semibold text-[#18283b]">Appliance manual</p><p className="text-xs text-[#18283b]/60">Always within reach</p></div>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/35 p-3">
          <div className="rounded-xl bg-white/55 p-2"><ShieldCheck className="h-5 w-5 text-[#18283b]" /></div>
          <div><p className="text-sm font-semibold text-[#18283b]">Warranty details</p><p className="text-xs text-[#18283b]/60">Saved in one place</p></div>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/30 via-transparent to-white/10" />
      </motion.div>
    </div>
  );
}
