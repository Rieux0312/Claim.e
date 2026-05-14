import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncDeliveries } from "@/lib/sync-deliveries";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Service role — pas de RLS, accès à tous les utilisateurs
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Cible uniquement les utilisateurs avec au moins une intégration active
  const { data: users, error } = await supabase
    .from("users")
    .select("id, carrier_api_keys, integrations")
    .or("carrier_api_keys.neq.{},integrations.neq.{}");

  if (error) {
    console.error("[cron/sync-all]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const summary: Record<string, { deliveries: number; anomalies: number; errors: string[] }> = {};

  for (const u of users ?? []) {
    try {
      const result = await syncDeliveries(
        u.id,
        u.carrier_api_keys ?? {},
        u.integrations ?? {},
        supabase
      );
      summary[u.id] = {
        deliveries: result.deliveries_upserted,
        anomalies:  result.anomalies_created,
        errors:     result.errors,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[cron/sync-all] user ${u.id}:`, msg);
      summary[u.id] = { deliveries: 0, anomalies: 0, errors: [msg] };
    }
  }

  console.log(`[cron/sync-all] terminé — ${Object.keys(summary).length} utilisateur(s)`, summary);
  return NextResponse.json({ ok: true, users_synced: Object.keys(summary).length, summary });
}
