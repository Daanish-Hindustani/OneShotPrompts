import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { ensureUserByEmail } from "@/lib/entitlements";
import { prisma } from "@/lib/db";

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

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-20">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {project.status}
          </p>
          <h1 className="text-3xl font-semibold">{project.title}</h1>
          <p className="text-sm text-slate-600">
            Created {project.createdAt.toLocaleDateString("en-US")} · Updated {" "}
            {project.updatedAt.toLocaleDateString("en-US")}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-600">
          Chat and project workflow will land here next.
        </div>
      </div>
    </main>
  );
}
