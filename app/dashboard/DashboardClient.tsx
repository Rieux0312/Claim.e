"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Delivery = {
  id: string; order_id: string; tracking: string;
  expected_date: string; actual_date: string | null;
  status: "delivered" | "delayed" | "lost" | "pending";
  user_id: string; created_at: string;
};
type Anomaly = {
  id: string; delivery_id: string;
  type: "delay" | "lost" | "service_failure" | "partial_delivery" | "billing_error" | "damaged" | "double_billing" | "overcharge";
  estimated_amount: number;
  status: "pending" | "sent" | "paid";
  user_id: string; created_at: string;
  delivery?: Delivery;
};
type User = { id: string; email: string; company_name: string };
type Toast = { id: number; msg: string; type: "success" | "error" };

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}
function fdate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function inferStatus(expected: string, actual: string | undefined): Delivery["status"] {
  if (!actual) return "lost";
  const d = Math.ceil((new Date(actual).getTime() - new Date(expected).getTime()) / 86400000);
  return d > 0 ? "delayed" : "delivered";
}
function calcAmount(type: string, daysLate = 0): number {
  if (type === "lost") return Math.round((150 + Math.random() * 100) * 100) / 100;
  if (type === "delay") return daysLate <= 3 ? daysLate * 15 : 45 + (daysLate - 3) * 25;
  if (type === "damaged") return Math.round((100 + Math.random() * 200) * 100) / 100;
  if (type === "partial_delivery") return Math.round((50 + Math.random() * 100) * 100) / 100;
  if (type === "billing_error" || type === "overcharge" || type === "double_billing") return Math.round((30 + Math.random() * 150) * 100) / 100;
  return 50;
}
function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`toast flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border ${t.type === "success" ? "bg-emerald-950 border-emerald-500/30 text-emerald-300" : "bg-red-950 border-red-500/30 text-red-300"}`}>
          {t.type === "success" ? "✓" : "✕"} {t.msg}
        </div>
      ))}
    </div>
  );
}
function DBadge({ s }: { s: string }) {
  const m: Record<string, [string, string]> = {
    delivered: ["badge-green", "Livré"],
    delayed: ["badge-orange", "Retard"],
    lost: ["badge-red", "Perdu"],
    pending: ["badge-gray", "En attente"],
  };
  const [cls, label] = m[s] ?? ["badge-gray", s];
  return <span className={cls}>{label}</span>;
}
function ABadge({ s }: { s: string }) {
  const m: Record<string, [string, string]> = {
    delay: ["badge-orange", "Retard"],
    lost: ["badge-red", "Perdu"],
    service_failure: ["badge-gray", "SLA"],
    partial_delivery: ["badge-orange", "Livraison partielle"],
    billing_error: ["badge-red", "Erreur de facturation"],
    damaged: ["badge-red", "Colis endommagé"],
    double_billing: ["badge-red", "Double facturation"],
    overcharge: ["badge-orange", "Surfacturation"],
  };
  const [cls, label] = m[s] ?? ["badge-gray", s];
  return <span className={cls}>{label}</span>;
}
function SBadge({ s }: { s: string }) {
  const m: Record<string, [string, string]> = {
    pending: ["badge-orange", "En attente"],
    sent: ["badge-blue", "Envoyée"],
    paid: ["badge-green", "Remboursé"],
  };
  const [cls, label] = m[s] ?? ["badge-gray", s];
  return <span className={cls}>{label}</span>;
}
function KPI({ label, value, sub, emoji }: { label: string; value: string; sub: string; emoji: string }) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-2xl">{emoji}</span>
      </div>
      <p className="font-display text-2xl font-700 text-white mb-1">{value}</p>
      <p className="text-xs text-slate-600">{sub}</p>
    </div>
  );
}

