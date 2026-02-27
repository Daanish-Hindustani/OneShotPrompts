import { getRequiredEnv } from "@/lib/env";
import { postOpenAIChatCompletions, type OpenAIChatMessage } from "@/lib/openai";

const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_TIMEOUT_MS = 45_000;

export async function generateMarkdownFromMessages(input: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<{ ok: true; content: string } | { ok: false; error: string }> {
  const apiKey = (() => {
    try {
      return getRequiredEnv("OPENAI_API_KEY");
    } catch {
      return null;
    }
  })();

  if (!apiKey) {
    return { ok: false, error: "OpenAI API key is not configured." };
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), OPENAI_TIMEOUT_MS);

  const messages: OpenAIChatMessage[] = [
    { role: "system", content: input.systemPrompt },
    { role: "user", content: input.userPrompt },
  ];

  const result = await postOpenAIChatCompletions({
    apiKey,
    model: OPENAI_MODEL,
    messages,
    temperature: 0.2,
    stream: false,
    signal: abortController.signal,
  });

  clearTimeout(timeout);

  if (!result.ok) {
    return { ok: false, error: "OpenAI request failed." };
  }

  if (!result.response.ok) {
    return { ok: false, error: "OpenAI request failed." };
  }

  try {
    const json = (await result.response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      return { ok: false, error: "Model returned an empty response." };
    }

    return { ok: true, content };
  } catch {
    return { ok: false, error: "Invalid model response." };
  }
}
