import { afterEach, describe, expect, it } from "vitest";

import {
  getSentryBaseConfig,
  getSentryDsn,
  getSentryEnvironment,
  isSentryEnabled,
} from "../src/lib/sentry";

const env = process.env as Record<string, string | undefined>;
const originalDsn = env.NEXT_PUBLIC_SENTRY_DSN;
const originalNodeEnv = env.NODE_ENV;
const originalEnvironment = env.SENTRY_ENVIRONMENT;

afterEach(() => {
  if (originalDsn === undefined) {
    delete env.NEXT_PUBLIC_SENTRY_DSN;
  } else {
    env.NEXT_PUBLIC_SENTRY_DSN = originalDsn;
  }

  if (originalNodeEnv === undefined) {
    delete env.NODE_ENV;
  } else {
    env.NODE_ENV = originalNodeEnv;
  }

  if (originalEnvironment === undefined) {
    delete env.SENTRY_ENVIRONMENT;
  } else {
    env.SENTRY_ENVIRONMENT = originalEnvironment;
  }
});

describe("sentry config helpers", () => {
  it("stays disabled when no DSN is configured", () => {
    delete env.NEXT_PUBLIC_SENTRY_DSN;

    expect(getSentryDsn()).toBeNull();
    expect(isSentryEnabled()).toBe(false);
    expect(getSentryBaseConfig()).toBeNull();
  });

  it("uses trimmed DSN values and defaults environment to node env", () => {
    env.NEXT_PUBLIC_SENTRY_DSN = "  https://examplePublicKey@o0.ingest.sentry.io/0  ";
    env.NODE_ENV = "production";
    delete env.SENTRY_ENVIRONMENT;

    expect(getSentryDsn()).toBe("https://examplePublicKey@o0.ingest.sentry.io/0");
    expect(isSentryEnabled()).toBe(true);
    expect(getSentryEnvironment()).toBe("production");
    expect(getSentryBaseConfig()).toEqual({
      dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
      enabled: true,
      environment: "production",
      tracesSampleRate: 0,
      sendDefaultPii: false,
    });
  });

  it("prefers explicit SENTRY_ENVIRONMENT", () => {
    env.NEXT_PUBLIC_SENTRY_DSN = "https://examplePublicKey@o0.ingest.sentry.io/0";
    env.NODE_ENV = "production";
    env.SENTRY_ENVIRONMENT = "staging";

    expect(getSentryEnvironment()).toBe("staging");
  });
});
