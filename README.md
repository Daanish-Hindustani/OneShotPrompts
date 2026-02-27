# OneShotPrompts
Create one-shot, production-ready plans from a structured chat.

## Quick Start
- Node 20+ recommended

Install dependencies:
```bash
npm install
```

Run the dev server:
```bash
npm run dev
```

## Scripts
```bash
npm run lint
npm run typecheck
npm run test
```

## Environment Variables
Create `.env.local` with the following variables (see `.env.example` for defaults):

```
NEXT_PUBLIC_APP_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_FREE=
STRIPE_PRICE_BASIC=
STRIPE_PRICE_PRO=
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### How to get values
- `NEXT_PUBLIC_APP_URL`: your local dev URL (`http://localhost:3000`) or production URL.
- `NEXTAUTH_URL`: same as your app URL.
- `NEXTAUTH_SECRET`: generate with `openssl rand -base64 32`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
- `DATABASE_URL`: create a Postgres database in [Neon](https://neon.tech/) or [Supabase](https://supabase.com/) and copy the connection string.
- `STRIPE_SECRET_KEY`: from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys).
- `STRIPE_WEBHOOK_SECRET`: create a webhook endpoint in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks) and copy the signing secret.
- `STRIPE_PRICE_FREE`, `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PRO`: create recurring monthly prices in Stripe and copy the price IDs.
- `OPENAI_API_KEY`: from the [OpenAI API keys page](https://platform.openai.com/api-keys).
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: from your [Upstash Redis](https://upstash.com/) database REST credentials.

## Outline
The initial requirements outline is in `docs/requirements-outline.md`.
