export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-20">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            OneShotPrompts
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Turn a messy idea into a production-ready plan.
          </h1>
          <p className="text-lg text-slate-600">
            Chat with a focused agent, approve your requirements, and export a
            single Markdown plan your coding agent can execute end-to-end.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm text-slate-600">
            Task 1 scaffold is in place. Next up: Google auth, billing gates,
            and the chat flow.
          </p>
        </div>
      </div>
    </main>
  );
}
