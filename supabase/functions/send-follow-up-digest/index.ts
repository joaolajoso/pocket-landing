import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all orgs with email notifications enabled
    const { data: orgSettings, error: settingsErr } = await supabase
      .from("organization_follow_up_settings")
      .select("*, organizations(name, created_by)")
      .eq("email_notifications_enabled", true);

    if (settingsErr) throw settingsErr;
    if (!orgSettings?.length) {
      return new Response(JSON.stringify({ message: "No organizations with email notifications enabled" }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    let emailsSent = 0;

    for (const setting of orgSettings) {
      const orgId = setting.organization_id;
      const reminderDays = setting.reminder_days_before || 2;

      // Get leads with follow-up dates that are overdue or coming up within reminder window
      const today = new Date().toISOString().split("T")[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + reminderDays);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const { data: urgentLeads, error: leadsErr } = await supabase
        .from("contact_submissions")
        .select("name, email, phone, follow_up_date, created_at")
        .eq("organization_id", orgId)
        .not("follow_up_date", "is", null)
        .lte("follow_up_date", futureDateStr)
        .order("follow_up_date", { ascending: true });

      if (leadsErr || !urgentLeads?.length) continue;

      // Separate overdue and upcoming
      const overdue = urgentLeads.filter((l: any) => l.follow_up_date < today);
      const todayLeads = urgentLeads.filter((l: any) => l.follow_up_date === today);
      const upcoming = urgentLeads.filter((l: any) => l.follow_up_date > today);

      if (overdue.length === 0 && todayLeads.length === 0 && upcoming.length === 0) continue;

      // Get org admins/owners to send the email to
      const { data: admins } = await supabase
        .from("organization_members")
        .select("user_id, profiles(email, name)")
        .eq("organization_id", orgId)
        .in("role", ["owner", "admin"])
        .eq("status", "active");

      if (!admins?.length) continue;

      const orgName = (setting as any).organizations?.name || "Sua Organização";

      // Build email HTML
      const buildLeadRows = (leads: any[], label: string, color: string) => {
        if (!leads.length) return "";
        return `
          <tr><td colspan="3" style="padding: 12px 0 6px; font-size: 13px; font-weight: 600; color: ${color};">
            ${label} (${leads.length})
          </td></tr>
          ${leads.map((l: any) => `
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px; font-size: 13px; color: #333;">${l.name}</td>
              <td style="padding: 8px 12px; font-size: 12px; color: #666;">${l.email || l.phone || "—"}</td>
              <td style="padding: 8px 12px; font-size: 12px; color: ${color}; font-weight: 500;">${l.follow_up_date}</td>
            </tr>
          `).join("")}
        `;
      };

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
            <div style="background: #1a1a2e; padding: 24px; text-align: center;">
              <h1 style="color: white; font-size: 18px; margin: 0;">📋 Follow-up de Leads</h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 8px 0 0;">${orgName}</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 14px; color: #333; margin: 0 0 16px;">
                Tem <strong>${urgentLeads.length} lead${urgentLeads.length > 1 ? "s" : ""}</strong> que requerem a sua atenção:
              </p>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #eee;">
                    <th style="text-align: left; padding: 8px 12px; font-size: 11px; color: #999; text-transform: uppercase;">Nome</th>
                    <th style="text-align: left; padding: 8px 12px; font-size: 11px; color: #999; text-transform: uppercase;">Contacto</th>
                    <th style="text-align: left; padding: 8px 12px; font-size: 11px; color: #999; text-transform: uppercase;">Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildLeadRows(overdue, "🔴 Atrasados", "#ef4444")}
                  ${buildLeadRows(todayLeads, "🟡 Hoje", "#f59e0b")}
                  ${buildLeadRows(upcoming, "🔵 Próximos dias", "#3b82f6")}
                </tbody>
              </table>
              <div style="margin-top: 24px; text-align: center;">
                <a href="https://pocketcv.pt/business" style="display: inline-block; background: #6366f1; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500;">
                  Ver todos os leads →
                </a>
              </div>
            </div>
            <div style="padding: 16px; background: #fafafa; text-align: center; border-top: 1px solid #eee;">
              <p style="font-size: 11px; color: #999; margin: 0;">
                Pocket CV · Pode desativar estes emails nas configurações de Leads
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send to each admin
      for (const admin of admins) {
        const profile = (admin as any).profiles;
        if (!profile?.email) continue;

        const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
        
        if (!lovableApiKey || !resendApiKey) {
          console.error("Missing API keys for email sending");
          continue;
        }

        try {
          const emailRes = await fetch(`${GATEWAY_URL}/emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${lovableApiKey}`,
              "X-Connection-Api-Key": resendApiKey,
            },
            body: JSON.stringify({
              from: "PocketCV <networking@mail.pocketcv.pt>",
              to: [profile.email],
              subject: `📋 ${urgentLeads.length} lead${urgentLeads.length > 1 ? "s" : ""} precisam de follow-up — ${orgName}`,
              html,
            }),
          });

          if (emailRes.ok) {
            emailsSent++;
          } else {
            console.error("Failed to send email:", await emailRes.text());
          }
        } catch (emailError) {
          console.error("Email send error:", emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, emails_sent: emailsSent }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
