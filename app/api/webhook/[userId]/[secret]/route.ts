/**
 * Webhook universel Claim.e
 *
 * URL : POST /api/webhook/{userId}/{secret}
 *
 * Compatible avec les formats suivants (détection automatique) :
 *  - Shopify       (order/fulfilled, order/updated)
 *  - WooCommerce   (order.updated)
 *  - PrestaShop    (via module ou Zapier)
 *  - Sendcloud     (parcel_status_changed)
 *  - Boxtal        (suivi de colis)
 *  - Format générique Claim.e
 *  - Tout JSON contenant un numéro de tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calcAmount } from "@/lib/sync-deliveries";

type DeliveryStatus = "delivered" | "delayed" | "lost" | "pending";
type AnomalyType    = "delay" | "lost" | "service_failure";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toYMD(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Lit une valeur imbriquée via un chemin "a.b.0.c" */
function dig(obj: unknown, path: string): string | null {
  const val = path.split(".").reduce<unknown>((cur, key) => {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) return cur[Number(key)];
    if (typeof cur === "object") return (cur as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return val != null && typeof val === "string" && val.trim() ? val.trim() : null;
}

function normalizeStatus(raw: string): DeliveryStatus {
  const s = raw.toLowerCase();
  if (s.includes("delivered") || s.includes("livré") || s.includes("distribué") || s.includes("remis")) return "delivered";
  if (s.includes("lost") || s.includes("perdu") || s.includes("introuvable") || s.includes("failed")) return "lost";
  if (s.includes("delay") || s.includes("retard") || s.includes("attempted") || s.includes("late"))    return "delayed";
  return "pending";
}

// ── Parser multi-format ───────────────────────────────────────────────────────

interface ParsedShipment {
  order_id:      string;
  tracking:      string;
  status:        DeliveryStatus;
  expected_date: string;
  actual_date:   string | null;
}

function parse(body: Record<string, unknown>): ParsedShipment | null {
  // ── Tracking (champ le plus important) ──────────────────────────────────────
  const tracking =
    // Generique / Claim.e natif
    dig(body, "tracking") ||
    dig(body, "tracking_number") ||
    dig(body, "trackingNumber") ||
    // Shopify fulfillment webhook
    dig(body, "fulfillments.0.tracking_number") ||
    // Sendcloud
    dig(body, "parcel.tracking_number") ||
    // PrestaShop
    dig(body, "shipping_number") ||
    dig(body, "id_tracking") ||
    // Boxtal
    dig(body, "shipment.tracking_number") ||
    dig(body, "colis.numero_suivi") ||
    // WooCommerce meta_data
    (() => {
      const meta = (body as Record<string, unknown[]>).meta_data;
      if (!Array.isArray(meta)) return null;
      const entry = meta.find(
        (m) => typeof m === "object" && m !== null &&
          ["_tracking_number", "tracking_number", "_wc_shipment_tracking_number"].includes(
            (m as Record<string, string>).key
          )
      ) as Record<string, string> | undefined;
      return entry?.value?.trim() ?? null;
    })();

  if (!tracking) return null;

  // ── Order ID ────────────────────────────────────────────────────────────────
  const order_id =
    dig(body, "order_id")     ||
    dig(body, "name")          ||   // Shopify (#1001)
    dig(body, "number")        ||   // WooCommerce
    dig(body, "reference")     ||   // Sendcloud / générique
    dig(body, "id_order")      ||   // PrestaShop
    dig(body, "order_number")  ||
    dig(body, "parcel.reference") ||
    String((body as Record<string, unknown>).id ?? `WH-${Date.now()}`);

  // ── Statut ──────────────────────────────────────────────────────────────────
  // Sendcloud utilise des IDs numériques (11 = livré, ≥1000 = échec)
  const sendcloudId = (body as { parcel?: { status?: { id?: number } } })
    ?.parcel?.status?.id;

  let status: DeliveryStatus;
  if (sendcloudId != null) {
    if (sendcloudId === 11)       status = "delivered";
    else if (sendcloudId >= 1000) status = "lost";
    else if (sendcloudId === 8 || sendcloudId === 17) status = "delayed";
    else                          status = "pending";
  } else {
    const rawStatus =
      dig(body, "status")                         ||
      dig(body, "shipment_status")                ||
      dig(body, "fulfillments.0.shipment_status") ||
      dig(body, "parcel.status.message")          ||
      dig(body, "shipping_status")                || "";
    status = normalizeStatus(rawStatus);
  }

  // ── Date prévue ─────────────────────────────────────────────────────────────
  const rawExpected =
    dig(body, "expected_date")           ||
    dig(body, "expected_delivery_date")  ||
    dig(body, "estimatedDelivery")       ||
    dig(body, "parcel.expected_delivery_date") ||
    dig(body, "fulfillments.0.estimated_delivery_at");

  const fallbackExpected = new Date();
  fallbackExpected.setDate(fallbackExpected.getDate() + 3);

  const expected_date = rawExpected
    ? rawExpected.split("T")[0]
    : toYMD(fallbackExpected);

  // ── Date réelle ─────────────────────────────────────────────────────────────
  const rawActual =
    dig(body, "actual_date")     ||
    dig(body, "delivered_at")    ||
    dig(body, "delivery_date")   ||
    dig(body, "parcel.date_delivered");

  const actual_date = status === "delivered"
    ? (rawActual?.split("T")[0] ?? toYMD(new Date()))
    : null;

  return { order_id, tracking, status, expected_date, actual_date };
}

// ── Détection anomalie ────────────────────────────────────────────────────────

function detectAnomaly(s: ParsedShipment): AnomalyType | null {
  if (s.status === "lost")    return "lost";
  if (s.status === "delayed") return "delay";
  if (s.status === "delivered" && s.actual_date) {
    const late = Math.ceil(
      (new Date(s.actual_date).getTime() - new Date(s.expected_date).getTime()) / 86400000
    );
    if (late > 2) return "service_failure";
  }
  return null;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; secret: string }> }
) {
  const { userId, secret } = await params;

  // Service role — pas de session, le secret fait office d'auth
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Vérifie le secret
  const { data: profile } = await supabase
    .from("users")
    .select("id, webhook_secret")
    .eq("id", userId)
    .single();

  if (!profile || profile.webhook_secret !== secret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Parse le payload
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const shipment = parse(body);

  // Aucun tracking détecté → on accepte silencieusement (évite les retry inutiles)
  if (!shipment) {
    return NextResponse.json({ received: true, processed: false });
  }

  // Vérifie si la livraison existe déjà
  const { data: existing } = await supabase
    .from("deliveries")
    .select("id, status")
    .eq("user_id", userId)
    .eq("tracking", shipment.tracking)
    .maybeSingle();

  let deliveryId: string;

  if (existing) {
    if (existing.status !== shipment.status) {
      await supabase.from("deliveries").update({
        status:        shipment.status,
        actual_date:   shipment.actual_date,
        expected_date: shipment.expected_date,
      }).eq("id", existing.id);
    }
    deliveryId = existing.id;
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from("deliveries")
      .insert({
        order_id:      shipment.order_id,
        tracking:      shipment.tracking,
        expected_date: shipment.expected_date,
        actual_date:   shipment.actual_date,
        status:        shipment.status,
        user_id:       userId,
      })
      .select("id")
      .single();

    if (insErr || !inserted) {
      console.error("[webhook] insert delivery:", insErr);
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }
    deliveryId = inserted.id;
  }

  // Détection et création d'anomalie
  const anomalyType = detectAnomaly(shipment);
  let anomalyCreated = false;

  if (anomalyType) {
    const { data: existingAnomaly } = await supabase
      .from("anomalies")
      .select("id")
      .eq("delivery_id", deliveryId)
      .eq("type", anomalyType)
      .maybeSingle();

    if (!existingAnomaly) {
      const daysLate = shipment.actual_date
        ? Math.ceil((new Date(shipment.actual_date).getTime() - new Date(shipment.expected_date).getTime()) / 86400000)
        : Math.floor((Date.now() - new Date(shipment.expected_date).getTime()) / 86400000);

      await supabase.from("anomalies").insert({
        delivery_id:      deliveryId,
        type:             anomalyType,
        estimated_amount: calcAmount(anomalyType, Math.max(0, daysLate)),
        status:           "pending",
        user_id:          userId,
      });
      anomalyCreated = true;
    }
  }

  return NextResponse.json({
    received:       true,
    processed:      true,
    order_id:       shipment.order_id,
    tracking:       shipment.tracking,
    status:         shipment.status,
    anomaly:        anomalyType ?? null,
    anomaly_created: anomalyCreated,
  });
}