export default function DashboardClient({ user, initialDeliveries, initialAnomalies }: { user: User; initialDeliveries: Delivery[]; initialAnomalies: Anomaly[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [anomalies, setAnomalies] = useState(initialAnomalies);
  const [tab, setTab] = useState<"deliveries" | "anomalies">("deliveries");
  const [analyzing, setAnalyzing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const tid = useRef(0);

  const [searchDelivery, setSearchDelivery] = useState("");
  const [filterDeliveryStatus, setFilterDeliveryStatus] = useState("all");
  const [searchAnomaly, setSearchAnomaly] = useState("");
  const [filterAnomalyStatus, setFilterAnomalyStatus] = useState("all");
  const [filterAnomalyType, setFilterAnomalyType] = useState("all");

  function toast(msg: string, type: "success" | "error" = "success") {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }
  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) setFile(f);
  }, []);

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim());
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
      });
      const deliveryInserts = rows.filter((r) => r.expected_date && r.expected_date.trim() !== "").map((r) => ({
        order_id: r.order_id || `ORD-${Date.now()}`,
        tracking: r.tracking || "",
        expected_date: r.expected_date,
        actual_date: r.actual_date || null,
        carrier: r.carrier || r.transporteur || r.transporter || null,
        status: r.anomaly_type === "lost" ? "lost" as const :
                r.anomaly_type && r.anomaly_type !== "delay" ? "pending" as const :
                inferStatus(r.expected_date, r.actual_date || undefined),
        user_id: user.id,
      }));
      const { data: ins, error: dErr } = await supabase.from("deliveries").insert(deliveryInserts).select();
      if (dErr) throw new Error(dErr.message);

      const aIns = (ins ?? []).map((d, index) => {
        const rawRow = rows[index] ?? {};
        const manualType = rawRow.anomaly_type?.trim();
        const anomalyType = manualType && manualType !== "" ? manualType :
          d.status === "delayed" ? "delay" :
          d.status === "lost" ? "lost" : null;
        if (!anomalyType) return null;
        const days = d.actual_date ? Math.ceil((new Date(d.actual_date).getTime() - new Date(d.expected_date).getTime()) / 86400000) : 0;
        return {
          delivery_id: d.id,
          type: anomalyType,
          estimated_amount: calcAmount(anomalyType, days),
          status: "pending",
          user_id: user.id,
        };
      }).filter((x): x is NonNullable<typeof x> => x !== null);

      let insertedAnomalies: Anomaly[] = [];
      if (aIns.length > 0) {
        const { data: aData, error: aErr } = await supabase.from("anomalies").insert(aIns).select("*, delivery:delivery_id(*)");
        if (aErr) throw new Error(aErr.message);
        insertedAnomalies = aData ?? [];
      }
      setDeliveries((p) => [...(ins ?? []), ...p]);
      setAnomalies((p) => [...insertedAnomalies, ...p]);
      const n = insertedAnomalies.length;
      toast(n > 0 ? `✓ ${rows.length} livraisons · ${n} anomalie${n > 1 ? "s" : ""} détectée${n > 1 ? "s" : ""}` : `✓ ${rows.length} livraisons · Aucune anomalie`);
      if (n > 0) setTab("anomalies");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setAnalyzing(false);
    }
  }

  async function sendClaim(id: string, sendCopy = true) {
    setBusy((s) => new Set([...s, id]));
    try {
      const res = await fetch("/api/send-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anomalyId: id, sendCopy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur envoi");
      setAnomalies((p) => p.map((a) => (a.id === id ? { ...a, status: "sent" } : a)));
      toast("📧 Réclamation envoyée au transporteur ✓");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }

  async function markPaid(id: string) {
    setBusy((s) => new Set([...s, id]));
    const { error } = await supabase.from("anomalies").update({ status: "paid" }).eq("id", id);
    setBusy((s) => { const n = new Set(s); n.delete(id); return n; });
    if (error) return toast(error.message, "error");
    setAnomalies((p) => p.map((a) => (a.id === id ? { ...a, status: "paid" } : a)));
    toast("Remboursement enregistré 🎉");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFillColor(26, 86, 255);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Claim.e — Rapport d'anomalies", 14, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Entreprise : ${user.company_name}`, 14, 23);
    doc.text(`Généré le : ${new Date().toLocaleDateString("fr-FR")}`, 14, 30);
    doc.setTextColor(30, 45, 69);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Résumé", 14, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Montant récupérable : ${eur(recoverable)}`, 14, 60);
    doc.text(`Montant récupéré : ${eur(recovered)}`, 14, 68);
    doc.text(`Anomalies actives : ${active.length}`, 14, 76);
    doc.text(`Livraisons analysées : ${deliveries.length}`, 14, 84);
    doc.text(`Taux d'erreur : ${errorRate.toFixed(1)}%`, 14, 92);
    doc.setTextColor(30, 45, 69);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Détail des anomalies", 14, 108);
    const typeLabels: Record<string, string> = {
      delay: "Retard", lost: "Perdu", service_failure: "SLA",
      partial_delivery: "Livraison partielle", billing_error: "Erreur de facturation",
      damaged: "Colis endommagé", double_billing: "Double facturation", overcharge: "Surfacturation",
    };
    const statusLabels: Record<string, string> = { pending: "En attente", sent: "Réclamation envoyée", paid: "Remboursé" };
    autoTable(doc, {
      startY: 114,
      head: [["Commande", "Type", "Montant estimé", "Statut"]],
      body: anomalies.map((a) => [
        (a.delivery as Delivery)?.order_id ?? "—",
        typeLabels[a.type] ?? a.type,
        eur(a.estimated_amount),
        statusLabels[a.status] ?? a.status,
      ]),
      headStyles: { fillColor: [26, 86, 255], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 5 },
    });
    doc.save(`claim-e-anomalies-${new Date().toISOString().split("T")[0]}.pdf`);
    toast("PDF exporté avec succès ✓");
  }

  const chartData = (() => {
    const months: Record<string, { mois: string; récupérable: number; récupéré: number }> = {};
    anomalies.forEach((a) => {
      const date = new Date(a.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      if (!months[key]) months[key] = { mois: label, récupérable: 0, récupéré: 0 };
      if (a.status !== "paid") months[key].récupérable += a.estimated_amount;
      if (a.status === "paid") months[key].récupéré += a.estimated_amount;
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  })();

  const filteredDeliveries = deliveries.filter((d) => {
    const matchSearch = searchDelivery === "" || d.order_id.toLowerCase().includes(searchDelivery.toLowerCase()) || d.tracking.toLowerCase().includes(searchDelivery.toLowerCase());
    const matchStatus = filterDeliveryStatus === "all" || d.status === filterDeliveryStatus;
    return matchSearch && matchStatus;
  });
  const filteredAnomalies = anomalies.filter((a) => {
    const delivery = a.delivery as Delivery;
    const matchSearch = searchAnomaly === "" || (delivery?.order_id?.toLowerCase().includes(searchAnomaly.toLowerCase()));
    const matchStatus = filterAnomalyStatus === "all" || a.status === filterAnomalyStatus;
    const matchType = filterAnomalyType === "all" || a.type === filterAnomalyType;
    return matchSearch && matchStatus && matchType;
  });

  const active = anomalies.filter((a) => a.status !== "paid");
  const paid = anomalies.filter((a) => a.status === "paid");
  const recoverable = active.reduce((s, a) => s + a.estimated_amount, 0);
  const recovered = paid.reduce((s, a) => s + a.estimated_amount, 0);
  const errorRate = deliveries.length > 0 ? (anomalies.length / deliveries.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-surface">
      <Toasts toasts={toasts} />
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
            <Link href="/" className="font-display font-800 text-lg text-white hover:opacity-80 transition-opacity">Claim<span className="text-brand-400">.e</span></Link>
          </div>
          <div className="flex items-center gap-2">
<Link href="/dashboard" className="btn-ghost text-sm">📦 Dashboard</Link>
<Link href="/settings" className="btn-ghost text-sm">⚙️ Paramètres</Link>
<Link href="/tarifs" className="btn-ghost text-sm">💳 Tarifs</Link>
            <div className="w-px h-5 bg-border mx-1" />
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white leading-tight">{user.company_name}</p>
              <p className="text-xs text-slate-500 leading-tight">{user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-700 text-sm">
              {user.company_name[0]?.toUpperCase()}
            </div>
            <button onClick={logout} className="btn-ghost text-sm">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-700 text-white mb-1">Tableau de bord</h1>
            <p className="text-slate-500 text-sm">Suivez vos anomalies et votre argent récupéré en temps réel.</p>
          </div>
          <button onClick={exportPDF} disabled={anomalies.length === 0} className="btn-secondary gap-2">
            📄 Exporter PDF
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Récupérable" value={eur(recoverable)} sub={`+ ${eur(recovered)} récupéré`} emoji="💶" />
          <KPI label="Anomalies actives" value={String(active.length)} sub={`${anomalies.length} détectées`} emoji="⚠️" />
          <KPI label="Livraisons" value={String(deliveries.length)} sub="Depuis tous les imports" emoji="📦" />
          <KPI label="Taux d'erreur" value={`${errorRate.toFixed(1)}%`} sub="Moyenne secteur : 3,2%" emoji="📊" />
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display font-600 text-white mb-1 text-lg">📈 Évolution des montants</h2>
          <p className="text-slate-500 text-sm mb-6">Montants récupérables et récupérés par mois</p>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-slate-600 text-sm">Importez des livraisons pour voir le graphique</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRecuperable" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a56ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a56ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRecupere" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="mois" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                <Tooltip contentStyle={{ backgroundColor: "#1a2236", border: "1px solid #1e2d45", borderRadius: "12px", color: "#e2e8f0" }} formatter={(value) => [`${Number(value).toFixed(2)}€`]} />
                <Area type="monotone" dataKey="récupérable" stroke="#1a56ff" strokeWidth={2} fill="url(#colorRecuperable)" name="Récupérable" />
                <Area type="monotone" dataKey="récupéré" stroke="#10b981" strokeWidth={2} fill="url(#colorRecupere)" name="Récupéré" />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
              Récupérable
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Récupéré
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="font-display font-600 text-white text-lg">Importer des livraisons</h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-emerald-400 text-xs">🔒</span>
              <span className="text-emerald-400 text-xs font-medium">Données chiffrées et sécurisées</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-5">Colonnes : <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs font-mono text-slate-400">order_id, tracking, expected_date, actual_date, anomaly_type (optionnel)</code></p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div onClick={() => fileRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
              className={`flex-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${drag ? "border-brand-500 bg-brand-500/10" : file ? "border-emerald-500/40 bg-emerald-500/5" : "border-border hover:border-brand-500/40"}`}>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
              {file ? (
                <><p className="text-2xl mb-2">📄</p><p className="font-medium text-sm text-white">{file.name}</p></>
              ) : (
                <><p className="text-2xl mb-2">📂</p><p className="font-medium text-sm text-slate-400">Déposez votre CSV ici</p></>
              )}
            </div>
            <div className="flex flex-col gap-3 min-w-[180px]">
              <button onClick={handleAnalyze} disabled={!file || analyzing} className="btn-primary justify-center py-3">
                {analyzing ? "Analyse…" : "⚡ Analyser"}
              </button>
              
               </div>
              <a href="data:text/csv;charset=utf-8,order_id,tracking,expected_date,actual_date,anomaly_type%0AORD-001,FR123456789FR,2024-01-10,2024-01-14,%0AORD-002,FR987654321FR,2024-01-11,,lost%0AORD-003,FR112233445FR,2024-01-12,2024-01-12,damaged"
                download="template.csv"
                className="btn-secondary justify-center py-2.5 text-sm"
              >
                Télécharger modèle
              </a>
            </div>
          </div>
        <div>
          <div className="flex items-center gap-1 p-1 bg-card/50 border border-border rounded-xl w-fit mb-5">
            {(["deliveries", "anomalies"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === t ? "bg-brand-500 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                {t === "deliveries" ? "📦 Livraisons" : "⚠️ Anomalies"}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-700 ${tab === t ? "bg-white/20 text-white" : "bg-white/5 text-slate-500"}`}>
                  {t === "deliveries" ? filteredDeliveries.length : filteredAnomalies.length}
                </span>
              </button>
            ))}
          </div>

          {tab === "deliveries" && (
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <h3 className="font-display font-600 text-white">Livraisons</h3>
                  <div className="flex gap-2 flex-wrap">
                    <input type="text" placeholder="🔍 Rechercher..." value={searchDelivery} onChange={(e) => setSearchDelivery(e.target.value)} className="input text-xs py-1.5 px-3 w-40" />
                    <select value={filterDeliveryStatus} onChange={(e) => setFilterDeliveryStatus(e.target.value)} className="input text-xs py-1.5 px-3 w-36">
                      <option value="all">Tous les statuts</option>
                      <option value="delivered">Livré</option>
                      <option value="delayed">Retard</option>
                      <option value="lost">Perdu</option>
                      <option value="pending">En attente</option>
                    </select>
                    {(searchDelivery || filterDeliveryStatus !== "all") && (
                      <button onClick={() => { setSearchDelivery(""); setFilterDeliveryStatus("all"); }} className="btn-ghost text-xs py-1.5 px-3">✕ Réinitialiser</button>
                    )}
                  </div>
                </div>
              </div>
              {filteredDeliveries.length === 0 ? (
                <div className="py-20 text-center"><p className="text-4xl mb-3">📭</p><p className="text-slate-500 text-sm">{deliveries.length === 0 ? "Aucune livraison importée" : "Aucun résultat pour ces filtres"}</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>Commande</th><th>Tracking</th><th>Date prévue</th><th>Date réelle</th><th>Statut</th></tr></thead>
                    <tbody>
                      {filteredDeliveries.map((d) => (
                        <tr key={d.id}>
                          <td className="font-mono text-xs font-medium">{d.order_id}</td>
                          <td className="font-mono text-xs text-slate-500">{d.tracking}</td>
                          <td>{fdate(d.expected_date)}</td>
                          <td>{fdate(d.actual_date)}</td>
                          <td><DBadge s={d.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "anomalies" && (
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <h3 className="font-display font-600 text-white">Anomalies & Réclamations</h3>
                  <div className="flex gap-2 flex-wrap">
                    <input type="text" placeholder="🔍 Rechercher..." value={searchAnomaly} onChange={(e) => setSearchAnomaly(e.target.value)} className="input text-xs py-1.5 px-3 w-40" />
                    <select value={filterAnomalyType} onChange={(e) => setFilterAnomalyType(e.target.value)} className="input text-xs py-1.5 px-3 w-36">
                      <option value="all">Tous les types</option>
                      <option value="delay">Retard</option>
                      <option value="lost">Perdu</option>
                      <option value="service_failure">SLA</option>
                      <option value="partial_delivery">Livraison partielle</option>
                      <option value="billing_error">Erreur de facturation</option>
                      <option value="damaged">Colis endommagé</option>
                      <option value="double_billing">Double facturation</option>
                      <option value="overcharge">Surfacturation</option>
                    </select>
                    <select value={filterAnomalyStatus} onChange={(e) => setFilterAnomalyStatus(e.target.value)} className="input text-xs py-1.5 px-3 w-36">
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="sent">Envoyée</option>
                      <option value="paid">Remboursé</option>
                    </select>
                    {(searchAnomaly || filterAnomalyStatus !== "all" || filterAnomalyType !== "all") && (
                      <button onClick={() => { setSearchAnomaly(""); setFilterAnomalyStatus("all"); setFilterAnomalyType("all"); }} className="btn-ghost text-xs py-1.5 px-3">✕ Réinitialiser</button>
                    )}
                  </div>
                </div>
              </div>
              {filteredAnomalies.length === 0 ? (
                <div className="py-20 text-center"><p className="text-4xl mb-3">🔍</p><p className="text-slate-500 text-sm">{anomalies.length === 0 ? "Aucune anomalie détectée" : "Aucun résultat pour ces filtres"}</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>Type</th><th>Commande</th><th>Montant</th><th>Statut</th><th>Action</th></tr></thead>
                    <tbody>
                      {filteredAnomalies.map((a) => (
                        <tr key={a.id}>
                          <td><ABadge s={a.type} /></td>
                          <td className="font-mono text-xs font-medium">{(a.delivery as Delivery)?.order_id ?? "—"}</td>
                          <td className="font-display font-600 text-emerald-400">{eur(a.estimated_amount)}</td>
                          <td><SBadge s={a.status} /></td>
                          <td>
                            {busy.has(a.id) ? (
                              <span className="spinner inline-block" />
                            ) : a.status === "pending" ? (
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    id={`copy-${a.id}`}
                                    defaultChecked={true}
                                    className="w-3.5 h-3.5 accent-brand-500 cursor-pointer"
                                  />
                                  <label htmlFor={`copy-${a.id}`} className="text-xs text-slate-400 cursor-pointer">
                                    Recevoir une copie
                                  </label>
                                </div>
                                <button
                                  onClick={() => sendClaim(a.id, (document.getElementById(`copy-${a.id}`) as HTMLInputElement)?.checked)}
                                  className="btn-action"
                                >
                                  📤 Envoyer
                                </button>
                              </div>
                            ) : a.status === "sent" ? (
                              <button onClick={() => markPaid(a.id)} className="btn-success">✓ Remboursé</button>
                            ) : (
                              <span className="text-xs text-emerald-400 font-medium">✓ Récupéré</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-center text-xs text-slate-700 pb-4">Claim.e · </p>
      </main>
    </div>
  );
}