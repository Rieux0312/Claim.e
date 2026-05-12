"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative w-full max-w-md animate-fade-up">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8">
          ← Retour à l'accueil
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
          <h1 className="font-display text-3xl font-700 text-white mb-2">Bon retour</h1>
          <p className="text-slate-400">Connectez-vous à votre espace de récupération.</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
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
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" className="input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-3">
            <div className="text-sm">
              <span className="text-slate-400">Pas encore de compte ? </span>
              <Link href="/signup" className="text-brand-400 font-medium hover:text-brand-300 transition-colors">
                Créer un compte gratuit
              </Link>
            </div>
            <div className="text-sm">
              <Link href="/reset-password" className="text-slate-400 hover:text-white transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}