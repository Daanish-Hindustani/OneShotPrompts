import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureUserByEmail } from "@/lib/entitlements";

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }

  const email = session.user?.email;
  if (!email) {
    return {
      ok: false as const,
      status: 401 as const,
      error: "Unable to verify your account.",
    };
  }

  const user = await ensureUserByEmail({
    email,
    name: session.user?.name,
    image: session.user?.image,
  });

  return { ok: true as const, user };
}

export async function getOwnedProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    select: {
      id: true,
    },
  });
}
