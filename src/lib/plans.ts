export type PlanType = 'free' | 'creator_pro' | 'creator_premium';

export interface Profile {
  plan_type: PlanType;
  plan_expires_at: string | Date | null;
  role?: 'creator' | 'client' | 'admin';
  [key: string]: any;
}

export function getActivePlan(profile?: Profile): PlanType {
  if (!profile || !profile.plan_type) return 'free';
  
  if (profile.plan_expires_at) {
    const expiresAt = new Date(profile.plan_expires_at);
    if (expiresAt < new Date()) return 'free';
  }
  
  return profile.plan_type;
}

export function isCreatorPlan(plan: PlanType): boolean {
  return plan === 'creator_pro' || plan === 'creator_premium';
}

export function isClientPlan(plan: PlanType): boolean {
  // Clients are now pay-per-use only
  return false;
}

export function getCreatorRankingBoost(plan: PlanType): number {
  switch (plan) {
    case 'creator_pro': return 5;
    case 'creator_premium': return 10;
    default: return 0;
  }
}

export function getClientUnlockDiscount(plan: PlanType): number {
  // Removing client-side discounts as there are no monthly client tiers
  return 0;
}

export function getPortfolioUploadLimit(plan: PlanType): number | 'unlimited' {
  switch (plan) {
    case 'creator_pro': return 10;
    case 'creator_premium': return 'unlimited';
    default: return 3;
  }
}

export function canAccessAdvancedAnalytics(plan: PlanType): boolean {
  // Only creators have tiers now
  return plan === 'creator_premium';
}

export function canAccessPriorityVisibility(plan: PlanType): boolean {
  return isCreatorPlan(plan);
}
