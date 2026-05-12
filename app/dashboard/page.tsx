import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: anomalies } = await supabase
    .from("anomalies")
    .select("*, delivery:delivery_id(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      user={{
        id: user.id,
        email: user.email ?? "",
        company_name: profile?.company_name ?? "Mon Entreprise",
      }}
      initialDeliveries={deliveries ?? []}
      initialAnomalies={anomalies ?? []}
    />
  );
}