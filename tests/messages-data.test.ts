import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const create = vi.fn();

vi.mock("../src/lib/db", () => ({
  prisma: {
    message: {
      findMany,
      create,
    },
  },
}));

describe("message data access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists project messages in ascending order", async () => {
    const now = new Date("2026-02-01T00:00:00.000Z");
    findMany.mockResolvedValueOnce([
      { id: "m1", role: "USER", content: "hi", createdAt: now },
    ]);

    const { listProjectMessages } = await import("../src/lib/messages-data");

    const result = await listProjectMessages({
      projectId: "p1",
      userId: "u1",
      limit: 10,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: { projectId: "p1", project: { userId: "u1" } },
      orderBy: { createdAt: "asc" },
      take: 10,
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });
    expect(result).toEqual([
      { id: "m1", role: "USER", content: "hi", createdAt: now },
    ]);
  });

  it("lists recent project messages in ascending order", async () => {
    const older = new Date("2026-02-01T00:00:00.000Z");
    const newer = new Date("2026-02-02T00:00:00.000Z");

    findMany.mockResolvedValueOnce([
      { id: "m2", role: "ASSISTANT", content: "new", createdAt: newer },
      { id: "m1", role: "USER", content: "old", createdAt: older },
    ]);

    const { listRecentProjectMessages } = await import(
      "../src/lib/messages-data"
    );

    const result = await listRecentProjectMessages({
      projectId: "p1",
      userId: "u1",
      limit: 2,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: { projectId: "p1", project: { userId: "u1" } },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });
    expect(result).toEqual([
      { id: "m1", role: "USER", content: "old", createdAt: older },
      { id: "m2", role: "ASSISTANT", content: "new", createdAt: newer },
    ]);
  });

  it("creates a project message", async () => {
    const now = new Date("2026-02-02T00:00:00.000Z");
    create.mockResolvedValueOnce({
      id: "m1",
      role: "USER",
      content: "hello",
      createdAt: now,
    });

    const { createProjectMessage } = await import("../src/lib/messages-data");

    const result = await createProjectMessage({
      projectId: "p1",
      role: "USER",
      content: "hello",
    });

    expect(create).toHaveBeenCalledWith({
      data: { projectId: "p1", role: "USER", content: "hello" },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });
    expect(result).toEqual({
      id: "m1",
      role: "USER",
      content: "hello",
      createdAt: now,
    });
  });
});
