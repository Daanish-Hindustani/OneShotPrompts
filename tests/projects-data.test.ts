import { beforeEach, describe, expect, it, vi } from "vitest";

const updateMany = vi.fn();
const deleteMany = vi.fn();

vi.mock("../src/lib/db", () => ({
  prisma: {
    project: {
      updateMany,
      deleteMany,
    },
  },
}));

describe("project data access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates project title for the owning user", async () => {
    updateMany.mockResolvedValueOnce({ count: 1 });

    const { updateProjectTitleForUser } = await import(
      "../src/lib/projects-data"
    );

    const result = await updateProjectTitleForUser({
      projectId: "proj_1",
      userId: "user_1",
      title: "New title",
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "proj_1", userId: "user_1" },
      data: { title: "New title" },
    });
    expect(result).toEqual({ ok: true });
  });

  it("returns not_found when update affects no rows", async () => {
    updateMany.mockResolvedValueOnce({ count: 0 });

    const { updateProjectTitleForUser } = await import(
      "../src/lib/projects-data"
    );

    const result = await updateProjectTitleForUser({
      projectId: "proj_1",
      userId: "user_1",
      title: "New title",
    });

    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("deletes project for the owning user", async () => {
    deleteMany.mockResolvedValueOnce({ count: 1 });

    const { deleteProjectForUser } = await import(
      "../src/lib/projects-data"
    );

    const result = await deleteProjectForUser({
      projectId: "proj_1",
      userId: "user_1",
    });

    expect(deleteMany).toHaveBeenCalledWith({
      where: { id: "proj_1", userId: "user_1" },
    });
    expect(result).toEqual({ ok: true });
  });

  it("returns not_found when delete affects no rows", async () => {
    deleteMany.mockResolvedValueOnce({ count: 0 });

    const { deleteProjectForUser } = await import(
      "../src/lib/projects-data"
    );

    const result = await deleteProjectForUser({
      projectId: "proj_1",
      userId: "user_1",
    });

    expect(result).toEqual({ ok: false, reason: "not_found" });
  });
});
