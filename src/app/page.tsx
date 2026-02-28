import Link from "next/link";

import AuthButtons from "@/app/_components/auth-buttons";
import LandingNav from "@/app/_components/landing-nav";
import { BILLING_PLANS } from "@/lib/billing";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f2f1eb] text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <LandingNav />

          <section className="relative overflow-hidden border-t border-black/5 px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
            <div className="absolute inset-x-[8%] top-[-6rem] h-48 rounded-full bg-lime-200/50 blur-3xl" />
            <div className="absolute right-[10%] top-24 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="absolute bottom-8 right-[14%] h-40 w-40 rounded-full bg-pink-200/50 blur-3xl" />

            <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                One Shot Prompts
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-none tracking-[-0.04em] sm:text-6xl">
                Prompt To Production
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Generate a single prompt that agents can use to build secure,
                scalable, and reliability-focused production applications.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <AuthButtons />
                <Link
                  className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white/70"
                  href="#pricing"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section
          className="grid gap-4 md:grid-cols-3"
          id="pricing"
        >
          {BILLING_PLANS.map((plan) => (
            <article
              key={plan.tier}
              className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]"
            >
              <p className="text-lg font-semibold">{plan.label}</p>
              <p className="mt-1 text-sm text-slate-500">
                {plan.tier === "FREE"
                  ? "Free Trial"
                  : plan.tier === "BASIC"
                    ? "For basic uses"
                    : "For elite vibe coders"}
              </p>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-[-0.05em]">
                  ${plan.priceUsdMonthly}
                </span>
                <span className="pb-2 text-sm text-slate-500">/ month</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                <li>{plan.projectsPerMonth} Projects/month</li>
                <li>
                  {plan.rateLimitTier === "ultra_low"
                    ? "Ultra Low Rate Limiting"
                    : plan.rateLimitTier === "low"
                      ? "Low Rate Limiting"
                      : "High Rate Limiting"}
                </li>
                <li>{plan.models === "pro" ? "Pro Models" : "Cheaper Models"}</li>
              </ul>
              <div className="mt-8">
                <Link
                  className={`flex h-12 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                    plan.tier === "BASIC"
                      ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
                      : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                  href="/api/auth/signin?callbackUrl=/projects"
                >
                  Sign up
                </Link>
              </div>
            </article>
          ))}
        </section>

        <footer
          className="rounded-3xl border border-black/10 bg-white px-6 py-10 shadow-[0_12px_40px_rgba(15,23,42,0.05)]"
          id="contact"
        >
          <p className="text-2xl font-semibold tracking-[-0.03em]">
            One Shot Prompts
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Prompt your way to production. Reach out at{" "}
            <a
              className="font-medium text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-950"
              href="mailto:hello@oneshotprompts.dev"
            >
              hello@oneshotprompts.dev
            </a>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
