import { NextResponse } from "next/server";

import { getOwnedProject, getAuthenticatedUser } from "@/lib/project-access";
import { approveRequirement, getLatestRequirement } from "@/lib/requirements-data";
import { consumeRateLimitWithFallback, getClientIp } from "@/lib/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security";

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  if (!isTrustedRequestOrigin(request.headers)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const ipLimit = await consumeRateLimitWithFallback({
    key: `requirements:approve:ip:${clientIp}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds ?? 1) } }
    );
  }

  const auth = await getAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const params = await context.params;
  const project = await getOwnedProject(params.projectId, auth.user.id);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const latest = await getLatestRequirement(project.id);
  if (!latest) {
    return NextResponse.json({ error: "No requirements draft found." }, { status: 400 });
  }

  if (latest.approvedAt) {
    return NextResponse.json({ requirement: latest });
  }

  const approved = await approveRequirement(latest.id);
  return NextResponse.json({ requirement: approved });
}
