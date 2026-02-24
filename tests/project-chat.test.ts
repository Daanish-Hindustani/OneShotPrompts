import { describe, expect, it } from "vitest";
import {
  rollbackOptimisticMessages,
  type ChatMessage,
} from "../src/app/projects/[projectId]/project-chat";

describe("rollbackOptimisticMessages", () => {
  it("removes both optimistic user and assistant messages", () => {
    const persisted: ChatMessage = {
      id: "persisted-1",
      role: "ASSISTANT",
      content: "Saved reply",
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    const result = rollbackOptimisticMessages(
      [
        persisted,
        {
          id: "user-temp",
          role: "USER",
          content: "Draft message",
          createdAt: "2026-01-01T00:00:01.000Z",
        },
        {
          id: "assistant-temp",
          role: "ASSISTANT",
          content: "",
          createdAt: "2026-01-01T00:00:02.000Z",
        },
      ],
      "user-temp",
      "assistant-temp"
    );

    expect(result).toEqual([persisted]);
  });
});
