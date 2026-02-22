import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
const upsert = vi.fn();

vi.mock("../src/lib/db", () => ({
  prisma: {
    subscription: { findFirst },
    user: { upsert },
    usageMeter: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe("entitlements data access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters latest subscription to active and unexpired records", async () => {
    const now = new Date("2026-01-15T00:00:00.000Z");
    findFirst.mockResolvedValueOnce(null);

    const { getLatestSubscription } = await import("../src/lib/entitlements");

    await getLatestSubscription("user_123", now);

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
        status: "ACTIVE",
        currentPeriodEnd: {
          gte: now,
        },
      },
      orderBy: [{ currentPeriodEnd: "desc" }, { updatedAt: "desc" }],
    });
  });

  it("upserts user by email to avoid concurrent creation races", async () => {
    upsert.mockResolvedValueOnce({ id: "u1", email: "test@example.com" });

    const { ensureUserByEmail } = await import("../src/lib/entitlements");

    await ensureUserByEmail({
      email: "test@example.com",
      name: "Test User",
      image: "https://example.com/avatar.png",
    });

    expect(upsert).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      update: {
        name: "Test User",
        image: "https://example.com/avatar.png",
      },
      create: {
        email: "test@example.com",
        name: "Test User",
        image: "https://example.com/avatar.png",
      },
    });
  });

  it("does not overwrite existing profile fields with nullish values", async () => {
    upsert.mockResolvedValueOnce({ id: "u1", email: "test@example.com" });

    const { ensureUserByEmail } = await import("../src/lib/entitlements");

    await ensureUserByEmail({
      email: "test@example.com",
      name: null,
      image: undefined,
    });

    expect(upsert).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      update: {
        name: undefined,
        image: undefined,
      },
      create: {
        email: "test@example.com",
        name: null,
        image: null,
      },
    });
  });

});
