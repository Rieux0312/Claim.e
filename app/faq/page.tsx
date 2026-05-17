"use client";
import Link from "next/link";
import { useState } from "react";
import PublicNavbar from "@/app/components/PublicNavbar";

const FAQ_ITEMS = [
  {
    q: "Comment Claim.e récupère-t-il mes commandes ?",
    a: "En plan Pro, vous connectez votre boutique en quelques clics : Shopify (token Admin), Sendcloud (clés API), ou via le webhook universel pour WooCommerce, PrestaShop, Make, Zapier… Les commandes arrivent automatiquement. En plan Starter, vous importez un fichier CSV depuis votre transporteur.",
  },
  {
    q: "Qu'est-ce que le webhook universel ?",
    a: "C'est une URL unique générée pour votre compte. Vous la collez dans votre boutique (WooCommerce, PrestaShop, Make, Zapier…) et chaque nouvelle commande expédiée arrive automatiquement dans Claim.e — sans import manuel.",
  },
  {
    q: "Quels transporteurs sont compatibles ?",
    a: "Claim.e est compatible avec tous les transporteurs : Colissimo, Chronopost, DHL, UPS, FedEx, DPD, GLS, Mondial Relay, TNT et bien d'autres. La détection des anomalies est indépendante du transporteur.",
  },
  {
    q: "Comment fonctionne la détection des anomalies ?",
    a: "Dès qu'une commande est reçue, Claim.e analyse le statut, les dates prévues et réelles de livraison. Si un retard, une perte ou un SLA non respecté est détecté, une anomalie est créée automatiquement avec le montant estimé récupérable.",
  },
  {
    q: "Combien puis-je récupérer par anomalie ?",
    a: "Retard : 15€/jour pour les 3 premiers jours, puis 45€ + 25€/jour supplémentaire. Colis perdu : entre 150€ et 250€. Non-respect du SLA (livraison en avance de retard) : 20€ forfaitaire.",
  },
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez passer de Starter à Pro (ou inversement) à tout moment depuis vos paramètres. Le changement prend effet immédiatement.",
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
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Toutes les données sont stockées sur Supabase (infrastructure sécurisée, chiffrement en transit et au repos). Chaque compte est isolé — vous n'avez accès qu'à vos propres données.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-surface">
      <PublicNavbar />

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <div className="section-tag mb-4 md:mb-6">F.A.Q.</div>
          <h1 className="font-display text-3xl md:text-5xl font-700 text-white tracking-tight mb-4">
            Questions fréquentes
          </h1>
          <p className="text-slate-400 text-lg">Tout ce que vous devez savoir sur Claim.e</p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div
              key={i}
              className="glass-card overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-display font-600 text-white text-sm pr-4">{q}</span>
                <span className={`text-brand-400 text-lg flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10 md:mt-14">
          <p className="text-slate-400 text-sm mb-4">Vous avez une autre question ?</p>
          <a href="mailto:contact@claim-e.fr" className="btn-secondary px-6 py-2.5 text-sm">
            Nous contacter
          </a>
        </div>
      </main>

      <footer className="border-t border-border py-6 md:py-8 px-4 md:px-6 mt-10 md:mt-16">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2026 Claim.e · Tous droits réservés</p>
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
