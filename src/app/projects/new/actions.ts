"use server";

import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import {
  createProjectWithEntitlement,
  ensureUserByEmail,
} from "@/lib/entitlements";
import { validateProjectTitle } from "@/lib/projects";
import { consumeRateLimitWithFallback } from "@/lib/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security";

export type CreateProjectState = {
  error?: string;
};

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const requestHeaders = await headers();
  if (!isTrustedRequestOrigin(requestHeaders)) {
    return { error: "Forbidden origin." };
  }

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
  const rateLimit = await consumeRateLimitWithFallback({
    key: `projects:create:${user.id}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return { error: "Too many requests. Try again shortly." };
  }

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
    const message = "Project quota exceeded for this month.";
    return { error: message };
  }

  console.info("projects: creating project");
  redirect(`/projects/${creationResult.projectId}`);
}
