import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import type { ReactElement } from "react";
import blueprintImage from "../../blueprint.png";
import blocksImage from "../../blocks.png";
import claudeImage from "../../claude.png";
import cursorImage from "../../cursor.png";
import lightbulbImage from "../../lightbuld.png";
import openAiImage from "../../openai.png";

import LandingNav from "@/app/_components/landing-nav";
import RevealOnScroll from "@/app/_components/reveal-on-scroll";
import { BILLING_PLANS } from "@/lib/billing";

const inter = Inter({
  subsets: ["latin"],
});

type WorkflowStep = {
  title: string;
  description: string;
  bullets?: string[];
  icon: ReactElement;
};

const FEATURE_CARDS = [
  {
    title: "Security",
    body: "Authentication, rate limits, secrets, and safe data boundaries — not just working code.",
  },
  {
    title: "Scalability",
    body: "Scaling beyond a demo: autoscale, sharding, queues, and real traffic handling.",
  },
  {
    title: "Reliability",
    body: "Idempotency, concurrency safety, observability, and failure-proof pipelines.",
  },
  {
    title: "Observability",
    body: "Logs, metrics, tracing, and alerting so you can see failures before users do.",
  },
] as const;

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    title: "1. Explain the idea",
    description: "Chat with our PM agents to define your product.",
    icon: (
      <Image
        alt=""
        className="h-auto w-[108px]"
        priority
        src={lightbulbImage}
      />
    ),
  },
  {
    title: "2. Product Break Down",
    description:
      "We convert your idea into production constraints: auth, scale, data flow, failure modes, API schema, etc.",
    icon: (
      <Image
        alt=""
        className="h-auto w-[148px]"
        src={blocksImage}
      />
    ),
  },
  {
    title: "3. Production Blueprint",
    description: "You receive a deployable production blueprint:",
    bullets: [
      "Architecture design",
      "Security constraints",
      "Scalability requirements",
      "Reliability guardrails",
      "Modular task breakdown",
    ],
    icon: (
      <Image
        alt=""
        className="h-auto w-[128px]"
        src={blueprintImage}
      />
    ),
  },
  {
    title: "4. Deploy With Any Agent",
    description:
      "Feed the blueprint into Codex, Claude Code, Cursor, or any coding agent — and generate a production ready app.",
    icon: <AgentLogosIcon />,
  },
];

