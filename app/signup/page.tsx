"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ email: "", password: "", company_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const up = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { company_name: form.company_name } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id,
        email: form.email,
        company_name: form.company_name,
      });
    }
    if (data.session) { router.push("/onboarding"); return; }
    router.push("/confirm");
    setLoading(false);
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card max-w-md w-full p-10 text-center animate-fade-up">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-emerald-400 text-2xl">✓</span>
        </div>
        <h2 className="font-display text-2xl font-700 text-white mb-2">Compte créé !</h2>
        <p className="text-slate-400 text-sm">
          Vérifiez votre email pour confirmer votre compte, puis{" "}
          <Link href="/login" className="text-brand-400 font-medium">connectez-vous</Link>.
        </p>
      </div>
    </div>
  );

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
          <h1 className="font-display text-3xl font-700 text-white mb-2">Créez votre compte</h1>
          <p className="text-slate-400">Commencez à récupérer de l'argent en quelques minutes.</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="label">Nom de l'entreprise</label>
              <input type="text" className="input" placeholder="Acme Logistics"
                value={form.company_name} onChange={(e) => up("company_name", e.target.value)} required />
            </div>
            <div>
              <label className="label">Adresse email</label>
              <input type="email" className="input" placeholder="vous@entreprise.com"
                value={form.email} onChange={(e) => up("email", e.target.value)} required />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" className="input" placeholder="8 caractères minimum"
                value={form.password} onChange={(e) => up("password", e.target.value)} required minLength={8} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base">
              {loading ? "Création…" : "Créer mon compte"}
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-border text-center text-sm">
            <span className="text-slate-500">Déjà un compte ? </span>
            <Link href="/login" className="text-brand-400 font-medium hover:text-brand-300 transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}