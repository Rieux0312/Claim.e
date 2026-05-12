"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setLoading(false);
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card max-w-md w-full p-10 text-center animate-fade-up">
        <p className="text-4xl mb-4">📧</p>
        <h2 className="font-display text-2xl font-700 text-white mb-2">Email envoyé !</h2>
        <p className="text-slate-400 text-sm mb-6">
          Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
        </p>
        <Link href="/login" className="btn-primary justify-center">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative w-full max-w-md animate-fade-up">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8">
          ← Retour à la connexion
        </Link>
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display font-800 text-xl text-white">
            Claim<span className="text-brand-400">.e</span>
          </span>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-700 text-white mb-2">Mot de passe oublié ?</h1>
          <p className="text-slate-400">Entrez votre email et on vous envoie un lien de réinitialisation.</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleReset} className="space-y-5">
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="label">Adresse email</label>
              <input type="email" className="input" placeholder="vous@entreprise.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? "Envoi…" : "📧 Envoyer le lien"}
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-white/10 text-center text-sm">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}