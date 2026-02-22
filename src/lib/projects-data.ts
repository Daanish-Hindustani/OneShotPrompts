import { prisma } from "./db";

export async function updateProjectTitleForUser(input: {
  projectId: string;
  userId: string;
  title: string;
}): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
  const result = await prisma.project.updateMany({
    where: { id: input.projectId, userId: input.userId },
    data: { title: input.title },
  });

  if (result.count === 0) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true };
}

export async function deleteProjectForUser(input: {
  projectId: string;
  userId: string;
}): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
  const result = await prisma.project.deleteMany({
    where: { id: input.projectId, userId: input.userId },
  });

  if (result.count === 0) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true };
}
