import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const QA_EMAILS = [
  'joaolajoso@ua.pt',
  'joaopedrolajoso@hotmail.com',
  'joaopedrolajoso@gmail.com'
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is QA user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await anonClient.auth.getUser();
    
    if (!caller?.email || !QA_EMAILS.includes(caller.email)) {
      return new Response(JSON.stringify({ error: "Not a QA user" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { action, params } = await req.json();
    let result: any = {};

    switch (action) {
      case "create_test_users": {
        const users = params?.users || [
          { email: "test1@pocketcv.test", name: "Test User 1", password: "TestPass123!" },
          { email: "test2@pocketcv.test", name: "Test User 2", password: "TestPass123!" },
          { email: "test3@pocketcv.test", name: "Test User 3", password: "TestPass123!" },
        ];
        const created: string[] = [];
        const errors: string[] = [];

        for (const u of users) {
          // Check if user already exists
          const { data: existing } = await adminClient.auth.admin.listUsers();
          const exists = existing?.users?.find((eu: any) => eu.email === u.email);
          
          if (exists) {
            created.push(`${u.email}: já existe (${exists.id})`);
            continue;
          }

          const { data, error } = await adminClient.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { name: u.name, account_type: u.accountType || "personal" },
          });

          if (error) {
            errors.push(`${u.email}: ${error.message}`);
          } else {
            created.push(`${u.email}: criado (${data.user.id})`);
          }
        }
        result = { created, errors };
        break;
      }

      case "create_business_user": {
        const email = params?.email || `testbiz${Date.now()}@pocketcv.test`;
        const { data, error } = await adminClient.auth.admin.createUser({
          email,
          password: "TestPass123!",
          email_confirm: true,
          user_metadata: {
            name: params?.name || "Test Business User",
            account_type: "business",
            companyName: params?.companyName || "Test Company QA",
            companySize: params?.companySize || "startup",
          },
        });
        if (error) {
          result = { success: false, error: error.message };
        } else {
          result = { success: true, userId: data.user.id, email };
        }
        break;
      }

      case "create_test_event": {
        const { data, error } = await adminClient
          .from("events")
          .insert({
            title: params?.title || `QA Test Event ${new Date().toISOString().slice(0, 10)}`,
            description: params?.description || "Evento criado automaticamente por QA Tests",
            event_date: params?.eventDate || new Date().toISOString(),
            end_date: params?.endDate || new Date(Date.now() + 86400000).toISOString(),
            location: params?.location || "QA Test Location",
            created_by: caller.id,
            access_type: params?.accessType || "public",
            category: "networking",
          })
          .select()
          .single();

        if (error) {
          result = { success: false, error: error.message };
        } else {
          result = { success: true, event: data };
        }
        break;
      }

      case "register_for_event": {
        const { eventId, userId } = params;
        const { data, error } = await adminClient
          .from("event_participants")
          .insert({
            event_id: eventId,
            user_id: userId,
            role: "participant",
            status: "confirmed",
          })
          .select()
          .single();

        if (error) {
          result = { success: false, error: error.message };
        } else {
          result = { success: true, participant: data };
        }
        break;
      }

      case "create_connection": {
        const { userId, connectedUserId } = params;
        const { data, error } = await adminClient
          .from("connections")
          .insert({
            user_id: userId,
            connected_user_id: connectedUserId,
            tag: "QA Test",
            note: "Conexão criada por QA Tests",
          })
          .select()
          .single();

        if (error) {
          result = { success: false, error: error.message };
        } else {
          result = { success: true, connection: data };
        }
        break;
      }

      case "create_contact_submission": {
        const { profileOwnerId, name, email, phone, message } = params;
        const { data, error } = await adminClient
          .from("contact_submissions")
          .insert({
            profile_owner_id: profileOwnerId,
            name: name || "QA Test Contact",
            email: email || "qacontact@pocketcv.test",
            phone: phone || "+351000000000",
            message: message || "Contacto criado por QA Tests",
          })
          .select()
          .single();

        if (error) {
          result = { success: false, error: error.message };
        } else {
          result = { success: true, contact: data };
        }
        break;
      }

      case "setup_public_profile": {
        const { userId, slug, bio, headline } = params;
        const { data, error } = await adminClient
          .from("profiles")
          .update({
            slug: slug || `qatest-${Date.now()}`,
            bio: bio || "Perfil de teste QA",
            headline: headline || "QA Tester at PocketCV",
            onboarding_completed: true,
          })
          .eq("id", userId)
          .select()
          .single();

        if (error) {
          result = { success: false, error: error.message };
        } else {
          result = { success: true, profile: data };
        }
        break;
      }

      case "create_links_for_user": {
        const { userId } = params;
        // Create a link group first
        const { data: group, error: groupError } = await adminClient
          .from("link_groups")
          .insert({ user_id: userId, title: "QA Test Links" })
          .select()
          .single();

        if (groupError) {
          result = { success: false, error: groupError.message };
          break;
        }

        const links = [
          { title: "LinkedIn QA", url: "https://linkedin.com/in/qatest", icon: "linkedin" },
          { title: "Website QA", url: "https://qatest.pocketcv.test", icon: "website" },
          { title: "Email QA", url: "mailto:qa@pocketcv.test", icon: "email" },
        ];

        const { data, error } = await adminClient
          .from("links")
          .insert(links.map(l => ({ ...l, user_id: userId, group_id: group.id })))
          .select();

        if (error) {
          result = { success: false, error: error.message };
        } else {
          result = { success: true, links: data, group };
        }
        break;
      }

      case "create_org_website": {
        const { organizationId } = params;
        const { data, error } = await adminClient
          .from("organization_websites")
          .insert({
            organization_id: organizationId,
            company_name: params?.companyName || "QA Test Company",
            subdomain: `qatest-${Date.now()}`,
            description: "Website criado por QA Tests",
            is_published: true,
            template_id: "modern",
          })
          .select()
          .single();

        if (error) {
          result = { success: false, error: error.message };
        } else {
          result = { success: true, website: data };
        }
        break;
      }

      case "get_test_users": {
        const { data } = await adminClient.auth.admin.listUsers();
        const testUsers = data?.users?.filter((u: any) => 
          u.email?.endsWith("@pocketcv.test")
        ) || [];
        result = { users: testUsers.map((u: any) => ({ id: u.id, email: u.email, created_at: u.created_at })) };
        break;
      }

      case "verify_business_onboarding": {
        const { userId } = params;
        const { data: profile } = await adminClient
          .from("profiles")
          .select("id, name, slug, organization_id, onboarding_completed")
          .eq("id", userId)
          .single();

        if (!profile) {
          result = { success: false, error: "Perfil não encontrado" };
          break;
        }

        const checks: string[] = [];
        checks.push(`Perfil: ${profile.name}, slug=${profile.slug}`);

        if (profile.organization_id) {
          const { data: org } = await adminClient
            .from("organizations")
            .select("id, name")
            .eq("id", profile.organization_id)
            .single();
          checks.push(`Organização: ${org?.name || "?"} (${profile.organization_id})`);

          const { data: member } = await adminClient
            .from("organization_members")
            .select("role, status")
            .eq("user_id", userId)
            .eq("organization_id", profile.organization_id)
            .single();
          checks.push(`Membro: role=${member?.role}, status=${member?.status}`);

          if (member?.role !== "owner") checks.push("⚠️ Deveria ser owner!");
        } else {
          checks.push("❌ Organização não criada automaticamente");
        }

        const allOk = !checks.some((c) => c.includes("❌") || c.includes("⚠️"));
        result = { success: allOk, checks };
        break;
      }

      case "cleanup_test_data": {
        const { data: users } = await adminClient.auth.admin.listUsers();
        const testUsers = users?.users?.filter((u: any) => u.email?.endsWith("@pocketcv.test")) || [];
        const deleted: string[] = [];

        for (const u of testUsers) {
          // Get profile to find org
          const { data: profile } = await adminClient
            .from("profiles")
            .select("organization_id")
            .eq("id", u.id)
            .single();

          // Clean business data if org exists
          if (profile?.organization_id) {
            await adminClient.from("organization_team_highlights").delete().eq("website_id", 
              (await adminClient.from("organization_websites").select("id").eq("organization_id", profile.organization_id)).data?.[0]?.id || "none"
            );
            await adminClient.from("organization_website_sections").delete().eq("website_id",
              (await adminClient.from("organization_websites").select("id").eq("organization_id", profile.organization_id)).data?.[0]?.id || "none"
            );
            await adminClient.from("organization_websites").delete().eq("organization_id", profile.organization_id);
            await adminClient.from("organization_members").delete().eq("organization_id", profile.organization_id);
            await adminClient.from("organization_goals").delete().eq("organization_id", profile.organization_id);
            await adminClient.from("departments").delete().eq("organization_id", profile.organization_id);
            await adminClient.from("organization_invitations").delete().eq("organization_id", profile.organization_id);
            // Unlink profile before deleting org
            await adminClient.from("profiles").update({ organization_id: null }).eq("id", u.id);
            await adminClient.from("organizations").delete().eq("id", profile.organization_id);
          }

          await adminClient.from("connections").delete().eq("user_id", u.id);
          await adminClient.from("connections").delete().eq("connected_user_id", u.id);
          await adminClient.from("contact_submissions").delete().eq("profile_owner_id", u.id);
          await adminClient.from("links").delete().eq("user_id", u.id);
          await adminClient.from("link_groups").delete().eq("user_id", u.id);
          await adminClient.from("event_participants").delete().eq("user_id", u.id);
          await adminClient.from("profile_views").delete().eq("profile_id", u.id);
          await adminClient.from("employee_activity_log").delete().eq("employee_id", u.id);
          await adminClient.from("employee_performance_metrics").delete().eq("employee_id", u.id);
          await adminClient.from("profile_slug_history").delete().eq("user_id", u.id);
          await adminClient.from("profile_design_settings").delete().eq("user_id", u.id);
          await adminClient.from("experiences").delete().eq("user_id", u.id);
          const { error } = await adminClient.auth.admin.deleteUser(u.id);
          if (!error) deleted.push(u.email);
        }
        
        // Delete QA test events
        await adminClient.from("events").delete().like("title", "QA Test Event%");
        
        result = { deleted, count: deleted.length };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
