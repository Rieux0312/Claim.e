"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function Logo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="flex-shrink-0">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        <circle cx="20" cy="20" r="19" stroke="url(#logo-gradient)" strokeWidth="2" fill="none" />
        <path d="M28 14c-1.8-2.4-4.6-4-7.8-4C14.5 10 10 14.5 10 20s4.5 10 10.2 10c3.2 0 6-1.6 7.8-4" stroke="url(#logo-gradient)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M26 11l2 3-3 1" stroke="#14b6a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="16" y="17" width="8" height="6" rx="1" fill="url(#logo-gradient)" opacity="0.9" />
        <path d="M16 19l4-2 4 2" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14b6a6" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

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
            Claim<span className="text-brand-400">.E</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <a href="#fonctionnalites" className="btn-ghost text-sm">Fonctionnalités</a>
          <Link href="/tarifs" className="btn-ghost text-sm">Tarifs</Link>
          <Link href="/faq" className="btn-ghost text-sm">Ressources</Link>
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

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-500/5 blur-3xl" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-accent-cyan/5 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Audit logistique automatisé
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-800 text-white leading-tight tracking-tight mb-6">
            Récupérez l'argent<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
              perdu sur vos livraisons
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
            Claim.e détecte automatiquement les erreurs de vos transporteurs — retards, colis perdus,
            SLA non respectés — et récupère l'argent pour vous.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <Link href="/signup" className="btn-primary px-7 py-3.5 text-base">
              Analyser mes livraisons →
            </Link>
            <a href="#comment-ca-marche" className="btn-secondary px-7 py-3.5 text-base">
              Voir comment ça marche
            </a>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-sm">
            {[["2,4M€+", "Récupérés"], ["98%", "Taux de détection"], ["48h", "Délai moyen"]].map(([val, label]) => (
              <div key={label} className="glass-card p-3 text-center">
                <p className="font-display text-xl font-700 text-white mb-0.5">{val}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Right — carte flottante */}
        <div className="hidden lg:flex justify-center">
          <div className="relative">
            <div className="glass-card p-6 w-72 shadow-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <span className="text-brand-400 text-sm">✓</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Réclamation réussie</p>
                  <p className="text-slate-500 text-xs">Remboursement obtenu</p>
                </div>
              </div>
              <div className="text-3xl font-800 text-white mb-1">+ €1 250,00</div>
              <div className="text-xs text-brand-400 mb-4">Évolution ce mois</div>
              <div className="h-12 flex items-end gap-1">
                {[30, 50, 40, 70, 55, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-brand-500 to-cyan-400 opacity-80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            {/* Badge flottant */}
            <div className="absolute -top-4 -right-4 glass-card px-3 py-2 text-xs text-brand-300 font-semibold border-brand-500/30">
              🔍 Détection automatique
            </div>
          </div>
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
          <p className="text-slate-400 max-w-lg mx-auto text-sm">Claim.E analyse automatiquement 8 types d'anomalies sur chaque livraison.</p>
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
            <span className="font-display font-700 text-white">Claim<span className="text-brand-400">.E</span></span>
          </Link>
          <p className="text-slate-600 text-sm text-center max-w-sm">Protégeons vos revenus. Chaque livraison compte.</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link href="/cgu" className="hover:text-slate-400 transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-slate-400 transition-colors">Confidentialité</Link>
            <Link href="/mentions-legales" className="hover:text-slate-400 transition-colors">Mentions légales</Link>
          </div>
        </div>
        <p className="text-center text-xs text-slate-700">© 2026 Claim.E · Tous droits réservés</p>
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
