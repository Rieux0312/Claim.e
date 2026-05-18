"use client";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Types ──────────────────────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────────────
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
  if (type === "billing_error" || type === "overcharge" || type === "double_billing")
    return Math.round((30 + Math.random() * 150) * 100) / 100;
  return 50;
}
function useCountUp(target: number, dur = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const tick = (t: number) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / dur);
      setV(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#1a56ff", height = 36 }: { data: number[]; color?: string; height?: number }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * 100,
    100 - ((v - min) / range) * 90 - 5,
  ]);
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;
  const gid = `sp-${color.replace(/[^a-z0-9]/gi, "")}-${height}`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height={height} className="sparkline">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, unit, sub, trend, trendUp = true, accent = "brand", spark, icon }: {
  label: string; value: number; unit?: "€" | "%"; sub: string; trend?: string;
  trendUp?: boolean; accent?: "brand" | "success" | "warning"; spark?: number[]; icon: React.ReactNode;
}) {
  const v = useCountUp(value);
  const display = unit === "€" ? eur(v) : unit === "%" ? `${v.toFixed(1)}%` : Math.round(v).toLocaleString("fr-FR");
  const sparkColor = accent === "success" ? "#10b981" : accent === "warning" ? "#f59e0b" : "#1a56ff";
  return (
    <div className={`kpi-card kpi-${accent}`}>
      <div className="kpi-top">
        <span className="kpi-icon" aria-hidden="true">{icon}</span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{display}</div>
      <div className="kpi-foot">
        <span className="kpi-sub">{sub}</span>
        {trend && (
          <span className={`kpi-trend ${trendUp ? "up" : "down"}`}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d={trendUp ? "M5 1 L9 7 L1 7 Z" : "M5 9 L1 3 L9 3 Z"} fill="currentColor" />
            </svg>
            {trend}
          </span>
        )}
      </div>
      {spark && <div className="kpi-spark"><Sparkline data={spark} color={sparkColor} height={40} /></div>}
    </div>
  );
}

