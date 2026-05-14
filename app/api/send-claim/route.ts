import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const CARRIER_EMAILS: Record<string, string> = {
  colissimo: "e-recours@laposte.fr",
  chronopost: "service.client@chronopost.fr",
  gls: "servicedestinataire@gls-france.com",
  dpd: "information@dpd.fr",
  mondialrelay: "suividecolis@mondialrelay.fr",
  tnt: "fr-litiges-tnt@fedex.com",
  default: "reclamations@claim-e.fr",
};

function detectCarrier(tracking: string): string {
  const t = tracking.toUpperCase().trim();

  // UPS
  if (t.startsWith("1Z")) return "ups";

  // DHL
  if (t.startsWith("JD")) return "dhl";

  // FedEx / TNT
  if (/^\d{12,14}$/.test(t) && t.startsWith("7")) return "fedex";
  if (/^\d{9,10}$/.test(t)) return "tnt";

  // GLS
  if (t.startsWith("GL")) return "gls";

  // DPD (14 chiffres uniquement)
  if (/^\d{14}$/.test(t)) return "dpd";

  // Chronopost (2 lettres + 9 chiffres + 2 lettres)
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(t)) return "chronopost";

  // Colissimo (commence par FR + chiffres + FR)
  if (t.startsWith("FR") && t.endsWith("FR")) return "colissimo";

  // Mondial Relay (alphanumérique long)
  if (/^[A-Z0-9]{15,}$/.test(t)) return "mondialrelay";

  return "default";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { anomalyId } = await request.json();

    const { data: anomaly, error: anomalyError } = await supabase
      .from("anomalies")
      .select("*, delivery:deliveries(*)")
      .eq("id", anomalyId)
      .eq("user_id", user.id)
      .single();

    if (anomalyError || !anomaly) {
      return NextResponse.json({ error: "Anomalie introuvable" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    const companyName = profile?.company_name ?? "Notre entreprise";
    const delivery = anomaly.delivery as {
      order_id: string;
      tracking: string;
      expected_date: string;
      actual_date: string | null;
    };

    const carrier = detectCarrier(delivery.tracking);
    const carrierEmail = CARRIER_EMAILS[carrier];

const typeLabels: Record<string, string> = {
      delay: "retard de livraison",
      lost: "colis perdu",
      service_failure: "non-respect du SLA",
      partial_delivery: "livraison partielle",
      billing_error: "erreur de facturation",
      damaged: "colis endommagé",
      double_billing: "double facturation",
      overcharge: "surfacturation",
    };

    const typeLabel = typeLabels[anomaly.type] ?? anomaly.type;

    // En test : envoi à votre email
    // En production : remplacez user.email par carrierEmail
    const { error: emailError } = await resend.emails.send({
      from: "Claim.e <reclamations@claim-e.fr>",
to: carrierEmail,
cc: user.email!,
      subject: `Réclamation — ${typeLabel} — Commande ${delivery.order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background: #1a56ff; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Claim.e — Réclamation officielle</h1>
          
            </div>

          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            
            <p style="color: #334155; font-size: 15px;">Madame, Monsieur,</p>
            
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              Par la présente, <strong>${companyName}</strong> souhaite déposer une réclamation 
              officielle concernant un <strong>${typeLabel}</strong> constaté sur l'expédition suivante :
            </p>

            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 40%;">Numéro de commande</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px;">${delivery.order_id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Numéro de tracking</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px;">${delivery.tracking}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Date de livraison prévue</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px;">${new Date(delivery.expected_date).toLocaleDateString("fr-FR")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Date de livraison réelle</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px;">${delivery.actual_date ? new Date(delivery.actual_date).toLocaleDateString("fr-FR") : "Non livré"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Type d'anomalie</td>
                  <td style="padding: 8px 0; color: #dc2626; font-weight: bold; font-size: 13px; text-transform: capitalize;">${typeLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Montant réclamé</td>
                  <td style="padding: 8px 0; color: #16a34a; font-weight: bold; font-size: 13px;">${anomaly.estimated_amount.toFixed(2)} €</td>
                </tr>
              </table>
            </div>

            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              Conformément aux conditions générales de transport et aux engagements de service, 
              nous vous demandons de bien vouloir procéder au remboursement du montant indiqué 
              dans les meilleurs délais.
            </p>

            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              Nous restons à votre disposition pour tout complément d'information nécessaire 
              au traitement de cette réclamation.
            </p>

            <p style="color: #334155; font-size: 14px; margin-top: 24px;">
              Cordialement,<br/>
              <strong>${companyName}</strong><br/>
              <span style="color: #64748b; font-size: 12px;">Via Claim.e — Plateforme d'audit logistique</span>
            </p>

          </div>

          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
            Cet email a été envoyé automatiquement par Claim.e · claim-e.fr
          </p>

        </div>
      `,
    });

    if (emailError) {
      console.error("Email error:", emailError);
      return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 });
    }

    await supabase
      .from("anomalies")
      .update({ status: "sent" })
      .eq("id", anomalyId);

    // Envoyer les données à Make.com
const webhookUrl = process.env.MAKE_WEBHOOK_URL;
if (webhookUrl) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_name: companyName,
      order_id: delivery.order_id,
      tracking: delivery.tracking,
      expected_date: delivery.expected_date,
      actual_date: delivery.actual_date,
      anomaly_type: typeLabel,
      amount: anomaly.estimated_amount,
      carrier: carrier,
      carrier_email: carrierEmail,
      client_email: user.email,
    }),
  });
}
      return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-claim]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}