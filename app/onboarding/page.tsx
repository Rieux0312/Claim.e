"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/app/components/Logo";

const STEPS = [
  {
    num: 1,
    emoji: "👋",
    title: "Bienvenue sur Claim.e !",
    desc: "Vous êtes à quelques minutes de récupérer de l'argent perdu sur vos livraisons. Voici comment ça marche.",
    action: "Commencer la visite →",
  },
  {
    num: 2,
    emoji: "📂",
    title: "Importez vos livraisons",
    desc: "Exportez vos données de livraison depuis votre transporteur (Colissimo, DHL, FedEx…) au format CSV et importez-les dans Claim.e.",
    action: "Suivant →",
    tip: "💡 Nous avons un modèle CSV téléchargeable dans le dashboard si vous ne savez pas par où commencer.",
  },
  {
    num: 3,
    emoji: "⚡",
    title: "Détection automatique",
    desc: "Notre moteur analyse chaque livraison et détecte automatiquement les anomalies : retards, colis perdus, SLA non respectés.",
    action: "Suivant →",
    tip: "💡 L'analyse prend quelques secondes, même pour des milliers de livraisons.",
  },
  {
    num: 4,
    emoji: "📤",
    title: "Envoyez vos réclamations",
    desc: "Pour chaque anomalie détectée, cliquez sur \"Envoyer réclamation\". Claim.e génère et envoie la réclamation au transporteur.",
    action: "Suivant →",
    tip: "💡 Suivez le statut de chaque réclamation en temps réel dans votre dashboard.",
  },
  {
    num: 5,
    emoji: "💶",
    title: "Récupérez votre argent !",
    desc: "Une fois le transporteur remboursé, marquez la réclamation comme \"Payée\". Votre dashboard se met à jour automatiquement.",
    action: "Accéder au dashboard →",
    tip: "💡 En moyenne nos clients récupèrent 3 à 8% de leur budget transport mensuel.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function next() {
    if (isLast) {
      router.push("/dashboard");
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative w-full max-w-lg animate-fade-up">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="logo-link">
            <Logo size={28} />
            <span>Claim<span style={{ opacity: 0.5 }}>.</span>e</span>
          </Link>
        </div>

        {/* Barre de progression */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-brand-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Card principale */}
        <div className="glass-card p-10 text-center">
          {/* Emoji */}
          <div className="text-6xl mb-6">{current.emoji}</div>

          {/* Étape */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs font-semibold mb-4">
            Étape {current.num} sur {STEPS.length}
          </div>

          {/* Titre */}
          <h1 className="font-display text-2xl font-700 text-white mb-4">
            {current.title}
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {current.desc}
          </p>

          {/* Tip */}
          {current.tip && (
            <div className="px-4 py-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-sm text-brand-300 mb-6 text-left">
              {current.tip}
            </div>
          )}

          {/* Bouton suivant */}
          <button onClick={next} className="btn btn-primary w-full justify-center py-3 text-base">
            {current.action}
          </button>

          {/* Passer */}
          {!isLast && (
            <button
              onClick={() => router.push("/dashboard")}
              className="btn btn-ghost w-full justify-center mt-3 text-sm"
            >
              Passer la visite
            </button>
          )}
        </div>

        {/* Indicateurs de points */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map((s, i) => (
            <button
              key={s.num}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === step ? "bg-brand-500 w-6" : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}