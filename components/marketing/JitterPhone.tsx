"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./JitterHome.module.css";

export default function JitterPhone() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (preference.matches) video.current?.pause();
      else void video.current?.play().catch(() => setPlaying(false));
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return (
    <div className={styles.phone}>
      <video ref={video} muted loop playsInline preload="metadata" poster="/images/jitter/phone-poster.jpg" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} aria-label="Animated preview of the Home Tech Vault iPhone dashboard">
        <source src="/videos/htv-phone.mp4" type="video/mp4" />
        Your browser does not support video. <a href="/demo">Explore the interactive demo.</a>
      </video>
      <button type="button" className={styles.motionButton} onClick={() => {
        if (playing) video.current?.pause();
        else void video.current?.play().catch(() => setPlaying(false));
      }} aria-label={playing ? "Pause phone animation" : "Play phone animation"}>{playing ? "Pause animation" : "Play animation"}</button>
    </div>
  );
}
