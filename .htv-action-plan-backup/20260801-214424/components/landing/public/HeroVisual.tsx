"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";

import {
  LANDING_HERO_DEVICES,
  LANDING_HOME_HEALTH,
} from "@/lib/marketing/landingPublicContent";

export default function HeroVisual() {
  const [activeTab, setActiveTab] = useState<"health" | "advisor" | "devices">("health");

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Ambient background glow halo */}
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-home-health-soft via-premium-soft to-interaction-soft opacity-80 blur-3xl -z-10" />

      {/* Floating Dashboard Card 1 — Top Left */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-5 -left-4 z-20 htv-glass-pill px-4 py-2.5 shadow-lift flex items-center gap-2.5 text-xs font-semibold text-text-primary border border-border-subtle/80 bg-surface-card/95 backdrop-blur-md"
      >
        <span className="flex h-2.5 w-2.5 rounded-full bg-home-health animate-pulse" />
        <span className="truncate">Living Room Network · Optimal</span>
      </motion.div>

      {/* Floating Dashboard Card 2 — Bottom Right */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-6 -right-4 z-20 htv-glass-pill px-4 py-2.5 shadow-lift flex items-center gap-2.5 text-xs font-semibold text-text-primary border border-border-subtle/80 bg-surface-card/95 backdrop-blur-md"
      >
        <Sparkles size={14} className="text-premium shrink-0" />
        <span className="truncate">Home Advisor: 1 Warranty Auto-Protected</span>
      </motion.div>

      {/* Floating Dashboard Card 3 — Mid Right */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="hidden sm:flex absolute top-24 -right-6 z-20 htv-glass-card px-3.5 py-2 shadow-md items-center gap-2 text-xs font-medium text-text-secondary bg-surface-card/90 backdrop-blur-md border border-border-subtle"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-home-health-soft text-home-health font-bold text-xs">
          98%
        </div>
        <div>
          <p className="text-[11px] font-semibold text-text-primary">System Health</p>
          <p className="text-[10px] text-home-health">34 Connected Hubs</p>
        </div>
      </motion.div>

      {/* Main Glass Operating System Frame */}
      <div className="htv-glass-card-elevated relative overflow-hidden p-5 sm:p-7 border border-border-subtle shadow-lift rounded-[28px] bg-surface-card/95 backdrop-blur-xl">
        {/* Window Chrome / OS Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/60 pb-4">
          <div className="flex items-center gap-3">
            {/* macOS-style Window control dots */}
            <div className="flex items-center gap-1.5 mr-1">
              <span className="h-3 w-3 rounded-full bg-rose-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-home-health-soft text-home-health font-bold shadow-sm">
                <ShieldCheck size={17} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Home Tech Vault
                </p>
                <p className="text-xs sm:text-sm font-semibold text-text-primary">
                  Highland Park Sanctuary
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-sunken/80 p-1 rounded-full border border-border-subtle/60 text-xs">
            <button
              onClick={() => setActiveTab("health")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                activeTab === "health"
                  ? "bg-surface-card text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Home Health
            </button>
            <button
              onClick={() => setActiveTab("advisor")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                activeTab === "advisor"
                  ? "bg-surface-card text-premium shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Advisor
            </button>
            <button
              onClick={() => setActiveTab("devices")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                activeTab === "devices"
                  ? "bg-surface-card text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Devices
            </button>
          </div>
        </div>

        {/* Dynamic OS Workspace Content */}
        <div className="mt-5 min-h-[280px]">
          <AnimatePresence mode="wait">
            {activeTab === "health" && (
              <motion.div
                key="health-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Health Score Dial & Overview */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr] sm:items-center bg-surface-sunken/50 p-4 rounded-2xl border border-border-subtle/50">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-card border-2 border-home-health/40 shadow-inner mx-auto sm:mx-0">
                    <span className="text-xl font-bold text-text-primary tracking-tight">
                      {LANDING_HOME_HEALTH.score}%
                    </span>
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-home-health opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-home-health" />
                    </span>
                  </div>

                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Overall Home Health
                      </span>
                      <span className="htv-glass-pill px-2 py-0.5 text-[10px] font-semibold text-home-health bg-home-health-soft/90 border-home-health/20">
                        Protected
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-home-health mt-0.5">
                      {LANDING_HOME_HEALTH.status}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      34 Connected Hubs · 12 Active Warranties · 0 Issues
                    </p>
                  </div>
                </div>

                {/* Live Real-Time Guidance Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      Live Home System Pulse
                    </p>
                    <span className="text-[11px] font-medium text-interaction flex items-center gap-1">
                      <Activity size={12} className="animate-pulse" /> Real-time active
                    </span>
                  </div>

                  {LANDING_HOME_HEALTH.insights.map((insight) => (
                    <div
                      key={insight.title}
                      className="htv-glass-card flex items-center justify-between gap-3 p-3 transition-all hover:translate-x-1 border border-border-subtle/80 bg-surface-card/80"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                            insight.tone === "attention"
                              ? "bg-warning-soft text-warning"
                              : "bg-home-health-soft text-home-health"
                          }`}
                        >
                          {insight.tone === "attention" ? <Cpu size={15} /> : <Wifi size={15} />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-text-primary">
                            {insight.title}
                          </p>
                          <p className="truncate text-[11px] text-text-muted">
                            {insight.detail}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          insight.tone === "attention"
                            ? "bg-warning-soft text-warning border border-warning/20"
                            : "bg-home-health-soft text-home-health border border-home-health/20"
                        }`}
                      >
                        {insight.tone === "attention" ? "Action Ready" : "Protected"}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "advisor" && (
              <motion.div
                key="advisor-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Home Advisor AI Card */}
                <div className="bg-gradient-to-r from-premium-soft via-surface-card to-home-health-soft p-4 rounded-2xl border border-premium/20 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-premium text-white shadow-md">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-premium">AI Home Advisor</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      &quot;I noticed your LG OLED TV warranty expires next month. Would you like me to prepare an extended warranty audit?&quot;
                    </p>
                  </div>
                </div>

                {/* Search Bar Prompt */}
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    readOnly
                    value="Is everything in my living room protected?"
                    className="w-full rounded-xl border border-border-subtle bg-surface-sunken/60 pl-9 pr-24 py-2.5 text-xs text-text-primary focus:outline-none cursor-default font-medium"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-charcoal px-2.5 py-1 text-[10px] font-semibold text-white">
                    Ask Advisor
                  </span>
                </div>

                {/* Proactive Recommendations */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Proactive Insights
                  </p>

                  <div className="htv-glass-card p-3 flex items-center justify-between border border-border-subtle">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-home-health-soft text-home-health">
                        <CheckCircle2 size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">Receipt &amp; Serial Auto-Linked</p>
                        <p className="text-[11px] text-text-muted">Sonos Arc · Purchase date Sep 2024</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-home-health bg-home-health-soft px-2 py-0.5 rounded-full">
                      Auto-Filed
                    </span>
                  </div>

                  <div className="htv-glass-card p-3 flex items-center justify-between border border-border-subtle">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-interaction-soft text-interaction">
                        <Zap size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">Firmware Update Available</p>
                        <p className="text-[11px] text-text-muted">Eero Pro 6E Router · Security patch ready</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-interaction bg-interaction-soft px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "devices" && (
              <motion.div
                key="devices-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Connected Hardware Nodes (34 Total)
                  </p>
                  <span className="text-[11px] font-semibold text-home-health">
                    100% Online
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {LANDING_HERO_DEVICES.map((device) => (
                    <div
                      key={device.name}
                      className="htv-glass-card p-3 flex items-center gap-2.5 border border-border-subtle/80 hover:border-home-health/40 transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-home-health shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-text-primary">
                          {device.name}
                        </p>
                        <p className="truncate text-[10px] text-text-muted">
                          {device.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer OS Status Ribbon */}
        <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center justify-between text-[11px] text-text-muted">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock size={12} className="text-home-health" /> Encrypted Local Vault
          </span>
          <span className="font-semibold text-text-primary">
            Home Tech Vault · All Systems Normal
          </span>
        </div>
      </div>
    </div>
  );
}
