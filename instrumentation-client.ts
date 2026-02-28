import * as Sentry from "@sentry/nextjs";

import { getSentryBaseConfig } from "@/lib/sentry";

const config = getSentryBaseConfig();

if (config) {
  Sentry.init(config);
}
