import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to create a valid email slug from organization name
function createOrgSlug(orgName: string): string {
  return orgName
    .toLowerCase()
    .normalize('NFD') // Normalize to decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 64); // Limit to 64 characters (email local-part max)
}

interface InvitationEmailRequest {
  email: string;
  organizationName: string;
  role: string;
  invitationToken: string;
  permissions: string[];
  invitedByName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      organizationName, 
      role, 
      invitationToken, 
      permissions,
      invitedByName 
    }: InvitationEmailRequest = await req.json();

    const signupUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/signup?invitation=${invitationToken}`;

    const permissionLabels: Record<string, string> = {
      profile_views: "Visualizações do perfil",
      leads: "Contactos e leads gerados",
      connections: "Conexões de rede",
      performance_metrics: "Métricas de desempenho"
    };

    const permissionsList = permissions
      .map(p => `<li style="margin: 8px 0;">✓ ${permissionLabels[p] || p}</li>`)
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Convite para ${organizationName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                        🎉 Convite para ${organizationName}
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                        Olá!
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                        <strong>${invitedByName}</strong> convidou você para se juntar à equipa <strong>${organizationName}</strong> como <strong>${role}</strong>.
                      </p>

                      <!-- Role Badge -->
                      <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 24px 0; border-radius: 6px;">
                        <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
                          <strong>Cargo:</strong> ${role}
                        </p>
                      </div>

                      <p style="margin: 24px 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
                        Dados que serão partilhados:
                      </p>
                      <ul style="margin: 0 0 24px; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
                        ${permissionsList}
                      </ul>

                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #6b7280; background-color: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                        ℹ️ Estes dados só serão partilhados após aceitar o convite. Pode gerir as permissões a qualquer momento.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);">
                              Criar Conta e Aceitar Convite
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                        Ou copie e cole este link no seu navegador:<br>
                        <a href="${signupUrl}" style="color: #0ea5e9; word-break: break-all;">${signupUrl}</a>
                      </p>

                      <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.6; color: #9ca3af;">
                        Este convite expira em 7 dias.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        Se não esperava este convite, pode ignorar este email com segurança.
                      </p>
                      <p style="margin: 12px 0 0; font-size: 12px; color: #9ca3af;">
                        © ${new Date().getFullYear()} PocketCV. Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Create dynamic from address based on organization name
    const orgSlug = createOrgSlug(organizationName);
    const fromAddress = orgSlug 
      ? `${organizationName} <${orgSlug}@mail.pocketcv.pt>`
      : `${organizationName} <networking@mail.pocketcv.pt>`;

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: `Convite para ${organizationName} - ${role}`,
      html: emailHtml,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