export default function HomePage() {
  return (
    <main className={`${inter.className} min-h-screen bg-white text-black`}>
      <div className="flex w-full flex-col bg-white">
        <div className="overflow-hidden bg-white">
          <LandingNav />

          <section className="landing-hero relative flex flex-col items-center gap-12 px-6 py-20 text-center sm:px-10 lg:h-[502px] lg:px-12 lg:py-[112px]">
            <div className="relative z-10 flex w-full max-w-[1000px] flex-col items-center gap-6">
              <h1 className="w-full text-balance text-5xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-6xl lg:text-[68px]">
                Prompt To Production
              </h1>
              <p className="w-full max-w-[1000px] text-lg font-medium leading-[1.45] tracking-[-0.005em] text-black/55 sm:text-xl lg:text-[25px]">
                Generate a SINGLE prompt that agents can use to build secure,
                scalable, and reliability production applications.
              </p>
            </div>

            <div className="relative z-10 flex w-full flex-wrap items-center justify-center gap-4">
              <Link
                className="flex h-[50px] min-w-[132px] items-center justify-center rounded-xl bg-black px-4 text-lg font-medium leading-[1.45] tracking-[-0.005em] text-white transition hover:bg-black/90"
                href="/api/auth/signin?callbackUrl=/projects"
              >
                Get Started
              </Link>
              <Link
                className="flex h-[50px] min-w-[129px] items-center justify-center rounded-xl border-2 border-black/15 px-4 text-lg font-medium leading-[1.45] tracking-[-0.005em] text-black transition hover:bg-black/[0.02]"
                href="#pricing"
              >
                Learn More
              </Link>
            </div>
          </section>
        </div>

        <section className="flex items-center justify-center px-6 py-20 text-center sm:px-10 lg:h-[270px] lg:px-12 lg:py-[112px]">
          <p className="w-full max-w-[1152px] text-balance text-3xl font-bold leading-[1.2] tracking-[-0.02em] sm:text-4xl lg:text-[36px]">
            “AI Writes the code. We engineer the blueprint.”
          </p>
        </section>

        <section className="px-6 py-10 sm:px-10 lg:h-[436px] lg:px-12">
          <div className="flex flex-col items-center">
            <h2 className="text-center text-3xl font-bold leading-[1.2] tracking-[-0.02em] lg:text-[36px]">
              What AI Misses:
            </h2>

            <div className="mt-16 grid w-full max-w-[1440px] gap-10 px-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-16">
              {FEATURE_CARDS.map((card, index) => (
                <RevealOnScroll
                  className="w-full"
                  delayMs={index * 120}
                  key={card.title}
                >
                  <article className="h-full min-h-[204px] rounded-2xl bg-black/5">
                    <div className="flex h-full flex-col gap-2 p-8">
                      <h3 className="text-2xl font-semibold leading-[1.2] tracking-[-0.02em]">
                        {card.title}
                      </h3>
                      <p className="text-lg font-medium leading-[1.45] tracking-[-0.005em] text-black/55">
                        {card.body}
                      </p>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:px-10 lg:h-[747px] lg:px-12 lg:py-[112px]">
          <h2 className="max-w-[463px] text-balance text-4xl font-bold leading-[1.2] tracking-[-0.02em] sm:text-5xl lg:text-[48px]">
            Here’s How One Shot Prompts Work:
          </h2>

          <div className="mt-16 grid items-start justify-items-center gap-10 md:grid-cols-2 xl:grid-cols-4">
            {WORKFLOW_STEPS.map((step, index) => (
              <RevealOnScroll
                className="w-full"
                delayMs={index * 140}
                key={step.title}
              >
                <article className="flex flex-col items-center text-center">
                  <div className="flex w-full max-w-[307px] flex-col items-center text-center">
                    <div className="mb-2 flex h-[148px] w-full items-center justify-center">
                      {step.icon}
                    </div>
                    <h3 className="mt-1 text-2xl font-semibold leading-[1] tracking-[-0.015em]">
                      {step.title}
                    </h3>
                    {step.bullets ? (
                      <div className="mt-2 space-y-1 text-lg font-medium leading-[1.45] tracking-[-0.005em] text-black/55">
                        <p>{step.description}</p>
                        <ul className="mt-3 space-y-1 text-sm text-black/55">
                          {step.bullets.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="mt-2 max-w-md text-lg font-medium leading-[1.45] tracking-[-0.005em] text-black/55">
                        {step.description}
                      </p>
                    )}
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        <section
          className="px-6 py-20 sm:px-10 lg:h-[626px] lg:px-12 lg:py-[112px]"
          id="pricing"
        >
          <div className="grid gap-8 lg:grid-cols-3">
            {BILLING_PLANS.map((plan) => (
              <article
                key={plan.tier}
                className="flex min-h-[405px] flex-col rounded-2xl border border-black/10 bg-white px-6 pb-6 pt-8 shadow-[0_0_4.4px_rgba(0,0,0,0.06),0_5px_19px_rgba(0,0,0,0.08)]"
              >
                <div>
                  <p className="text-xl font-semibold leading-[1.4] tracking-[-0.005em]">
                    {plan.label}
                  </p>
                  <p className="text-lg font-medium leading-[1.4] tracking-[-0.005em] text-black/55">
                    {plan.tier === "FREE"
                      ? "Free Trial"
                      : plan.tier === "BASIC"
                        ? "For basic uses"
                        : "For Elite Vibe Coders"}
                  </p>
                </div>

                <div className="mt-8 flex items-baseline gap-1.5">
                  <span className="text-[56px] font-bold leading-[1.1] tracking-[-0.02em]">
                    ${plan.priceUsdMonthly}
                  </span>
                  <span className="text-lg font-medium leading-[1.4] tracking-[-0.005em] text-black/55">
                    / month
                  </span>
                </div>

                <ul className="mt-8 space-y-2">
                  <li className="flex items-center gap-2 text-lg font-medium leading-[1.4] tracking-[-0.005em]">
                    <CheckIcon />
                    <span>{plan.projectsPerMonth} Project{plan.projectsPerMonth > 1 ? "s" : ""}/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-lg font-medium leading-[1.4] tracking-[-0.005em]">
                    <CheckIcon />
                    <span>
                      {plan.rateLimitTier === "ultra_low"
                        ? "Ultra Low Rate Limiting"
                        : plan.rateLimitTier === "low"
                          ? "Low Rate Limiting"
                          : "High Rate Limiting"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-lg font-medium leading-[1.4] tracking-[-0.005em]">
                    <CheckIcon />
                    <span>{plan.models === "pro" ? "Pro Models" : "Cheaper Models"}</span>
                  </li>
                </ul>

                <div className="mt-auto pt-8">
                  <Link
                    className={`flex h-12 w-full items-center justify-center rounded-xl border-2 px-4 text-lg font-medium leading-[1.45] tracking-[-0.005em] transition ${
                      plan.tier === "BASIC"
                        ? "border-black bg-black text-white hover:bg-black/90"
                        : "border-black/15 text-black hover:bg-black/[0.02]"
                    }`}
                    href="/api/auth/signin?callbackUrl=/projects"
                  >
                    Sign up
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer
          className="px-6 pb-20 sm:px-10 lg:h-[327px] lg:px-12 lg:pb-[112px]"
          id="contact"
        >
          <div className="border-t border-black/10 pt-20">
            <div className="flex min-h-[137px] flex-col justify-between gap-10">
              <div>
                <p className="text-2xl font-semibold leading-[1.45] tracking-[-0.02em]">
                  One Shot Prompts
                </p>
                <p className="mt-1 text-base font-medium leading-[1.45] tracking-[-0.005em] text-black/55">
                  Prompt your way to production
                </p>
              </div>

              <div className="flex items-center gap-6 text-black/45">
                <Link
                  aria-label="LinkedIn"
                  className="transition-opacity hover:opacity-70"
                  href="https://www.linkedin.com/in/daanishhindustani/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <LinkedInIcon />
                </Link>
                <Link
                  aria-label="X"
                  className="transition-opacity hover:opacity-70"
                  href="https://x.com/DanuCodes"
                  rel="noreferrer"
                  target="_blank"
                >
                  <XIcon />
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function AgentLogosIcon() {
  return (
    <div className="flex items-center justify-center gap-5">
      <Image
        alt=""
        className="h-auto w-[58px]"
        src={claudeImage}
      />
      <Image
        alt=""
        className="h-auto w-[58px]"
        src={openAiImage}
      />
      <Image
        alt=""
        className="h-auto w-[58px]"
        src={cursorImage}
      />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6 shrink-0 text-black/55"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m5.5 12 4.1 4.1L18.5 7.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M4.98 3.5a2.24 2.24 0 1 1 0 4.47 2.24 2.24 0 0 1 0-4.47ZM3 8.98h3.96V21H3V8.98Zm6.2 0h3.8v1.64h.06c.53-1 1.83-2.05 3.77-2.05 4.04 0 4.79 2.66 4.79 6.12V21h-3.96v-5.58c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.44-2.13 2.94V21H9.2V8.98Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M18.9 3H22l-6.76 7.73L23.2 21h-6.23l-4.88-6.38L6.5 21H3.4l7.22-8.25L1 3h6.38l4.41 5.82L18.9 3Zm-1.1 16h1.72L6.44 4.9H4.6L17.8 19Z" />
    </svg>
  );
}
