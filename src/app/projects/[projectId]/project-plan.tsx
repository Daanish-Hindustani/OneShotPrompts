"use client";

import { useState } from "react";

type ProjectPlan = {
  id: string;
  contentMd: string;
};

export default function ProjectPlanEditor({
  projectId,
  initialPlan,
}: {
  projectId: string;
  initialPlan: ProjectPlan | null;
}) {
  const [plan, setPlan] = useState<ProjectPlan | null>(initialPlan);
  const [content, setContent] = useState(initialPlan?.contentMd ?? "");
  const [loading, setLoading] = useState<"generate" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading("generate");
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/plan/generate`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.plan) {
        setError(payload?.error ?? "Unable to generate plan.");
        return;
      }
      const next = payload.plan as ProjectPlan;
      setPlan(next);
      setContent(next.contentMd);
    } catch {
      setError("Unable to generate plan.");
    } finally {
      setLoading(null);
    }
  }

  async function save() {
    setLoading("save");
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentMd: content }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.plan) {
        setError(payload?.error ?? "Unable to save plan.");
        return;
      }
      const next = payload.plan as ProjectPlan;
      setPlan(next);
      setContent(next.contentMd);
    } catch {
      setError("Unable to save plan.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Implementation Plan</h2>
        <p className="text-xs text-slate-500">
          Generate from approved requirements, edit, and download markdown.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={18}
          placeholder="No plan yet. Generate one from approved requirements."
          disabled={loading !== null}
          className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generate}
            disabled={loading !== null}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "generate" ? "Generating..." : "Generate plan"}
          </button>

          <button
            type="button"
            onClick={save}
            disabled={loading !== null || !content.trim()}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "save" ? "Saving..." : "Save plan"}
          </button>

          <a
            href={`/api/projects/${projectId}/plan/download`}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
          >
            Download .md
          </a>
        </div>

        {!plan ? (
          <p className="text-xs text-slate-500">
            Plan generation requires approved requirements.
          </p>
        ) : null}

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </section>
  );
}
