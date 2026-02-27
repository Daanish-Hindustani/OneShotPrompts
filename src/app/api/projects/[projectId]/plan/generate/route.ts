import { NextResponse } from "next/server";

import { generateMarkdownFromMessages } from "@/lib/ai-generation";
import { loadPromptTemplate } from "@/lib/prompt-loader";
import { getOwnedProject, getAuthenticatedUser } from "@/lib/project-access";
import { getLatestRequirement } from "@/lib/requirements-data";
import { upsertPlan } from "@/lib/plans-data";
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
    key: `plan:generate:ip:${clientIp}`,
    limit: 20,
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
    key: `plan:generate:user:${auth.user.id}`,
    limit: 10,
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

  const requirement = await getLatestRequirement(project.id);
  if (!requirement || !requirement.approvedAt) {
    return NextResponse.json(
      { error: "Approve requirements before generating a plan." },
      { status: 400 }
    );
  }

  const template = await loadPromptTemplate("plan");
  const generated = await generateMarkdownFromMessages({
    systemPrompt: template,
    userPrompt: `Approved requirements markdown:\n\n${requirement.contentMd}`,
  });

  if (!generated.ok) {
    return NextResponse.json({ error: generated.error }, { status: 502 });
  }

  const plan = await upsertPlan({
    projectId: project.id,
    contentMd: generated.content,
  });

  return NextResponse.json({ plan });
}
