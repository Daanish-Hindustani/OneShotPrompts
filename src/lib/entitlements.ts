import type { Subscription, SubscriptionTier } from "@prisma/client";

import { prisma } from "./db";
import { getOptionalEnv } from "./env";

const TIER_PROJECT_LIMITS: Record<SubscriptionTier, number> = {
  BASIC: 5,
  PRO: 20,
  TEAM: 100,
};

export type EntitlementResult = {
  ok: boolean;
  reason?: "unsubscribed" | "over_quota";
  tier?: SubscriptionTier;
  limit?: number;
  used?: number;
  bypass?: boolean;
};

export function getTierProjectLimit(tier: SubscriptionTier): number {
  return TIER_PROJECT_LIMITS[tier];
}

export function getCurrentMonthKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isSubscriptionActive(
  subscription: Subscription | null,
  now = new Date()
): boolean {
  if (!subscription) return false;
  if (subscription.status !== "ACTIVE") return false;
  return subscription.currentPeriodEnd.getTime() >= now.getTime();
}

export function getBypassTier(): SubscriptionTier | null {
  if (process.env.NODE_ENV === "production") return null;

  const flag = getOptionalEnv("SUBSCRIPTION_BYPASS", "").toLowerCase();
  if (!flag || !["1", "true", "yes", "on"].includes(flag)) return null;

  const rawTier = getOptionalEnv("SUBSCRIPTION_BYPASS_TIER", "BASIC").toUpperCase();
  if (rawTier === "PRO" || rawTier === "TEAM" || rawTier === "BASIC") {
    return rawTier as SubscriptionTier;
  }

  return "BASIC";
}

export async function getLatestSubscription(userId: string, now = new Date()) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      currentPeriodEnd: {
        gte: now,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getUsageMeter(userId: string, month: string) {
  return prisma.usageMeter.findUnique({
    where: { userId_month: { userId, month } },
  });
}

export async function ensureUsageMeter(userId: string, month: string) {
  return prisma.usageMeter.upsert({
    where: { userId_month: { userId, month } },
    update: {},
    create: { userId, month },
  });
}

export async function incrementProjectsCreated(userId: string, month: string) {
  return prisma.usageMeter.upsert({
    where: { userId_month: { userId, month } },
    update: { projectsCreatedCount: { increment: 1 } },
    create: { userId, month, projectsCreatedCount: 1 },
  });
}

export async function getProjectCreationEntitlement(
  userId: string,
  now = new Date()
): Promise<EntitlementResult> {
  const bypassTier = getBypassTier();
  if (bypassTier) {
    const limit = getTierProjectLimit(bypassTier);
    console.info("entitlements: using dev bypass", { tier: bypassTier });
    return { ok: true, tier: bypassTier, limit, used: 0, bypass: true };
  }

  const subscription = await getLatestSubscription(userId, now);
  if (!subscription || !isSubscriptionActive(subscription, now)) {
    console.warn("entitlements: inactive subscription", { userId });
    return { ok: false, reason: "unsubscribed" };
  }

  const tier = subscription.tier;
  const limit = getTierProjectLimit(tier);
  const monthKey = getCurrentMonthKey(now);
  const meter = await getUsageMeter(userId, monthKey);
  const used = meter?.projectsCreatedCount ?? 0;

  if (used >= limit) {
    console.warn("entitlements: project quota exceeded", {
      userId,
      tier,
      limit,
      used,
    });
    return { ok: false, reason: "over_quota", tier, limit, used };
  }

  return { ok: true, tier, limit, used };
}

export async function ensureUserByEmail(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  console.info("users: ensuring user exists", { email: input.email });
  return prisma.user.upsert({
    where: { email: input.email },
    update: {},
    create: {
      email: input.email,
      name: input.name ?? null,
      image: input.image ?? null,
    },
  });
}
