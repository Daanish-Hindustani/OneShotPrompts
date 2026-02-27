"use client";

import { useMemo, useState } from "react";

type RequirementDraft = {
  id: string;
  contentMd: string;
  versionInt: number;
  approvedAt: string | null;
};

export default function ProjectRequirements({
  projectId,
  initialRequirement,
}: {
  projectId: string;
  initialRequirement: RequirementDraft | null;
}) {
  const [requirement, setRequirement] = useState<RequirementDraft | null>(initialRequirement);
  const [content, setContent] = useState(initialRequirement?.contentMd ?? "");
  const [loading, setLoading] = useState<"generate" | "save" | "approve" | "reopen" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isApproved = useMemo(() => Boolean(requirement?.approvedAt), [requirement]);

  async function generate() {
    setLoading("generate");
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/requirements/generate`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.requirement) {
        setError(payload?.error ?? "Unable to generate requirements.");
        return;
      }

      const next = payload.requirement as RequirementDraft;
      setRequirement(next);
      setContent(next.contentMd);
    } catch {
      setError("Unable to generate requirements.");
    } finally {
      setLoading(null);
    }
  }

  async function save(reopen = false) {
    setLoading(reopen ? "reopen" : "save");
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/requirements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentMd: content, reopen }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.requirement) {
        setError(payload?.error ?? "Unable to save requirements.");
        return;
      }

      const next = payload.requirement as RequirementDraft;
      setRequirement(next);
      setContent(next.contentMd);
    } catch {
      setError("Unable to save requirements.");
    } finally {
      setLoading(null);
    }
  }

  async function approve() {
    setLoading("approve");
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/requirements/approve`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.requirement) {
        setError(payload?.error ?? "Unable to approve requirements.");
        return;
      }

      const next = payload.requirement as RequirementDraft;
      setRequirement(next);
      setContent(next.contentMd);
    } catch {
      setError("Unable to approve requirements.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Requirements</h2>
          <p className="text-xs text-slate-500">
            Generate, edit, and approve project requirements before planning.
          </p>
        </div>
        {requirement ? (
          <span className="text-xs text-slate-500">
            v{requirement.versionInt} {isApproved ? "(approved)" : "(draft)"}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={16}
          placeholder="No requirements yet. Generate from chat or write manually."
          disabled={loading !== null || isApproved}
          className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generate}
            disabled={loading !== null}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "generate" ? "Generating..." : "Generate requirements"}
          </button>

          <button
            type="button"
            onClick={() => save(false)}
            disabled={loading !== null || isApproved}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "save" ? "Saving..." : "Save draft"}
          </button>

          <button
            type="button"
            onClick={approve}
            disabled={loading !== null || isApproved || !requirement}
            className="rounded-md border border-emerald-300 px-3 py-2 text-sm text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "approve" ? "Approving..." : "Looks good (approve)"}
          </button>

          <button
            type="button"
            onClick={() => save(true)}
            disabled={loading !== null || !isApproved}
            className="rounded-md border border-amber-300 px-3 py-2 text-sm text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "reopen" ? "Reopening..." : "Reopen editing"}
          </button>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </section>
  );
}
