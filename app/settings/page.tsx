"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      setEmail(user.email ?? "");
      const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (profile) setCompanyName(profile.company_name);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from("users")
      .update({ company_name: companyName })
      .eq("id", user!.id);

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Profil mis à jour avec succès !", type: "success" });
    }
    setLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Mot de passe mis à jour !", type: "success" });
      setPassword("");
    }
    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-surface">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
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
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="btn-ghost text-sm">
              📦 Dashboard
            </Link>
            <Link href="/settings" className="btn-ghost text-sm">
              ⚙️ Paramètres
            </Link>
            <div className="w-px h-5 bg-border mx-1" />
            <button onClick={logout} className="btn-ghost text-sm">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Titre */}
        <div>
          <h1 className="font-display text-2xl font-700 text-white mb-1">Paramètres du compte</h1>
          <p className="text-slate-500 text-sm">Gérez vos informations et votre sécurité.</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {message.type === "success" ? "✓" : "✕"} {message.text}
          </div>
        )}

        {/* Informations entreprise */}
        <div className="glass-card p-6">
          <h2 className="font-display font-600 text-white mb-5 text-lg">🏢 Informations entreprise</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Nom de l'entreprise</label>
              <input
                type="text"
                className="input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Logistics"
                required
              />
            </div>
            <div>
              <label className="label">Adresse email</label>
              <input
                type="email"
                className="input"
                value={email}
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              />
              <p className="text-xs text-slate-600 mt-1">L'email ne peut pas être modifié ici.</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Sauvegarde…" : "💾 Sauvegarder"}
            </button>
          </form>
        </div>

        {/* Changer mot de passe */}
        <div className="glass-card p-6">
          <h2 className="font-display font-600 text-white mb-5 text-lg">🔒 Changer le mot de passe</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                minLength={8}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Mise à jour…" : "🔑 Mettre à jour"}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="glass-card p-6 border-red-500/20">
          <h2 className="font-display font-600 text-red-400 mb-2 text-lg">⚠️ Zone danger</h2>
          <p className="text-slate-500 text-sm mb-4">
            Se déconnecter de votre compte Claim.e.
          </p>
          <button onClick={logout} className="btn-danger px-4 py-2 rounded-xl text-sm font-medium">
            Se déconnecter
          </button>
        </div>

      </main>
    </div>
  );
}