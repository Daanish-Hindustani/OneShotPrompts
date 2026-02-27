import type { SubscriptionTier } from "@prisma/client";

import { getRequiredEnv } from "./env";

export const BILLING_PLANS: Array<{
  tier: SubscriptionTier;
  label: string;
  priceUsdMonthly: number;
  projectsPerMonth: number;
  rateLimitTier: "high" | "low" | "ultra_low";
  models: "cheaper" | "pro";
}> = [
  {
    tier: "FREE",
    label: "Free",
    priceUsdMonthly: 0,
    projectsPerMonth: 1,
    rateLimitTier: "high",
    models: "cheaper",
  },
  {
    tier: "BASIC",
    label: "Basic",
    priceUsdMonthly: 5,
    projectsPerMonth: 10,
    rateLimitTier: "low",
    models: "pro",
  },
  {
    tier: "PRO",
    label: "Pro",
    priceUsdMonthly: 10,
    projectsPerMonth: 20,
    rateLimitTier: "ultra_low",
    models: "pro",
  },
];

export function getStripePriceIdForTier(tier: SubscriptionTier): string {
  if (tier === "FREE") return getRequiredEnv("STRIPE_PRICE_FREE");
  if (tier === "BASIC") return getRequiredEnv("STRIPE_PRICE_BASIC");
  return getRequiredEnv("STRIPE_PRICE_PRO");
}

export function mapStripePriceIdToTier(priceId: string): SubscriptionTier | null {
  const mappings: Array<[string, SubscriptionTier]> = [
    [process.env.STRIPE_PRICE_FREE ?? "", "FREE"],
    [process.env.STRIPE_PRICE_BASIC ?? "", "BASIC"],
    [process.env.STRIPE_PRICE_PRO ?? "", "PRO"],
  ];

  const match = mappings.find(([configured]) => configured && configured === priceId);
  return match?.[1] ?? null;
}
