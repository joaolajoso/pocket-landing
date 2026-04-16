
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  ownerEmail: string;
  ownerName: string;
  profileOwnerId: string;
  fileUrl?: string | null;
  fileName?: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    const { name, email, phone, message, profileOwnerId, fileUrl, fileName } = formData;

    if (!name || !email || !profileOwnerId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Look up the profile owner's organization_id from their active membership
    let organizationId: string | null = null;
    try {
      const { data: memberData } = await supabaseClient
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', profileOwnerId)
        .eq('status', 'active')
        .limit(1)
        .single();
      
      if (memberData?.organization_id) {
        organizationId = memberData.organization_id;
      }
    } catch {
      // Profile owner is not part of any organization — that's fine
    }

    const insertData: Record<string, unknown> = {
      profile_owner_id: profileOwnerId,
      name,
      email,
      phone: phone || null,
      message: message || null,
      organization_id: organizationId,
    };

    if (fileUrl) insertData.file_url = fileUrl;
    if (fileName) insertData.file_name = fileName;

    const { error: insertError } = await supabaseClient
      .from('contact_submissions')
      .insert(insertData);

    if (insertError) {
      throw new Error(`Failed to store contact submission: ${insertError.message}`);
    }

    // Capture lead_capture event metric if profile owner is in an active event
    try {
      const { data: activeParticipation } = await supabaseClient
        .from('event_participants')
        .select('event_id, user_id')
        .eq('user_id', profileOwnerId)
        .limit(1);

      if (activeParticipation && activeParticipation.length > 0) {
        // Check if event is currently active
        for (const participation of activeParticipation) {
          const { data: eventData } = await supabaseClient
            .from('events')
            .select('id, event_date, end_date')
            .eq('id', participation.event_id)
            .single();

          if (eventData) {
            const now = new Date();
            const eventStart = new Date(eventData.event_date);
            const eventEnd = eventData.end_date ? new Date(eventData.end_date) : null;
            
            if (now >= eventStart && (!eventEnd || now <= eventEnd)) {
              await supabaseClient.rpc('capture_event_metric', {
                _event_id: participation.event_id,
                _participant_id: profileOwnerId,
                _metric_type: 'lead_capture',
                _metadata: { contact_name: name, contact_email: email }
              });
              console.log(`Lead capture metric recorded for event ${participation.event_id}`);
            }
          }
        }
      }
    } catch (metricError) {
      console.error('Error capturing event metric (non-blocking):', metricError);
    }

    console.log(`Contact form from ${name} stored for profile owner ${profileOwnerId}${organizationId ? ` (org: ${organizationId})` : ''}${fileName ? ` with file: ${fileName}` : ''}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in send-contact-form function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
