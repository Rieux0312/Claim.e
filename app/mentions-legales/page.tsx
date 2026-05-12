import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
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
        <h1 className="font-display text-4xl font-700 text-white mb-2">Mentions légales</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : janvier 2024</p>

        <div className="space-y-8">

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">1. Éditeur du site</h2>
            <div className="text-slate-400 text-sm space-y-2 leading-relaxed">
              <p><strong className="text-slate-300">Raison sociale :</strong> Claim.e SAS</p>
              <p><strong className="text-slate-300">Siège social :</strong> [Adresse complète]</p>
              <p><strong className="text-slate-300">SIRET :</strong> [Numéro SIRET]</p>
              <p><strong className="text-slate-300">Capital social :</strong> [Montant] €</p>
              <p><strong className="text-slate-300">Email :</strong> contact@claim-e.fr</p>
              <p><strong className="text-slate-300">Directeur de publication :</strong> [Nom du dirigeant]</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">2. Hébergement</h2>
            <div className="text-slate-400 text-sm space-y-2 leading-relaxed">
              <p><strong className="text-slate-300">Hébergeur :</strong> Vercel Inc.</p>
              <p><strong className="text-slate-300">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
              <p><strong className="text-slate-300">Site :</strong> vercel.com</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">3. Propriété intellectuelle</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              L'ensemble du contenu de ce site (textes, images, logos, marques) est la propriété exclusive de Claim.e SAS et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification ou exploitation non autorisée est strictement interdite.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">4. Limitation de responsabilité</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Claim.e SAS s'efforce de fournir des informations exactes et à jour sur ce site. Cependant, elle ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées. Claim.e SAS décline toute responsabilité pour les dommages directs ou indirects résultant de l'utilisation de ce site.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-600 text-white mb-4">5. Droit applicable</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </div>

        </div>

        <div className="mt-10 flex gap-4 flex-wrap">
          <Link href="/cgu" className="btn-secondary text-sm">Conditions générales d'utilisation</Link>
          <Link href="/confidentialite" className="btn-secondary text-sm">Politique de confidentialité</Link>
        </div>
      </main>
    </div>
  );
}