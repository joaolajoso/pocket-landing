
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BusinessInquiry {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  numberOfCards: string;
  companyType: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const inquiry: BusinessInquiry = await req.json();

    const emailResponse = await resend.emails.send({
      from: "PocketCV <networking@mail.pocketcv.pt>",
      to: ["pocketcvnetworking@gmail.com"],
      subject: `New Business Inquiry from ${inquiry.companyName}`,
      html: `
        <h1>New Business Inquiry</h1>
        <h2>Company Information</h2>
        <ul>
          <li><strong>Company:</strong> ${inquiry.companyName}</li>
          <li><strong>Contact Name:</strong> ${inquiry.contactName}</li>
          <li><strong>Email:</strong> ${inquiry.email}</li>
          <li><strong>Phone:</strong> ${inquiry.phone}</li>
          <li><strong>Number of Cards:</strong> ${inquiry.numberOfCards}</li>
          <li><strong>Company Type:</strong> ${inquiry.companyType}</li>
        </ul>
        ${inquiry.message ? `<h2>Additional Message</h2><p>${inquiry.message}</p>` : ''}
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error sending business inquiry:", error);
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
