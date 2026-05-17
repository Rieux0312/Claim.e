"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";

const CARRIERS = [
  { id: "colissimo",     name: "Colissimo",     emoji: "📮", hint: "Clé API La Poste Developer (X-Okapi-Key)" },
  { id: "chronopost",   name: "Chronopost",    emoji: "⚡", hint: "Numéro de compte Chronopost" },
  { id: "dhl",          name: "DHL",           emoji: "🟡", hint: "DHL-API-Key (MyDHL API)" },
  { id: "ups",          name: "UPS",           emoji: "🟤", hint: "clientId:clientSecret (UPS Developers)" },
  { id: "fedex",        name: "FedEx",         emoji: "🟣", hint: "apiKey:secretKey (FedEx Developer Portal)" },
  { id: "dpd",          name: "DPD",           emoji: "🔴", hint: "API Token DPD" },
  { id: "gls",          name: "GLS",           emoji: "🟢", hint: "contactId:apiToken (GLS API)" },
  { id: "mondialrelay", name: "Mondial Relay", emoji: "🌍", hint: "enseigne:cleApi (Mondial Relay)" },
  { id: "tnt",          name: "TNT",           emoji: "🔵", hint: "apiKey:secretKey (FedEx/TNT API)" },
] as const;

const WEBHOOK_PLATFORMS = [
  { name: "Shopify",      emoji: "🟢", path: "Admin → Paramètres → Notifications → Webhooks → Ajouter", event: "Commande expédiée" },
  { name: "WooCommerce",  emoji: "🟣", path: "WooCommerce → Paramètres → Avancé → Webhooks → Ajouter", event: "Commande mise à jour" },
  { name: "PrestaShop",   emoji: "🔵", path: "Admin → Paramètres avancés → Service web → Ajouter", event: "Commande (PUT/POST)" },
  { name: "Sendcloud",    emoji: "🟠", path: "Paramètres → Intégrations → Webhooks → Ajouter", event: "Statut du colis modifié" },
  { name: "Make / Zapier",emoji: "⚡", path: "Action : HTTP POST → URL du webhook", event: "Lors d'une expédition" },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; email: string | undefined } | null>(null);
  const [companyName, setCompanyName]   = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [message, setMessage]           = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Webhook
  const [webhookSecret, setWebhookSecret]         = useState<string | null>(null);
  const [webhookGenerating, setWebhookGenerating] = useState(false);
  const [webhookCopied, setWebhookCopied]         = useState(false);

  // Shopify
  const [shopifyDomain, setShopifyDomain]     = useState("");
  const [shopifyToken, setShopifyToken]       = useState("");
  const [showShopifyToken, setShowShopifyToken] = useState(false);
  const [shopifySaving, setShopifySaving]     = useState(false);

  // Sendcloud
  const [sendcloudKey, setSendcloudKey]         = useState("");
  const [showSendcloudKey, setShowSendcloudKey] = useState(false);
  const [sendcloudSaving, setSendcloudSaving]   = useState(false);

  // Transporteurs
  const [carrierKeys, setCarrierKeys]   = useState<Record<string, string>>({});
  const [showKeys, setShowKeys]         = useState<Record<string, boolean>>({});
  const [carrierSaving, setCarrierSaving] = useState(false);

  // Synchro
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSync, setLastSync]       = useState<string | null>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://claim-e.fr";

  const webhookUrl = user && webhookSecret
    ? `${appUrl}/api/webhook/${user.id}/${webhookSecret}`
    : null;

  const generateSecret = useCallback(async () => {
    setWebhookGenerating(true);
    const res  = await fetch("/api/generate-webhook-secret", { method: "POST" });
    const data = await res.json();
    if (data.secret) setWebhookSecret(data.secret);
    setWebhookGenerating(false);
  }, []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser({ id: user.id, email: user.email });
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("users").select("*").eq("id", user.id).single();

      if (profile) {
        setCompanyName(profile.company_name ?? "");
        if (profile.carrier_api_keys) setCarrierKeys(profile.carrier_api_keys);
        if (profile.last_sync_at)     setLastSync(profile.last_sync_at);

        if (profile.webhook_secret) {
          setWebhookSecret(profile.webhook_secret);
        }

        const integ = profile.integrations ?? {};
        if (integ.shopify) {
          setShopifyDomain(integ.shopify.domain ?? "");
          setShopifyToken(integ.shopify.token ?? "");
        }
        if (integ.sendcloud?.credentials) {
          setSendcloudKey(integ.sendcloud.credentials);
        }
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMessage(null);
    const { error } = await supabase.from("users")
      .update({ company_name: companyName }).eq("id", user!.id);
    setMessage(error
      ? { text: error.message, type: "error" }
      : { text: "Profil mis à jour !", type: "success" });
    setLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setMessage({ text: error.message, type: "error" }); }
    else { setMessage({ text: "Mot de passe mis à jour !", type: "success" }); setPassword(""); }
    setLoading(false);
  }

  async function saveIntegrations(patch: Record<string, unknown>) {
    const { data: profile } = await supabase.from("users")
      .select("integrations").eq("id", user!.id).single();
    const merged = { ...(profile?.integrations ?? {}), ...patch };
    return supabase.from("users").update({ integrations: merged }).eq("id", user!.id);
  }

  async function handleSaveShopify(e: React.FormEvent) {
    e.preventDefault();
    setShopifySaving(true); setMessage(null);
    const domain = shopifyDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const { error } = await saveIntegrations({
      shopify: domain && shopifyToken ? { domain, token: shopifyToken } : null,
    });
    setMessage(error
      ? { text: error.message, type: "error" }
      : { text: "Boutique Shopify connectée !", type: "success" });
    setShopifySaving(false);
  }

  async function handleSaveSendcloud(e: React.FormEvent) {
    e.preventDefault();
    setSendcloudSaving(true); setMessage(null);
    const { error } = await saveIntegrations({
      sendcloud: sendcloudKey.trim() ? { credentials: sendcloudKey.trim() } : null,
    });
    setMessage(error
      ? { text: error.message, type: "error" }
      : { text: "Sendcloud connecté !", type: "success" });
    setSendcloudSaving(false);
  }

  async function handleSaveCarriers(e: React.FormEvent) {
    e.preventDefault();
    setCarrierSaving(true); setMessage(null);
    const { error } = await supabase.from("users")
      .update({ carrier_api_keys: carrierKeys }).eq("id", user!.id);
    setMessage(error
      ? { text: error.message, type: "error" }
      : { text: "Clés API sauvegardées !", type: "success" });
    setCarrierSaving(false);
  }

  async function handleSync() {
    setSyncLoading(true); setMessage(null);
    try {
      const res  = await fetch("/api/sync-orders", { method: "POST" });
      const data = await res.json();
      if (data.error) { setMessage({ text: data.error, type: "error" }); return; }
      setLastSync(new Date().toISOString());
      const d = data.deliveries_upserted ?? 0;
      const a = data.anomalies_created   ?? 0;
      setMessage({ text: `Synchronisation terminée — ${d} livraison(s) · ${a} anomalie(s)`, type: "success" });
    } catch { setMessage({ text: "Erreur lors de la synchronisation", type: "error" }); }
    finally  { setSyncLoading(false); }
  }

  async function copyWebhookUrl() {
    if (!webhookUrl) return;
    await navigator.clipboard.writeText(webhookUrl);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  }

  async function logout() { await supabase.auth.signOut(); router.push("/"); }

  const connectedCarriers = CARRIERS.filter((c) => carrierKeys[c.id]?.trim()).length;
  const shopifyConnected  = !!(shopifyDomain.trim() && shopifyToken.trim());
  const sendcloudConnected = !!sendcloudKey.trim();
  const canSync = connectedCarriers > 0 || shopifyConnected || sendcloudConnected;

  return (
    <div className="min-h-screen bg-surface">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-display font-800 text-lg text-white">
              Claim<span className="text-brand-400">.e</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 md:gap-2">
            <Link href="/dashboard" className="hidden sm:flex btn-ghost text-sm">📦 Dashboard</Link>
            <Link href="/settings" className="hidden sm:flex btn-ghost text-sm">⚙️ Paramètres</Link>
            <div className="hidden sm:block w-px h-5 bg-border mx-1" />
            <button onClick={logout} className="hidden sm:flex btn-ghost text-sm">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6">

        <div>
          <h1 className="font-display text-2xl font-700 text-white mb-1">Paramètres du compte</h1>
          <p className="text-slate-500 text-sm">Gérez vos informations et vos intégrations.</p>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {message.type === "success" ? "✓" : "✕"} {message.text}
          </div>
        )}

        {/* ── Informations entreprise ── */}
        <div className="glass-card p-6">
          <h2 className="font-display font-600 text-white mb-5 text-lg">🏢 Informations entreprise</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Nom de l&apos;entreprise</label>
              <input type="text" className="input" value={companyName}
                onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Logistics" required />
            </div>
            <div>
              <label className="label">Adresse email</label>
              <input type="email" className="input" value={email} disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }} />
              <p className="text-xs text-slate-600 mt-1">L&apos;email ne peut pas être modifié ici.</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Sauvegarde…" : "💾 Sauvegarder"}
            </button>
          </form>
        </div>

        {/* ── Mot de passe ── */}
        <div className="glass-card p-6">
          <h2 className="font-display font-600 text-white mb-5 text-lg">🔒 Changer le mot de passe</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input type="password" className="input" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum" minLength={8} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Mise à jour…" : "🔑 Mettre à jour"}
            </button>
          </form>
        </div>

        {/* ── Webhook universel ── */}
        <div className="glass-card p-6">
          <h2 className="font-display font-600 text-white text-lg mb-1">🔗 Webhook universel</h2>
          <p className="text-slate-500 text-sm mb-5">
            Copiez cette URL dans <strong className="text-slate-300">n&apos;importe quelle plateforme</strong> pour
            recevoir vos commandes automatiquement — Shopify, WooCommerce, PrestaShop, Sendcloud, Make, Zapier&hellip;
          </p>

          {webhookUrl ? (
            <div className="space-y-3">
              {/* URL à copier */}
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white/5 border border-border rounded-xl px-4 py-2.5 text-xs text-brand-300 font-mono truncate select-all">
                  {webhookUrl}
                </code>
                <button
                  onClick={copyWebhookUrl}
                  className={`btn-secondary text-sm shrink-0 transition-all ${webhookCopied ? "text-emerald-400 border-emerald-500/30" : ""}`}
                >
                  {webhookCopied ? "✓ Copié !" : "📋 Copier"}
                </button>
              </div>

              {/* Plateformes */}
              <div className="space-y-1.5 mt-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  Comment configurer sur votre plateforme
                </p>
                {WEBHOOK_PLATFORMS.map((p) => (
                  <div key={p.name} className="flex items-start gap-3 py-2 px-3 rounded-xl bg-white/[0.02] border border-border/50">
                    <span className="text-base mt-0.5 shrink-0">{p.emoji}</span>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-white">{p.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{p.path}</span>
                      <p className="text-xs text-slate-600 mt-0.5">Événement : <span className="text-slate-400">{p.event}</span></p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Régénérer */}
              <button
                onClick={generateSecret}
                disabled={webhookGenerating}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors mt-2"
              >
                {webhookGenerating ? "Génération…" : "↺ Régénérer le secret (invalide l'ancienne URL)"}
              </button>
            </div>
          ) : (
            <button onClick={generateSecret} disabled={webhookGenerating} className="btn-primary">
              {webhookGenerating ? "Génération…" : "⚡ Générer mon URL webhook"}
            </button>
          )}
        </div>

        {/* ── Shopify ── */}
        <div className="glass-card p-6">
          <h2 className="font-display font-600 text-white text-lg flex items-center gap-2 mb-1">
            <span>🛍️ Shopify</span>
            {shopifyConnected && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Connecté
              </span>
            )}
          </h2>
          <p className="text-slate-500 text-sm mb-5">
            Synchronisation automatique de toutes vos commandes Shopify + détection d&apos;anomalies.
          </p>

          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mb-5 text-xs text-slate-400 space-y-1">
            <p className="font-medium text-brand-400 mb-2">Obtenir le token en 3 minutes :</p>
            <p>1. Admin Shopify → <strong className="text-white">Applications</strong> → <strong className="text-white">Développer des applications</strong></p>
            <p>2. <strong className="text-white">Créer une app</strong> → Portées API Admin → cocher <strong className="text-white">read_orders</strong> + <strong className="text-white">read_fulfillments</strong></p>
            <p>3. <strong className="text-white">Installer l&apos;app</strong> → copier le <strong className="text-white">Token d&apos;accès API Admin</strong> (shpat_…)</p>
          </div>

          <form onSubmit={handleSaveShopify} className="space-y-4">
            <div>
              <label className="label">Domaine</label>
              <input type="text" className="input" value={shopifyDomain}
                onChange={(e) => setShopifyDomain(e.target.value)}
                placeholder="monstore.myshopify.com" autoComplete="off" />
            </div>
            <div>
              <label className="label">Token d&apos;accès API Admin</label>
              <div className="flex items-center gap-2">
                <input type={showShopifyToken ? "text" : "password"} className="input flex-1"
                  value={shopifyToken} onChange={(e) => setShopifyToken(e.target.value)}
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxx" autoComplete="new-password" />
                <button type="button" onClick={() => setShowShopifyToken((v) => !v)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-2 text-base">
                  {showShopifyToken ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={shopifySaving} className="btn-primary">
                {shopifySaving ? "Connexion…" : "🔗 Connecter Shopify"}
              </button>
              {shopifyConnected && (
                <button type="button" onClick={handleSync} disabled={syncLoading} className="btn-secondary text-sm">
                  {syncLoading ? "⏳ Synchro…" : "🔄 Synchroniser"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Sendcloud ── */}
        <div className="glass-card p-6">
          <h2 className="font-display font-600 text-white text-lg flex items-center gap-2 mb-1">
            <span>📦 Sendcloud</span>
            {sendcloudConnected && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Connecté
              </span>
            )}
          </h2>
          <p className="text-slate-500 text-sm mb-5">
            Agrégateur d&apos;expédition n°1 en France. Connectez Sendcloud pour récupérer automatiquement
            tous vos colis, quel que soit le transporteur.
          </p>

          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mb-5 text-xs text-slate-400 space-y-1">
            <p className="font-medium text-brand-400 mb-2">Obtenir vos clés Sendcloud :</p>
            <p>1. Admin Sendcloud → <strong className="text-white">Paramètres</strong> → <strong className="text-white">Intégrations</strong> → <strong className="text-white">API</strong></p>
            <p>2. <strong className="text-white">Créer une clé API</strong> → copier la <strong className="text-white">Clé publique</strong> et la <strong className="text-white">Clé secrète</strong></p>
            <p>3. Coller ici au format : <strong className="text-white font-mono">clePublique:cleSecrete</strong></p>
          </div>

          <form onSubmit={handleSaveSendcloud} className="space-y-4">
            <div>
              <label className="label">Clé publique:Clé secrète</label>
              <div className="flex items-center gap-2">
                <input type={showSendcloudKey ? "text" : "password"} className="input flex-1"
                  value={sendcloudKey} onChange={(e) => setSendcloudKey(e.target.value)}
                  placeholder="publicKey:secretKey" autoComplete="new-password" />
                <button type="button" onClick={() => setShowSendcloudKey((v) => !v)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-2 text-base">
                  {showSendcloudKey ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={sendcloudSaving} className="btn-primary">
                {sendcloudSaving ? "Connexion…" : "🔗 Connecter Sendcloud"}
              </button>
              {sendcloudConnected && (
                <button type="button" onClick={handleSync} disabled={syncLoading} className="btn-secondary text-sm">
                  {syncLoading ? "⏳ Synchro…" : "🔄 Synchroniser"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Transporteurs (MAJ statuts) ── */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="font-display font-600 text-white text-lg">🚚 Mise à jour des statuts</h2>
              <p className="text-slate-500 text-sm mt-1">
                Optionnel — met à jour le statut de suivi des colis déjà importés.
                {connectedCarriers > 0 && (
                  <span className="ml-2 text-emerald-400 font-medium">
                    {connectedCarriers} connecté{connectedCarriers > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
            {canSync && (
              <button onClick={handleSync} disabled={syncLoading}
                className="btn-secondary text-sm shrink-0 ml-4 mt-0.5">
                {syncLoading ? "⏳ Synchro…" : "🔄 Synchroniser tout"}
              </button>
            )}
          </div>

          {lastSync && (
            <p className="text-xs text-slate-600 mb-4">
              Dernière synchro : {new Date(lastSync).toLocaleString("fr-FR")}
            </p>
          )}

          <form onSubmit={handleSaveCarriers} className="space-y-2 mt-4">
            {CARRIERS.map((carrier) => {
              const hasKey = !!carrierKeys[carrier.id]?.trim();
              return (
                <div key={carrier.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-border hover:border-brand-500/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-lg select-none">
                    {carrier.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{carrier.name}</span>
                      {hasKey && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Connecté
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{carrier.hint}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input type={showKeys[carrier.id] ? "text" : "password"}
                      className="input text-sm" style={{ width: "180px" }}
                      value={carrierKeys[carrier.id] ?? ""}
                      onChange={(e) => setCarrierKeys((p) => ({ ...p, [carrier.id]: e.target.value }))}
                      placeholder="Clé API…" autoComplete="new-password" />
                    <button type="button"
                      onClick={() => setShowKeys((p) => ({ ...p, [carrier.id]: !p[carrier.id] }))}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1 text-base">
                      {showKeys[carrier.id] ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="pt-3">
              <button type="submit" disabled={carrierSaving} className="btn-primary">
                {carrierSaving ? "Sauvegarde…" : "💾 Sauvegarder les clés"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Danger zone ── */}
        <div className="glass-card p-6 border-red-500/20">
          <h2 className="font-display font-600 text-red-400 mb-2 text-lg">⚠️ Zone danger</h2>
          <p className="text-slate-500 text-sm mb-4">Se déconnecter de votre compte Claim.e.</p>
          <button onClick={logout} className="btn-danger px-4 py-2 rounded-xl text-sm font-medium">
            Se déconnecter
          </button>
        </div>

      </main>
    </div>
  );
}
