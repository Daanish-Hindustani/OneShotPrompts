import { getOptionalEnv } from "./env";

function normalizeOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getExpectedAppOrigin(): string | null {
  return (
    normalizeOrigin(getOptionalEnv("NEXTAUTH_URL", "")) ??
    normalizeOrigin(getOptionalEnv("NEXT_PUBLIC_APP_URL", ""))
  );
}

export function isTrustedRequestOrigin(headers: Headers): boolean {
  const expectedOrigin = getExpectedAppOrigin();
  if (!expectedOrigin) {
    return true;
  }

  const origin = normalizeOrigin(headers.get("origin"));
  if (origin && origin !== expectedOrigin) {
    return false;
  }

  const referer = headers.get("referer");
  if (!origin && referer) {
    if (!referer.startsWith(expectedOrigin)) {
      return false;
    }
  }

  const fetchSite = headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
    return false;
  }

  return true;
}
