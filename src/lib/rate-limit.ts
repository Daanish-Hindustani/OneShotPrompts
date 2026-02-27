type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

type RateLimitResult = {
  ok: boolean;
  retryAfterSeconds?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function consumeRateLimit(input: RateLimitInput): RateLimitResult {
  const now = input.now ?? Date.now();
  const existing = buckets.get(input.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    });
    return { ok: true };
  }

  if (existing.count >= input.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000)
    );
    return { ok: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { ok: true };
}

async function consumeRateLimitUpstash(
  input: RateLimitInput
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }

  try {
    const now = input.now ?? Date.now();
    const incrRes = await fetch(`${url}/incr/${encodeURIComponent(input.key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!incrRes.ok) return null;

    const incrJson = (await incrRes.json()) as { result?: number };
    const count = Number(incrJson.result ?? 0);
    if (!Number.isFinite(count) || count <= 0) return null;

    if (count === 1) {
      await fetch(
        `${url}/pexpire/${encodeURIComponent(input.key)}/${input.windowMs}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      return { ok: true };
    }

    if (count > input.limit) {
      const pttlRes = await fetch(
        `${url}/pttl/${encodeURIComponent(input.key)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      let retryAfterSeconds = 1;
      if (pttlRes.ok) {
        const pttlJson = (await pttlRes.json()) as { result?: number };
        const pttlMs = Number(pttlJson.result ?? 0);
        if (Number.isFinite(pttlMs) && pttlMs > 0) {
          retryAfterSeconds = Math.max(1, Math.ceil(pttlMs / 1000));
        } else if (input.windowMs > 0) {
          retryAfterSeconds = Math.max(
            1,
            Math.ceil((input.windowMs - (Date.now() - now)) / 1000)
          );
        }
      }
      return { ok: false, retryAfterSeconds };
    }

    return { ok: true };
  } catch {
    return null;
  }
}

export async function consumeRateLimitWithFallback(
  input: RateLimitInput
): Promise<RateLimitResult> {
  const remote = await consumeRateLimitUpstash(input);
  if (remote) return remote;
  return consumeRateLimit(input);
}

export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export function resetRateLimitStoreForTests() {
  buckets.clear();
}
