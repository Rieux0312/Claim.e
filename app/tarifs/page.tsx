"use client";
import Link from "next/link";
import PublicNavbar from "@/app/components/PublicNavbar";

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <PublicNavbar />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16">

        {/* Hero */}
        <div className="text-center mb-10 md:mb-16">
          <div className="section-tag mb-4 md:mb-6">Tarifs</div>
          <h1 className="font-display text-4xl md:text-5xl font-700 text-white tracking-tight mb-6">
            Transparent et sans risque
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Abonnement mensuel simple et transparent.
            <br />Sans engagement, annulable à tout moment.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 md:mb-16 max-w-3xl mx-auto">
          {/* Starter */}
          <div className="glass-card p-5 md:p-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Starter</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-display text-4xl md:text-5xl font-800 text-white">99.99€</span>
              <span className="text-slate-500 text-sm">/mois</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">Pour les PME qui débutent</p>
            <div className="h-px bg-border mb-6" />
            <ul className="space-y-3 mb-8">
              {[
                { text: "Jusqu'à 500 livraisons/mois", included: true },
                { text: "Détection automatique d'anomalies", included: true },
                { text: "Dashboard en temps réel", included: true },
                { text: "Import CSV manuel", included: true },
                { text: "Export PDF des rapports", included: true },
                { text: "Connexion automatique (Shopify, Sendcloud…)", included: false },
                { text: "Webhook universel (WooCommerce, PrestaShop…)", included: false },
                { text: "Envoi automatique des réclamations", included: false },
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
            <Link href="/signup" className="btn btn-ghost w-full justify-center py-3">
              Commencer en Starter
            </Link>
          </div>

          {/* Pro */}
          <div className="glass-card p-5 md:p-8 border-brand-500/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold">
              Populaire
            </div>
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-4">Pro</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-display text-4xl md:text-5xl font-800 text-white">179.99€</span>
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
                { text: "Connexion Shopify & Sendcloud automatique", included: true },
                { text: "Webhook universel (WooCommerce, PrestaShop…)", included: true },
                { text: "Synchronisation quotidienne automatique", included: true },
                { text: "Envoi automatique des réclamations", included: true },
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
            <Link href="/signup" className="btn btn-primary w-full justify-center py-3">
              Démarrer en Pro
            </Link>
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
                q: "Y a-t-il une période d'essai gratuite ?",
                a: "Vous pouvez tester Claim.e gratuitement avec votre premier import CSV. Aucune carte bancaire requise pour commencer.",
              },
              {
                q: "Qu'est-ce que le Webhook universel inclus dans le plan Pro ?",
                a: "C'est une URL unique générée pour votre compte. Vous la collez dans votre boutique (WooCommerce, PrestaShop, Make, Zapier…) et chaque nouvelle commande expédiée arrive automatiquement dans Claim.e — sans import manuel.",
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
          <Link href="/signup" className="btn btn-primary px-8 py-3">
            Créer un compte gratuit →
          </Link>
        </div>

      </main>

      {/* Footer */}
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