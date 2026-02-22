"use client";

import { useFormState, useFormStatus } from "react-dom";

import type { CreateProjectState } from "./actions";
import { createProjectAction } from "./actions";
import { PROJECT_TITLE_MAX_LENGTH } from "@/lib/projects";

const initialState: CreateProjectState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create project"}
    </button>
  );
}

export default function CreateProjectForm() {
  const [state, formAction] = useFormState(createProjectAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="title">
          Project title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={PROJECT_TITLE_MAX_LENGTH}
          placeholder="OneShot Prompts MVP"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          required
        />
      </div>
      {state.error ? (
        <p className="text-sm text-rose-600" role="status">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
