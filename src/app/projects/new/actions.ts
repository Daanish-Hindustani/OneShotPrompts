"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import {
  ensureUserByEmail,
  getCurrentMonthKey,
  getProjectCreationEntitlement,
  incrementProjectsCreated,
} from "@/lib/entitlements";
import { prisma } from "@/lib/db";
import { validateProjectTitle } from "@/lib/projects";

export type CreateProjectState = {
  error?: string;
};

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/projects/new");
  }

  const email = session.user?.email;
  if (!email) {
    console.warn("projects: missing email in session");
    return { error: "Unable to verify your account. Try signing in again." };
  }

  const user = await ensureUserByEmail({
    email,
    name: session.user?.name,
    image: session.user?.image,
  });

  const entitlement = await getProjectCreationEntitlement(user.id);
  if (!entitlement.ok) {
    const message =
      entitlement.reason === "over_quota"
        ? "Project quota exceeded for this month."
        : "An active subscription is required to create projects.";
    return { error: message };
  }

  const rawTitle = String(formData.get("title") ?? "");
  const titleCheck = validateProjectTitle(rawTitle);
  if (!titleCheck.ok) {
    return { error: titleCheck.error };
  }

  console.info("projects: creating project", { userId: user.id });
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: titleCheck.value,
    },
  });

  const monthKey = getCurrentMonthKey();
  await incrementProjectsCreated(user.id, monthKey);

  redirect(`/projects/${project.id}`);
}
