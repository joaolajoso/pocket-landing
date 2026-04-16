import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const eventId = url.searchParams.get("eventId");

    if (!eventId) {
      return new Response(JSON.stringify({ error: "eventId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, description, event_date, end_date, location, image_url, access_type, category, event_type, organization_id, organization, created_by")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch organization
    let organization = null;
    let paymentInfo = null;

    if (event.organization_id) {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("id, name, logo_url, banner_url")
        .eq("id", event.organization_id)
        .single();

      organization = orgData;

      const { data: websiteData } = await supabase
        .from("organization_websites")
        .select("payment_method, payment_key, show_payment_method")
        .eq("organization_id", event.organization_id)
        .single();

      if (websiteData?.show_payment_method && websiteData?.payment_key) {
        paymentInfo = {
          method: websiteData.payment_method,
          key: websiteData.payment_key,
        };
      }
    }

    // Fetch landing config
    const { data: landingConfig } = await supabase
      .from("event_landing_config")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        event,
        organization,
        paymentInfo,
        landingConfig,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
