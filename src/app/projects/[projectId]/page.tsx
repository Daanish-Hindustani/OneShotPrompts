import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { ensureUserByEmail } from "@/lib/entitlements";
import { prisma } from "@/lib/db";
import { listProjectMessages } from "@/lib/messages-data";
import SignOutButton from "@/app/_components/sign-out-button";
import ProjectChat from "./project-chat";
import ProjectPlanEditor from "./project-plan";
import ProjectRequirements from "./project-requirements";
import ProjectSettingsForm from "./project-settings-form";

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/api/auth/signin?callbackUrl=/projects/${params.projectId}`);
  }

  const email = session.user?.email;
  if (!email) {
    redirect(`/api/auth/signin?callbackUrl=/projects/${params.projectId}`);
  }

  const user = await ensureUserByEmail({
    email,
    name: session.user?.name,
    image: session.user?.image,
  });

  const project = await prisma.project.findFirst({
    where: {
      id: params.projectId,
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!project) {
    notFound();
  }

  const messages = await listProjectMessages({
    projectId: project.id,
    userId: user.id,
  });
  const requirement = await prisma.requirement.findFirst({
    where: { projectId: project.id },
    orderBy: { versionInt: "desc" },
    select: {
      id: true,
      contentMd: true,
      versionInt: true,
      approvedAt: true,
    },
  });
  const plan = await prisma.plan.findUnique({
    where: { projectId: project.id },
    select: {
      id: true,
      contentMd: true,
    },
  });

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-20">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {project.status}
          </p>
          <h1 className="text-3xl font-semibold">{project.title}</h1>
          <p className="text-sm text-slate-600">
            Created {project.createdAt.toLocaleDateString("en-US")} · Updated{" "}
            {project.updatedAt.toLocaleDateString("en-US")}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-slate-600">Project workspace</span>
          <div className="flex items-center gap-2">
            <SignOutButton />
          </div>
        </div>

        <ProjectChat
          projectId={project.id}
          initialMessages={messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
          }))}
        />

        <ProjectRequirements
          projectId={project.id}
          initialRequirement={
            requirement
              ? {
                  id: requirement.id,
                  contentMd: requirement.contentMd,
                  versionInt: requirement.versionInt,
                  approvedAt: requirement.approvedAt?.toISOString() ?? null,
                }
              : null
          }
        />

        <ProjectPlanEditor
          projectId={project.id}
          initialPlan={
            plan
              ? {
                  id: plan.id,
                  contentMd: plan.contentMd,
                }
              : null
          }
        />

        <section className="rounded-lg border border-slate-200 p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Project settings
            </h2>
            <p className="text-xs text-slate-500">
              Update the project title or delete the project.
            </p>
          </div>
          <ProjectSettingsForm projectId={project.id} title={project.title} />
        </section>
      </div>
    </main>
  );
}
