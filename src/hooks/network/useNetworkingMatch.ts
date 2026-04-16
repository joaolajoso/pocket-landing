import { NetworkingPreferences } from '@/hooks/profile/useNetworkingPreferences';

export interface MatchResult {
  score: number; // 0-100
  matchType: 'none' | 'interest' | 'high-probability';
  reasons: string[];
  commonTags: {
    roles: string[];
    industries: string[];
    goals: string[];
  };
}

// Complementary goal mappings - broader and more inclusive
interface ComplementaryMapping {
  matchRoles?: string[] | 'any';
  matchGoals?: string[];
}

const GOAL_COMPLEMENTARITY: Record<string, ComplementaryMapping> = {
  // Talent & Career
  'Hiring': { matchRoles: 'any', matchGoals: ['Open to Work', 'Career Change'] },
  'Open to Work': { matchGoals: ['Hiring', 'Partnership Opportunities', 'Building Community', 'Finding Clients'], matchRoles: ['CEO/Executive', 'Founder', 'HR/Recruiter', 'Operations Manager'] },
  'Career Change': { matchGoals: ['Hiring', 'Offering Mentorship', 'Building Community'], matchRoles: ['CEO/Executive', 'Founder', 'HR/Recruiter', 'Consultant'] },

  // Mentorship
  'Seeking Mentorship': { matchRoles: ['CEO/Executive', 'Founder', 'Consultant', 'Professor/Teacher', 'Researcher'], matchGoals: ['Offering Mentorship'] },
  'Offering Mentorship': { matchGoals: ['Seeking Mentorship', 'Learning & Development', 'Career Change'] },

  // Investment & Growth
  'Investing': { matchRoles: ['Founder', 'CEO/Executive', 'CTO/CIO'], matchGoals: ['Fundraising'] },
  'Fundraising': { matchGoals: ['Investing', 'Partnership Opportunities'], matchRoles: ['Investor'] },
  'Finding Co-founder': { matchRoles: ['Founder', 'Engineer', 'Designer', 'Marketing Pro', 'Developer', 'Data Scientist'], matchGoals: ['Finding Co-founder', 'Side Project Partners'] },

  // Community & Partnerships
  'Building Community': { matchGoals: ['Building Community', 'Just Networking', 'Partnership Opportunities', 'Learning & Development', 'Speaker Opportunities', 'Co-Working/Collaboration'] },
  'Partnership Opportunities': { matchGoals: ['Partnership Opportunities', 'Building Community', 'Fundraising', 'Open to Work', 'Selling Products/Services', 'Finding Clients'], matchRoles: ['Founder', 'CEO/Executive', 'Consultant', 'COO'] },
  'Learning & Development': { matchGoals: ['Offering Mentorship', 'Building Community', 'Learning & Development', 'Speaker Opportunities'] },

  // Networking (universal mild match)
  'Just Networking': { matchGoals: ['Just Networking', 'Building Community', 'Partnership Opportunities', 'Open to Work', 'Co-Working/Collaboration'] },

  // Commercial
  'Selling Products/Services': { matchGoals: ['Finding Clients', 'Partnership Opportunities', 'Just Networking'], matchRoles: ['Sales Professional', 'Marketing Pro'] },
  'Finding Clients': { matchGoals: ['Selling Products/Services', 'Partnership Opportunities', 'Just Networking', 'Open to Work'], matchRoles: 'any' },

  // Speaking & Collaboration
  'Speaker Opportunities': { matchGoals: ['Building Community', 'Learning & Development', 'Speaker Opportunities'], matchRoles: ['Content Creator', 'Professor/Teacher', 'Journalist'] },
  'Co-Working/Collaboration': { matchGoals: ['Co-Working/Collaboration', 'Finding Co-founder', 'Side Project Partners', 'Building Community'] },
  'Side Project Partners': { matchGoals: ['Side Project Partners', 'Co-Working/Collaboration', 'Finding Co-founder'], matchRoles: ['Developer', 'Designer', 'Engineer', 'Data Scientist'] },
};

