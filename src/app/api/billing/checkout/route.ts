import { NextResponse } from "next/server";
import type { SubscriptionTier } from "@prisma/client";

import { BILLING_PLANS, getStripePriceIdForTier } from "@/lib/billing";
import { getOptionalEnv } from "@/lib/env";
import { getAuthenticatedUser } from "@/lib/project-access";
import { consumeRateLimitWithFallback, getClientIp } from "@/lib/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security";
import { getStripeClient } from "@/lib/stripe";

function getAppUrl() {
  return (
    getOptionalEnv("NEXT_PUBLIC_APP_URL", "") ||
    getOptionalEnv("NEXTAUTH_URL", "") ||
    "http://localhost:3000"
  );
}

export async function POST(request: Request) {
  if (!isTrustedRequestOrigin(request.headers)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const ipLimit = await consumeRateLimitWithFallback({
    key: `billing:checkout:ip:${clientIp}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds ?? 1) } }
    );
  }

  const auth = await getAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { tier?: SubscriptionTier };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const tier = body.tier;
  if (!tier || !BILLING_PLANS.some((plan) => plan.tier === tier)) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }

  if (tier === "FREE") {
    return NextResponse.json({ checkoutUrl: `${getAppUrl()}/projects` });
  }

  const priceId = getStripePriceIdForTier(tier);
  const stripe = getStripeClient();
  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/projects?billing=success`,
    cancel_url: `${appUrl}/billing?billing=canceled`,
    customer_email: auth.user.email,
    metadata: {
      userId: auth.user.id,
      tier,
    },
    subscription_data: {
      metadata: {
        userId: auth.user.id,
      },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ checkoutUrl: session.url });
}
