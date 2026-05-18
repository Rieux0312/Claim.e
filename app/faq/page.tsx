"use client";
import Link from "next/link";
import { useState } from "react";
import PublicNavbar from "@/app/components/PublicNavbar";
import AuroraBg from "@/app/components/AuroraBg";
import Logo from "@/app/components/Logo";

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
    <>
      <AuroraBg />
      <PublicNavbar />

      <main>
        {/* Hero */}
        <section className="section" style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
          <div className="wrap">
            <div className="section-head">
              <div style={{ marginBottom: "18px" }}>
                <span className="eyebrow"><i className="dot" />F.A.Q.</span>
              </div>
              <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.1, color: "#fff", marginBottom: "1rem" }}>
                Questions <span className="em">fréquentes</span>
              </h1>
              <p className="sub" style={{ maxWidth: "520px", margin: "0 auto" }}>
                Tout ce que vous devez savoir sur Claim.e
              </p>
            </div>
          </div>
        </section>

        {/* Accordion */}
        <section className="section" style={{ paddingTop: 0, paddingBottom: "5rem" }}>
          <div className="wrap" style={{ maxWidth: "760px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {FAQ_ITEMS.map(({ q, a }, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${open === i ? "rgba(26,86,255,0.4)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "border-color .25s",
                  }}
                >
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center",
                      justifyContent: "space-between", padding: "20px 24px",
                      textAlign: "left", background: "none", border: "none", cursor: "pointer",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#fff", fontSize: "15px", paddingRight: "16px", lineHeight: 1.4 }}>{q}</span>
                    <span style={{
                      color: "#06b6d4", fontSize: "22px", flexShrink: 0,
                      transform: open === i ? "rotate(45deg)" : "none",
                      transition: "transform .2s",
                      lineHeight: 1,
                    }}>+</span>
                  </button>
                  {open === i && (
                    <div style={{ padding: "0 24px 20px" }}>
                      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.7 }}>{a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
                Vous avez une autre question ?
              </p>
              <a href="mailto:contact@claim-e.fr" className="btn btn-ghost">
                Nous contacter
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
    </>
  );
}
