import { afterEach, describe, expect, it, vi } from "vitest";

import { postOpenAIChatCompletions } from "../src/lib/openai";

describe("postOpenAIChatCompletions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns transport error when fetch throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network down"));

    const result = await postOpenAIChatCompletions({
      apiKey: "test-key",
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "hello" }],
      temperature: 0.3,
      stream: true,
    });

    expect(result).toEqual({ ok: false, error: "transport" });
  });

  it("returns response when fetch succeeds", async () => {
    const response = new Response("ok", { status: 200 });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response);

    const result = await postOpenAIChatCompletions({
      apiKey: "test-key",
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "hello" }],
      temperature: 0.3,
      stream: true,
    });

    expect(result).toEqual({ ok: true, response });
  });
});
