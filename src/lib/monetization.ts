export const calculatePlatformCommission = (deliveryDays: number) => {
  if (deliveryDays < 1) return 0.08;
  if (deliveryDays === 1) return 0.06;
  if (deliveryDays === 2) return 0.04;
  if (deliveryDays >= 3 && deliveryDays <= 5) return 0.02;
  return 0.01;
};

export const getUnlockFee = (tier: string) => {
  switch (tier) {
    case 'beginner': return 29;
    case 'professional': return 49;
    case 'premium': return 99;
    default: return 29;
  }
};
