"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInModalTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="transition-opacity hover:opacity-60"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Sign In
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-6 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <div
            aria-modal="true"
            className="landing-hero w-full max-w-[520px] rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
                  One Shot Prompts
                </p>
                <h2 className="mt-3 text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-black">
                  Sign in to keep building.
                </h2>
                <p className="mt-4 text-base font-medium leading-[1.5] tracking-[-0.005em] text-black/55">
                  Start a project, generate your blueprint, and export a production-ready plan.
                </p>
              </div>
              <button
                aria-label="Close sign in dialog"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-xl leading-none text-black/60 transition hover:bg-white/60 hover:text-black"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-black/10 bg-white/80 p-5 backdrop-blur-sm">
              <button
                className="flex h-14 w-full items-center justify-center rounded-xl bg-black px-5 text-lg font-semibold leading-[1.45] tracking-[-0.005em] text-white transition hover:bg-black/90"
                onClick={() => signIn("google", { callbackUrl: "/projects" })}
                type="button"
              >
                Continue with Google
              </button>
              <p className="mt-4 text-center text-sm font-medium leading-[1.45] tracking-[-0.005em] text-black/45">
                Google auth only for V1.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
