"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";
import AuroraBg from "@/app/components/AuroraBg";

// ── Hooks ──────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800, enabled = true) {
  const [v, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) { setValue(0); return; }
    let raf: number;
    let start: number | null = null;
    const tick = (t: number) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setValue(target * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return v;
}

function useRevealAll() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function formatEUR(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}

// ── Magnetic button ────────────────────────────────────────────────────────

function MagneticBtn({ className, children, href, ...rest }: { className?: string; children: React.ReactNode; href: string; [k: string]: unknown }) {
  const ref = useRef<HTMLAnchorElement>(null);
  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    if (ref.current) ref.current.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
  }
  function onLeave() { if (ref.current) ref.current.style.transform = ""; }
  return (
    <Link ref={ref} href={href} className={`btn magnetic ${className ?? ""}`}
      onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>{children}</Link>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "#fonctionnalites",  label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs",           label: "Tarifs" },
  { href: "/faq",              label: "F.A.Q." },
  { href: "/a-propos",         label: "À propos" },
];

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
  }, []);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setMenuOpen(false);
  }

  return (
    <nav className="nav" data-scrolled={scrolled ? "1" : "0"}>
      <div className="wrap nav-inner">

        {/* Logo */}
        <Link href="/" className="logo-link">
          <Logo size={28} />
          <span>Claim<span style={{ opacity: 0.5 }}>.</span>e</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {NAV_LINKS.map(({ href, label }) =>
            href.startsWith("#") ? (
              <a key={href} href={href}>{label}</a>
            ) : (
              <Link key={href} href={href}>{label}</Link>
            )
          )}
        </div>

        {/* CTA */}
        <div className="nav-cta">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="btn btn-primary">📦 Dashboard</Link>
              <button onClick={logout} className="btn btn-ghost">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Se connecter</Link>
              <Link href="/signup" className="btn btn-primary">Essayer<span className="arr">→</span></Link>
            </>
          )}
          {/* Hamburger — visible uniquement sous 980px */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="nav-hamburger"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
          >
            <span style={{ transform: menuOpen ? "rotate(45deg) translateY(7px)" : undefined }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : undefined }} />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div className={`nav-mobile${menuOpen ? " open" : ""}`}>
        <div className="wrap nav-mobile-inner">
          {NAV_LINKS.map(({ href, label }) =>
            href.startsWith("#") ? (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ) : (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</Link>
            )
          )}
          <div className="nav-mobile-divider" />
          <div className="nav-mobile-cta">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="btn btn-primary" onClick={() => setMenuOpen(false)}>📦 Dashboard</Link>
                <button onClick={logout} className="btn btn-ghost">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>Se connecter</Link>
                <Link href="/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Essayer →</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── FloatingCard ────────────────────────────────────────────────────────────

function FloatingCard() {
  const [phase, setPhase] = useState(0);
  const amount = useCountUp(phase >= 1 ? 1250 : 0, 1600, phase >= 1);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase < 1) return;
    const t = setTimeout(() => {
      setPhase(0);
      setTimeout(() => setPhase(1), 700);
    }, 6500);
    return () => clearTimeout(t);
  }, [phase]);

  const sparkPath = "M0 50 L22 42 L50 36 L80 28 L108 20 L135 12 L163 6 L200 1";

  return (
    <div className="float-card">
      <div className="fc-status">
        <span className="fc-check">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span>Réclamation réussie</span>
      </div>
      <p className="fc-label">Remboursement obtenu</p>
      <p className="fc-amount-line">
        <span className="sign">+</span>
        <span>€</span>
        <span>{formatEUR(amount)}</span>
        <span className="dec">,00</span>
      </p>
      <div className="fc-evo">
        <span className="fc-evo-lbl">Évolution</span>
        <span className="fc-evo-val">▲ +12%</span>
      </div>
      <svg viewBox="0 0 200 52" className="fc-spark-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="1" stopColor="#1a56ff" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path
          d={`${sparkPath} L 200 52 L 0 52 Z`} fill="url(#gf)"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity .6s .4s" }}
        />
        <path
          d={sparkPath} stroke="#06b6d4" strokeWidth="2.2" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
          pathLength={100} strokeDasharray={100}
          strokeDashoffset={phase >= 1 ? 0 : 100}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.3,.7,.2,1) .2s" }}
        />
        <circle cx="200" cy="1" r="3.5" fill="#06b6d4"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity .4s 1.4s" }} />
        <circle cx="200" cy="1" r="6" fill="#06b6d4" fillOpacity="0.2"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity .4s 1.4s" }}>
          <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

