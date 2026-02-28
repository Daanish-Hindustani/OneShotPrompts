type SentryBaseConfig = {
  dsn: string;
  enabled: true;
  environment: string;
  tracesSampleRate: 0;
  sendDefaultPii: false;
};

export function getSentryDsn(): string | null {
  const value = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return value ? value : null;
}

export function isSentryEnabled(): boolean {
  return getSentryDsn() !== null;
}

export function getSentryEnvironment(): string {
  const configured = process.env.SENTRY_ENVIRONMENT?.trim();
  return configured || process.env.NODE_ENV || "development";
}

export function getSentryBaseConfig(): SentryBaseConfig | null {
  const dsn = getSentryDsn();
  if (!dsn) {
    return null;
  }

  return {
    dsn,
    enabled: true,
    environment: getSentryEnvironment(),
    tracesSampleRate: 0,
    sendDefaultPii: false,
  };
}
