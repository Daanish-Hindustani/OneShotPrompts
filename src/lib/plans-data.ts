import { prisma } from "@/lib/db";

export async function getPlanByProjectId(projectId: string) {
  return prisma.plan.findUnique({
    where: { projectId },
  });
}

export async function upsertPlan(input: { projectId: string; contentMd: string }) {
  return prisma.plan.upsert({
    where: { projectId: input.projectId },
    update: { contentMd: input.contentMd },
    create: {
      projectId: input.projectId,
      contentMd: input.contentMd,
    },
  });
}
