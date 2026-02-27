import { beforeEach, describe, expect, it } from "vitest";

import {
  consumeRateLimit,
  consumeRateLimitWithFallback,
  getClientIp,
  resetRateLimitStoreForTests,
} from "../src/lib/rate-limit";

describe("rate limit", () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
  });

  it("allows requests under the limit", () => {
    expect(
      consumeRateLimit({ key: "k", limit: 2, windowMs: 60_000, now: 1000 })
    ).toEqual({ ok: true });

    expect(
      consumeRateLimit({ key: "k", limit: 2, windowMs: 60_000, now: 1001 })
    ).toEqual({ ok: true });
  });

  it("blocks requests over the limit and returns retry-after", () => {
    consumeRateLimit({ key: "k", limit: 1, windowMs: 60_000, now: 1000 });

    const blocked = consumeRateLimit({
      key: "k",
      limit: 1,
      windowMs: 60_000,
      now: 2000,
    });

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets the bucket after window passes", () => {
    consumeRateLimit({ key: "k", limit: 1, windowMs: 1000, now: 1000 });

    expect(
      consumeRateLimit({ key: "k", limit: 1, windowMs: 1000, now: 2001 })
    ).toEqual({ ok: true });
  });
});

describe("client ip", () => {
  it("uses x-forwarded-for when present", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" },
    });

    expect(getClientIp(request)).toBe("1.1.1.1");
  });

  it("falls back to unknown when no ip headers", () => {
    const request = new Request("http://localhost");

    expect(getClientIp(request)).toBe("unknown");
  });
});

describe("fallback limiter", () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("falls back to in-memory when upstash env is not configured", async () => {
    const first = await consumeRateLimitWithFallback({
      key: "k",
      limit: 1,
      windowMs: 60_000,
      now: 1000,
    });
    const second = await consumeRateLimitWithFallback({
      key: "k",
      limit: 1,
      windowMs: 60_000,
      now: 1001,
    });

    expect(first).toEqual({ ok: true });
    expect(second.ok).toBe(false);
  });
});
