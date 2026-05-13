import Link from "next/link";

export default function CguPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between h-16">
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-700 text-white mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : janvier 2024</p>

        <div className="space-y-8">

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">1. Objet</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation des services proposés par Claim.e SAS, ainsi que les droits et obligations des parties. Toute utilisation du service implique l'acceptation pleine et entière des présentes CGU.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">2. Description du service</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Claim.e est une plateforme SaaS permettant aux entreprises de détecter automatiquement les anomalies logistiques (retards, colis perdus, surfacturations, SLA non respectés) et de récupérer les compensations financières auprès des transporteurs.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">3. Accès au service</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Le service est accessible après création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants. Claim.e SAS se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">4. Tarification</h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-2">
              <p>Le service est proposé selon deux formules d'abonnement mensuel :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-slate-300">Starter :</strong> 99.99€/mois</li>
                <li><strong className="text-slate-300">Pro :</strong> 179.99€/mois</li>
              </ul>
              <p>Les abonnements sont sans engagement et annulables à tout moment.</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">5. Obligations de l'utilisateur</h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-2">
              <p>L'utilisateur s'engage à :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Fournir des données exactes et légalement obtenues</li>
                <li>Ne pas utiliser le service à des fins frauduleuses</li>
                <li>Respecter les droits de propriété intellectuelle de Claim.e</li>
                <li>Ne pas tenter de contourner les mesures de sécurité</li>
              </ul>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">6. Limitation de responsabilité</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Claim.e SAS ne peut garantir le succès de toutes les réclamations. Les montants récupérables sont estimatifs et dépendent des politiques de remboursement des transporteurs. Claim.e SAS ne saurait être tenue responsable des décisions des transporteurs.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">7. Résiliation</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              L'utilisateur peut résilier son abonnement à tout moment depuis son espace personnel. La résiliation prend effet à la fin de la période d'abonnement en cours. Les données sont conservées pendant 30 jours après la résiliation.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">8. Droit applicable</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut, le tribunal compétent sera celui du siège social de Claim.e SAS.
            </p>
          </div>

        </div>

        <div className="mt-10 flex gap-4 flex-wrap">
          <Link href="/mentions-legales" className="btn-secondary text-sm">Mentions légales</Link>
          <Link href="/confidentialite" className="btn-secondary text-sm">Politique de confidentialité</Link>
        </div>
      </main>
    </div>
  );
}