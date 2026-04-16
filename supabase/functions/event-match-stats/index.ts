import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Complementary goals mapping (same as client-side scoring)
const COMPLEMENTARY_GOALS: Record<string, string[]> = {
  Hiring: ["Open to Work", "Career Change"],
  "Open to Work": ["Hiring", "HR/Recruiter"],
  "Finding Co-founder": ["Finding Co-founder", "Investing", "Partnership Opportunities"],
  "Seeking Mentorship": ["Offering Mentorship"],
  "Offering Mentorship": ["Seeking Mentorship"],
  Investing: ["Fundraising", "Finding Co-founder"],
  Fundraising: ["Investing"],
  "Selling Products/Services": ["Finding Clients"],
  "Finding Clients": ["Selling Products/Services"],
  "Partnership Opportunities": ["Partnership Opportunities", "Finding Co-founder"],
  "Side Project Partners": ["Side Project Partners", "Finding Co-founder"],
};

function calculateScore(
  userInterests: { professional_roles: string[]; industries: string[]; networking_goals: string[] },
  otherInterests: { professional_roles: string[]; industries: string[]; networking_goals: string[] }
): number {
  // Goal complementarity (50%)
  let goalScore = 0;
  const userGoals = userInterests.networking_goals || [];
  const otherGoals = otherInterests.networking_goals || [];
  if (userGoals.length > 0 && otherGoals.length > 0) {
    let complementaryMatches = 0;
    for (const ug of userGoals) {
      const complements = COMPLEMENTARY_GOALS[ug] || [];
      for (const og of otherGoals) {
        if (complements.includes(og)) complementaryMatches++;
      }
    }
    // Direct overlap also counts
    const directOverlap = userGoals.filter((g) => otherGoals.includes(g)).length;
    goalScore = Math.min(1, (complementaryMatches * 2 + directOverlap) / Math.max(userGoals.length, 1));
  }

  // Role overlap (20%)
  const userRoles = userInterests.professional_roles || [];
  const otherRoles = otherInterests.professional_roles || [];
  const roleOverlap = userRoles.filter((r) => otherRoles.includes(r)).length;
  const roleScore = userRoles.length > 0 ? roleOverlap / userRoles.length : 0;

  // Industry overlap (20%)
  const userIndustries = userInterests.industries || [];
  const otherIndustries = otherInterests.industries || [];
  const industryOverlap = userIndustries.filter((i) => otherIndustries.includes(i)).length;
  const industryScore = userIndustries.length > 0 ? industryOverlap / userIndustries.length : 0;

  // Intent bonus (10%) - has any tags at all
  const intentScore = otherGoals.length > 0 ? 1 : 0;

  return Math.round((goalScore * 50 + roleScore * 20 + industryScore * 20 + intentScore * 10));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { event_ids } = await req.json();

    // Get user's interests
    const { data: userInterests } = await supabase
      .from("user_interests")
      .select("professional_roles, industries, networking_goals")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!userInterests || (
      (!userInterests.professional_roles?.length) &&
      (!userInterests.industries?.length) &&
      (!userInterests.networking_goals?.length)
    )) {
      // User has no tags, return empty
      const empty: Record<string, any> = {};
      for (const eid of (event_ids || [])) {
        empty[eid] = { totalWithTags: 0, goodMatches: 0, topRoles: [], topIndustries: [] };
      }
      return new Response(JSON.stringify(empty), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get internal events from the list
    let eventFilter = event_ids as string[] | undefined;
    if (!eventFilter || eventFilter.length === 0) {
      return new Response(JSON.stringify({}), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all participants for these events (excluding current user)
    const { data: participants } = await supabase
      .from("event_participants")
      .select("event_id, user_id")
      .in("event_id", eventFilter)
      .neq("user_id", user.id);

    if (!participants || participants.length === 0) {
      const empty: Record<string, any> = {};
      for (const eid of eventFilter) {
        empty[eid] = { totalWithTags: 0, goodMatches: 0, topRoles: [], topIndustries: [] };
      }
      return new Response(JSON.stringify(empty), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(participants.map((p) => p.user_id))];

    // Batch fetch all interests
    const { data: allInterests } = await supabase
      .from("user_interests")
      .select("user_id, professional_roles, industries, networking_goals")
      .in("user_id", uniqueUserIds);

    const interestsMap = new Map<string, any>();
    for (const interest of (allInterests || [])) {
      interestsMap.set(interest.user_id, interest);
    }

    // Build per-event stats
    const result: Record<string, any> = {};

    // Group participants by event
    const eventParticipants = new Map<string, string[]>();
    for (const p of participants) {
      if (!eventParticipants.has(p.event_id)) {
        eventParticipants.set(p.event_id, []);
      }
      eventParticipants.get(p.event_id)!.push(p.user_id);
    }

    for (const eid of eventFilter) {
      const pUserIds = eventParticipants.get(eid) || [];
      let totalWithTags = 0;
      let goodMatches = 0;
      const roleCounts = new Map<string, number>();
      const industryCounts = new Map<string, number>();

      for (const uid of pUserIds) {
        const interests = interestsMap.get(uid);
        if (!interests) continue;
        const hasAnyTag =
          (interests.professional_roles?.length > 0) ||
          (interests.industries?.length > 0) ||
          (interests.networking_goals?.length > 0);
        if (!hasAnyTag) continue;

        totalWithTags++;

        const score = calculateScore(userInterests, interests);
        if (score >= 50) goodMatches++;

        // Count roles & industries for top lists
        for (const r of (interests.professional_roles || [])) {
          roleCounts.set(r, (roleCounts.get(r) || 0) + 1);
        }
        for (const i of (interests.industries || [])) {
          industryCounts.set(i, (industryCounts.get(i) || 0) + 1);
        }
      }

      const topRoles = [...roleCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([r]) => r);
      const topIndustries = [...industryCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([i]) => i);

      result[eid] = { totalWithTags, goodMatches, topRoles, topIndustries };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("event-match-stats error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
