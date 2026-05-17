"use client";
import Link from "next/link";
import PublicNavbar from "@/app/components/PublicNavbar";

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-surface">
      <PublicNavbar />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16">

        {/* Hero */}
        <div className="text-center mb-10 md:mb-16">
          <div className="section-tag mb-4 md:mb-6">À propos</div>
          <h1 className="font-display text-3xl md:text-5xl font-700 text-white tracking-tight mb-4 md:mb-6">
            Nous aidons les entreprises à<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
              récupérer l'argent qu'elles perdent
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Claim.e est né d'un constat simple : les entreprises perdent des milliers d'euros 
            chaque mois à cause des erreurs de transporteurs, sans même le savoir.
          </p>
        </div>

        {/* Notre histoire */}
        <div className="glass-card p-8 mb-6">
          <h2 className="font-display text-2xl font-700 text-white mb-4">🚀 Notre histoire</h2>
          <div className="text-slate-400 text-sm leading-relaxed space-y-4">
            <p>
              Tout a commencé quand nous avons réalisé qu'une entreprise e-commerce de taille moyenne 
              perdait en moyenne <strong className="text-white">3 à 8% de son budget transport</strong> chaque 
              mois en anomalies non réclamées — retards, colis perdus, colis endommagés.
            </p>
            <p>
              Le problème ? Les équipes logistiques n'ont pas le temps de vérifier chaque livraison 
              manuellement. Les contrats transporteurs sont complexes. Et réclamer prend du temps.
            </p>
            <p>
              Nous avons créé Claim.e pour automatiser entièrement ce processus. Notre technologie 
              analyse chaque livraison, détecte les anomalies et récupère l'argent pour vous — 
              sans effort de votre part.
            </p>
          </div>
        </div>

        {/* Nos valeurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            {
              emoji: "🎯",
              title: "Transparence",
              desc: "Nous récupérons l'argent perdu pour vous avec une transparence totale sur nos résultats.",
            },
            {
              emoji: "🔒",
              title: "Sécurité",
              desc: "Vos données logistiques sont chiffrées et hébergées en Europe. Conformité RGPD totale.",
            },
            {
              emoji: "⚡",
              title: "Efficacité",
              desc: "Résultats visibles en quelques minutes. Import CSV simple, détection automatique immédiate.",
            },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="glass-card p-6 text-center hover:border-brand-500/30 transition-colors duration-300">
              <div className="text-3xl mb-4">{emoji}</div>
              <h3 className="font-display font-600 text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Chiffres clés */}
        <div className="glass-card p-8 mb-6">
          <h2 className="font-display text-2xl font-700 text-white mb-8 text-center">Claim.e en chiffres</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "2,4M€+", label: "Récupérés pour nos clients" },
              { value: "98%", label: "Taux de détection des anomalies" },
              { value: "500+", label: "Entreprises clientes" },
              { value: "48h", label: "Délai moyen de traitement" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl font-700 text-white mb-2">{value}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Qui sommes-nous */}
        <div className="glass-card p-8 mb-10">
          <h2 className="font-display text-2xl font-700 text-white mb-6">👥 L'équipe</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Claim.e est une équipe passionnée par la logistique et la technologie. 
            Nous combinons expertise transport, intelligence artificielle et expérience SaaS 
            pour offrir la meilleure solution de récupération financière du marché.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { initiale: "F", nom: "Fondateur & CEO", desc: "Expert logistique · 10 ans d'expérience transport" },
              { initiale: "T", nom: "CTO", desc: "Ingénieur IA · Spécialiste data et automatisation" },
              { initiale: "M", nom: "Head of Growth", desc: "Expert B2B SaaS · Développement commercial" },
            ].map(({ initiale, nom, desc }) => (
              <div key={nom} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-700 text-brand-400">{initiale}</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{nom}</p>
                  <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-display text-2xl font-700 text-white mb-4">
            Prêt à récupérer votre argent ?
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Rejoignez 500+ entreprises qui récupèrent déjà leurs pertes logistiques avec Claim.e.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup" className="btn-primary px-8 py-3">
              Commencer →
            </Link>
            <Link href="/" className="btn-secondary px-8 py-3">
              Voir nos fonctionnalités
            </Link>
          </div>
        </div>

      </main>

      {/* Footer simple */}
      <footer className="border-t border-border py-6 md:py-8 px-4 md:px-6 mt-10 md:mt-16">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2024 Claim.e · Tous droits réservés</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-slate-400">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-slate-400">CGU</Link>
            <Link href="/confidentialite" className="hover:text-slate-400">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}