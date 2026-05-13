import Link from "next/link";

function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0"
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-surface/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="font-display font-800 text-lg text-white tracking-tight">
            Claim<span className="text-brand-400">.e</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1">
<a href="#fonctionnalites" className="btn-ghost text-sm">Fonctionnalités</a>
<a href="#comment-ca-marche" className="btn-ghost text-sm">Comment ça marche</a>
<Link href="/a-propos" className="btn-ghost text-sm">À propos</Link>
<Link href="/tarifs" className="btn-ghost text-sm">Tarifs</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm">Connexion</Link>
          <Link href="/signup" className="btn-primary text-sm">Commencer</Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl" />
      <div className="relative max-w-5xl mx-auto px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Audit logistique automatisé
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-800 text-white leading-tight tracking-tight mb-6 animate-fade-up">
          Récupérez l'argent<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
            perdu sur vos livraisons
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Claim.e détecte automatiquement les erreurs de vos transporteurs — retards, colis perdus,
          SLA non respectés — et récupère l'argent pour vous.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link href="/signup" className="btn-primary px-7 py-3.5 text-base">
            Analyser mes livraisons →
          </Link>
          <a href="#comment-ca-marche" className="btn-secondary px-7 py-3.5 text-base">
            Voir comment ça marche
          </a>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[["2,4M€+", "Récupérés"], ["98%", "Taux de détection"], ["48h", "Délai moyen"]].map(([val, label]) => (
            <div key={label} className="glass-card p-4 text-center">
              <p className="font-display text-2xl font-700 text-white mb-0.5">{val}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const ANOMALY_TYPES = [
  { icon: "⏱", label: "Retard de livraison", desc: "Détection automatique de tout dépassement de délai contractuel" },
  { icon: "📦", label: "Colis perdu", desc: "Identification des expéditions sans confirmation de livraison" },
  { icon: "💸", label: "Surfacturation", desc: "Comparaison automatique avec les tarifs contractuels" },
  { icon: "⚠️", label: "SLA non respecté", desc: "Contrôle des engagements de service du transporteur" },
  { icon: "🔄", label: "Livraison partielle", desc: "Détection des commandes livrées incomplètement" },
  { icon: "🏷", label: "Erreur de facturation", desc: "Audit des factures vs prestations réellement effectuées" },
  { icon: "💥", label: "Colis endommagé", desc: "Suivi des déclarations de casse et compensations dues" },
  { icon: "📋", label: "Erreur de tracking", desc: "Analyse des incohérences dans les données de suivi" },
];

function Features() {
  return (
    <section id="fonctionnalites" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-tag mb-6">Anomalies détectées</div>
          <h2 className="font-display text-4xl font-700 text-white tracking-tight mb-4">
            Toutes les erreurs que<br />vous ratez actuellement
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Claim.e analyse automatiquement 8 types d'anomalies sur chaque livraison.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ANOMALY_TYPES.map(({ icon, label, desc }) => (
            <div key={label} className="glass-card p-5 hover:border-brand-500/30 transition-all duration-300 group hover:-translate-y-1 cursor-default">
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-display font-600 text-white text-sm mb-2 group-hover:text-brand-300 transition-colors">{label}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
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
          {[
            { num: "01", title: "Importez vos données", desc: "Exportez vos livraisons depuis votre transporteur et importez en CSV en quelques secondes.", detail: "Compatible : Colissimo, DHL, FedEx, UPS…" },
            { num: "02", title: "Détection automatique", desc: "Notre moteur analyse chaque livraison et identifie toutes les anomalies récupérables.", detail: "Analyse en temps réel · 98% de taux de détection" },
            { num: "03", title: "Réclamations & remboursements", desc: "Claim.e génère les réclamations et suit les remboursements jusqu'au paiement.", detail: "Suivi automatique jusqu'au remboursement" },
          ].map(({ num, title, desc, detail }) => (
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

function Pricing() {
  return (
    <section id="tarifs" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-tag mb-6">Tarifs</div>
          <h2 className="font-display text-4xl font-700 text-white tracking-tight mb-4">Transparent et sans risque</h2>
          <p className="text-slate-400 text-lg">Abonnement mensuel<br /></p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: "Starter", price: "99.99€", period: "/mois", desc: "Pour les PME qui débutent",
              features: ["Jusqu'à 500 livraisons/mois", "Détection automatique d'anomalies", "Dashboard en temps réel", "Export des réclamations", "Support email"],
              cta: "Commencer", highlighted: false,
            },
            {
              name: "Pro", price: "179.99€", period: "/mois", desc: "Pour les équipes logistiques",
              features: ["Livraisons illimitées", "Détection automatique d'anomalies", "Dashboard en temps réel", "Export des réclamations", "Envoi automatique des réclamations", "Suivi des remboursements", "Intégration API transporteurs", "Support prioritaire 24/7"],
              cta: "Démarrer en Pro", highlighted: true,
            },
          ].map(({ name, price, period, desc, features, cta, highlighted }) => (
            <div key={name} className={`glass-card p-8 relative overflow-hidden ${highlighted ? "border-brand-500/40" : ""}`}>
              {highlighted && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />}
              {highlighted && <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold">Populaire</div>}
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">{name}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display text-4xl font-800 text-white">{price}</span>
                <span className="text-slate-500 text-sm">{period}</span>
              </div>
              <p className="text-slate-500 text-sm mb-6">{desc}</p>
              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <span className="text-emerald-400">✓</span> {f}
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-display font-800 text-white">Claim<span className="text-brand-400">.e</span></span>
          </div>
          <p className="text-slate-600 text-sm">© 2026 Claim.e · Tous droits réservés</p>
          <div className="flex gap-4 text-xs text-slate-600">
<Link href="/cgu" className="hover:text-slate-400">CGU</Link>
<Link href="/confidentialite" className="hover:text-slate-400">Confidentialité</Link>
<Link href="/mentions-legales" className="hover:text-slate-400">Mentions légales</Link>
          </div>
        </div>
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
        <Pricing />
      </main>
      <Footer />
    </>
  );
}