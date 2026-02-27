import Stripe from "stripe";

import { getRequiredEnv } from "@/lib/env";

let cachedStripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedStripe) return cachedStripe;

  const apiKey = getRequiredEnv("STRIPE_SECRET_KEY");
  cachedStripe = new Stripe(apiKey);
  return cachedStripe;
}
