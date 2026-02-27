import { prisma } from "@/lib/db";

export async function getLatestRequirement(projectId: string) {
  return prisma.requirement.findFirst({
    where: { projectId },
    orderBy: { versionInt: "desc" },
  });
}

export async function createRequirementVersion(input: {
  projectId: string;
  contentMd: string;
  versionInt: number;
  approvedAt?: Date | null;
}) {
  return prisma.requirement.create({
    data: {
      projectId: input.projectId,
      contentMd: input.contentMd,
      versionInt: input.versionInt,
      approvedAt: input.approvedAt ?? null,
    },
  });
}

export async function updateRequirementContent(input: {
  id: string;
  contentMd: string;
}) {
  return prisma.requirement.update({
    where: { id: input.id },
    data: { contentMd: input.contentMd },
  });
}

export async function approveRequirement(id: string) {
  return prisma.requirement.update({
    where: { id },
    data: { approvedAt: new Date() },
  });
}
