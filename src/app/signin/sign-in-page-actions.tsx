"use client";

import { signIn } from "next-auth/react";

export default function SignInPageActions({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  return (
    <button
      className="flex h-14 w-full items-center justify-center rounded-xl bg-black px-5 text-lg font-semibold leading-[1.45] tracking-[-0.005em] text-white transition hover:bg-black/90"
      onClick={() => signIn("google", { callbackUrl })}
      type="button"
    >
      Continue with Google
    </button>
  );
}
