import { describe, expect, it } from "vitest";
import {
  MESSAGE_MAX_LENGTH,
  normalizeMessageContent,
  validateMessageContent,
} from "../src/lib/messages";

describe("message validation", () => {
  it("trims whitespace", () => {
    expect(normalizeMessageContent("  hello  ")).toBe("hello");
  });

  it("rejects empty messages", () => {
    expect(validateMessageContent("   ")).toEqual({
      ok: false,
      error: "Message is required.",
    });
  });

  it("rejects messages over max length", () => {
    const longMessage = "a".repeat(MESSAGE_MAX_LENGTH + 1);
    expect(validateMessageContent(longMessage)).toEqual({
      ok: false,
      error: `Message must be ${MESSAGE_MAX_LENGTH} characters or less.`,
    });
  });

  it("accepts valid messages", () => {
    expect(validateMessageContent("Build a SaaS app")).toEqual({
      ok: true,
      value: "Build a SaaS app",
    });
  });
});
