import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";

export const metadata: Metadata = {
  title: "Claim.e — Récupération automatique des pertes logistiques",
  description: "Claim.e détecte automatiquement les anomalies transporteurs et récupère l'argent perdu sur vos livraisons.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}