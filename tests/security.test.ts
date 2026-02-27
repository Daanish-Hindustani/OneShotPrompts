import { afterEach, describe, expect, it } from "vitest";

import { getExpectedAppOrigin, isTrustedRequestOrigin } from "../src/lib/security";

describe("security origin checks", () => {
  const prevNextAuth = process.env.NEXTAUTH_URL;
  const prevPublicUrl = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    process.env.NEXTAUTH_URL = prevNextAuth;
    process.env.NEXT_PUBLIC_APP_URL = prevPublicUrl;
  });

  it("uses NEXTAUTH_URL as expected origin", () => {
    process.env.NEXTAUTH_URL = "https://app.example.com";
    process.env.NEXT_PUBLIC_APP_URL = "https://fallback.example.com";

    expect(getExpectedAppOrigin()).toBe("https://app.example.com");
  });

  it("allows same-origin requests", () => {
    process.env.NEXTAUTH_URL = "https://app.example.com";

    const headers = new Headers({
      origin: "https://app.example.com",
      "sec-fetch-site": "same-origin",
    });

    expect(isTrustedRequestOrigin(headers)).toBe(true);
  });

  it("rejects cross-origin requests", () => {
    process.env.NEXTAUTH_URL = "https://app.example.com";

    const headers = new Headers({
      origin: "https://evil.example.com",
      "sec-fetch-site": "cross-site",
    });

    expect(isTrustedRequestOrigin(headers)).toBe(false);
  });

  it("rejects bad referer when origin is missing", () => {
    process.env.NEXTAUTH_URL = "https://app.example.com";

    const headers = new Headers({
      referer: "https://evil.example.com/path",
    });

    expect(isTrustedRequestOrigin(headers)).toBe(false);
  });
});
