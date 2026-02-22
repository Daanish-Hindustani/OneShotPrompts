import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import {
  ensureUserByEmail,
  getProjectCreationEntitlement,
} from "@/lib/entitlements";

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

  if (!entitlement.ok) {
    const message =
      entitlement.reason === "over_quota"
        ? "Project quota exceeded for this month."
        : "An active subscription is required to create projects.";

    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-20">
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="text-sm text-slate-600">{message}</p>
          <p className="text-sm text-slate-600">
            You can continue once your subscription is active.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-20">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <p className="text-sm text-slate-600">
          You are signed in. Project scaffolding comes next.
        </p>
      </div>
    </main>
  );
}
