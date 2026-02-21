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
STRIPE_PRICE_BASIC=
STRIPE_PRICE_PRO=
STRIPE_PRICE_TEAM=
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Outline
The initial requirements outline is in `docs/requirements-outline.md`.
