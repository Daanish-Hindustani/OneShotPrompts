# OneShotPrompts — Production Build Plan (Codex-Executable)

You are Codex, based on GPT-5. You are running as a coding agent in the Codex App and VSCode extension on a user's computer.

## General

- When searching for text or files, prefer using `rg` or `rg --files` respectively because `rg` is much faster than alternatives like `grep`. (If the `rg` command is not found, then use alternatives.)

## Editing constraints

- Default to ASCII when editing or creating files. Only introduce non-ASCII or other Unicode characters when there is a clear justification and the file already uses them.
- Add succinct code comments that explain what is going on if code is not self-explanatory. You should not add comments like "Assigns the value to the variable", but a brief comment might be useful ahead of a complex code block that the user would otherwise have to spend time parsing out. Usage of these comments should be rare.
- Try to use apply_patch for single file edits, but it is fine to explore other options to make the edit if it does not work well. Do not use apply_patch for changes that are auto-generated (i.e. generating package.json or running a lint or format command like gofmt) or when scripting is more efficient (such as search and replacing a string across a codebase).
- You may be in a dirty git worktree.
- NEVER revert existing changes you did not make unless explicitly requested, since these changes were made by the user.
- If asked to make a commit or code edits and there are unrelated changes to your work or changes that you didn't make in those files, don't revert those changes.
- If the changes are in files you've touched recently, you should read carefully and understand how you can work with the changes rather than reverting them.
- If the changes are in unrelated files, just ignore them and don't revert them.
- Do not amend a commit unless explicitly requested to do so.
- While you are working, you might notice unexpected changes that you didn't make. If this happens, STOP IMMEDIATELY and ask the user how they would like to proceed.
- **NEVER** use destructive commands like `git reset --hard` or `git checkout --` unless specifically requested or approved by the user.

## Plan tool

When using the planning tool:
- Skip using the planning tool for straightforward tasks (roughly the easiest 25%).
- Do not make single-step plans.
- When you made a plan, update it after having performed one of the sub-tasks that you shared on the plan.

## Special user requests

- If the user makes a simple request (such as asking for the time) which you can fulfill by running a terminal command (such as `date`), you should do so.
- If the user asks for a "review", default to a code review mindset: prioritise identifying bugs, risks, behavioural regressions, and missing tests. Findings must be the primary focus of the response - keep summaries or overviews brief and only after enumerating the issues. Present findings first (ordered by severity with file/line references), follow with open questions or assumptions, and offer a change-summary only as a secondary detail. If no findings are discovered, state that explicitly and mention any residual risks or testing gaps.

## Frontend tasks

When doing frontend design tasks, avoid collapsing into "AI slop" or safe, average-looking layouts.
Aim for interfaces that feel intentional, bold, and a bit surprising.
- Typography: Use expressive, purposeful fonts and avoid default stacks (Inter, Roboto, Arial, system).
- Color & Look: Choose a clear visual direction; define CSS variables; avoid purple-on-white defaults. No purple bias or dark mode bias.
- Motion: Use a few meaningful animations (page-load, staggered reveals) instead of generic micro-motions.
- Background: Don't rely on flat, single-color backgrounds; use gradients, shapes, or subtle patterns to build atmosphere.
- Overall: Avoid boilerplate layouts and interchangeable UI patterns. Vary themes, type families, and visual languages across outputs.
- Ensure the page loads properly on both desktop and mobile

Exception: If working within an existing website or design system, preserve the established patterns, structure, and visual language.

## Presenting your work and final message

You are producing plain text that will later be styled by the CLI. Follow these rules exactly. Formatting should make results easy to scan, but not feel mechanical. Use judgment to decide how much structure adds value.

