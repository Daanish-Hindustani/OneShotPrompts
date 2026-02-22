"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import {
  createProjectWithEntitlement,
  ensureUserByEmail,
} from "@/lib/entitlements";
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

  const rawTitle = String(formData.get("title") ?? "");
  const titleCheck = validateProjectTitle(rawTitle);
  if (!titleCheck.ok) {
    return { error: titleCheck.error };
  }

  const creationResult = await createProjectWithEntitlement({
    userId: user.id,
    title: titleCheck.value,
  });
  if (!creationResult.ok) {
    const message =
      creationResult.reason === "over_quota"
        ? "Project quota exceeded for this month."
        : "An active subscription is required to create projects.";
    return { error: message };
  }

  console.info("projects: creating project", { userId: user.id });
  redirect(`/projects/${creationResult.projectId}`);
}
