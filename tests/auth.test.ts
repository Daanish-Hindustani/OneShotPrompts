import { describe, expect, it, vi } from "vitest";

describe("authOptions", () => {
  it("builds when Google env vars are present", async () => {
    vi.resetModules();
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

    const { authOptions } = await import("../src/lib/auth");

    expect(authOptions.providers).toHaveLength(1);
  });
});
