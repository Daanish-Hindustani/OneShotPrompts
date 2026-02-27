export type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAIChatCompletionResult =
  | { ok: true; response: Response }
  | { ok: false; error: "transport" };

export async function postOpenAIChatCompletions({
  apiKey,
  model,
  messages,
  temperature,
  stream,
  signal,
}: {
  apiKey: string;
  model: string;
  messages: OpenAIChatMessage[];
  temperature: number;
  stream: boolean;
  signal?: AbortSignal;
}): Promise<OpenAIChatCompletionResult> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream,
      }),
      signal,
    });

    return { ok: true, response };
  } catch (error) {
    console.error("chat: openai transport error", error);
    return { ok: false, error: "transport" };
  }
}
