import Link from "next/link";

import SignInPageActions from "./sign-in-page-actions";

function getErrorMessage(error: string | undefined) {
  if (!error) {
    return null;
  }

  if (error === "OAuthSignin" || error === "OAuthCallback") {
    return "Google sign-in could not start. Check your OAuth credentials and try again.";
  }

  if (error === "AccessDenied") {
    return "Access was denied by the identity provider.";
  }

  return "Sign-in failed. Try again.";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const callbackUrl = resolvedSearchParams?.callbackUrl || "/projects";
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="landing-hero flex flex-col px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="flex items-center justify-between gap-4">
            <Link
              className="text-3xl font-black uppercase leading-[1.05] tracking-[-0.03em] sm:text-4xl lg:text-5xl"
              href="/"
            >
              One Shot Prompts
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 text-sm font-semibold text-black/70 backdrop-blur-sm transition hover:border-black/20 hover:bg-white hover:text-black"
              href="/"
            >
              Back home
            </Link>
          </div>

          <div className="mx-auto mt-12 flex w-full max-w-[720px] flex-col items-start py-10 lg:mt-20 lg:py-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Production planning
            </p>
            <h1 className="mt-5 max-w-[10ch] text-5xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              Build the blueprint before the code.
            </h1>
            <p className="mt-6 max-w-[56ch] text-lg font-medium leading-[1.5] tracking-[-0.005em] text-black/55 sm:text-xl">
              Sign in to generate requirements, shape architecture, and export a
              production-ready plan your coding agent can actually execute.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-[520px] rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Sign in
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-[1.05] tracking-[-0.02em]">
              Welcome back
            </h2>
            <p className="mt-4 text-base font-medium leading-[1.5] tracking-[-0.005em] text-black/55">
              Use your Google account to continue into your project workspace.
            </p>

            {errorMessage ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-8 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
              <SignInPageActions callbackUrl={callbackUrl} />
              <p className="mt-4 text-center text-sm font-medium leading-[1.45] tracking-[-0.005em] text-black/45">
                Google auth only for V1.
              </p>
            </div>

            <p className="mt-6 text-center text-sm font-medium leading-[1.45] tracking-[-0.005em] text-black/45">
              By continuing, you agree to use One Shot Prompts with your active
              Google account.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
