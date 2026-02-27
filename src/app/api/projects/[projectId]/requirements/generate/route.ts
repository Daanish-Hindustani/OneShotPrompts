import { NextResponse } from "next/server";

import { generateMarkdownFromMessages } from "@/lib/ai-generation";
import { loadPromptTemplate } from "@/lib/prompt-loader";
import { getOwnedProject, getAuthenticatedUser } from "@/lib/project-access";
import { listRecentProjectMessages } from "@/lib/messages-data";
import {
  createRequirementVersion,
  getLatestRequirement,
} from "@/lib/requirements-data";
import { consumeRateLimitWithFallback, getClientIp } from "@/lib/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security";

const MAX_TRANSCRIPT_CHARS = 40_000;

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  if (!isTrustedRequestOrigin(request.headers)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const ipLimit = await consumeRateLimitWithFallback({
    key: `requirements:generate:ip:${clientIp}`,
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

  const userLimit = await consumeRateLimitWithFallback({
    key: `requirements:generate:user:${auth.user.id}`,
    limit: 15,
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

  let body: { reopen?: boolean };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const latest = await getLatestRequirement(project.id);
  if (latest?.approvedAt && !body.reopen) {
    return NextResponse.json(
      { error: "Approved requirements are immutable until reopened." },
      { status: 409 }
    );
  }

  const messages = await listRecentProjectMessages({
    projectId: project.id,
    userId: auth.user.id,
    limit: 400,
  });

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Add chat messages before generating requirements." },
      { status: 400 }
    );
  }

  const transcript = messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n\n")
    .slice(-MAX_TRANSCRIPT_CHARS);

  const template = await loadPromptTemplate("requirements");
  const generated = await generateMarkdownFromMessages({
    systemPrompt: template,
    userPrompt: `Project conversation transcript:\n\n${transcript}`,
  });

  if (!generated.ok) {
    return NextResponse.json({ error: generated.error }, { status: 502 });
  }

  const versionInt = latest ? latest.versionInt + 1 : 1;

  const requirement = await createRequirementVersion({
    projectId: project.id,
    contentMd: generated.content,
    versionInt,
    approvedAt: null,
  });

  return NextResponse.json({
    requirement: {
      id: requirement.id,
      contentMd: requirement.contentMd,
      versionInt: requirement.versionInt,
      approvedAt: requirement.approvedAt,
      updatedAt: requirement.updatedAt,
    },
  });
}
