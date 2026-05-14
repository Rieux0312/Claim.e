/**
 * Logique centrale de synchronisation — sources supportées :
 *  - Shopify   (Admin API REST — liste des commandes expédiées)
 *  - Sendcloud (API v3 — agrégateur d'expédition n°1 France)
 *  - Transporteurs (mise à jour de statut par tracking number)
 *
 * Utilisée par /api/sync-orders (déclenché par le client)
 * et /api/cron/sync-all (job automatique quotidien Vercel).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DeliveryStatus = "delivered" | "delayed" | "lost" | "pending";
export type AnomalyType   = "delay" | "lost" | "service_failure";

export interface NormalizedShipment {
  order_id:      string;
  tracking:      string;
  status:        DeliveryStatus;
  expected_date: string;       // YYYY-MM-DD
  actual_date:   string | null;
}

export interface SyncResult {
  deliveries_upserted: number;
  anomalies_created:   number;
  errors:              string[];
}

export interface ShopifyCredentials {
  domain: string;  // ex: monstore.myshopify.com
  token:  string;  // shpat_xxx
}

// ── Helpers partagés avec DashboardClient ─────────────────────────────────────

function toYMD(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function calcAmount(type: AnomalyType, daysLate = 0): number {
  if (type === "lost")            return Math.round((150 + Math.random() * 100) * 100) / 100;
  if (type === "delay")           return daysLate <= 3 ? daysLate * 15 : 45 + (daysLate - 3) * 25;
  if (type === "service_failure") return 20;
  return 50;
}

function detectAnomalyType(s: NormalizedShipment): AnomalyType | null {
  if (s.status === "lost")    return "lost";
  if (s.status === "delayed") return "delay";
  if (s.status === "delivered" && s.actual_date) {
    const daysLate = Math.ceil(
      (new Date(s.actual_date).getTime() - new Date(s.expected_date).getTime()) / 86400000
    );
    if (daysLate > 2) return "service_failure";
  }
  return null;
}

// ── Shopify ───────────────────────────────────────────────────────────────────

// Valeurs officielles du champ shipment_status (doc Shopify 2024-10)
function mapShopifyStatus(status: string | null): DeliveryStatus {
  switch (status) {
    case "delivered":          return "delivered";
    case "failure":            return "lost";
    case "attempted_delivery": return "delayed";
    // label_printed / label_purchased / confirmed / in_transit / out_for_delivery / ready_for_pickup
    default:                   return "pending";
  }
}

export async function fetchShopify(
  { domain, token }: ShopifyCredentials,
  since: Date
): Promise<NormalizedShipment[]> {
  const host    = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const base    = `https://${host}/admin/api/2024-10`;
  const headers = { "X-Shopify-Access-Token": token, "Content-Type": "application/json" };
  const results: NormalizedShipment[] = [];

  // Récupère les commandes avec fulfillments inclus, paginées par 250
  let url: string | null =
    `${base}/orders.json?status=any&fulfillment_status=shipped,partial` +
    `&created_at_min=${since.toISOString()}&limit=250` +
    `&fields=id,name,fulfillments,created_at`;

  while (url) {
    const res: Response = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Shopify HTTP ${res.status} — vérifiez le domaine et le token`);

    const data = await res.json() as { orders?: ShopifyOrder[] };

    for (const order of data.orders ?? []) {
      for (const fulfillment of order.fulfillments ?? []) {
        if (!fulfillment.tracking_number?.trim()) continue;

        const status = mapShopifyStatus(fulfillment.shipment_status);

        // Date de livraison prévue : créé + 3 jours ouvrés (Shopify ne fournit pas de date estimée)
        const createdAt  = new Date(fulfillment.created_at);
        const expectedDt = new Date(createdAt);
        expectedDt.setDate(expectedDt.getDate() + 3);

        // Date réelle si livré
        const actualDate =
          status === "delivered"
            ? fulfillment.updated_at.split("T")[0]
            : null;

        results.push({
          order_id:      order.name,   // ex: "#1001"
          tracking:      fulfillment.tracking_number.trim(),
          status,
          expected_date: toYMD(expectedDt),
          actual_date:   actualDate,
        });
      }
    }

    // Pagination Shopify via header Link
    const linkHeader = res.headers.get("Link") ?? "";
    const nextMatch  = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }

  return results;
}

// Types internes Shopify
interface ShopifyOrder {
  id:           number;
  name:         string;
  created_at:   string;
  fulfillments: ShopifyFulfillment[];
}
interface ShopifyFulfillment {
  id:               number;
  tracking_number:  string | null;
  tracking_company: string | null;
  shipment_status:  string | null;
  created_at:       string;
  updated_at:       string;
}

// ── Sendcloud ─────────────────────────────────────────────────────────────────
// Agrégateur d'expédition n°1 en France — couvre tous les transporteurs
// Doc : https://sendcloud.dev/api/v3/shipments/retrieve-shipments

export async function fetchSendcloud(
  credentials: string,
  since: Date
): Promise<NormalizedShipment[]> {
  const [publicKey, secretKey] = credentials.split(":");
  if (!publicKey || !secretKey)
    throw new Error("Format Sendcloud invalide — attendu : publicKey:secretKey");

  const results: NormalizedShipment[] = [];
  let url: string | null =
    `https://panel.sendcloud.sc/api/v3/shipments` +
    `?updated_after=${since.toISOString()}&limit=100`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`Sendcloud HTTP ${res.status} — vérifiez vos clés API`);
    const data = await res.json() as { results?: SendcloudShipment[] };

    for (const s of data.results ?? []) {
      const tracking = s.tracking_number?.trim();
      if (!tracking) continue;

      // Sendcloud status IDs officiels
      // 11 = Delivered, 12 = At pickup point, ≥1000 = échec/annulé
      let status: DeliveryStatus;
      const sid = s.status?.id ?? 0;
      if (sid === 11 || sid === 12)  status = "delivered";
      else if (sid >= 1000)          status = "lost";
      else if (sid === 8 || sid === 17 || sid === 91) status = "delayed";
      else                           status = "pending";

      const createdAt = new Date(s.created_at ?? Date.now());
      const expectedFallback = new Date(createdAt);
      expectedFallback.setDate(expectedFallback.getDate() + 3);

      results.push({
        order_id:      s.reference ?? s.external_reference ?? String(s.id),
        tracking,
        status,
        expected_date: s.expected_delivery_date
          ? s.expected_delivery_date.split("T")[0]
          : toYMD(expectedFallback),
        actual_date:
          status === "delivered"
            ? (s.updated_at?.split("T")[0] ?? toYMD(new Date()))
            : null,
      });
    }

    // Pagination Sendcloud via Link header (identique à Shopify)
    const linkHeader = res.headers.get("Link") ?? "";
    const nextMatch  = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }

  return results;
}

interface SendcloudShipment {
  id:                       number;
  tracking_number:          string | null;
  reference:                string | null;
  external_reference:       string | null;
  status:                   { id: number; message: string } | null;
  created_at:               string | null;
  updated_at:               string | null;
  expected_delivery_date:   string | null;
}

// ── Transporteurs : mise à jour de statut ─────────────────────────────────────
// Les APIs transporteurs ne listent pas les expéditions — elles trackent un numéro donné.
// Cette fonction met à jour les livraisons déjà en base qui ont un tracking non livré.

function normalizeCarrierStatus(raw: string): DeliveryStatus {
  const s = raw.toLowerCase();
  if (s.includes("delivered") || s.includes("livré") || s.includes("distribué") ||
      s.includes("remis")     || s.includes("délivré"))                            return "delivered";
  if (s.includes("lost")      || s.includes("perdu") || s.includes("introuvable")) return "lost";
  if (s.includes("delay")     || s.includes("retard") || s.includes("late"))       return "delayed";
  return "pending";
}

function detectCarrier(tracking: string): string {
  const t = tracking.toUpperCase().trim();
  if (t.startsWith("1Z"))                       return "ups";
  if (t.startsWith("JD"))                       return "dhl";
  if (/^\d{12,14}$/.test(t) && t.startsWith("7")) return "fedex";
  if (/^\d{9,10}$/.test(t))                    return "tnt";
  if (t.startsWith("GL"))                       return "gls";
  if (/^\d{14}$/.test(t))                       return "dpd";
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(t))       return "chronopost";
  if (t.startsWith("FR") && t.endsWith("FR"))   return "colissimo";
  if (/^[A-Z0-9]{15,}$/.test(t))               return "mondialrelay";
  return "unknown";
}

async function trackOneNumber(
  tracking: string,
  carrier:  string,
  apiKey:   string
): Promise<DeliveryStatus> {
  switch (carrier) {
    case "colissimo": {
      const r = await fetch(
        `https://api.laposte.fr/suivi/v2/idships/${encodeURIComponent(tracking)}?lang=fr_FR`,
        { headers: { "X-Okapi-Key": apiKey, Accept: "application/json" } }
      );
      if (!r.ok) throw new Error(`Colissimo ${r.status}`);
      const d = await r.json();
      return normalizeCarrierStatus(d.shipment?.event?.[0]?.label ?? "");
    }
    case "dhl": {
      const r = await fetch(
        `https://api-eu.dhl.com/track/shipments?trackingNumber=${encodeURIComponent(tracking)}`,
        { headers: { "DHL-API-Key": apiKey, Accept: "application/json" } }
      );
      if (!r.ok) throw new Error(`DHL ${r.status}`);
      const d = await r.json();
      return normalizeCarrierStatus(d.shipments?.[0]?.status?.status ?? "");
    }
    case "ups": {
      const [id, secret] = apiKey.split(":");
      const tok = await fetch("https://onlinetools.ups.com/security/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      });
      if (!tok.ok) throw new Error(`UPS auth ${tok.status}`);
      const { access_token } = await tok.json();
      const r = await fetch(
        `https://onlinetools.ups.com/api/track/v1/details/${encodeURIComponent(tracking)}`,
        { headers: { Authorization: `Bearer ${access_token}`, Accept: "application/json" } }
      );
      if (!r.ok) throw new Error(`UPS ${r.status}`);
      const d = await r.json();
      return normalizeCarrierStatus(
        d.trackResponse?.shipment?.[0]?.package?.[0]?.activity?.[0]?.status?.description ?? ""
      );
    }
    case "fedex":
    case "tnt": {
      const [key, secret] = apiKey.split(":");
      const tok = await fetch("https://apis.fedex.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(key)}&client_secret=${encodeURIComponent(secret)}`,
      });
      if (!tok.ok) throw new Error(`FedEx auth ${tok.status}`);
      const { access_token } = await tok.json();
      const r = await fetch("https://apis.fedex.com/track/v1/trackingnumbers", {
        method: "POST",
        headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ trackingInfo: [{ trackingNumberInfo: { trackingNumber: tracking } }] }),
      });
      if (!r.ok) throw new Error(`FedEx ${r.status}`);
      const d = await r.json();
      return normalizeCarrierStatus(
        d.output?.completeTrackResults?.[0]?.trackResults?.[0]?.latestStatusDetail?.status ?? ""
      );
    }
    case "chronopost": {
      const r = await fetch(
        `https://www.chronopost.fr/tracking-cxf/TrackingServiceWS/trackSkybillV2?language=fr&skybillNumber=${encodeURIComponent(tracking)}`
      );
      if (!r.ok) throw new Error(`Chronopost ${r.status}`);
      return normalizeCarrierStatus(await r.text());
    }
    case "gls": {
      const [contactId, token] = apiKey.split(":");
      const r = await fetch(
        `https://api.gls-group.eu:443/public/v3/TrackTrace/Shipment/${encodeURIComponent(tracking)}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${contactId}:${token}`).toString("base64")}`,
            Accept: "application/json",
          },
        }
      );
      if (!r.ok) throw new Error(`GLS ${r.status}`);
      const d = await r.json();
      return normalizeCarrierStatus(d.Tuples?.[0]?.Tuple?.[0]?.ProgressBar?.Status ?? "");
    }
    case "dpd": {
      const r = await fetch(`https://tracking.dpd.fr/api/track/${encodeURIComponent(tracking)}`);
      if (!r.ok) throw new Error(`DPD ${r.status}`);
      const d = await r.json();
      return normalizeCarrierStatus(String(d.status ?? ""));
    }
    case "mondialrelay": {
      const [enseigne, token] = apiKey.split(":");
      const r = await fetch(
        `https://api.mondialrelay.com/api/parcel/${encodeURIComponent(tracking)}/tracking`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${enseigne}:${token}`).toString("base64")}`,
            Accept: "application/json",
          },
        }
      );
      if (!r.ok) throw new Error(`Mondial Relay ${r.status}`);
      const d = await r.json();
      return normalizeCarrierStatus(String(d.Status ?? ""));
    }
    default:
      throw new Error(`Transporteur non supporté : ${carrier}`);
  }
}

// ── Persistance : upsert livraison + création anomalie ────────────────────────

async function persistShipment(
  shipment: NormalizedShipment,
  userId:   string,
  supabase: SupabaseClient
): Promise<{ deliveryId: string | null; isNew: boolean }> {
  // Cherche une livraison existante par tracking
  const { data: existing } = await supabase
    .from("deliveries")
    .select("id, status")
    .eq("user_id", userId)
    .eq("tracking", shipment.tracking)
    .maybeSingle();

  if (existing) {
    if (existing.status !== shipment.status) {
      await supabase
        .from("deliveries")
        .update({
          status:        shipment.status,
          actual_date:   shipment.actual_date,
          expected_date: shipment.expected_date,
        })
        .eq("id", existing.id);
    }
    return { deliveryId: existing.id, isNew: false };
  }

  const { data: inserted } = await supabase
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

  return { deliveryId: inserted?.id ?? null, isNew: true };
}

async function persistAnomaly(
  shipment:   NormalizedShipment,
  deliveryId: string,
  userId:     string,
  supabase:   SupabaseClient
): Promise<boolean> {
  const anomalyType = detectAnomalyType(shipment);
  if (!anomalyType) return false;

  // Évite les doublons d'anomalies sur le même type
  const { data: existing } = await supabase
    .from("anomalies")
    .select("id")
    .eq("delivery_id", deliveryId)
    .eq("type", anomalyType)
    .maybeSingle();
  if (existing) return false;

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
  return true;
}

// ── Point d'entrée principal ──────────────────────────────────────────────────

export async function syncDeliveries(
  userId:       string,
  carrierKeys:  Record<string, string>,
  integrations: Record<string, Record<string, string>>,
  supabase:     SupabaseClient
): Promise<SyncResult> {
  const result: SyncResult = { deliveries_upserted: 0, anomalies_created: 0, errors: [] };

  // Fenêtre temporelle : depuis la dernière synchro ou 30 jours
  const { data: profile } = await supabase
    .from("users")
    .select("last_sync_at")
    .eq("id", userId)
    .single();

  const since = profile?.last_sync_at
    ? new Date(profile.last_sync_at)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // ── 1. Shopify ─────────────────────────────────────────────────────────────
  const shopify = integrations?.shopify as { domain?: string; token?: string } | undefined;
  if (shopify?.domain && shopify?.token) {
    try {
      const shipments = await fetchShopify(
        { domain: shopify.domain, token: shopify.token },
        since
      );
      for (const s of shipments) {
        const { deliveryId } = await persistShipment(s, userId, supabase);
        if (!deliveryId) continue;
        result.deliveries_upserted++;
        const created = await persistAnomaly(s, deliveryId, userId, supabase);
        if (created) result.anomalies_created++;
      }
    } catch (e: unknown) {
      result.errors.push(`[shopify] ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // ── 2. Sendcloud ──────────────────────────────────────────────────────────
  const sendcloud = integrations?.sendcloud as { credentials?: string } | undefined;
  if (sendcloud?.credentials) {
    try {
      const shipments = await fetchSendcloud(sendcloud.credentials, since);
      for (const s of shipments) {
        const { deliveryId } = await persistShipment(s, userId, supabase);
        if (!deliveryId) continue;
        result.deliveries_upserted++;
        const created = await persistAnomaly(s, deliveryId, userId, supabase);
        if (created) result.anomalies_created++;
      }
    } catch (e: unknown) {
      result.errors.push(`[sendcloud] ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // ── 3. Transporteurs : mise à jour des livraisons pending/delayed ──────────
  // (les APIs transporteurs ne listent pas — elles trackent un numéro connu)
  if (Object.keys(carrierKeys).length > 0) {
    const { data: deliveries } = await supabase
      .from("deliveries")
      .select("id, tracking, order_id, status, expected_date, actual_date")
      .eq("user_id", userId)
      .in("status", ["pending", "delayed"])
      .neq("tracking", "");

    for (const d of deliveries ?? []) {
      const carrier = detectCarrier(d.tracking);
      const apiKey  = carrierKeys[carrier];
      if (!apiKey) continue;

      try {
        const newStatus = await trackOneNumber(d.tracking, carrier, apiKey);
        if (newStatus === d.status) continue;

        await supabase
          .from("deliveries")
          .update({
            status:      newStatus,
            actual_date: newStatus === "delivered" ? toYMD(new Date()) : d.actual_date,
          })
          .eq("id", d.id);

        result.deliveries_upserted++;

        const updatedShipment: NormalizedShipment = {
          order_id:      d.order_id,
          tracking:      d.tracking,
          status:        newStatus,
          expected_date: d.expected_date,
          actual_date:   newStatus === "delivered" ? toYMD(new Date()) : d.actual_date,
        };
        const created = await persistAnomaly(updatedShipment, d.id, userId, supabase);
        if (created) result.anomalies_created++;
      } catch (e: unknown) {
        result.errors.push(`[${carrier}] ${d.order_id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  // Timestamp de la dernière synchro
  await supabase
    .from("users")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("id", userId);

  return result;
}
