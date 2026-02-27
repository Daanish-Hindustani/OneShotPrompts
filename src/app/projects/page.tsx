import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import {
  ensureUserByEmail,
  getProjectCreationEntitlement,
} from "@/lib/entitlements";
import { prisma } from "@/lib/db";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/projects");
  }

  const email = session.user?.email;
  if (!email) {
    redirect("/api/auth/signin?callbackUrl=/projects");
  }

  const user = await ensureUserByEmail({
    email,
    name: session.user?.name,
    image: session.user?.image,
  });

  const entitlement = await getProjectCreationEntitlement(user.id);
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });

  const entitlementMessage = !entitlement.ok
    ? "Project quota exceeded for this month."
    : null;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="text-sm text-slate-600">
            Track your active projects and start new ones from here.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/billing"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
            >
              Billing
            </Link>
            {entitlement.ok ? (
              <Link
                href="/projects/new"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                New project
              </Link>
            ) : (
              <span className="text-xs text-rose-600">{entitlementMessage}</span>
            )}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-600">
            No projects yet. Create your first project to start chatting.
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-lg border border-slate-200 px-4 py-3 transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-900">
                      {project.title}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      {project.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Updated {project.updatedAt.toLocaleDateString("en-US")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