// ── Box3D ───────────────────────────────────────────────────────────────────

function Box3D() {
  return (
    <div className="box3d-wrap">
      <div className="box3d-glow" />
      <div className="box3d-inner">
        <svg viewBox="0 0 320 310" fill="none" xmlns="http://www.w3.org/2000/svg" className="box3d-svg">
          <defs>
            <linearGradient id="bf" x1="20" y1="70" x2="235" y2="275" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1c2f50" /><stop offset="1" stopColor="#0f1a2e" />
            </linearGradient>
            <linearGradient id="bt" x1="20" y1="30" x2="285" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2a4268" /><stop offset="1" stopColor="#1a3050" />
            </linearGradient>
            <linearGradient id="br" x1="235" y1="70" x2="285" y2="275" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0c1624" /><stop offset="1" stopColor="#080e1a" />
            </linearGradient>
            <linearGradient id="bedge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop stopColor="#06b6d4" /><stop offset="1" stopColor="#1a56ff" />
            </linearGradient>
            <linearGradient id="logo-f" x1="4" y1="8" x2="52" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" /><stop offset="1" stopColor="#1a56ff" />
            </linearGradient>
          </defs>
          <ellipse cx="152" cy="300" rx="118" ry="11" fill="#000" opacity="0.30" />
          <path d="M20 70 L235 70 L235 275 L20 275 Z" fill="url(#bf)" />
          <path d="M20 70 L70 30 L285 30 L235 70 Z" fill="url(#bt)" />
          <path d="M235 70 L285 30 L285 195 L235 275 Z" fill="url(#br)" />
          <path d="M20 70 L235 70 L235 275 L20 275 Z" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none" />
          <path d="M20 70 L70 30 L285 30 L235 70" stroke="rgba(255,255,255,0.09)" strokeWidth="1" fill="none" />
          <path d="M235 70 L285 30 L285 195 L235 275" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
          <path d="M20 70 L235 70" stroke="url(#bedge)" strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="stroke-opacity" values=".7;1;.7" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M20 70 L20 275" stroke="rgba(6,182,212,0.25)" strokeWidth="1.5" />
          <path d="M20 70 L90 70 L90 100 L20 100 Z" fill="white" opacity="0.025" />
          <g transform="translate(42, 128) scale(1.5)">
            <path d="M 45 38 A 20 20 0 1 1 45 18" stroke="url(#logo-f)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <polygon points="48,23 40,17 47,13" fill="url(#logo-f)" />
            <path d="M28 21 L36 25.5 L28 30 L20 25.5 Z" fill="url(#logo-f)" opacity="0.95" />
            <path d="M20 25.5 L28 30 L28 39 L20 34.5 Z" fill="#1a3a9f" />
            <path d="M28 30 L36 25.5 L36 34.5 L28 39 Z" fill="#2045c0" />
            <path d="M28 21 L36 25.5 L28 30 L20 25.5 Z" fill="white" opacity="0.18" />
          </g>
          <text x="70" y="248" textAnchor="middle" fill="white" fillOpacity="0.35"
            fontSize="11" fontFamily="Sora,sans-serif" fontWeight="700" letterSpacing="3">CLAIM.e</text>
        </svg>
        <FloatingCard />
      </div>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow reveal">
            <i className="dot" />
            Audit logistique automatisé
          </span>
          <h1 className="reveal" data-delay="1">
            Récupérez l&apos;argent{" "}
            <span className="em">perdu sur vos livraisons</span>
          </h1>
          <p className="lead reveal" data-delay="2">
            Claim.e détecte automatiquement les erreurs de vos transporteurs :
            retards, colis perdus, SLA non respectés, et récupère l&apos;argent pour vous.
          </p>
          <div className="hero-cta reveal" data-delay="3">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Analyser mes livraisons<span className="arr">→</span>
            </Link>
            <a href="#comment-ca-marche" className="btn btn-ghost btn-lg">
              Voir comment ça marche
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <Box3D />
        </div>
      </div>
    </section>
  );
}

// ── Features ────────────────────────────────────────────────────────────────

const FEATURES = [
  { e: "🔍", t: "Détection automatique",    p: "Nous identifions efficacement les litiges de livraison en temps réel." },
  { e: "📋", t: "Réclamations gérées",      p: "Nous négocions avec les transporteurs à votre place." },
  { e: "💶", t: "Remboursements récupérés", p: "Vous recevez ce qui vous revient, simplement." },
  { e: "🔗", t: "Connexion facile",         p: "Shopify, WooCommerce, Sendcloud ou webhook universel — connecté en minutes." },
  { e: "📊", t: "Dashboard en temps réel",  p: "Suivez vos anomalies, réclamations et remboursements en un coup d'œil." },
  { e: "🛡️", t: "Protection continue",     p: "Surveillance 24/7 de toutes vos expéditions sans intervention manuelle." },
];

function FeatureCard({ e, t, p, delay }: { e: string; t: string; p: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(ev: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ref.current?.style.setProperty("--mx", `${((ev.clientX - r.left) / r.width) * 100}%`);
    ref.current?.style.setProperty("--my", `${((ev.clientY - r.top) / r.height) * 100}%`);
  }
  return (
    <div ref={ref} className="feature reveal" data-delay={String(delay)} onMouseMove={onMove}>
      <div className="feature-emoji">{e}</div>
      <h3>{t}</h3>
      <p>{p}</p>
      <div className="feature-arrow">→</div>
    </div>
  );
}

function Features() {
  return (
    <section id="fonctionnalites" className="section">
      <div className="wrap">
        <div className="section-head">
          <div style={{marginBottom:'18px'}}><span className="eyebrow"><i className="dot" />Fonctionnalités</span></div>
          <h2 className="reveal">Simple, transparent, <span className="em">efficace.</span></h2>
          <p className="sub reveal" data-delay="1">
            Tout ce dont vous avez besoin pour récupérer l&apos;argent que vos transporteurs vous doivent.
          </p>
        </div>
        <div className="features">
          {FEATURES.map((f, i) => <FeatureCard key={f.t} {...f} delay={(i % 3) + 1} />)}
        </div>
      </div>
    </section>
  );
}

// ── Step viz components ─────────────────────────────────────────────────────

function VizConnect() {
  return (
    <svg viewBox="0 0 300 180" width="100%" height="100%" className="viz-connect">
      <defs>
        <linearGradient id="hub-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a56ff" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {[
        { x1: 30, y1: 30, x2: 150, y2: 90 },
        { x1: 270, y1: 30, x2: 150, y2: 90 },
        { x1: 30, y1: 150, x2: 150, y2: 90 },
        { x1: 270, y1: 150, x2: 150, y2: 90 },
      ].map((l, i) => (
        <line key={i} {...l} stroke="#1a2d45" strokeWidth="1" strokeDasharray="3 3">
          <animate attributeName="stroke-dashoffset" values="0;-6" dur="1.4s" repeatCount="indefinite" />
        </line>
      ))}
      <circle cx="150" cy="90" r="22" fill="url(#hub-grad)" />
      <circle cx="150" cy="90" r="22" fill="none" stroke="#06b6d4" strokeWidth="2">
        <animate attributeName="r" values="22;36;22" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".7;0;.7" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <text x="150" y="94" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="Sora,sans-serif">e</text>
      {[
        { x: 8,   y: 12,  label: "Shopify" },
        { x: 218, y: 12,  label: "WooCom." },
        { x: 8,   y: 132, label: "Sendcloud" },
        { x: 218, y: 132, label: "CSV" },
      ].map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={c.y} width="74" height="36" rx="8" fill="#141f35" stroke="#1a2d45" />
          <text x={c.x + 37} y={c.y + 22} textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="Sora,sans-serif" fontWeight="500">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function VizScan() {
  return (
    <div className="viz-scan-2">
      <div className="vs-grid">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className={`vs-cell${[8, 16, 24, 32].includes(i) ? " hit" : ""}`} />
        ))}
      </div>
      <div className="vs-beam" />
      <div className="vs-label">
        <span className="vs-pill">3 anomalies détectées</span>
      </div>
    </div>
  );
}

function VizMail() {
  return (
    <div className="viz-mail-2">
      <div className="vm-stack">
        <div className="vm-paper vm-p3">Réclamation #2845</div>
        <div className="vm-paper vm-p2">Réclamation #2846</div>
        <div className="vm-paper vm-p1">
          <div className="vm-row"><span /><span /></div>
          <div className="vm-row narrow"><span /></div>
          <div className="vm-stamp">PAYÉ</div>
        </div>
      </div>
    </div>
  );
}

// ── Steps ───────────────────────────────────────────────────────────────────

const STEPS: { n: string; title: string; p: string; tags: string[]; viz: React.ReactNode }[] = [
  {
    n: "01", title: "Connectez votre boutique",
    p: "Shopify, WooCommerce, PrestaShop, Sendcloud — une simple connexion et vos commandes arrivent automatiquement. Import CSV disponible pour les autres.",
    tags: ["Webhook universel", "Shopify", "Sendcloud", "CSV"],
    viz: <VizConnect />,
  },
  {
    n: "02", title: "Détection automatique",
    p: "Notre moteur analyse chaque livraison dès réception et identifie retards, colis perdus et SLA non respectés.",
    tags: ["Analyse en temps réel", "98% de taux de détection"],
    viz: <VizScan />,
  },
  {
    n: "03", title: "Réclamations & remboursements",
    p: "Claim.e génère les réclamations et suit les remboursements jusqu'au paiement.",
    tags: ["Suivi automatique jusqu'au remboursement"],
    viz: <VizMail />,
  },
];

function Steps() {
  return (
    <section id="comment-ca-marche" className="section section-alt">
      <div className="wrap">
        <div className="section-head">
          <div style={{marginBottom:'18px'}}><span className="eyebrow"><i className="dot" />Comment ça marche</span></div>
          <h2 className="reveal">Récupérez de l&apos;argent <span className="em">en 3 étapes simples</span></h2>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className="step reveal" data-delay={String(i + 1)}>
              <div className="step-num">{s.n}</div>
              <div className="step-viz">{s.viz}</div>
              <h3>{s.title}</h3>
              <p>{s.p}</p>
              <div className="step-tags">
                {s.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Anomalies ───────────────────────────────────────────────────────────────

const ANOMALY_ITEMS = [
  { e: "⏱",  t: "Retard de livraison" },
  { e: "📦", t: "Colis perdu" },
  { e: "💸", t: "Surfacturation" },
  { e: "⚠️", t: "SLA non respecté" },
  { e: "🔄", t: "Livraison partielle" },
  { e: "🏷",  t: "Erreur de facturation" },
  { e: "💥", t: "Colis endommagé" },
  { e: "📋", t: "Erreur de tracking" },
];

function Anomalies() {
  return (
    <section id="anomalies" className="section">
      <div className="wrap">
        <div className="section-head">
          <div style={{marginBottom:'18px'}}><span className="eyebrow"><i className="dot" />Anomalies détectées</span></div>
          <h2 className="reveal">Toutes les erreurs que vous ratez <span className="em">actuellement</span></h2>
          <p className="sub reveal" data-delay="1">
            Claim.e analyse automatiquement 8 types d&apos;anomalies sur chaque livraison.
          </p>
        </div>
        <div className="anomalies-grid">
          {ANOMALY_ITEMS.map((it, i) => (
            <div key={it.t} className="anomaly reveal" data-delay={String((i % 4) + 1)}>
              <span className="anomaly-emoji">{it.e}</span>
              <span className="anomaly-label">{it.t}</span>
              <span className="anomaly-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ─────────────────────────────────────────────────────────────────

function Check({ on = true }: { on?: boolean }) {
  return on ? (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="rgba(6,182,212,.18)" />
      <path d="M4.5 8.3 6.7 10.5 11.5 5.5" fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,.06)" />
      <path d="M5 5 L11 11 M11 5 L5 11" fill="none" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const STARTER_FEATS: [boolean, string][] = [
  [true,  "Jusqu'à 500 livraisons/mois"],
  [true,  "Détection automatique d'anomalies"],
  [true,  "Dashboard en temps réel"],
  [true,  "Import CSV manuel"],
  [true,  "Export PDF des rapports"],
  [false, "Connexion automatique (Shopify, Sendcloud…)"],
  [false, "Webhook universel (WooCommerce, PrestaShop…)"],
  [false, "Envoi automatique des réclamations"],
  [false, "Support prioritaire 24/7"],
];

const PRO_FEATS: [boolean, string][] = [
  [true, "Livraisons illimitées"],
  [true, "Détection automatique d'anomalies"],
  [true, "Dashboard en temps réel"],
  [true, "Connexion Shopify & Sendcloud automatique"],
  [true, "Webhook universel (WooCommerce, PrestaShop…)"],
  [true, "Synchronisation quotidienne automatique"],
  [true, "Envoi automatique des réclamations"],
  [true, "Support prioritaire 24/7"],
];

function Pricing() {
  return (
    <section id="tarifs" className="section section-alt">
      <div className="wrap">
        <div className="section-head">
          <div style={{marginBottom:'18px'}}><span className="eyebrow"><i className="dot" />Tarifs</span></div>
          <h2 className="reveal">Transparent et <span className="em">sans risque</span></h2>
          <p className="sub reveal" data-delay="1">Sans engagement, annulable à tout moment.</p>
        </div>
        <div className="pricing">

          {/* Starter */}
          <div className="plan reveal" data-delay="1">
            <h3>Starter</h3>
            <p className="tag-line">Pour les PME qui débutent</p>
            <div className="price">
              <span className="price-amount">99<span className="em">,99</span></span>
              <span className="per">€/mois</span>
            </div>
            <ul>
              {STARTER_FEATS.map(([on, l]) => (
                <li key={l} data-on={on ? "1" : "0"}><Check on={on} />{l}</li>
              ))}
            </ul>
            <Link href="/signup" className="btn btn-ghost">Commencer</Link>
          </div>

          {/* Pro */}
          <div className="plan featured reveal" data-delay="2">
            <span className="plan-badge">Populaire</span>
            <h3>Pro</h3>
            <p className="tag-line">Pour les équipes logistiques</p>
            <div className="price">
              <span className="price-amount">179<span className="em">,99</span></span>
              <span className="per">€/mois</span>
            </div>
            <ul>
              {PRO_FEATS.map(([, l]) => (
                <li key={l} data-on="1"><Check on={true} />{l}</li>
              ))}
            </ul>
            <Link href="/signup" className="btn btn-primary">Démarrer en Pro<span className="arr">→</span></Link>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Link href="/" className="footer-brand">
              <Logo size={28} />
              <span>Claim<span style={{ opacity: 0.5 }}>.</span>e</span>
            </Link>
            <p className="footer-tag">Protégeons vos revenus. <em>Chaque livraison compte.</em></p>
          </div>
          <div className="footer-links">
            <Link href="/cgu">CGU</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Claim.e · Tous droits réservés</span>
        </div>
      </div>
    </footer>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  useRevealAll();
  return (
    <>
      <AuroraBg />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Steps />
        <Anomalies />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
