import { describe, expect, it } from "vitest";
import { getOptionalEnv, getRequiredEnv } from "../src/lib/env";
import { getBypassTier } from "../src/lib/entitlements";

describe("env helpers", () => {
  it("returns required values", () => {
    process.env.REQUIRED_TEST = "ok";
    expect(getRequiredEnv("REQUIRED_TEST")).toBe("ok");
  });

  it("throws when required value missing", () => {
    delete process.env.MISSING_TEST;
    expect(() => getRequiredEnv("MISSING_TEST")).toThrow(
      "Missing required env var: MISSING_TEST"
    );
  });

  it("returns fallback for optional values", () => {
    delete process.env.OPTIONAL_TEST;
    expect(getOptionalEnv("OPTIONAL_TEST", "fallback")).toBe("fallback");
  });

  it("returns null when subscription bypass disabled", () => {
    delete process.env.SUBSCRIPTION_BYPASS;
    delete process.env.SUBSCRIPTION_BYPASS_TIER;
    expect(getBypassTier()).toBeNull();
  });

  it("returns BASIC when subscription bypass enabled", () => {
    process.env.SUBSCRIPTION_BYPASS = "true";
    process.env.SUBSCRIPTION_BYPASS_TIER = "basic";
    expect(getBypassTier()).toBe("BASIC");
    delete process.env.SUBSCRIPTION_BYPASS;
    delete process.env.SUBSCRIPTION_BYPASS_TIER;
  });

  it("returns FREE when bypass tier is free", () => {
    process.env.SUBSCRIPTION_BYPASS = "true";
    process.env.SUBSCRIPTION_BYPASS_TIER = "free";
    expect(getBypassTier()).toBe("FREE");
    delete process.env.SUBSCRIPTION_BYPASS;
    delete process.env.SUBSCRIPTION_BYPASS_TIER;
  });
});