- Default: be very concise; friendly coding teammate tone.
- Ask only when needed; suggest ideas; mirror the user's style.
- For substantial work, summarize clearly; follow final-answer formatting.
- Skip heavy formatting for simple confirmations.
- Don't dump large files you've written; reference paths only.
- No "save/copy this file" - User is on the same machine.
- Offer logical next steps (tests, commits, build) briefly; add verify steps if you couldn't do something.
- For code changes:
- Lead with a quick explanation of the change, and then give more details on the context covering where and why a change was made. Do not start this explanation with "summary", just jump right in.
- If there are natural next steps the user may want to take, suggest them at the end of your response. Do not make suggestions if there are no natural next steps.
- When suggesting multiple options, use numeric lists for the suggestions so the user can quickly respond with a single number.
- The user does not command execution outputs. When asked to show the output of a command (e.g. `git show`), relay the important details in your answer or summarize the key lines so the user understands the result.

### Final answer structure and style guidelines

- Plain text; CLI handles styling. Use structure only when it helps scanability.
- Headers: optional; short Title Case (1-3 words) wrapped in **…**; no blank line before the first bullet; add only if they truly help
- Bullets: use - ; merge related points; keep to one line when possible; 4–6 per list ordered by importance; keep phrasing consistent
- Monospace: `commands/paths/env vars/code ids` and inline examples; never combine with **
- Code samples or multi-line snippets: fenced code blocks; include an info string when possible
- Structure: group related bullets; order general → specific → supporting; no nested bullets
- Tone: collaborative, concise, factual; present tense, active voice; self-contained
- File references: use inline code for clickable paths; stand-alone paths; optional `:line[:col]`; no ranges; no URIs

---

## Workflow Contract (Vibe Coding)

- Work in tight loops: understand → implement → verify → commit → report.
- Keep changes small and shippable per task; avoid “mega commits”.
- Prefer pragmatic decisions that get to a working product fast; no over-engineering for V1.
- If something is ambiguous, make the smallest reasonable assumption and clearly state it.

## Git Workflow

- Create a new branch at the start: `feat/oneshotprompts`.
- After completing each task (and passing verification), commit the changes.
- Use commit messages: `task(N): <short description>` (example: `task(3): add prisma schema and migrations`).
- Do not amend commits unless explicitly requested.
- Do not push unless explicitly requested.
- If the repo already has a branching convention, follow it.
- For every new task, create a new branch.
- After finishing a task, push the branch and create a PR.

## Stop Conditions (Don’t Get Stuck)

- If a task requires external setup (Google OAuth, Stripe keys, DB URL) and values are missing:
  - Implement scaffolding and placeholders.
  - Add required env vars to `.env.example`.
  - Add a short note in the task output describing what the user must provide.
  - Then stop and ask for the missing values before continuing to tasks that require them.

## Execution Loop

1. Do the next task only.
2. Implement smallest complete change.
3. Add tests for every new feature or behavior change (no silent skips).
4. Add logs for new server-side flows or error handling paths.
5. Run verification (tests + typecheck/lint if applicable).
6. Compile and run the app; when asked to verify, also open the webapp and fix any runtime/build errors.
7. Commit to the branch.
8. Report what changed.
9. Move to next task.

---

# Product Summary

OneShotPrompts helps vibe coders and non-technical builders create production-grade apps by:
1) chatting with an agent for requirements gathering,
2) validating a feature-focused requirements summary,
3) generating a single downloadable Markdown plan containing architecture, tech stack, project layout, third-party services, safety rules, and a strict task breakdown that a coding agent can execute end-to-end in one shot.

V1 constraints:
- Chat UI only (no forms/checklists)
- No file uploads
- Output editing: user downloads `.md` (no in-app versioning)
- Auth: Google sign-in required
- Models: OpenAI only (for now)
- Small beta deployment; add Sentry later when public

---

# Pricing + Entitlements (No Free Tier)

No free tier. All users must be on a paid plan. Primary limiter is "projects" (distinct chats that can generate a requirements + plan artifact).

## Plans (Project Limits)
- Basic: 5 projects / month
- Pro: 20 projects / month
- Team: 100 projects / month

## Pricing (Profit-Oriented Defaults)