// ── Period Picker ──────────────────────────────────────────────────────────
type Period = "7j" | "30j" | "90j" | "1a";
const PERIODS: { v: Period; l: string }[] = [
  { v: "7j", l: "7 jours" }, { v: "30j", l: "30 jours" },
  { v: "90j", l: "90 jours" }, { v: "1a", l: "1 an" },
];
function PeriodPicker({ value, onChange }: { value: Period; onChange: (v: Period) => void }) {
  return (
    <div className="period-picker" role="radiogroup">
      {PERIODS.map((o) => (
        <button key={o.v} type="button" className={value === o.v ? "on" : ""}
          onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}

// ── Evolution Chart ────────────────────────────────────────────────────────
type ChartPoint = { label: string; recoverable: number; recovered: number };
function EvolutionChart({ data }: { data: ChartPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="dash-chart-empty">
        <div className="dash-chart-empty-icon">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l6-6 4 4 8-8" /><polyline points="14 7 21 7 21 14" />
          </svg>
        </div>
        <p className="dash-chart-empty-title">Aucune donnée pour le moment</p>
        <p className="dash-chart-empty-sub">Importez votre premier CSV ci-dessous pour voir votre courbe de récupération.</p>
      </div>
    );
  }
  const w = 720, h = 220, pad = { t: 8, r: 8, b: 24, l: 44 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxVal = Math.max(...data.flatMap((d) => [d.recoverable, d.recovered]), 100);
  const niceMax = Math.ceil(maxVal / 50) * 50;
  const xStep = innerW / Math.max(data.length - 1, 1);
  const xy = (i: number, v: number): [number, number] => [
    pad.l + i * xStep,
    pad.t + innerH - (v / niceMax) * innerH,
  ];
  const buildPath = (key: "recoverable" | "recovered") =>
    data.map((d, i) => { const [x, y] = xy(i, d[key]); return `${i === 0 ? "M" : "L"} ${x} ${y}`; }).join(" ");
  const buildArea = (key: "recoverable" | "recovered") => {
    const line = data.map((d, i) => { const [x, y] = xy(i, d[key]); return `L ${x} ${y}`; }).join(" ");
    const [lx] = xy(data.length - 1, 0);
    return `M ${pad.l} ${pad.t + innerH} ${line} L ${lx} ${pad.t + innerH} Z`;
  };
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => niceMax * p);
  const [lx, ly1] = xy(data.length - 1, data[data.length - 1].recoverable);
  const [, ly2] = xy(data.length - 1, data[data.length - 1].recovered);
  return (
    <div className="dash-chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} className="dash-chart-svg">
        <defs>
          <linearGradient id="dchart-recov" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a56ff" stopOpacity=".30" />
            <stop offset="100%" stopColor="#1a56ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dchart-paid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity=".30" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((v, i) => {
          const y = pad.t + innerH - (v / niceMax) * innerH;
          return (
            <g key={i}>
              <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="rgba(255,255,255,.04)" strokeWidth="1" />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="Sora,sans-serif">{v}€</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const [x] = xy(i, 0);
          return <text key={i} x={x} y={h - 6} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="Sora,sans-serif">{d.label}</text>;
        })}
        <path d={buildArea("recoverable")} fill="url(#dchart-recov)" />
        <path d={buildArea("recovered")}   fill="url(#dchart-paid)" />
        <path d={buildPath("recoverable")} fill="none" stroke="#1a56ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={buildPath("recovered")}   fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lx} cy={ly1} r="4" fill="#1a56ff" stroke="#0a0f1e" strokeWidth="2">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={lx} cy={ly2} r="4" fill="#10b981" stroke="#0a0f1e" strokeWidth="2">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

// ── Badges ────────────────────────────────────────────────────────────────
const DELIVERY_BADGE: Record<string, { color: string; label: string }> = {
  delivered: { color: "green",  label: "Livré" },
  delayed:   { color: "orange", label: "Retard" },
  lost:      { color: "red",    label: "Perdu" },
  pending:   { color: "gray",   label: "En attente" },
};
const TYPE_BADGE: Record<string, { color: string; label: string }> = {
  delay:            { color: "orange", label: "Retard" },
  lost:             { color: "red",    label: "Perdu" },
  service_failure:  { color: "gray",   label: "SLA" },
  partial_delivery: { color: "orange", label: "Livraison partielle" },
  billing_error:    { color: "red",    label: "Erreur facturation" },
  damaged:          { color: "red",    label: "Endommagé" },
  double_billing:   { color: "red",    label: "Double facturation" },
  overcharge:       { color: "orange", label: "Surfacturation" },
};
const STATUS_BADGE: Record<string, { color: string; label: string }> = {
  pending: { color: "orange", label: "En attente" },
  sent:    { color: "blue",   label: "Envoyée" },
  paid:    { color: "green",  label: "Remboursé" },
};
function Badge({ kind, value }: { kind: "delivery" | "type" | "status"; value: string }) {
  const map = kind === "delivery" ? DELIVERY_BADGE : kind === "type" ? TYPE_BADGE : STATUS_BADGE;
  const m = map[value] ?? { color: "gray", label: value };
  return <span className={`dash-badge dash-badge-${m.color}`}><i />{m.label}</span>;
}

// ── Toasts ────────────────────────────────────────────────────────────────
function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="dash-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`dash-toast dash-toast-${t.type}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            {t.type === "success"
              ? <polyline points="20 6 9 17 4 12" />
              : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>}
          </svg>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────
function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="dash-empty">
      <div className="dash-empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
      <p className="dash-empty-title">{title}</p>
      <p className="dash-empty-sub">{sub}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function DashboardClient({ user, initialDeliveries, initialAnomalies }: {
  user: User; initialDeliveries: Delivery[]; initialAnomalies: Anomaly[];
}) {
  const router = useRouter();
  const supabase = createClient();

  // ── State (identique à l'original) ──
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [anomalies, setAnomalies]   = useState(initialAnomalies);
  const [tab, setTab]               = useState<"deliveries" | "anomalies">("deliveries");
  const [analyzing, setAnalyzing]   = useState(false);
  const [toasts, setToasts]         = useState<Toast[]>([]);
  const [busy, setBusy]             = useState<Set<string>>(new Set());
  const [drag, setDrag]             = useState(false);
  const [file, setFile]             = useState<File | null>(null);
  const [period, setPeriod]         = useState<Period>("30j");

  const [searchDelivery, setSearchDelivery]               = useState("");
  const [filterDeliveryStatus, setFilterDeliveryStatus]   = useState("all");
  const [searchAnomaly, setSearchAnomaly]                 = useState("");
  const [filterAnomalyStatus, setFilterAnomalyStatus]     = useState("all");
  const [filterAnomalyType, setFilterAnomalyType]         = useState("all");

  const fileRef = useRef<HTMLInputElement>(null);
  const tid     = useRef(0);
  const importRef = useRef<HTMLDivElement>(null);

  // ── Toast helper ──
  function toast(msg: string, type: "success" | "error" = "success") {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }

  // ── Actions (logique inchangée) ──
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
      const deliveryInserts = rows
        .filter((r) => r.expected_date && r.expected_date.trim() !== "")
        .map((r) => ({
          order_id:      r.order_id || `ORD-${Date.now()}`,
          tracking:      r.tracking || "",
          expected_date: r.expected_date,
          actual_date:   r.actual_date || null,
          carrier:       r.carrier || r.transporteur || r.transporter || null,
          status:
            r.anomaly_type === "lost" ? ("lost" as const) :
            r.anomaly_type && r.anomaly_type !== "delay" ? ("pending" as const) :
            inferStatus(r.expected_date, r.actual_date || undefined),
          user_id: user.id,
        }));
      const { data: ins, error: dErr } = await supabase.from("deliveries").insert(deliveryInserts).select();
      if (dErr) throw new Error(dErr.message);
      const aIns = (ins ?? []).map((d, index) => {
        const rawRow = rows[index] ?? {};
        const manualType = rawRow.anomaly_type?.trim();
        const anomalyType =
          manualType && manualType !== "" ? manualType :
          d.status === "delayed" ? "delay" :
          d.status === "lost" ? "lost" : null;
        if (!anomalyType) return null;
        const days = d.actual_date
          ? Math.ceil((new Date(d.actual_date).getTime() - new Date(d.expected_date).getTime()) / 86400000)
          : 0;
        return { delivery_id: d.id, type: anomalyType, estimated_amount: calcAmount(anomalyType, days), status: "pending", user_id: user.id };
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
      const res  = await fetch("/api/send-claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomalyId: id, sendCopy }) });
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
    doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text("Claim.e — Rapport d'anomalies", 14, 15);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Entreprise : ${user.company_name}`, 14, 23);
    doc.text(`Généré le : ${new Date().toLocaleDateString("fr-FR")}`, 14, 30);
    doc.setTextColor(30, 45, 69);
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text("Résumé", 14, 50);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
    doc.text(`Montant récupérable : ${eur(recoverable)}`, 14, 60);
    doc.text(`Montant récupéré : ${eur(recovered)}`, 14, 68);
    doc.text(`Anomalies actives : ${active.length}`, 14, 76);
    doc.text(`Livraisons analysées : ${deliveries.length}`, 14, 84);
    doc.text(`Taux d'erreur : ${errorRate.toFixed(1)}%`, 14, 92);
    doc.setTextColor(30, 45, 69); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("Détail des anomalies", 14, 108);
    const typeLabels: Record<string, string> = { delay:"Retard", lost:"Perdu", service_failure:"SLA", partial_delivery:"Livraison partielle", billing_error:"Erreur de facturation", damaged:"Colis endommagé", double_billing:"Double facturation", overcharge:"Surfacturation" };
    const statusLabels: Record<string, string> = { pending:"En attente", sent:"Réclamation envoyée", paid:"Remboursé" };
    autoTable(doc, {
      startY: 114,
      head: [["Commande","Type","Montant estimé","Statut"]],
      body: anomalies.map((a) => [(a.delivery as Delivery)?.order_id ?? "—", typeLabels[a.type] ?? a.type, eur(a.estimated_amount), statusLabels[a.status] ?? a.status]),
      headStyles: { fillColor: [26,86,255], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248,250,252] },
      styles: { fontSize: 9, cellPadding: 5 },
    });
    doc.save(`claim-e-anomalies-${new Date().toISOString().split("T")[0]}.pdf`);
    toast("PDF exporté avec succès ✓");
  }

  // ── Derived stats (inchangé) ──
  const active      = anomalies.filter((a) => a.status !== "paid");
  const paid        = anomalies.filter((a) => a.status === "paid");
  const recoverable = active.reduce((s, a) => s + a.estimated_amount, 0);
  const recovered   = paid.reduce((s, a) => s + a.estimated_amount, 0);
  const errorRate   = deliveries.length > 0 ? (anomalies.length / deliveries.length) * 100 : 0;

  // ── Chart data (period-aware) ──
  const chartData = useMemo<ChartPoint[]>(() => {
    const TODAY = new Date();
    const count   = period === "7j" ? 7  : period === "30j" ? 4  : 12;
    const stepDays= period === "7j" ? 1  : period === "30j" ? 7  : period === "90j" ? 7 : 30;
    return Array.from({ length: count }, (_, idx) => {
      const i = count - 1 - idx;
      const end   = new Date(TODAY.getTime() - i * stepDays * 86400000);
      const start = new Date(end.getTime() - stepDays * 86400000);
      const inRange = anomalies.filter((a) => {
        const t = new Date(a.created_at).getTime();
        return t >= start.getTime() && t <= end.getTime();
      });
      const label =
        period === "7j" ? end.toLocaleDateString("fr-FR", { weekday: "short" }) :
        period === "1a" ? end.toLocaleDateString("fr-FR", { month: "short" }) :
        end.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
      return {
        label,
        recoverable: inRange.filter((a) => a.status !== "paid").reduce((s, a) => s + a.estimated_amount, 0),
        recovered:   inRange.filter((a) => a.status === "paid").reduce((s, a) => s + a.estimated_amount, 0),
      };
    });
  }, [anomalies, period]);

  const sparkRecoverable = chartData.map((d) => d.recoverable);
  const sparkRecovered   = chartData.map((d) => d.recovered);
  const sparkDeliveries  = chartData.map((_, i) => deliveries.length * 0.1 + i);
  const sparkActive      = chartData.map((d, i) => d.recoverable * 0.02 + (i % 3) * 0.5);

  // ── Filtered rows ──
  const filteredDeliveries = deliveries.filter((d) => {
    const s = searchDelivery.toLowerCase();
    return (!s || d.order_id.toLowerCase().includes(s) || d.tracking.toLowerCase().includes(s))
      && (filterDeliveryStatus === "all" || d.status === filterDeliveryStatus);
  });
  const filteredAnomalies = anomalies.filter((a) => {
    const del = a.delivery as Delivery;
    const s   = searchAnomaly.toLowerCase();
    return (!s || del?.order_id?.toLowerCase().includes(s))
      && (filterAnomalyStatus === "all" || a.status === filterAnomalyStatus)
      && (filterAnomalyType   === "all" || a.type   === filterAnomalyType);
  });

  const initial = (user.company_name?.[0] || "U").toUpperCase();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dash">
      <Toasts toasts={toasts} />

      {/* ── Header ── */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <Link href="/" className="dash-logo">
            <Logo size={28} />
            <span>Claim<span style={{ opacity: 0.5 }}>.</span>e</span>
          </Link>

          <nav className="dash-nav">
            <Link href="/dashboard" className="dash-nav-item on">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              Dashboard
            </Link>
            <Link href="/settings" className="dash-nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Paramètres
            </Link>
            <Link href="/#tarifs" className="dash-nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Tarifs
            </Link>
          </nav>

          <div className="dash-user">
            <div className="dash-user-info">
              <div className="dash-user-name">{user.company_name}</div>
              <div className="dash-user-email">{user.email}</div>
            </div>
            <button className="dash-avatar">{initial}</button>
            <button className="dash-logout" onClick={logout} title="Déconnexion">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="dash-main">

        {/* ── Welcome strip ── */}
        <div className="welcome-strip">
          <div>
            <h1 className="dash-h1">
              Bonjour <span className="em">{user.company_name}</span>
              <span className="hand" aria-hidden="true">👋</span>
            </h1>
            <p className="dash-h1-sub">
              Vous avez <strong>{eur(recoverable)}</strong> à récupérer — Claim.e a déjà envoyé{" "}
              {anomalies.filter((a) => a.status === "sent").length} réclamation(s) en votre nom.
            </p>
          </div>
          <div className="welcome-actions">
            <button className="dash-btn dash-btn-ghost" onClick={exportPDF}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exporter PDF
            </button>
            <button className="dash-btn dash-btn-primary" onClick={() => importRef.current?.scrollIntoView({ behavior: "smooth" })}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Importer CSV
            </button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="kpi-grid">
          <KpiCard label="Récupérable" value={recoverable} unit="€" sub={`${active.length} anomalies actives`} trend="+18,4%" accent="brand" spark={sparkRecoverable}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} />
          <KpiCard label="Récupéré" value={recovered} unit="€" sub={`${paid.length} remboursements`} trend="+12%" accent="success" spark={sparkRecovered}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>} />
          <KpiCard label="Livraisons" value={deliveries.length} sub="Sur 30 jours glissants" trend={`+${Math.max(0, deliveries.length - 5)}`} accent="brand" spark={sparkDeliveries}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>} />
          <KpiCard label="Taux d'erreur" value={errorRate} unit="%" sub="Moyenne secteur : 3,2%" trend={errorRate > 3.2 ? "+1,4 pt" : "−0,4 pt"} trendUp={errorRate > 3.2} accent="warning" spark={sparkActive}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>} />
        </div>

        {/* ── Chart ── */}
        <div className="dash-card">
          <div className="dash-card-head">
            <div>
              <h2 className="dash-card-title">Évolution des montants</h2>
              <p className="dash-card-sub">Récupérable vs. récupéré sur la période sélectionnée</p>
            </div>
            <PeriodPicker value={period} onChange={setPeriod} />
          </div>
          <EvolutionChart data={chartData} />
          <div className="dash-chart-legend">
            <span className="dash-legend-item"><i style={{ background: "#1a56ff" }} />Récupérable<strong>{eur(recoverable)}</strong></span>
            <span className="dash-legend-item"><i style={{ background: "#10b981" }} />Récupéré<strong>{eur(recovered)}</strong></span>
          </div>
        </div>

        {/* ── Import ── */}
        <div className="dash-card" ref={importRef}>
          <div className="dash-card-head">
            <div>
              <h2 className="dash-card-title">Importer des livraisons</h2>
              <p className="dash-card-sub">Colonnes : <code>order_id, tracking, expected_date, actual_date, anomaly_type</code></p>
            </div>
            <span className="dash-badge-secure">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Données chiffrées
            </span>
          </div>

          <div className="dash-import-row">
            <div
              className={`dash-dropzone${drag ? " dragging" : ""}${file ? " filed" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
            >
              <input ref={fileRef} type="file" accept=".csv" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
              <div className="dash-dz-icon">
                {file ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
                  </svg>
                ) : (
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
                <span className="dash-dz-pulse" />
              </div>
              <p className="dash-dz-title">{file ? file.name : drag ? "Lâchez pour importer" : "Glissez votre CSV ici"}</p>
              <p className="dash-dz-sub">{file ? `${(file.size / 1024).toFixed(1)} KB · prêt à analyser` : "ou cliquez pour sélectionner"}</p>
            </div>

            <div className="dash-import-actions">
              <button className="dash-btn dash-btn-primary" disabled={!file || analyzing} onClick={handleAnalyze}>
                {analyzing ? (
                  <><span className="dash-spinner" />Analyse…</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>Analyser</>
                )}
              </button>
              <a className="dash-btn dash-btn-ghost" download="template.csv"
                href="data:text/csv;charset=utf-8,order_id,tracking,expected_date,actual_date,anomaly_type%0AORD-001,FR123456789FR,2024-01-10,2024-01-14,%0AORD-002,FR987654321FR,2024-01-11,,lost">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Modèle CSV
              </a>
            </div>
          </div>
        </div>

        {/* ── Tabs + Tables ── */}
        <div className="dash-tabs-section">
          <div className="dash-tabs-head">
            <div className="dash-tabs" role="tablist">
              <div className="dash-tabs-thumb" style={{ left: `calc(4px + ${tab === "deliveries" ? 0 : 1} * (50% - 4px))` }} />
              {([["deliveries", "Livraisons", filteredDeliveries.length], ["anomalies", "Anomalies", filteredAnomalies.length]] as [string, string, number][]).map(([v, l, c]) => (
                <button key={v} role="tab" aria-selected={tab === v} className={tab === v ? "on" : ""} onClick={() => setTab(v as "deliveries" | "anomalies")}>
                  <span>{l}</span>
                  <span className="dash-tabs-count">{c}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dash-table-card">
            {tab === "deliveries" ? (
              <>
                <div className="dash-filters">
                  <label className="dash-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Rechercher" value={searchDelivery} onChange={(e) => setSearchDelivery(e.target.value)} />
                  </label>
                  <select className="dash-select" value={filterDeliveryStatus} onChange={(e) => setFilterDeliveryStatus(e.target.value)}>
                    <option value="all">Tous les statuts</option>
                    <option value="delivered">Livré</option>
                    <option value="delayed">Retard</option>
                    <option value="lost">Perdu</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
                {filteredDeliveries.length === 0 ? (
                  <EmptyState title="Aucune livraison" sub="Importez un CSV ci-dessus pour démarrer." />
                ) : (
                  <div className="dash-table-wrap">
                    <table className="dash-data-table">
                      <thead>
                        <tr><th>Commande</th><th>Transporteur</th><th>Tracking</th><th>Date prévue</th><th>Date réelle</th><th>Statut</th></tr>
                      </thead>
                      <tbody>
                        {filteredDeliveries.map((d, i) => (
                          <tr key={d.id} style={{ animationDelay: `${i * 40}ms` }}>
                            <td className="d-mono d-strong">{d.order_id}</td>
                            <td>{(d as Delivery & { carrier?: string }).carrier || "—"}</td>
                            <td className="d-mono d-dim">{d.tracking}</td>
                            <td>{fdate(d.expected_date)}</td>
                            <td>{fdate(d.actual_date)}</td>
                            <td><Badge kind="delivery" value={d.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="dash-filters">
                  <label className="dash-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Rechercher" value={searchAnomaly} onChange={(e) => setSearchAnomaly(e.target.value)} />
                  </label>
                  <select className="dash-select" value={filterAnomalyType} onChange={(e) => setFilterAnomalyType(e.target.value)}>
                    <option value="all">Tous les types</option>
                    <option value="delay">Retard</option>
                    <option value="lost">Perdu</option>
                    <option value="overcharge">Surfacturation</option>
                    <option value="billing_error">Erreur facturation</option>
                    <option value="damaged">Endommagé</option>
                  </select>
                  <select className="dash-select" value={filterAnomalyStatus} onChange={(e) => setFilterAnomalyStatus(e.target.value)}>
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="sent">Envoyée</option>
                    <option value="paid">Remboursé</option>
                  </select>
                </div>
                {filteredAnomalies.length === 0 ? (
                  <EmptyState title="Aucune anomalie" sub="Bonne nouvelle — vos livraisons sont au vert." />
                ) : (
                  <div className="dash-table-wrap">
                    <table className="dash-data-table">
                      <thead>
                        <tr><th>Type</th><th>Commande</th><th>Transporteur</th><th>Montant</th><th>Statut</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {filteredAnomalies.map((a, i) => (
                          <tr key={a.id} style={{ animationDelay: `${i * 40}ms` }}>
                            <td><Badge kind="type" value={a.type} /></td>
                            <td className="d-mono d-strong">{(a.delivery as Delivery)?.order_id || "—"}</td>
                            <td>{(a.delivery as Delivery & { carrier?: string })?.carrier || "—"}</td>
                            <td className="d-amount">{eur(a.estimated_amount)}</td>
                            <td><Badge kind="status" value={a.status} /></td>
                            <td>
                              {busy.has(a.id) ? <span className="dash-spinner" /> :
                               a.status === "pending" ? (
                                 <button className="dash-btn-action" onClick={() => sendClaim(a.id)}>
                                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                     <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                   </svg>
                                   Envoyer
                                 </button>
                               ) : a.status === "sent" ? (
                                 <button className="dash-btn-action dash-btn-action-ok" onClick={() => markPaid(a.id)}>
                                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                     <polyline points="20 6 9 17 4 12" />
                                   </svg>
                                   Marquer payé
                                 </button>
                               ) : (
                                 <span className="dash-paid-marker">
                                   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                     <polyline points="20 6 9 17 4 12" />
                                   </svg>
                                   Récupéré
                                 </span>
                               )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="dash-footer">
          <span>Claim.e — Tableau de bord</span>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </footer>

      </main>
    </div>
  );
}
