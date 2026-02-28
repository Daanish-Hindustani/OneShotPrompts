"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

type AuthButtonsProps = {
  variant?: "default" | "nav";
};

export default function AuthButtons({ variant = "default" }: AuthButtonsProps) {
  const { data: session, status } = useSession();
  const isNav = variant === "nav";

  if (status === "loading") {
    return <div className="text-sm text-slate-500">Checking session...</div>;
  }

  if (session?.user) {
    if (isNav) {
      return (
        <div className="flex flex-wrap items-center gap-5">
          <Link
            className="transition-opacity hover:opacity-60"
            href="/projects"
          >
            Projects
          </Link>
          <button
            className="transition-opacity hover:opacity-60"
            onClick={() => signOut({ callbackUrl: "/" })}
            type="button"
          >
            Sign out
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-600">
          Signed in as {session.user.email ?? session.user.name ?? "user"}.
        </span>
        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          onClick={() => signOut({ callbackUrl: "/" })}
          type="button"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (isNav) {
    return (
      <button
        className="text-sm font-medium text-slate-900 transition-opacity hover:opacity-60"
        onClick={() => signIn("google", { callbackUrl: "/projects" })}
        type="button"
      >
        Sign In
      </button>
    );
  }

  return (
    <button
      className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      onClick={() => signIn("google", { callbackUrl: "/projects" })}
      type="button"
    >
      Sign in with Google
    </button>
  );
}
