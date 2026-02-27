import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { BILLING_PLANS } from "@/lib/billing";
import BillingActions from "./pricing-actions";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/billing");
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Billing</h1>
          <p className="text-sm text-slate-600">
            Choose a plan that matches your project volume.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {BILLING_PLANS.map((plan) => (
            <section key={plan.tier} className="rounded-xl border border-slate-200 p-6">
              <h2 className="text-2xl font-semibold">{plan.label}</h2>
              <p className="mt-2 text-4xl font-bold">${plan.priceUsdMonthly}</p>
              <p className="text-sm text-slate-500">/ month</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>{plan.projectsPerMonth} projects/month</li>
                <li>{plan.rateLimitTier.replace("_", " ")} rate limiting</li>
                <li>{plan.models === "pro" ? "Pro models" : "Cheaper models"}</li>
              </ul>
              <div className="mt-6">
                <BillingActions tier={plan.tier} />
              </div>
            </section>
          ))}
        </div>

        <div>
          <BillingActions tier={null} />
        </div>
      </div>
    </main>
  );
}
