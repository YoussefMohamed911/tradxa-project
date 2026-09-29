# TRADEXA — AI PROJECT CONTEXT

## Product

Tradxa is a production financial-markets platform.

Core areas:
- Market Data
- Economic Calendar
- Financial News
- Market Analysis
- Signals
- FX Company
- Education / Books
- Authentication / Accounts
- Admin Dashboard

---

## Current Stack

- React
- Vite
- JavaScript
- React Router
- Custom CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Realtime
- Supabase Edge Functions
- i18next
- Vite PWA

Do NOT migrate to Next.js.

Do NOT introduce:
- Tailwind
- shadcn/ui
- Bootstrap
- Material UI

unless explicitly approved.

---

## Design Direction

Tradxa must look like a serious institutional financial platform.

Design principles:
- Premium
- Restrained
- High information density
- Precise alignment
- Fast scanning
- Professional financial UI
- Responsive
- Performance-first

Avoid:
- Generic AI dashboard design
- Excessive cards
- Excessive rounded containers
- Glassmorphism
- Strong gradients
- Neon effects
- Oversized typography
- Unnecessary animation
- Random redesigns

Accent color:
#67c9b8

All UI must support:
- Desktop
- Tablet
- Mobile
- Dark mode
- Light mode
- English
- Arabic / RTL

---

## Architecture Rules

1. Preserve existing working functionality.
2. Do not modify unrelated files.
3. Do not rewrite features unnecessarily.
4. Do not fabricate APIs.
5. Do not fabricate financial data.
6. Never expose secrets in frontend code.
7. Never expose Supabase service_role.
8. Respect Supabase RLS.
9. Reuse the existing Supabase client.
10. Preserve the existing authentication architecture.
11. Maintain timezone correctness.
12. Do not silently change business logic.
13. Avoid adding dependencies unless necessary.
14. Production features require:
   - loading state
   - error state
   - empty state
   - responsive behavior

---

## Economic Calendar

Current architecture:

MQL5 Economic Calendar
→ MetaTrader 5
→ TradxaCalendarCollector.mq5
→ Supabase Edge Function
→ economic_events
→ Supabase Realtime
→ Tradxa

The Economic Calendar already uses REAL data.

### economic_events

Important fields:

- id
- external_id
- event_time
- country
- currency
- event_name
- impact
- actual
- forecast
- previous

### Current requirements

Full Calendar page:
- Route: /calendar
- Real Supabase data
- Weekly navigation
- Date selector
- Impact filtering
- Currency filtering
- Group events by day
- Actual / Forecast / Previous
- Realtime updates

Home:
- Show TODAY'S events only
- Same economic_events table
- Realtime updates

Do not replace the current calendar architecture.

---

## Authentication

Supabase Auth currently supports:

- Registration
- Email verification
- Login
- Forgot password
- Reset password
- Account/profile
- Protected routes

Do not rewrite authentication unless explicitly required.

---

## Data Infrastructure

Planned production architecture:

General Windows VPS
│
├── MetaTrader 5
│   └── Economic Calendar Collector
│
├── Node.js collectors
│   ├── News Collector
│   ├── Future API Collectors
│   └── Health Monitoring
│
└── Scheduled jobs

Supabase handles:
- PostgreSQL
- Auth
- Realtime
- Edge Functions

---

## Data Sources

Economic Calendar:
- MQL5 / MetaTrader 5

Market display:
- TradingView Widgets for MVP

News:
- Licensed financial-news provider to be selected

Official releases:
- Official APIs / RSS feeds where appropriate

Never scrape or copy protected data from:
- ForexFactory
- Investing.com
- TradingView
unless explicit permission/license exists.

---

## AI Working Rules

Before editing code:

1. Read this file.
2. Inspect relevant existing files.
3. Understand the current implementation.
4. Identify dependencies.
5. Identify exact files that need modification.
6. Produce a short implementation plan.

For non-trivial tasks:

DO NOT modify code until the plan is understood.

During implementation:

- Make the smallest coherent change.
- Preserve existing architecture.
- Avoid duplicate logic.
- Avoid unrelated refactors.
- Reuse existing project patterns.

After implementation:

1. Review the diff.
2. Run the build.
3. Run available lint/tests.
4. Check runtime/console errors.
5. Report files changed.
6. Report what changed.
7. Report verification performed.
8. Report remaining risks.

Never claim something works unless it was actually verified.

---

## Definition of Done

A feature is NOT complete just because it renders.

Before marking DONE check:

- Functionality
- Real data
- Loading states
- Error states
- Empty states
- Desktop
- Mobile
- Dark mode
- Light mode
- English
- Arabic / RTL
- Security
- Build
- No console errors
- QA

Goal:

Senior-level production code that fits the existing Tradxa product.