import Link from "next/link";

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-display font-800 text-lg text-white">
              Claim<span className="text-brand-400">.e</span>
            </span>
          </Link>
          <Link href="/" className="btn-ghost text-sm">← Retour à l'accueil</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="section-tag mb-6">Tarifs</div>
          <h1 className="font-display text-4xl md:text-5xl font-700 text-white tracking-tight mb-6">
            Transparent et sans risque
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Abonnement mensuel + commission de 20% sur l'argent effectivement récupéré.
            <br />Vous ne payez rien si on ne récupère rien.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
          {/* Starter */}
          <div className="glass-card p-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Starter</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-display text-5xl font-800 text-white">99.99€</span>
              <span className="text-slate-500 text-sm">/mois</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">Pour les PME qui débutent</p>
            <div className="h-px bg-border mb-6" />
            <ul className="space-y-3 mb-8">
              {[
                { text: "Jusqu'à 500 livraisons/mois", included: true },
                { text: "Détection automatique d'anomalies", included: true },
                { text: "Dashboard en temps réel", included: true },
                { text: "Export PDF des rapports", included: true },
                { text: "Support email", included: true },
                { text: "Envoi automatique des réclamations", included: false },
                { text: "Intégration API transporteurs", included: false },
                { text: "Support prioritaire 24/7", included: false },
              ].map(({ text, included }) => (
                <li key={text} className={`flex items-center gap-2.5 text-sm ${included ? "text-slate-300" : "text-slate-600"}`}>
                  <span className={included ? "text-emerald-400" : "text-slate-700"}>
                    {included ? "✓" : "✕"}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-secondary w-full justify-center py-3">
              Commencer en Starter
            </Link>
          </div>

          {/* Pro */}
          <div className="glass-card p-8 border-brand-500/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold">
              Populaire
            </div>
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-4">Pro</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-display text-5xl font-800 text-white">179.99€</span>
              <span className="text-slate-500 text-sm">/mois</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">Pour les équipes logistiques</p>
            <div className="h-px bg-border mb-6" />
            <ul className="space-y-3 mb-8">
              {[
                { text: "Livraisons illimitées", included: true },
                { text: "Détection automatique d'anomalies", included: true },
                { text: "Dashboard en temps réel", included: true },
                { text: "Export PDF des rapports", included: true },
                { text: "Envoi automatique des réclamations", included: true },
                { text: "Intégration API transporteurs", included: true },
                { text: "Tableau de bord multi-sites", included: true },
                { text: "Support prioritaire 24/7", included: true },
              ].map(({ text, included }) => (
                <li key={text} className={`flex items-center gap-2.5 text-sm ${included ? "text-slate-300" : "text-slate-600"}`}>
                  <span className={included ? "text-emerald-400" : "text-slate-700"}>
                    {included ? "✓" : "✕"}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-primary w-full justify-center py-3">
              Démarrer en Pro
            </Link>
          </div>
        </div>

        {/* Commission */}
        <div className="glass-card p-8 mb-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <span className="text-3xl">💸</span>
            <div>
              <h2 className="font-display text-xl font-700 text-white mb-2">
                + 20% de commission sur succès
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                En plus de l'abonnement mensuel, nous prélevons une commission de <strong className="text-white">20%</strong> uniquement 
                sur les montants effectivement récupérés auprès des transporteurs. 
                Si nous ne récupérons rien, vous ne payez aucune commission.
              </p>
              <div className="mt-4 p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                <p className="text-brand-300 text-sm font-medium">
                  💡 Exemple : Si nous récupérons 10 000€ pour vous, notre commission est de 2 000€.
                  Vous empêchez 8 000€ nets que vous n'auriez jamais récupérés sans nous.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ tarifs */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-2xl font-700 text-white mb-6 text-center">Questions fréquentes sur les tarifs</h2>
          <div className="space-y-4">
            {[
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui, vous pouvez passer de Starter à Pro (ou inversement) à tout moment. Le changement prend effet immédiatement.",
              },
              {
                q: "Y a-t-il un engagement minimum ?",
                a: "Non, aucun engagement. Vous pouvez annuler votre abonnement à tout moment depuis vos paramètres.",
              },
              {
                q: "Comment est calculée la commission ?",
                a: "La commission de 20% s'applique uniquement sur les montants réellement encaissés auprès des transporteurs, pas sur les montants estimés.",
              },
              {
                q: "Y a-t-il une période d'essai gratuite ?",
                a: "Vous pouvez tester Claim.e gratuitement avec votre premier import CSV. Aucune carte bancaire requise pour commencer.",
              },
              {
                q: "Quels moyens de paiement acceptez-vous ?",
                a: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) ainsi que les virements SEPA pour les plans annuels.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="glass-card p-5 hover:border-brand-500/20 transition-colors duration-300">
                <h3 className="font-display font-600 text-white mb-2 text-sm">{q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-display text-2xl font-700 text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Créez votre compte gratuitement et analysez vos premières livraisons en quelques minutes.
          </p>
          <Link href="/signup" className="btn-primary px-8 py-3">
            Créer un compte gratuit →
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 mt-16">
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