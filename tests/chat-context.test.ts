import { describe, expect, it } from "vitest";

import { selectMessagesForContext } from "../src/lib/chat-context";

describe("chat context selection", () => {
  it("keeps most recent messages under max chars", () => {
    const messages = [
      { role: "system", content: "abcd" },
      { role: "user", content: "efgh" },
      { role: "assistant", content: "ijkl" },
    ] as const;

    const result = selectMessagesForContext([...messages], 8);

    expect(result).toEqual([
      { role: "user", content: "efgh" },
      { role: "assistant", content: "ijkl" },
    ]);
  });

  it("truncates a single oversized latest message", () => {
    const messages = [{ role: "user", content: "abcdefgh" }] as const;

    const result = selectMessagesForContext([...messages], 4);

    expect(result).toEqual([{ role: "user", content: "efgh" }]);
  });
});
