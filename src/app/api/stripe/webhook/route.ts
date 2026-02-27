import { NextResponse } from "next/server";
import type { Stripe } from "stripe";

import { mapStripePriceIdToTier } from "@/lib/billing";
import { prisma } from "@/lib/db";
import { getRequiredEnv } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";

function toSubscriptionStatus(
  status: Stripe.Subscription.Status
): "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "TRIALING" {
  if (status === "active") return "ACTIVE";
  if (status === "past_due" || status === "unpaid") return "PAST_DUE";
  if (status === "canceled" || status === "incomplete_expired") return "CANCELED";
  if (status === "trialing") return "TRIALING";
  return "INCOMPLETE";
}

async function upsertFromSubscription(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId ? mapStripePriceIdToTier(priceId) : null;
  if (!tier || tier === "FREE") {
    return;
  }

  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  const userIdFromMetadata = subscription.metadata?.userId;
  const userId = existing?.userId ?? userIdFromMetadata;
  if (!userId) {
    console.error("stripe webhook: missing userId for subscription", {
      stripeSubscriptionId: subscription.id,
    });
    return;
  }
  const periodEndSeconds = subscription.items.data.reduce((latest, item) => {
    return Math.max(latest, item.current_period_end ?? 0);
  }, 0);

  if (!periodEndSeconds) {
    console.error("stripe webhook: missing current period end", {
      stripeSubscriptionId: subscription.id,
    });
    return;
  }

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: toSubscriptionStatus(subscription.status),
      tier,
      currentPeriodEnd: new Date(periodEndSeconds * 1000),
      stripeCustomerId: String(subscription.customer),
    },
    create: {
      userId,
      stripeCustomerId: String(subscription.customer),
      stripeSubscriptionId: subscription.id,
      status: toSubscriptionStatus(subscription.status),
      tier,
      currentPeriodEnd: new Date(periodEndSeconds * 1000),
    },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  const webhookSecret = getRequiredEnv("STRIPE_WEBHOOK_SECRET");
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    await upsertFromSubscription(subscription);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.subscription && typeof session.subscription === "string") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      if (session.metadata?.userId) {
        await stripe.subscriptions.update(subscription.id, {
          metadata: {
            ...subscription.metadata,
            userId: session.metadata.userId,
          },
        });
      }

      await upsertFromSubscription({
        ...subscription,
        metadata: {
          ...subscription.metadata,
          userId: subscription.metadata.userId ?? session.metadata?.userId,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
