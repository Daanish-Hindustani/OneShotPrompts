import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import {
  ensureUserByEmail,
  getProjectCreationEntitlement,
} from "@/lib/entitlements";
import CreateProjectForm from "./create-project-form";

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/projects/new");
  }

  const email = session.user?.email;
  if (!email) {
    redirect("/api/auth/signin?callbackUrl=/projects/new");
  }

  const user = await ensureUserByEmail({
    email,
    name: session.user?.name,
    image: session.user?.image,
  });

  const entitlement = await getProjectCreationEntitlement(user.id);
  if (!entitlement.ok) {
    const message = "Project quota exceeded for this month.";

    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-20">
          <h1 className="text-3xl font-semibold">New project</h1>
          <p className="text-sm text-slate-600">{message}</p>
          <p className="text-sm text-slate-600">
            Upgrade your plan or wait until your monthly quota resets.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">New project</h1>
          <p className="text-sm text-slate-600">
            Give your project a clear name so you can find it later.
          </p>
        </div>
        <CreateProjectForm />
      </div>
    </main>
  );
}
