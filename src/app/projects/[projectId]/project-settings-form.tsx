"use client";

import { useFormState, useFormStatus } from "react-dom";

import type { DeleteProjectState, UpdateProjectState } from "./actions";
import { deleteProjectAction, updateProjectTitleAction } from "./actions";
import { PROJECT_TITLE_MAX_LENGTH } from "@/lib/projects";

const initialUpdateState: UpdateProjectState = {};
const initialDeleteState: DeleteProjectState = {};

function UpdateButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete project"}
    </button>
  );
}

export default function ProjectSettingsForm({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  const [updateState, updateAction] = useFormState(
    updateProjectTitleAction,
    initialUpdateState
  );
  const [deleteState, deleteAction] = useFormState(
    deleteProjectAction,
    initialDeleteState
  );

  return (
    <div className="flex flex-col gap-8">
      <form action={updateAction} className="flex flex-col gap-4">
        <input type="hidden" name="projectId" value={projectId} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="title">
            Project title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={PROJECT_TITLE_MAX_LENGTH}
            defaultValue={title}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            required
          />
        </div>
        {updateState.error ? (
          <p className="text-sm text-rose-600" role="status">
            {updateState.error}
          </p>
        ) : null}
        <UpdateButton />
      </form>

      <form action={deleteAction} className="flex flex-col gap-2">
        <input type="hidden" name="projectId" value={projectId} />
        {deleteState.error ? (
          <p className="text-sm text-rose-600" role="status">
            {deleteState.error}
          </p>
        ) : null}
        <DeleteButton />
        <p className="text-xs text-slate-500">
          Deleting a project removes its chat history and drafts.
        </p>
      </form>
    </div>
  );
}
