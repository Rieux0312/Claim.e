import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncDeliveries } from "@/lib/sync-deliveries";

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("carrier_api_keys, integrations")
      .eq("id", user.id)
      .single();

    const carrierKeys:  Record<string, string>            = profile?.carrier_api_keys ?? {};
    const integrations: Record<string, Record<string, string>> = profile?.integrations ?? {};

    const hasCarriers   = Object.values(carrierKeys).some((k) => k?.trim());
    const hasShopify    = !!(integrations?.shopify?.domain && integrations?.shopify?.token);

    if (!hasCarriers && !hasShopify) {
      return NextResponse.json(
        { error: "Aucune intégration configurée (transporteur ou boutique)" },
        { status: 400 }
      );
    }

    const result = await syncDeliveries(user.id, carrierKeys, integrations, supabase);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[sync-orders]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