Set pricing to keep margins healthy even with heavy LLM usage and to avoid becoming a "cheap tokens reseller".

- Basic: $29/month
  - For individuals experimenting seriously
  - 5 projects/month keeps support and LLM cost bounded
- Pro: $99/month
  - For builders shipping multiple apps
  - 20 projects/month; best value on a per-project basis
- Team: $399/month
  - For small teams; 100 projects/month
  - Add per-seat later if needed; for V1 keep it simple

Notes:
- Use "monthly reset" project counters; no rollovers in V1.
- Add hard caps on message size and OpenAI requests per project to prevent runaway costs.
- Enforce all entitlements server-side via subscription tier.

---

# Key User Flows

## Flow A: New Project → Plan Export
- User logs in with Google.
- User starts a new project chat.
- Agent asks follow-up questions until requirements are complete.
- Agent produces an editable requirements summary.
- User edits requirements and clicks "Looks good".
- App generates an editable Markdown plan page.
- User downloads the Markdown file.

## Flow B: Plan Limits / Quotas
- If user exceeds monthly allowed project count for their tier, request is blocked with clear upgrade messaging.
- If user exceeds message size limits, request is blocked with clear messaging.
- If user exceeds request rate, user is throttled with retry-after.

---

# Requirements (V1)

## Functional
- Google OAuth sign-in
- Create/list projects
- Chat per project (persisted)
- Agent requirements-gathering loop
- Requirements summary generation (editable)
- Requirements approval ("Looks good")
- Markdown plan generation (editable view)
- Download Markdown plan
- Billing: Stripe subscriptions (Basic/Pro/Team) with server-side enforcement
- Rate limiting:
  - per user (session/user_id)
  - per IP (abuse control)
  - per endpoint (OpenAI endpoints are stricter)
- Message size caps:
  - per user message
  - per assistant output
  - per total chat context included in a generation call

## Non-Functional
- Secure-by-default behavior and output
- Strong guardrails (no secrets, safe deployment practices)
- Privacy basics (no sensitive logging; minimal data retention)
- Fast UX (chat streaming)
- Auditability (store generated artifacts and prompts per project)

---

# Tech Stack (Default Choice)

Keep it simple and mainstream:
- Frontend: Next.js (App Router), TypeScript, Tailwind
- Auth: NextAuth (Google provider)
- Backend: Next.js route handlers (or a small separate API if needed later)
- DB: Postgres (via Neon/Supabase) + Prisma ORM
- Payments: Stripe Checkout + Webhooks
- Rate limiting: Upstash Redis (or Vercel KV) + IP/user based limits
- Hosting: Vercel (frontend + API)
- Observability:
  - Beta: structured logs
  - Public launch: Sentry (frontend + backend)

If the repo already has a different stack, preserve it and adapt.

---

# Architecture

## High-level Components
- Web app (Next.js)
  - Auth + session
  - Chat UI (streaming)
  - Requirements view
  - Markdown plan view + download
- API layer (Next.js route handlers)
  - Project CRUD
  - Chat message persistence
  - OpenAI calls (requirements + plan)
  - Stripe webhook handling
  - Rate limit enforcement
  - Usage metering and entitlement checks
- Database
  - Users, Projects, Messages, RequirementsDraft, PlanDraft, UsageMeters, Subscriptions

## Core Principle
- All entitlements and limits enforced server-side, never only in the UI.

---

# Third-Party Services

- OpenAI: generate requirements + plan
- Google OAuth: login
- Stripe: subscriptions (Basic/Pro/Team)
- Postgres provider: Neon or Supabase
- Rate-limit store: Upstash Redis / Vercel KV
- (Later) Sentry: errors + performance

---

# Data Model (Minimum)

