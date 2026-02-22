import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/projects");
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
