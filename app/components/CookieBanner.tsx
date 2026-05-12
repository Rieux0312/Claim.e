"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto glass-card p-5 border-brand-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Texte */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🍪</span>
              <p className="font-display font-600 text-white text-sm">
                Nous utilisons des cookies
              </p>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Claim.e utilise uniquement des cookies essentiels pour le bon fonctionnement du service (authentification, sécurité). Aucun cookie publicitaire.{" "}
              <Link href="/confidentialite" className="text-brand-400 hover:text-brand-300 underline">
                En savoir plus
              </Link>
            </p>
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={decline}
              className="btn-ghost text-sm py-2 px-4"
            >
              Refuser
            </button>
            <button
              onClick={accept}
              className="btn-primary text-sm py-2 px-5"
            >
              ✓ Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}