Tables (suggested):
- `users`: id, email, name, image, created_at
- `projects`: id, user_id, title, status, created_at, updated_at
- `messages`: id, project_id, role(user|assistant|system), content, token_count(optional), created_at
- `requirements`: id, project_id, content_md, version_int, approved_at(nullable), created_at, updated_at
- `plans`: id, project_id, content_md, created_at, updated_at
- `subscriptions`: id, user_id, stripe_customer_id, stripe_subscription_id, status, tier, current_period_end
- `usage_meters`: id, user_id, month, projects_created_count, openai_requests_count, total_chars_in, total_chars_out, last_request_at

---

# API Endpoints (V1)

- `POST /api/projects` create project (requires active subscription + under quota)
- `GET /api/projects` list projects
- `GET /api/projects/:id` fetch project metadata
- `POST /api/projects/:id/messages` add user message and stream agent response
- `POST /api/projects/:id/requirements/generate` generate requirements summary from chat
- `PUT /api/projects/:id/requirements` save edited requirements summary
- `POST /api/projects/:id/requirements/approve` mark approved and transition to plan generation
- `POST /api/projects/:id/plan/generate` generate Markdown plan from approved requirements
- `PUT /api/projects/:id/plan` save edited plan content
- `GET /api/projects/:id/plan/download` download `.md`
- `POST /api/stripe/webhook` stripe events
- `GET /api/billing/portal` customer portal link (recommended)

All endpoints:
- Require auth (except Stripe webhook)
- Apply rate limits
- Validate input sizes and content
- Enforce subscription tier entitlements

---

# Security and Safety Rules

- No secrets in code or logs; use env vars for all keys
- Enforce auth + authorization on every project resource
- Validate and cap message size; reject oversized payloads
- Rate limit by user + IP; stricter limits for OpenAI endpoints
- Sanitize/escape user-provided content rendered in UI
- Store minimal PII; protect access to stored prompts/artifacts
- Stripe webhooks:
  - verify signature
  - idempotency handling
- Production config:
  - disable debug flags
  - strict security headers (reasonable CSP, etc.)
  - secure cookies (https-only in prod)

---

# Prompting Strategy (Server-Side)

Use two-stage generation:
1) Requirements summary prompt
   - Feature-focused, non-technical language
   - Includes basic cost notes and operational considerations
   - Produces structured markdown requirements

2) Plan generation prompt
   - Converts approved requirements into a single executable plan
   - Includes architecture, tech stack, project layout, services, and step-by-step tasks
   - Includes guardrails and verification steps per task
   - Instructions only, no code

Keep prompt templates in version-controlled files, e.g. `prompts/requirements.md`, `prompts/plan.md`.

---

# Project Layout (Repo)

Suggested:
- `apps/web/` Next.js app
- `packages/` shared utilities (optional)
- `prisma/` schema + migrations
- `prompts/` prompt templates
- `scripts/` maintenance scripts (optional)
- `docs/` product docs (optional)

If single-app repo:
- `src/` app code
- `prisma/`
- `prompts/`

---

# Task Breakdown (Strict, Verifiable)

## Task 1: Repo Bootstrap
- Goal: Initialize a production-ready Next.js TypeScript app with linting and env handling
- Outputs:
  - Working dev server
  - Env template file
  - Basic CI checks (lint/typecheck)
- Verify:
  - `pnpm lint` and `pnpm typecheck` pass

## Task 2: Auth (Google)
- Goal: Add Google login and authenticated session support
- Outputs:
  - Sign-in/out UI
  - Server-side session checks
- Verify:
  - Unauthed users cannot access project pages

## Task 3: Database + Prisma
- Goal: Add Postgres + Prisma schema for users/projects/messages/requirements/plans/subscriptions/usage
- Outputs:
  - Prisma schema + migrations
  - DB connection configured
- Verify:
  - Migrations apply cleanly; basic CRUD works

## Task 4: Subscription Gating + Tier Entitlements
- Goal: Require an active subscription and enforce tier limits (Basic 5 / Pro 20 / Team 100 projects per month)
- Outputs:
  - Tier definitions in code
  - Middleware/helpers that block access when unsubscribed
  - Server-side quota check on project creation and generation endpoints
