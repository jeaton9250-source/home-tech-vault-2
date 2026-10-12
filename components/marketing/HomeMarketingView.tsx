import type { HomepageContent } from "@/lib/cms/schema";
import { MarketingText } from "@/components/marketing/MarketingContent";
import { BookOpen, FileText, Folder, Home, ShieldCheck } from "lucide-react";
import JitterPhone from "./JitterPhone";
import styles from "./JitterHome.module.css";

const explore = [["How it works", "/demo"], ["For Realtors", "/for-realtors"], ["Pricing", "/pricing"], ["Our Story", "/our-story"]];
const company = [["Contact", "/contact"], ["Help Center", "/faq"], ["Privacy", "/privacy"], ["Terms", "/terms"]];

export default function HomeMarketingView({ content }: { content: HomepageContent }) {
  const appStore = content.appStoreLink;
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <a className={styles.brand} href="/" aria-label="Home Tech Vault home"><img src="/images/jitter/logo.webp" alt="" width={38} height={42} /><span>Home Tech Vault</span></a>
          <nav aria-label="Main navigation"><a href="/explore">Explore</a><a href="/for-realtors">For Realtors</a><a href="/pricing">Pricing</a><a className={styles.login} href="/login">Login</a></nav>
        </header>
        {content.announcement && <p className={styles.announcement}>{content.announcement}</p>}
        <section className={styles.hero} aria-label="Your home has a memory">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A smarter home starts here</p>
            <h1>{content.headline.split("\n").map((line, index) => <span key={index}><MarketingText scope="shared">{line}</MarketingText></span>)}</h1>
            <p className={styles.description}>Keep the details that come with your home organized, useful, and ready when you need them.</p>
            <a className={styles.primary} href={appStore}>Download on the App Store</a>
          </div>
          <div className={styles.heroPreview}>
            <div className={styles.details} aria-label="Example saved home information">
              <div><FileText /><p><strong>Model number</strong><small>Saved with your device</small></p></div>
              <div><ShieldCheck /><p><strong>Warranty</strong><small>Know what’s covered</small></p></div>
              <div><BookOpen /><p><strong>Manual found</strong><small>Ready when you need it</small></p></div>
            </div>
            <JitterPhone />
          </div>
        </section>
        <section id="memory" className={styles.cards} aria-label="What your home remembers">
          <article className={`${styles.card} ${styles.bought}`}><span className={styles.quote} aria-hidden="true">“</span><h2>Bought years ago.<br />Needed today.</h2><span className={styles.rule} /><img src="/images/jitter/books-plant.webp" alt="Books and a green houseplant" /></article>
          <article className={`${styles.card} ${styles.documents}`}><Folder aria-hidden="true" /><h2>Manuals,<br />warranties,<br />and receipts.</h2><img src="/images/jitter/documents.webp" alt="A tidy stack of home manuals, warranties, and receipts" /></article>
          <article className={`${styles.card} ${styles.record}`}><Home aria-hidden="true" /><h2>One home.<br />One record.</h2><span className={styles.rule} /><img src="/images/jitter/home-record.webp" alt="Line illustration of a home" /></article>
          <article className={`${styles.card} ${styles.connected}`}><img src="/images/jitter/kitchen.webp" alt="Kitchen appliances and a smart thermostat" /><h2>Everything<br />stays connected.</h2></article>
        </section>
        <section className={styles.banner}><h2>Your home information, finally organized.</h2><a href="/demo">See how it works <span aria-hidden="true">→</span></a></section>
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div><a className={styles.brand} href="/"><Home aria-hidden="true" /><span>Home Tech Vault</span></a><h2>Your home, well remembered.</h2><p>Every device, document, and detail—kept together for the life of your home.</p><a className={styles.footerDownload} href={appStore}>Download on the App Store</a></div>
            {[['Explore', explore], ['Company', company]].map(([title, links]) => <nav key={title as string} aria-label={`${title} footer`}><h3>{title as string}</h3>{(links as string[][]).map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>)}
          </div>
          <div className={styles.footerBottom}><p>© {new Date().getFullYear()} Home Tech Vault</p><p>Built for the moments you need it most.</p></div>
        </footer>
      </div>
    </main>
  );
}
