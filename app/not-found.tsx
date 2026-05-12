import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative text-center animate-fade-up">
        <div className="font-display text-[120px] font-800 text-white/5 leading-none select-none mb-4">
          404
        </div>
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-700 text-white mb-3">
          Page introuvable
        </h1>
        <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn-primary px-6 py-3">
            🏠 Retour à l'accueil
          </Link>
          <Link href="/dashboard" className="btn-secondary px-6 py-3">
            📦 Mon dashboard
          </Link>
        </div>
        <div className="mt-12 flex items-center gap-2 justify-center">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display font-700 text-white">
            Claim<span className="text-brand-400">.e</span>
          </span>
        </div>
      </div>
    </div>
  );
}