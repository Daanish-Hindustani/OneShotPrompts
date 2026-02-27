export const MESSAGE_MAX_LENGTH = 4000;

export type MessageValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function normalizeMessageContent(input: string): string {
  return input.trim();
}

export function validateMessageContent(input: string): MessageValidationResult {
  const normalized = normalizeMessageContent(input);
  if (!normalized) {
    return { ok: false, error: "Message is required." };
  }

  if (normalized.length > MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      error: `Message must be ${MESSAGE_MAX_LENGTH} characters or less.`,
    };
  }

  return { ok: true, value: normalized };
}
