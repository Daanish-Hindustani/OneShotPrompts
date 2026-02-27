import type { OpenAIChatMessage } from "@/lib/openai";

export function selectMessagesForContext(
  messages: OpenAIChatMessage[],
  maxChars: number
): OpenAIChatMessage[] {
  if (maxChars <= 0) return [];

  const selected: OpenAIChatMessage[] = [];
  let used = 0;

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    const size = message.content.length;
    if (size > maxChars) {
      if (selected.length === 0) {
        selected.unshift({
          ...message,
          content: message.content.slice(-maxChars),
        });
      }
      break;
    }

    if (used + size > maxChars) {
      break;
    }

    selected.unshift(message);
    used += size;
  }

  return selected;
}
