import { describe, expect, it } from "vitest";
import { getOptionalEnv, getRequiredEnv } from "../src/lib/env";

describe("env helpers", () => {
  it("returns required values", () => {
    process.env.REQUIRED_TEST = "ok";
    expect(getRequiredEnv("REQUIRED_TEST")).toBe("ok");
  });

  it("throws when required value missing", () => {
    delete process.env.MISSING_TEST;
    expect(() => getRequiredEnv("MISSING_TEST")).toThrow(
      "Missing required env var: MISSING_TEST"
    );
  });

  it("returns fallback for optional values", () => {
    delete process.env.OPTIONAL_TEST;
    expect(getOptionalEnv("OPTIONAL_TEST", "fallback")).toBe("fallback");
  });
});
