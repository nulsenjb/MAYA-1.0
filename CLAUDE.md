# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Maya is an AI-driven personal beauty web app with a Glossier-inspired aesthetic. It guides users through a beauty intake questionnaire, generates a personalized AI dossier, and provides an ongoing conversational advisor ("Maya") — all scoped per user via Supabase Auth.

## Design Principles & Product Voice

This steers every UX, copy, and interaction decision in the app. Before implementing any screen, button, empty state, loading message, error, or any text Maya generates, check it against this. The technical implementation comes second; the feeling comes first.

### The test

Every decision moves the user toward **"oh — that's why,"** or toward **"what should I buy / what trick do I do."** The first is always right. The second is always wrong. When a fork points at a purchase or a trick, it's the wrong fork — even when it's the easier build.

### What Maya is (and isn't)

Maya is an interactive beauty **interpretation** system. The product is **clarity**, not tricks and not products. It is a companion that helps a woman understand herself.

It is **not** a beauty counter (don't sell), **not** a tutorial platform (don't lecture), and **not** a product-recommendation engine (don't optimize for recommendations). Each is a trap that quietly betrays the feeling.

### The core principle

**The interface is a mirror, not a stage.** It reflects the user's own observations back to her with structure; it never performs expertise *at* her. The app noticed — *she* understood. Always leave the authorship of the insight with the user. Authority flows toward her, not away from her.

### Emotional target

Should feel: calm, thoughtful, reassuring, spacious, premium, warm, human, curious.

Should never feel: sales-focused, influencer-driven, flashy, judgmental, overwhelming, cluttered, overly technical, or like an "expert" talking down.

The tone is **thoughtful guide**, never **beauty expert** or **sales associate**.

### Decision forks

The counter/tutorial reflex on the left betrays the feeling. The Maya decision on the right protects it.

**Copy & verbs**
- "Get your recommendations" / "Shop your shade" → "Show me what you're noticing." Verbs of *noticing* and *understanding*, never *getting* and *buying*.
- "You should…" → "Here's something I noticed…" / "One thing that might be going on…"
- Exclamation marks, hype, urgency → calm punctuation, no urgency. Maya is never excited at the user.

**Home / entry**
- "What product do you need?" or a feature dashboard → "What are you noticing today?" with observation prompts ("my blush turns orange," "help me understand what's not working"). An open input the cursor is invited into — not a CTA to click through. This is the highest-leverage screen in the app.

**Empty states**
- "No items yet — add your first!" → "Nothing here yet. When you notice something — a blush that turns, a look that felt off — bring it here." An invitation to notice, not a chore.

**Loading / timing**
- "Finding your perfect products!" → "Looking at this with you…" Unhurried pacing *is* the reassurance. Never rush; rushing signals a transaction.

**Motion**
- Bouncy, energetic micro-animations → soft, slow, diffused easing. Respect `prefers-reduced-motion`.

**Framing "wrong"**
- "You're doing this wrong" / corrective rules → "This is a common one — here's what's usually behind it." The user is never the problem; the *misunderstanding* is. Prefer observations over corrections (e.g., "Worth easing off," not "Avoid").

**Deference & pattern recognition**
- App delivers its verdict → app asks her read first ("how did that feel on you?") and treats her perception as data, not something to overwrite. Surface her *own* recurring observations back to her so she authors the insight ("you've mentioned a few times that warmer blushes feel heavy — there may be a pattern there").

**Education & video**
- Courses / modules / lessons as the spine → insight emerges inside the conversation at the moment of confusion. Videos **support** the product; they never lead it. Library categories are problems and outcomes ("why this happens," "what changed with age"), never body-part taxonomy. Clips are short (45–90s).

**Visual**
- Beauty-store brightness, excessive pinks, dense dashboards → restraint, generous whitespace, one thing at a time, a muted editorial palette. Spaciousness itself signals "you are not being sold to." Avoid information overload.

### Maya's generated voice

Applies to all AI output — dossier (`lib/dossier-prompt.ts`) and chat (`app/api/chat/route.ts`):

- Maya is a **fellow explorer / first student**, never the authority.
- **Observational and tentative** — "here's something I noticed," not rules handed down.
- **Diagnostic** — orient around "why is this happening for you," never "what should you buy."
- The goal is helping her **understand herself**, not look younger or like someone else.
- Always **specific to her** actual undertone, contrast, and the products she owns — never generic.
- End with a **gentle question** that helps her notice the next thing.

### The founder's voice

Adi is presented as the **first student**, not the expert. The narrative: "I spent years trying to understand why beauty advice wasn't working for me. I learned that beauty is highly individual. Maya was built to help other women go through that same discovery." Never position her as an authority delivering rules.

### Success state

The app has done its job when the user says **"I finally understand why."** Not when she buys. Not when she learns a trick. Design every screen toward that exhale.

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
