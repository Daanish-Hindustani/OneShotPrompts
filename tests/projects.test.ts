import { describe, expect, it } from "vitest";
import {
  PROJECT_TITLE_MAX_LENGTH,
  normalizeProjectTitle,
  validateProjectTitle,
} from "../src/lib/projects";

describe("project title helpers", () => {
  it("normalizes whitespace", () => {
    expect(normalizeProjectTitle("  Hello   World  ")).toBe("Hello World");
  });

  it("rejects empty titles", () => {
    expect(validateProjectTitle("   ")).toEqual({
      ok: false,
      error: "Project title is required.",
    });
  });

  it("rejects overly long titles", () => {
    const longTitle = "a".repeat(PROJECT_TITLE_MAX_LENGTH + 1);
    expect(validateProjectTitle(longTitle)).toEqual({
      ok: false,
      error: `Project title must be ${PROJECT_TITLE_MAX_LENGTH} characters or less.`,
    });
  });

  it("accepts valid titles", () => {
    expect(validateProjectTitle("  New App  ")).toEqual({
      ok: true,
      value: "New App",
    });
  });
});
