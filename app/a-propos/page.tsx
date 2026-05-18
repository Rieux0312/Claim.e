"use client";
import Link from "next/link";
import PublicNavbar from "@/app/components/PublicNavbar";
import AuroraBg from "@/app/components/AuroraBg";
import Logo from "@/app/components/Logo";

const VALEURS = [
  {
    e: "🎯",
    t: "Transparence",
    p: "Nous récupérons l'argent perdu pour vous avec une transparence totale sur nos résultats.",
  },
  {
    e: "🔒",
    t: "Sécurité",
    p: "Vos données logistiques sont chiffrées et hébergées en Europe. Conformité RGPD totale.",
  },
  {
    e: "⚡",
    t: "Efficacité",
    p: "Résultats visibles en quelques minutes. Import CSV simple, détection automatique immédiate.",
  },
];

const CHIFFRES = [
  { value: "2,4M€+", label: "Récupérés pour nos clients" },
  { value: "98%",    label: "Taux de détection des anomalies" },
  { value: "500+",   label: "Entreprises clientes" },
  { value: "48h",    label: "Délai moyen de traitement" },
];

const EQUIPE = [
  { initiale: "F", nom: "Fondateur & CEO",   desc: "Expert logistique · 10 ans d'expérience transport" },
  { initiale: "T", nom: "CTO",               desc: "Ingénieur IA · Spécialiste data et automatisation" },
  { initiale: "M", nom: "Head of Growth",    desc: "Expert B2B SaaS · Développement commercial" },
];

export default function AProposPage() {
  return (
    <>
      <AuroraBg />
      <PublicNavbar />

      <main>

        {/* ── Hero ── */}
        <section className="section" style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
          <div className="wrap">
            <div className="section-head">
              <div style={{ marginBottom: "18px" }}>
                <span className="eyebrow"><i className="dot" />À propos</span>
              </div>
              <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.1, color: "#fff", marginBottom: "1.25rem" }}>
                Nous aidons les entreprises à<br />
                <span className="em">récupérer l&apos;argent qu&apos;elles perdent</span>
              </h1>
              <p className="sub" style={{ maxWidth: "580px", margin: "0 auto" }}>
                Claim.e est né d&apos;un constat simple : les entreprises perdent des milliers d&apos;euros
                chaque mois à cause des erreurs de transporteurs, sans même le savoir.
              </p>
            </div>
          </div>
        </section>

        {/* ── Notre histoire ── */}
        <section className="section section-alt" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
          <div className="wrap" style={{ maxWidth: "860px" }}>
            <div style={{ marginBottom: "18px" }}>
              <span className="eyebrow"><i className="dot" />Notre histoire</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", letterSpacing: "-.02em" }}>
              🚀 De l&apos;observation au produit
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.8 }}>
                Tout a commencé quand nous avons réalisé qu&apos;une entreprise e-commerce de taille moyenne
                perdait en moyenne{" "}
                <strong style={{ color: "#fff" }}>3 à 8% de son budget transport</strong>{" "}
                chaque mois en anomalies non réclamées — retards, colis perdus, colis endommagés.
              </p>
              <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.8 }}>
                Le problème ? Les équipes logistiques n&apos;ont pas le temps de vérifier chaque livraison
                manuellement. Les contrats transporteurs sont complexes. Et réclamer prend du temps.
              </p>
              <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.8 }}>
                Nous avons créé Claim.e pour automatiser entièrement ce processus. Notre technologie
                analyse chaque livraison, détecte les anomalies et récupère l&apos;argent pour vous —
                sans effort de votre part.
              </p>
            </div>
          </div>
        </section>

        {/* ── Nos valeurs ── */}
        <section className="section" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
          <div className="wrap">
            <div className="section-head">
              <div style={{ marginBottom: "18px" }}>
                <span className="eyebrow"><i className="dot" />Nos valeurs</span>
              </div>
              <h2 className="reveal" style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>
                Ce qui nous <span className="em">guide chaque jour</span>
              </h2>
            </div>
            <div className="features">
              {VALEURS.map(({ e, t, p }, i) => (
                <div key={t} className="feature reveal" data-delay={String(i + 1)}>
                  <div className="feature-emoji">{e}</div>
                  <h3>{t}</h3>
                  <p>{p}</p>
                  <div className="feature-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Chiffres clés ── */}
        <section className="section section-alt" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
          <div className="wrap">
            <div className="section-head">
              <div style={{ marginBottom: "18px" }}>
                <span className="eyebrow"><i className="dot" />Claim.e en chiffres</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "2rem", textAlign: "center" }}>
              {CHIFFRES.map(({ value, label }, i) => (
                <div key={label} className="reveal" data-delay={String(i + 1)}>
                  <p style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, color: "#fff", letterSpacing: "-.03em", lineHeight: 1 }}>{value}</p>
                  <p style={{ color: "#64748b", fontSize: "13px", marginTop: "8px", lineHeight: 1.5 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── L'équipe ── */}
        <section className="section" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
          <div className="wrap" style={{ maxWidth: "860px" }}>
            <div style={{ marginBottom: "18px" }}>
              <span className="eyebrow"><i className="dot" />L&apos;équipe</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem", letterSpacing: "-.02em" }}>
              👥 Des experts <span className="em">logistique & tech</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.8, marginBottom: "2rem" }}>
              Claim.e est une équipe passionnée par la logistique et la technologie.
              Nous combinons expertise transport, intelligence artificielle et expérience SaaS
              pour offrir la meilleure solution de récupération financière du marché.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "16px" }}>
              {EQUIPE.map(({ initiale, nom, desc }, i) => (
                <div key={nom} className="feature reveal" data-delay={String(i + 1)}
                  style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "16px", padding: "20px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                    background: "rgba(26,86,255,0.15)", border: "1px solid rgba(26,86,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontWeight: 700, color: "#06b6d4", fontSize: "16px" }}>{initiale}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "#fff", fontSize: "15px", marginBottom: "4px" }}>{nom}</p>
                    <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section section-alt" style={{ paddingTop: "4rem", paddingBottom: "5rem" }}>
          <div className="wrap">
            <div className="section-head">
              <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)", fontWeight: 800, color: "#fff", letterSpacing: "-.03em", marginBottom: "1rem" }}>
                Prêt à <span className="em">récupérer votre argent ?</span>
              </h2>
              <p className="sub" style={{ marginBottom: "2rem" }}>
                Rejoignez 500+ entreprises qui récupèrent déjà leurs pertes logistiques avec Claim.e.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Commencer<span className="arr">→</span>
                </Link>
                <Link href="/#fonctionnalites" className="btn btn-ghost btn-lg">
                  Voir les fonctionnalités
                </Link>
              </div>
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
