import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getOptionalEnv } from "@/lib/env";
import { getAuthenticatedUser } from "@/lib/project-access";
import { consumeRateLimitWithFallback, getClientIp } from "@/lib/rate-limit";
import { getStripeClient } from "@/lib/stripe";

function getAppUrl() {
  return (
    getOptionalEnv("NEXT_PUBLIC_APP_URL", "") ||
    getOptionalEnv("NEXTAUTH_URL", "") ||
    "http://localhost:3000"
  );
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const ipLimit = await consumeRateLimitWithFallback({
    key: `billing:portal:ip:${clientIp}`,
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

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: auth.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found." }, { status: 404 });
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${getAppUrl()}/billing`,
  });

  return NextResponse.json({ portalUrl: session.url });
}
