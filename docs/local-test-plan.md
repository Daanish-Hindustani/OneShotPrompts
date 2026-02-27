# Local Test Plan

## Prerequisites
1. Ensure `.env.local` contains valid values for auth, database, OpenAI, and Stripe test keys.
2. Apply database changes:
   ```bash
   npm run db:migrate
   npm run db:generate
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Optional full precheck:
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

## Core UI Flows
1. Open `http://localhost:3000` and verify the landing page renders.
2. Sign in with Google and confirm `/projects` loads.
3. Open `/billing` and verify `Free`, `Basic`, and `Pro` plans render.
4. Create a project from `/projects/new` and verify redirect to the project detail page.
5. Rename the project, then delete a throwaway project to confirm CRUD works.

## Chat Flow
1. Open a project detail page.
2. Send a chat message.
3. Verify the assistant response streams into the UI.
4. Refresh the page and confirm the conversation persists.
5. Repeat requests quickly to confirm throttling eventually returns a user-visible error.

## Requirements Flow
1. Click `Generate requirements` after a non-empty chat.
2. Confirm a Markdown draft appears.
3. Edit the draft and click `Save draft`.
4. Click `Looks good (approve)`.
5. Confirm edits are blocked while approved.
6. Click `Reopen editing` and verify editing becomes possible again.

## Plan Flow
1. Approve requirements first.
2. Click `Generate plan`.
3. Confirm a Markdown plan appears.
4. Edit and save the plan.
5. Click `Download .md` and verify the downloaded file matches saved content.

## Billing Flow
1. Click `Choose plan` on `Basic` or `Pro` and verify the app redirects to a Stripe Checkout URL.
2. Click `Open customer portal` and verify it either opens Stripe portal or returns a clear error if no Stripe customer exists.
3. For webhook testing, run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   ```
5. Verify the `subscriptions` table updates with the expected tier and status.

## Security Checks
1. Send a cross-origin POST to a write endpoint and verify `403`.
2. Send an oversized chat payload and verify `413`.
3. Burst the chat endpoint and verify `429`.
4. Try opening a project you do not own and verify access is denied.

## Endpoint Checks
1. `GET /api/health` should return `200` and `{"ok":true}`.
2. `POST /api/projects/:id/messages` should require auth and enforce limits.
3. `POST /api/projects/:id/requirements/generate` should require chat history.
4. `PUT /api/projects/:id/requirements` should reject edits to approved drafts unless reopened.
5. `POST /api/projects/:id/plan/generate` should require approved requirements.
6. `GET /api/projects/:id/plan/download` should return a Markdown attachment.
7. `POST /api/billing/checkout` should return a checkout URL for paid tiers.
8. `POST /api/stripe/webhook` should reject invalid signatures.
