"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({
  className = "inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50",
}: {
  className?: string;
}) {
  return (
    <button
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      Sign out
    </button>
  );
}
