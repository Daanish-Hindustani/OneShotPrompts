import { afterEach, describe, expect, it } from "vitest";

import { getStripePriceIdForTier, mapStripePriceIdToTier } from "../src/lib/billing";

describe("billing tier mapping", () => {
  const prevFree = process.env.STRIPE_PRICE_FREE;
  const prevBasic = process.env.STRIPE_PRICE_BASIC;
  const prevPro = process.env.STRIPE_PRICE_PRO;

  afterEach(() => {
    process.env.STRIPE_PRICE_FREE = prevFree;
    process.env.STRIPE_PRICE_BASIC = prevBasic;
    process.env.STRIPE_PRICE_PRO = prevPro;
  });

  it("returns configured price id for tiers", () => {
    process.env.STRIPE_PRICE_FREE = "price_free";
    process.env.STRIPE_PRICE_BASIC = "price_basic";
    process.env.STRIPE_PRICE_PRO = "price_pro";

    expect(getStripePriceIdForTier("FREE")).toBe("price_free");
    expect(getStripePriceIdForTier("BASIC")).toBe("price_basic");
    expect(getStripePriceIdForTier("PRO")).toBe("price_pro");
  });

  it("maps price ids back to tiers", () => {
    process.env.STRIPE_PRICE_FREE = "price_free";
    process.env.STRIPE_PRICE_BASIC = "price_basic";
    process.env.STRIPE_PRICE_PRO = "price_pro";

    expect(mapStripePriceIdToTier("price_free")).toBe("FREE");
    expect(mapStripePriceIdToTier("price_basic")).toBe("BASIC");
    expect(mapStripePriceIdToTier("price_pro")).toBe("PRO");
    expect(mapStripePriceIdToTier("price_unknown")).toBeNull();
  });
});
