"use server";

import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { ensureUserByEmail } from "@/lib/entitlements";
import { validateProjectTitle } from "@/lib/projects";
import {
  deleteProjectForUser,
  updateProjectTitleForUser,
} from "@/lib/projects-data";
import { consumeRateLimitWithFallback } from "@/lib/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security";

export type UpdateProjectState = {
  error?: string;
};

export type DeleteProjectState = {
  error?: string;
};

export async function updateProjectTitleAction(
  _prevState: UpdateProjectState,
  formData: FormData
): Promise<UpdateProjectState> {
  const requestHeaders = await headers();
  if (!isTrustedRequestOrigin(requestHeaders)) {
    return { error: "Forbidden origin." };
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/projects");
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
    key: `projects:update:${user.id}`,
    limit: 40,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return { error: "Too many requests. Try again shortly." };
  }

  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) {
    return { error: "Project ID is required." };
  }

  const rawTitle = String(formData.get("title") ?? "");
  const titleCheck = validateProjectTitle(rawTitle);
  if (!titleCheck.ok) {
    return { error: titleCheck.error };
  }

  const result = await updateProjectTitleForUser({
    projectId,
    userId: user.id,
    title: titleCheck.value,
  });

  if (!result.ok) {
    return { error: "Project not found." };
  }

  console.info("projects: updated project title");
  redirect(`/projects/${projectId}`);
}

export async function deleteProjectAction(
  _prevState: DeleteProjectState,
  formData: FormData
): Promise<DeleteProjectState> {
  const requestHeaders = await headers();
  if (!isTrustedRequestOrigin(requestHeaders)) {
    return { error: "Forbidden origin." };
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/projects");
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
    key: `projects:delete:${user.id}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return { error: "Too many requests. Try again shortly." };
  }

  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) {
    return { error: "Project ID is required." };
  }

  const result = await deleteProjectForUser({
    projectId,
    userId: user.id,
  });

  if (!result.ok) {
    return { error: "Project not found." };
  }

  console.info("projects: deleted project");
  redirect("/projects");
}
