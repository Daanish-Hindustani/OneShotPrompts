import type { MessageRole } from "@prisma/client";

import { prisma } from "./db";

export type ProjectMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
};

export async function listProjectMessages(input: {
  projectId: string;
  userId: string;
  limit?: number;
}): Promise<ProjectMessage[]> {
  const limit = input.limit ?? 200;

  return prisma.message.findMany({
    where: {
      projectId: input.projectId,
      project: { userId: input.userId },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });
}

export async function listRecentProjectMessages(input: {
  projectId: string;
  userId: string;
  limit?: number;
}): Promise<ProjectMessage[]> {
  const limit = input.limit ?? 20;

  const messages = await prisma.message.findMany({
    where: {
      projectId: input.projectId,
      project: { userId: input.userId },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  return messages.reverse();
}

export async function createProjectMessage(input: {
  projectId: string;
  role: MessageRole;
  content: string;
}): Promise<ProjectMessage> {
  return prisma.message.create({
    data: {
      projectId: input.projectId,
      role: input.role,
      content: input.content,
    },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });
}
