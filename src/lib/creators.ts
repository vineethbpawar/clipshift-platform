import { getActivePlan, getCreatorRankingBoost, type PlanType, type Profile } from "./plans";

export interface CreatorProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  specialization?: 'editing' | 'videography' | 'both';
  tier?: 'beginner' | 'professional' | 'premium';
  rating: number;
  completed_projects: number;
  portfolio_link?: string;
  bio?: string;
  languages?: string[];
  starting_price?: number;
  plan_type?: PlanType;
  plan_expires_at?: string;
  featured_creator?: boolean;
  verified_creator?: boolean;
}

export const calculateCreatorRank = (creator: CreatorProfile) => {
  let score = 0;

  // 1. Rating weight: 40% (up to 40 points)
  score += (creator.rating / 5) * 40;

  // 2. Completed projects weight: 25% (up to 25 points, capped at 50 projects)
  score += (Math.min(creator.completed_projects, 50) / 50) * 25;

  // 3. Profile completeness weight: 15% (3 pts each)
  let completeness = 0;
  if (creator.bio) completeness += 3;
  if (creator.location) completeness += 3;
  if (creator.languages && creator.languages.length > 0) completeness += 3;
  if (creator.avatar_url) completeness += 3;
  if (creator.specialization) completeness += 3;
  score += completeness;

  // 4. Portfolio available weight: 10%
  if (creator.portfolio_link) score += 10;

  // 5. Premium tier/plan boost: up to 10% (from active plan_type and featured status)
  const activePlan = getActivePlan(creator as unknown as Profile);
  let boost = getCreatorRankingBoost(activePlan);
  if (creator.featured_creator) boost += 10;
  if (creator.verified_creator) boost += 5;
  
  // Cap total score at 100
  return Math.min(Math.round(score + boost), 100);
};

export const getUnlockFee = (tier: string = 'beginner') => {
  switch (tier.toLowerCase()) {
    case 'premium': return 99;
    case 'professional': return 49;
    default: return 29;
  }
};
