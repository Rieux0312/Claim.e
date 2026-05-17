"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-surface/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="font-display font-700 text-lg text-white tracking-tight">
            Claim<span className="text-brand-400">.e</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <a href="#fonctionnalites" className="btn-ghost text-sm">Fonctionnalités</a>
          <a href="#comment-ca-marche" className="btn-ghost text-sm">Comment ça marche</a>
          <Link href="/tarifs" className="btn-ghost text-sm">Tarifs</Link>
          <Link href="/faq" className="btn-ghost text-sm">F.A.Q.</Link>
          <Link href="/a-propos" className="btn-ghost text-sm">À propos</Link>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="btn-primary text-sm">📦 Mon Dashboard</Link>
              <button onClick={logout} className="btn-ghost text-sm">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">Se connecter</Link>
              <Link href="/signup" className="btn-primary text-sm">Essayer gratuitement</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Box3D() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: 400 }}>
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative" style={{ width: 340 }}>
        <svg viewBox="0 0 320 310" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <defs>
            {/* Face avant — couleur du site */}
            <linearGradient id="bf" x1="20" y1="70" x2="235" y2="275" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1c2f50" />
              <stop offset="1" stopColor="#0f1a2e" />
            </linearGradient>
            {/* Face du dessus — plus claire */}
            <linearGradient id="bt" x1="20" y1="30" x2="285" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2a4268" />
              <stop offset="1" stopColor="#1a3050" />
            </linearGradient>
            {/* Face droite — plus sombre */}
            <linearGradient id="br" x1="235" y1="70" x2="285" y2="275" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0c1624" />
              <stop offset="1" stopColor="#080e1a" />
            </linearGradient>
            {/* Glow bord brand */}
            <linearGradient id="bedge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop stopColor="#06b6d4" />
              <stop offset="1" stopColor="#1a56ff" />
            </linearGradient>
            <linearGradient id="logo-f" x1="4" y1="8" x2="52" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" />
              <stop offset="1" stopColor="#1a56ff" />
            </linearGradient>
          </defs>

          {/* Ombre sol */}
          <ellipse cx="152" cy="300" rx="118" ry="11" fill="#000" opacity="0.30" />

          {/* ── Faces ── */}
          {/* Face avant (gauche — principale) */}
          <path d="M20 70 L235 70 L235 275 L20 275 Z" fill="url(#bf)" />
          {/* Face du dessus */}
          <path d="M20 70 L70 30 L285 30 L235 70 Z" fill="url(#bt)" />
          {/* Face droite */}
          <path d="M235 70 L285 30 L285 195 L235 275 Z" fill="url(#br)" />

          {/* ── Arêtes ── */}
          <path d="M20 70 L235 70 L235 275 L20 275 Z" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none" />
          <path d="M20 70 L70 30 L285 30 L235 70" stroke="rgba(255,255,255,0.09)" strokeWidth="1" fill="none" />
          <path d="M235 70 L285 30 L285 195 L235 275" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />

          {/* Liseré brand en haut de la face avant */}
          <path d="M20 70 L235 70" stroke="url(#bedge)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Liseré brand bord gauche */}
          <path d="M20 70 L20 275" stroke="rgba(6,182,212,0.25)" strokeWidth="1.5" />

          {/* Reflet léger coin supérieur-gauche face avant */}
          <path d="M20 70 L90 70 L90 100 L20 100 Z" fill="white" opacity="0.025" />

          {/* ── Logo Claim.e — face avant, côté gauche centré ── */}
          <g transform="translate(42, 128) scale(1.5)">
            <svg viewBox="0 0 56 56" width="56" height="56">
              <path d="M 45 38 A 20 20 0 1 1 45 18" stroke="url(#logo-f)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <polygon points="48,23 40,17 47,13" fill="url(#logo-f)" />
              <path d="M28 21 L36 25.5 L28 30 L20 25.5 Z" fill="url(#logo-f)" opacity="0.95" />
              <path d="M20 25.5 L28 30 L28 39 L20 34.5 Z" fill="#1a3a9f" />
              <path d="M28 30 L36 25.5 L36 34.5 L28 39 Z" fill="#2045c0" />
              <path d="M28 21 L36 25.5 L28 30 L20 25.5 Z" fill="white" opacity="0.18" />
            </svg>
          </g>

          {/* Nom sous le logo */}
          <text x="70" y="248" textAnchor="middle" fill="white" fillOpacity="0.35" fontSize="11" fontFamily="Sora,sans-serif" fontWeight="700" letterSpacing="3">CLAIM.e</text>
        </svg>

        {/* Carte flottante — superposée sur le carton, bas droite */}
        <div className="absolute bottom-6 right-4 z-10 w-56 bg-[#0b1525]/90 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-white text-xs font-semibold">Réclamation réussie</span>
          </div>
          <p className="text-slate-400 text-xs mb-1">Remboursement obtenu</p>
          <p className="text-2xl font-display font-800 text-white mb-3">+€1 250,00</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs">Évolution</span>
            <span className="text-emerald-400 text-xs font-semibold">▲ +12%</span>
          </div>
          <svg viewBox="0 0 200 52" className="w-full h-12">
            <defs>
              <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="1" stopColor="#1a56ff" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <path d="M0 50 L22 42 L50 36 L80 28 L108 20 L135 12 L163 6 L200 1" stroke="#06b6d4" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0 50 L22 42 L50 36 L80 28 L108 20 L135 12 L163 6 L200 1 L200 52 L0 52 Z" fill="url(#gf)" />
            <circle cx="200" cy="1" r="3.5" fill="#06b6d4" />
            <circle cx="200" cy="1" r="6" fill="#06b6d4" fillOpacity="0.2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-300/5 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* Texte — colonne gauche */}
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Audit logistique automatisé
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-800 text-white leading-[1.1] tracking-tight mb-7">
            Récupérez l'argent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
              perdu sur vos livraisons
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
            Claim.e détecte automatiquement les erreurs de vos transporteurs — retards, colis perdus, SLA non respectés — et récupère l'argent pour vous.
          </p>
          <div className="flex items-center gap-4 flex-nowrap">
            <Link href="/signup" className="btn-primary px-8 py-3.5 text-base whitespace-nowrap">
              Analyser mes livraisons →
            </Link>
            <a href="#comment-ca-marche" className="btn-secondary px-8 py-3.5 text-base whitespace-nowrap">
              Voir comment ça marche
            </a>
          </div>
        </div>

        {/* Boîte 3D — colonne droite */}
        <div className="hidden lg:flex items-center justify-center">
          <Box3D />
        </div>

      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: "🔍", title: "Détection automatique", desc: "Nous identifions efficacement les litiges de livraison en temps réel." },
    { icon: "📋", title: "Réclamations gérées", desc: "Nous négocions avec les transporteurs à votre place." },
    { icon: "💶", title: "Remboursements récupérés", desc: "Vous recevez ce qui vous revient, simplement." },
    { icon: "🔗", title: "Connexion facile", desc: "Shopify, WooCommerce, Sendcloud ou webhook universel — connecté en minutes." },
    { icon: "📊", title: "Dashboard en temps réel", desc: "Suivez vos anomalies, réclamations et remboursements en un coup d'œil." },
    { icon: "🛡️", title: "Protection continue", desc: "Surveillance 24/7 de toutes vos expéditions sans intervention manuelle." },
  ];

  return (
    <section id="fonctionnalites" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-tag mb-6">Fonctionnalités</div>
          <h2 className="font-display text-4xl font-700 text-white tracking-tight mb-4">
            Simple, transparent, efficace.
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Tout ce dont vous avez besoin pour récupérer l'argent que vos transporteurs vous doivent.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon, title, desc }) => (
            <div key={title} className="glass-card p-6 hover:border-brand-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="text-2xl mb-4">{icon}</div>
              <h3 className="font-display font-600 text-white mb-2 group-hover:text-brand-300 transition-colors">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "01", title: "Connectez votre boutique", desc: "Shopify, WooCommerce, PrestaShop, Sendcloud — une simple connexion et vos commandes arrivent automatiquement. Import CSV disponible pour les autres.", detail: "Webhook universel · Shopify · Sendcloud · CSV" },
    { num: "02", title: "Détection automatique", desc: "Notre moteur analyse chaque livraison dès réception et identifie retards, colis perdus et SLA non respectés.", detail: "Analyse en temps réel · 98% de taux de détection" },
    { num: "03", title: "Réclamations & remboursements", desc: "Claim.e génère les réclamations et suit les remboursements jusqu'au paiement.", detail: "Suivi automatique jusqu'au remboursement" },
  ];

  return (
    <section id="comment-ca-marche" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/5 to-transparent" />
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-14">
          <div className="section-tag mb-6">Comment ça marche</div>
          <h2 className="font-display text-4xl font-700 text-white tracking-tight mb-4">
            Récupérez de l'argent<br />en 3 étapes simples
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(({ num, title, desc, detail }) => (
            <div key={num} className="glass-card p-7 relative overflow-hidden group hover:border-brand-500/30 transition-all duration-300">
              <div className="absolute top-4 right-4 font-display text-6xl font-800 text-white/[0.03] select-none">{num}</div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5">
                <span className="font-display font-700 text-brand-400 text-sm">{num}</span>
              </div>
              <h3 className="font-display font-700 text-white text-lg mb-3">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>
              <p className="text-xs text-brand-400/70 font-medium">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Anomalies() {
  const types = [
    { icon: "⏱", label: "Retard de livraison" },
    { icon: "📦", label: "Colis perdu" },
    { icon: "💸", label: "Surfacturation" },
    { icon: "⚠️", label: "SLA non respecté" },
    { icon: "🔄", label: "Livraison partielle" },
    { icon: "🏷", label: "Erreur de facturation" },
    { icon: "💥", label: "Colis endommagé" },
    { icon: "📋", label: "Erreur de tracking" },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="section-tag mb-6">Anomalies détectées</div>
          <h2 className="font-display text-3xl font-700 text-white mb-3">Toutes les erreurs que vous ratez actuellement</h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm">Claim.e analyse automatiquement 8 types d'anomalies sur chaque livraison.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {types.map(({ icon, label }) => (
            <div key={label} className="glass-card p-4 flex items-center gap-3 hover:border-brand-500/30 transition-all duration-200 group">
              <span className="text-xl">{icon}</span>
              <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="tarifs" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-tag mb-6">Tarifs</div>
          <h2 className="font-display text-4xl font-700 text-white tracking-tight mb-4">Transparent et sans risque</h2>
          <p className="text-slate-400">Sans engagement, annulable à tout moment.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: "Starter", price: "99.99€", desc: "Pour les PME qui débutent",
              features: [
                { text: "Jusqu'à 500 livraisons/mois", ok: true },
                { text: "Détection automatique d'anomalies", ok: true },
                { text: "Dashboard en temps réel", ok: true },
                { text: "Import CSV manuel", ok: true },
                { text: "Export PDF des rapports", ok: true },
                { text: "Connexion automatique (Shopify, Sendcloud…)", ok: false },
                { text: "Webhook universel (WooCommerce, PrestaShop…)", ok: false },
                { text: "Envoi automatique des réclamations", ok: false },
                { text: "Support prioritaire 24/7", ok: false },
              ],
              cta: "Commencer", highlighted: false,
            },
            {
              name: "Pro", price: "179.99€", desc: "Pour les équipes logistiques",
              features: [
                { text: "Livraisons illimitées", ok: true },
                { text: "Détection automatique d'anomalies", ok: true },
                { text: "Dashboard en temps réel", ok: true },
                { text: "Connexion Shopify & Sendcloud automatique", ok: true },
                { text: "Webhook universel (WooCommerce, PrestaShop…)", ok: true },
                { text: "Synchronisation quotidienne automatique", ok: true },
                { text: "Envoi automatique des réclamations", ok: true },
                { text: "Support prioritaire 24/7", ok: true },
              ],
              cta: "Démarrer en Pro", highlighted: true,
            },
          ].map(({ name, price, desc, features, cta, highlighted }) => (
            <div key={name} className={`glass-card p-8 relative overflow-hidden ${highlighted ? "border-brand-500/40" : ""}`}>
              {highlighted && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />}
              {highlighted && <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold">Populaire</div>}
              <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${highlighted ? "text-brand-400" : "text-slate-500"}`}>{name}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display text-4xl font-800 text-white">{price}</span>
                <span className="text-slate-500 text-sm">/mois</span>
              </div>
              <p className="text-slate-500 text-sm mb-6">{desc}</p>
              <ul className="space-y-3 mb-8">
                {features.map(({ text, ok }) => (
                  <li key={text} className={`flex items-center gap-2.5 text-sm ${ok ? "text-slate-300" : "text-slate-600"}`}>
                    <span className={ok ? "text-brand-400" : "text-slate-700"}>{ok ? "✓" : "✕"}</span>
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={highlighted ? "btn-primary w-full justify-center py-3" : "btn-secondary w-full justify-center py-3"}>
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display font-700 text-white">Claim<span className="text-brand-400">.e</span></span>
          </Link>
          <p className="text-slate-600 text-sm text-center max-w-sm">Protégeons vos revenus. Chaque livraison compte.</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link href="/cgu" className="hover:text-slate-400 transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-slate-400 transition-colors">Confidentialité</Link>
            <Link href="/mentions-legales" className="hover:text-slate-400 transition-colors">Mentions légales</Link>
          </div>
        </div>
        <p className="text-center text-xs text-slate-700">© 2026 Claim.e · Tous droits réservés</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Anomalies />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
