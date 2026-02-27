import { NextResponse } from "next/server";

import { getOwnedProject, getAuthenticatedUser } from "@/lib/project-access";
import { getPlanByProjectId } from "@/lib/plans-data";

function createSafeFilename(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
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
  if (!plan) {
    return NextResponse.json({ error: "No plan found." }, { status: 404 });
  }

  const fileName = `${createSafeFilename(project.id)}-implementation-plan.md`;
  return new Response(plan.contentMd, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
