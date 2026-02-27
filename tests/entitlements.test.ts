import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
const userUpsert = vi.fn();
const usageFindUnique = vi.fn();
const usageUpsert = vi.fn();
const usageUpdateMany = vi.fn();
const projectCreate = vi.fn();
const txSubscriptionFindFirst = vi.fn();
const txUsageUpsert = vi.fn();
const txUsageUpdateMany = vi.fn();
const txProjectCreate = vi.fn();
const transaction = vi.fn();

vi.mock("../src/lib/db", () => ({
  prisma: {
    subscription: { findFirst },
    user: { upsert: userUpsert },
    usageMeter: {
      findUnique: usageFindUnique,
      upsert: usageUpsert,
      updateMany: usageUpdateMany,
    },
    project: { create: projectCreate },
    $transaction: transaction,
  },
}));

describe("entitlements data access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (callback) =>
      callback({
        subscription: { findFirst: txSubscriptionFindFirst },
        usageMeter: {
          upsert: txUsageUpsert,
          updateMany: txUsageUpdateMany,
        },
        project: { create: txProjectCreate },
      })
    );
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
    userUpsert.mockResolvedValueOnce({ id: "u1", email: "test@example.com" });

    const { ensureUserByEmail } = await import("../src/lib/entitlements");

    await ensureUserByEmail({
      email: "test@example.com",
      name: "Test User",
      image: "https://example.com/avatar.png",
    });

    expect(userUpsert).toHaveBeenCalledWith({
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
    userUpsert.mockResolvedValueOnce({ id: "u1", email: "test@example.com" });

    const { ensureUserByEmail } = await import("../src/lib/entitlements");

    await ensureUserByEmail({
      email: "test@example.com",
      name: null,
      image: undefined,
    });

    expect(userUpsert).toHaveBeenCalledWith({
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

  it("creates a project and increments usage in a single transaction", async () => {
    const now = new Date("2026-01-15T00:00:00.000Z");
    txSubscriptionFindFirst.mockResolvedValueOnce({
      tier: "BASIC",
      status: "ACTIVE",
      currentPeriodEnd: new Date("2026-02-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-15T00:00:00.000Z"),
    });
    txUsageUpsert.mockResolvedValueOnce({});
    txUsageUpdateMany.mockResolvedValueOnce({ count: 1 });
    txProjectCreate.mockResolvedValueOnce({ id: "proj_1" });

    const { createProjectWithEntitlement } = await import("../src/lib/entitlements");

    const result = await createProjectWithEntitlement({
      userId: "user_123",
      title: "My project",
      now,
    });

    expect(result).toEqual({ ok: true, projectId: "proj_1" });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(txUsageUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
        month: "2026-01",
        projectsCreatedCount: { lt: 10 },
      },
      data: {
        projectsCreatedCount: { increment: 1 },
      },
    });
    expect(txProjectCreate).toHaveBeenCalledWith({
      data: {
        userId: "user_123",
        title: "My project",
      },
    });
  });

  it("returns over_quota when reservation update affects no rows", async () => {
    txSubscriptionFindFirst.mockResolvedValueOnce({
      tier: "BASIC",
      status: "ACTIVE",
      currentPeriodEnd: new Date("2026-02-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-15T00:00:00.000Z"),
    });
    txUsageUpsert.mockResolvedValueOnce({});
    txUsageUpdateMany.mockResolvedValueOnce({ count: 0 });

    const { createProjectWithEntitlement } = await import("../src/lib/entitlements");

    const result = await createProjectWithEntitlement({
      userId: "user_123",
      title: "My project",
      now: new Date("2026-01-15T00:00:00.000Z"),
    });

    expect(result).toEqual({ ok: false, reason: "over_quota" });
    expect(txProjectCreate).not.toHaveBeenCalled();
  });

  it("defaults to FREE tier limit when no active subscription exists", async () => {
    txSubscriptionFindFirst.mockResolvedValueOnce(null);
    txUsageUpsert.mockResolvedValueOnce({});
    txUsageUpdateMany.mockResolvedValueOnce({ count: 1 });
    txProjectCreate.mockResolvedValueOnce({ id: "proj_free_1" });

    const { createProjectWithEntitlement } = await import("../src/lib/entitlements");

    const result = await createProjectWithEntitlement({
      userId: "user_123",
      title: "Free project",
      now: new Date("2026-01-15T00:00:00.000Z"),
    });

    expect(result).toEqual({ ok: true, projectId: "proj_free_1" });
    expect(txUsageUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
        month: "2026-01",
        projectsCreatedCount: { lt: 1 },
      },
      data: {
        projectsCreatedCount: { increment: 1 },
      },
    });
  });
});
