import Link from "next/link";
import PublicNavbar from "@/app/components/PublicNavbar";

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-surface">
      <PublicNavbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-700 text-white mb-2">Politique de confidentialité</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : janvier 2024</p>

        <div className="space-y-8">

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">1. Données collectées</h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-2">
              <p>Claim.e collecte les données suivantes :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-slate-300">Données d'identification :</strong> nom, email, nom de l'entreprise</li>
                <li><strong className="text-slate-300">Données logistiques :</strong> données de livraison importées via CSV</li>
                <li><strong className="text-slate-300">Données de connexion :</strong> adresse IP, logs de connexion</li>
                <li><strong className="text-slate-300">Données de paiement :</strong> traitées par notre prestataire sécurisé</li>
              </ul>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">2. Utilisation des données</h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-2">
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Fournir et améliorer le service Claim.e</li>
                <li>Détecter les anomalies logistiques</li>
                <li>Gérer votre compte et votre abonnement</li>
                <li>Vous envoyer des communications liées au service</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">3. Base légale du traitement</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Le traitement de vos données est fondé sur l'exécution du contrat de service, votre consentement explicite, et nos obligations légales conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">4. Conservation des données</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Vos données sont conservées pendant toute la durée de votre abonnement, puis 30 jours après la résiliation pour vous permettre de récupérer vos informations. Les données comptables sont conservées 10 ans conformément à la loi française.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">5. Partage des données</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement avec nos sous-traitants techniques (hébergement, paiement) dans le cadre strict de la fourniture du service, et soumis aux mêmes obligations de confidentialité.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">6. Vos droits</h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-2">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-slate-300">Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong className="text-slate-300">Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong className="text-slate-300">Droit à l'effacement :</strong> supprimer vos données</li>
                <li><strong className="text-slate-300">Droit à la portabilité :</strong> recevoir vos données dans un format lisible</li>
                <li><strong className="text-slate-300">Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              </ul>
              <p className="mt-3">Pour exercer ces droits, contactez-nous à : <strong className="text-slate-300">privacy@claim-e.fr</strong></p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">7. Cookies</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Claim.e utilise uniquement des cookies essentiels au fonctionnement du service (authentification, sécurité). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">8. Contact</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pour toute question relative à vos données personnelles, contactez notre Délégué à la Protection des Données (DPO) à l'adresse : <strong className="text-slate-300">privacy@claim-e.fr</strong>
            </p>
          </div>

        </div>

        <div className="mt-10 flex gap-4 flex-wrap">
          <Link href="/mentions-legales" className="btn btn-ghost text-sm">Mentions légales</Link>
          <Link href="/cgu" className="btn btn-ghost text-sm">CGU</Link>
        </div>
      </main>
    </div>
  );
}