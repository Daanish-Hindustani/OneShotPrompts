import { NextResponse } from "next/server";

import { getOwnedProject, getAuthenticatedUser } from "@/lib/project-access";
import { getPlanByProjectId, upsertPlan } from "@/lib/plans-data";
import { consumeRateLimitWithFallback, getClientIp } from "@/lib/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security";

const MAX_PLAN_CHARS = 60_000;

export async function PUT(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  if (!isTrustedRequestOrigin(request.headers)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_PLAN_CHARS * 2) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const clientIp = getClientIp(request);
  const ipLimit = await consumeRateLimitWithFallback({
    key: `plan:save:ip:${clientIp}`,
    limit: 40,
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

  let body: { contentMd?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const contentMd = String(body.contentMd ?? "").trim();
  if (!contentMd) {
    return NextResponse.json({ error: "Plan content is required." }, { status: 400 });
  }
  if (contentMd.length > MAX_PLAN_CHARS) {
    return NextResponse.json(
      { error: `Plan must be ${MAX_PLAN_CHARS} characters or less.` },
      { status: 400 }
    );
  }

  const plan = await upsertPlan({
    projectId: project.id,
    contentMd,
  });

  return NextResponse.json({ plan });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const params = await context.params;
  const project = await getOwnedProject(params.projectId, auth.user.id);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const plan = await getPlanByProjectId(project.id);
  return NextResponse.json({ plan });
}