- Verify:
  - Unsubscribed user cannot create projects
  - Quota enforcement blocks project creation after limit

## Task 5: Projects CRUD
- Goal: Users can create and view projects
- Outputs:
  - `/projects` list
  - `/projects/new` creation flow
  - Per-project page shell
- Verify:
  - Only owner can access their projects

## Task 6: Chat (Persisted + Streaming)
- Goal: Chat UI with persisted messages and streamed assistant replies
- Outputs:
  - Messages stored per project
  - Streaming response handling
- Verify:
  - Refresh keeps chat history; streaming works

## Task 7: Requirements Generation + Approval
- Goal: Generate feature-focused requirements summary from chat; user edits; approve
- Outputs:
  - Requirements state machine: draft → edited → approved
  - Save edited requirements
- Verify:
  - Approved requirements are immutable unless user explicitly reopens editing

## Task 8: Plan Generation + Download
- Goal: Generate single Markdown plan containing architecture/tech stack/layout/services/tasks/rules; allow edit; download
- Outputs:
  - Plan page
  - Download endpoint returns `.md`
- Verify:
  - Downloaded file matches edited version

## Task 9: Stripe Billing (Subscriptions)
- Goal: Add Stripe subscriptions for Basic/Pro/Team and keep DB subscription state accurate
- Outputs:
  - Pricing page
  - Checkout flow
  - Webhook updates subscription status/tier
  - Customer portal link (optional but recommended)
- Verify:
  - Tier changes update entitlements within a reasonable window after webhook receipt

## Task 10: Rate Limiting + Message Size Caps
- Goal: Enforce request rate limits and payload size limits, especially for OpenAI endpoints
- Outputs:
  - Centralized limiter util
  - Clear UX errors
- Verify:
  - Rapid repeated calls are throttled; oversized payloads rejected

## Task 11: Security Hardening + Headers
- Goal: Add baseline production security controls
- Outputs:
  - Sensible security headers (CSP, etc.)
  - Safe markdown rendering
  - No sensitive logs
- Verify:
  - Manual checks: authz enforced, no unsafe HTML injection

## Task 12: Deployment (Beta)
- Goal: Deploy to simplest platform (Vercel) with DB and env vars configured
- Outputs:
  - Production deployment URL
  - Health check route
- Verify:
  - Login works, chat works, plan export works in prod

## Task 13: Launch Readiness (Public Later)
- Goal: Add Sentry and basic monitoring when moving beyond beta
- Outputs:
  - Sentry integration toggled by env
- Verify:
  - Errors captured in staging/prod when enabled

---

# Acceptance Criteria (Definition of Done)

- User can sign in with Google
- User has an active paid subscription before creating projects
- User can create a project and chat with the agent
- Agent produces an editable requirements summary; user approves
- App generates an editable Markdown plan that includes:
  - architecture
  - tech stack
  - project layout
  - third-party services (OpenAI/Google/Stripe/DB/rate limit store)
  - security rules / guardrails
  - strict step-by-step tasks with verification
- User can download the `.md`
- Server-side enforcement of:
  - authz
  - subscription gating
  - project quotas (Basic 5 / Pro 20 / Team 100 per month)
  - rate limits
  - message size caps
- Deployed to production (beta) on simplest hosting with DB and env vars configured

---

# Execution Instructions (Process Tasks One At A Time)

- Execute tasks strictly in order: Task 1, then Task 2, etc.
- For each task:
  - Create a new feature branch
  - Restate the task goal in one sentence.
  - Identify the exact files you will create/edit.
  - Implement the smallest complete change that satisfies the task.
  - Run the verification steps listed for the task (or the closest equivalent).
  - Add Tests
  - Only after verification passes, move to the next task.
- If a task depends on missing configuration (e.g., Stripe keys, Google OAuth client id/secret), implement code scaffolding and clearly list required env vars; do not invent secrets.
- If you discover a blocker, stop after explaining the blocker and what input is needed to proceed.
