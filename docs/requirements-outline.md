# OneShotPrompts Requirements Outline (V1)

## Goal
Build a paid, Google-authenticated web app that turns a chat-based requirements session into an editable requirements summary and a downloadable, editable Markdown implementation plan.

## Core Flows
- New Project: user signs in, creates a project, chats with the agent, reviews and edits a requirements summary, approves it, then generates and edits a Markdown plan and downloads it.
- Quota Enforcement: project creation and generation endpoints are blocked when the user exceeds their monthly project limit.
- Billing: Stripe subscriptions (Basic/Pro/Team) gate access to all core features.

## Functional Requirements
- Google OAuth sign-in with authenticated sessions
- Project CRUD with per-project chat history (persisted)
- Requirements summary generation, editable draft, approval state
- Plan generation from approved requirements, editable, downloadable as `.md`
- Stripe subscriptions + webhook updates
- Server-side enforcement of entitlements and quotas
- Rate limiting and message size caps

## Non-Functional Requirements
- Secure-by-default: authz checks, safe rendering, and no secrets in logs
- Fast UX with streaming chat responses
- Auditability: store generated artifacts and prompts per project

## Data Model (Minimum)
- users, projects, messages, requirements, plans, subscriptions, usage_meters

## Tech Stack (Default)
- Next.js (App Router), TypeScript, Tailwind
- NextAuth (Google)
- Postgres + Prisma
- Stripe Checkout + Webhooks
- Upstash Redis (rate limits)
- Vercel hosting