export const useNetworkingMatch = () => {
  const calculateMatch = (
    userPreferences: NetworkingPreferences | null,
    targetPreferences: NetworkingPreferences | null
  ): MatchResult => {
    if (!userPreferences || !targetPreferences) {
      return {
        score: 0,
        matchType: 'none',
        reasons: [],
        commonTags: { roles: [], industries: [], goals: [] }
      };
    }

    const reasons: string[] = [];
    const commonTags = {
      roles: [] as string[],
      industries: [] as string[],
      goals: [] as string[]
    };

    // === 50% WEIGHT: Goals ↔ Roles/Goals complementarity ===
    let goalMatches = 0;
    let totalGoals = Math.max(userPreferences.networking_goals.length, 1);

    for (const userGoal of userPreferences.networking_goals) {
      const mapping = GOAL_COMPLEMENTARITY[userGoal];
      if (!mapping) continue;

      let matched = false;

      // Check if target's roles complement this goal
      if (mapping.matchRoles) {
        if (mapping.matchRoles === 'any') {
          if (targetPreferences.professional_roles.length > 0) {
            matched = true;
            reasons.push(`${userGoal} ↔ ${targetPreferences.professional_roles[0]}`);
          }
        } else {
          const matchedRoles = targetPreferences.professional_roles.filter(
            role => (mapping.matchRoles as string[]).includes(role)
          );
          if (matchedRoles.length > 0) {
            matched = true;
            commonTags.roles.push(...matchedRoles);
            reasons.push(`${userGoal} ↔ ${matchedRoles.join(', ')}`);
          }
        }
      }

      // Check if target's goals complement this goal
      if (!matched && mapping.matchGoals) {
        const matchedGoals = targetPreferences.networking_goals.filter(
          goal => mapping.matchGoals!.includes(goal)
        );
        if (matchedGoals.length > 0) {
          matched = true;
          commonTags.goals.push(...matchedGoals);
          reasons.push(`${userGoal} ↔ ${matchedGoals.join(', ')}`);
        }
      }

      if (matched) goalMatches++;
    }

    const goalScore = totalGoals > 0 ? (goalMatches / totalGoals) * 100 : 0;

    // === 20% WEIGHT: Role overlap (same professional roles) ===
    const commonRoles = userPreferences.professional_roles.filter(
      role => targetPreferences.professional_roles.includes(role)
    );
    if (commonRoles.length > 0) {
      commonTags.roles = [...new Set([...commonTags.roles, ...commonRoles])];
      reasons.push(`Papéis em comum: ${commonRoles.join(', ')}`);
    }
    const totalRoles = new Set([
      ...userPreferences.professional_roles,
      ...targetPreferences.professional_roles
    ]).size;
    const roleScore = totalRoles > 0 ? (commonRoles.length / totalRoles) * 100 : 0;

    // === 20% WEIGHT: Industry overlap ===
    const commonIndustries = userPreferences.industries.filter(
      industry => targetPreferences.industries.includes(industry)
    );
    commonTags.industries = commonIndustries;

    const totalIndustries = new Set([
      ...userPreferences.industries,
      ...targetPreferences.industries
    ]).size;

    const industryScore = totalIndustries > 0
      ? (commonIndustries.length / totalIndustries) * 100
      : 0;

    if (commonIndustries.length > 0) {
      reasons.push(`${commonIndustries.length} indústria${commonIndustries.length > 1 ? 's' : ''} em comum`);
    }

    // === 10% WEIGHT: Networking intent bonus ===
    // Both want to network = small bonus
    const bothHaveGoals = userPreferences.networking_goals.length > 0 && targetPreferences.networking_goals.length > 0;
    const intentBonus = bothHaveGoals ? 100 : 0;

    // === FINAL SCORE ===
    const finalScore = Math.round(
      (goalScore * 0.50) +
      (roleScore * 0.20) +
      (industryScore * 0.20) +
      (intentBonus * 0.10)
    );
    const cappedScore = Math.min(finalScore, 100);

    // Determine match type
    let matchType: 'none' | 'interest' | 'high-probability';
    if (cappedScore >= 80) {
      matchType = 'high-probability';
    } else if (cappedScore >= 30) {
      matchType = 'interest';
    } else {
      matchType = 'none';
    }

    return {
      score: cappedScore,
      matchType,
      reasons,
      commonTags
    };
  };

  return { calculateMatch };
};
