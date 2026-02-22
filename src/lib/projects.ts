export const PROJECT_TITLE_MAX_LENGTH = 80;

export function normalizeProjectTitle(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function validateProjectTitle(input: string): {
  ok: true;
  value: string;
} | {
  ok: false;
  error: string;
} {
  const normalized = normalizeProjectTitle(input);
  if (!normalized) {
    return { ok: false, error: "Project title is required." };
  }

  if (normalized.length > PROJECT_TITLE_MAX_LENGTH) {
    return {
      ok: false,
      error: `Project title must be ${PROJECT_TITLE_MAX_LENGTH} characters or less.`,
    };
  }

  return { ok: true, value: normalized };
}
