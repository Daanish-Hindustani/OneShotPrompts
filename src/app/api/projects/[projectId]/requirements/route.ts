import { NextResponse } from "next/server";

import { getOwnedProject, getAuthenticatedUser } from "@/lib/project-access";
import {
  createRequirementVersion,
  getLatestRequirement,
  updateRequirementContent,
} from "@/lib/requirements-data";
import { consumeRateLimitWithFallback, getClientIp } from "@/lib/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security";

const MAX_REQUIREMENT_CHARS = 40_000;

export async function PUT(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  if (!isTrustedRequestOrigin(request.headers)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUIREMENT_CHARS * 2) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const clientIp = getClientIp(request);
  const ipLimit = await consumeRateLimitWithFallback({
    key: `requirements:save:ip:${clientIp}`,
    limit: 50,
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

  const userLimit = await consumeRateLimitWithFallback({
    key: `requirements:save:user:${auth.user.id}`,
    limit: 40,
    windowMs: 60_000,
  });
  if (!userLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(userLimit.retryAfterSeconds ?? 1) } }
    );
  }

  const params = await context.params;
  const project = await getOwnedProject(params.projectId, auth.user.id);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  let body: { contentMd?: string; reopen?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const contentMd = String(body.contentMd ?? "").trim();
  if (!contentMd) {
    return NextResponse.json({ error: "Requirements content is required." }, { status: 400 });
  }
  if (contentMd.length > MAX_REQUIREMENT_CHARS) {
    return NextResponse.json(
      { error: `Requirements must be ${MAX_REQUIREMENT_CHARS} characters or less.` },
      { status: 400 }
    );
  }

  const latest = await getLatestRequirement(project.id);
  if (!latest) {
    const created = await createRequirementVersion({
      projectId: project.id,
      contentMd,
      versionInt: 1,
      approvedAt: null,
    });
    return NextResponse.json({ requirement: created });
  }

  if (latest.approvedAt && !body.reopen) {
    return NextResponse.json(
      { error: "Approved requirements are immutable until reopened." },
      { status: 409 }
    );
  }

  if (latest.approvedAt && body.reopen) {
    const created = await createRequirementVersion({
      projectId: project.id,
      contentMd,
      versionInt: latest.versionInt + 1,
      approvedAt: null,
    });
    return NextResponse.json({ requirement: created });
  }

  const updated = await updateRequirementContent({
    id: latest.id,
    contentMd,
  });

  return NextResponse.json({ requirement: updated });
}
