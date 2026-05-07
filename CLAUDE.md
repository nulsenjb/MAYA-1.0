# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Maya is an AI-driven personal beauty web app with a Glossier-inspired aesthetic. It guides users through a beauty intake questionnaire, generates a personalized AI dossier, and provides an ongoing conversational advisor ("Maya") — all scoped per user via Supabase Auth.

## Commands

```bash
npm run dev      # Start local dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via Next.js
```

No test suite is currently configured.

## Architecture

### Core Loop

The app has one primary data flow:

1. **Intake** (`/intake`) — user answers ~18 beauty questions → saved to `intake_profiles` (one row per user, upserted)
2. **Dossier** (`/api/dossier` POST) — auto-triggered after intake; fetches intake + inventory + refinement notes in parallel, sends to GPT-4o via `lib/dossier-prompt.ts`, stores structured JSON in `dossiers` (one row per user, upserted)
3. **Chat** (`/refine`) — conversational advisor with full context injected as system prompt (intake + inventory + dossier + chat history); chat messages persisted to `chat_messages`
4. **Inventory** + **Notes** — enrich the dossier and chat context over time

### Auth & Middleware

Middleware lives in `proxy.ts` (not `middleware.ts` — this is non-standard). It exports `proxy` as the handler and a `config` matcher. Route protection redirects unauthenticated users to `/auth/login` for: `/dashboard`, `/intake`, `/inventory`, `/dossier`, `/refine`.

Two Supabase clients:
- `lib/supabase-server.ts` — used in API routes (cookie-based SSR session)
- `lib/supabase-browser.ts` — used in client components

### API Routes

All routes in `app/api/` follow the same pattern: get user from Supabase server client → 401 if missing → validate body with Zod → Supabase query → return JSON. Routes and their Supabase tables:

| Route | Table |
|---|---|
| `/api/intake` | `intake_profiles` |
| `/api/inventory` | `inventory_items` |
| `/api/dossier` | `dossiers` (writes), also reads intake/inventory/notes |
| `/api/notes` | `refinement_notes` |
| `/api/chat` | `chat_messages` |
| `/api/looks` | `saved_looks` |

### AI Integration

- **Model:** `gpt-4o` for both dossier generation and chat
- **Dossier:** `lib/dossier-prompt.ts` → `buildDossierPrompt()` returns a strict JSON-only prompt. `parseDossierJson()` parses the response. Output shape is `DossierContent` from `lib/types.ts`.
- **Chat:** System prompt inlines all user context. Temperature 0.8 vs 0.7 for dossier.
- **Look detection:** Client-side heuristic in `/refine` page — if a chat reply contains keywords (`step`, `foundation`, `blush`, `lip`, `mascara`) or is >300 chars, a "Save to playlist" button appears.

### Types & Validation

`lib/types.ts` is the source of truth for all interfaces (`IntakeProfile`, `InventoryItem`, `DossierContent`, `StoredDossier`, `SavedLook`, etc.) and string union enums (undertone, depth, contrast, category).

`lib/validation.ts` contains Zod schemas (`intakeSchema`, `inventorySchema`, `noteSchema`) used in API routes. If you add a field to a type, update both files.

### Database

Schema is in `supabase/schema.sql`. All tables have RLS enabled — users can only access rows where `auth.uid() = user_id`. `intake_profiles` and `dossiers` are one-per-user (unique on `user_id`), so writes use upsert with `onConflict: 'user_id'`.

`chat_messages` and `saved_looks` tables are referenced in API routes but not in `schema.sql` — they need to be added if running a fresh Supabase instance.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY
```
