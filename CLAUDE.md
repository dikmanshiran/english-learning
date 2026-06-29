# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is

English Adventure is an English-Hebrew vocabulary learning game for a 10-year-old Israeli child. It has 4 question types: English→Hebrew translation, Hebrew→English translation, sentence completion (fill-the-blank), and listen-and-choose (TTS via Web Speech API). The legacy single-file version is `index.html` at the repo root — it still works and is kept as reference.

## Monorepo Structure

```
/                   ← root: Railway build/start scripts only
/client/            ← React 18 + Vite + TypeScript frontend
/server/            ← Express + TypeScript backend
/server/prisma/     ← Prisma schema + seed (200+ vocab words)
/index.html         ← legacy single-file version (reference only)
```

## Commands

### Development
```bash
# Install all dependencies
npm install && npm install --prefix client && npm install --prefix server

# Run both dev servers concurrently (client: 5173, server: 3001)
npm run dev

# Run individually
npm run dev --prefix client
npm run dev --prefix server
```

### Build
```bash
npm run build   # builds client (Vite) then server (tsc)
```

### Database
```bash
cd server
npx prisma generate          # after schema changes
npx prisma migrate dev --name <description>   # create migration
npx prisma migrate deploy    # apply migrations in production
npx tsx prisma/seed.ts       # seed all vocab/phrases/sentences
npx prisma studio            # GUI to inspect data
```

### Type checking
```bash
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

## Architecture

### Frontend (client/src/)

**Navigation** — App.tsx manages a `screen` state string (`'profile' | 'newUser' | 'home' | 'game' | 'results'`). No React Router — screens are conditionally rendered. `LoginScreen` and `RegisterScreen` and `DashboardScreen` exist but are not yet wired into the main navigation flow.

**State** — Four Zustand stores:
- `gameStore` — active session state: questions array, currentQ index, score, lives, streak, wrongAnswers, questionLog. `resetGame()` must be called before `setQuestions()` when starting a new game.
- `profileStore` — user profiles persisted to `localStorage` under key `ea_users`. Each profile has a `stats` map keyed by question text (English) storing `{correct, wrong, lastSeen}`.
- `contentStore` — vocab/phrases/sentences/listenItems. Currently **bundled from `data/content.ts`**, not fetched from the API. The API `/api/content` exists but is not used by the frontend yet.
- `authStore` — JWT access token in memory. Server auth is implemented but the frontend login/register screens are not yet connected to the main game flow. The app currently runs in guest mode only.

**Question generation flow:**
1. `useQuestionPool(selectedUnits)` — filters content by selected units
2. `useBuildQuestions()` — builds a shuffled mix of questions at these ratios: 35% e2h vocab, 25% h2e vocab, 15% sentence, 15% phrases, 20% listen (half full sentences, half words)
3. Wrong options for vocab/phrase questions are sampled from the **global** pool (not just selected units) to ensure 4 credible distractors

**Wrong-answer behaviour** — On wrong answer: flash red + shake (800ms), then reset all buttons to default state. A `_wrongLogged` flag on the question object prevents charging more than one life per question. The `resetting` flag in `gameStore` blocks clicks during the 800ms reset window.

**Audio** — `playTone(correct)` in `useGame.ts` uses Web Audio API. `speak(text)` uses Web Speech API (`lang: 'en-US'`, `rate: 0.85`). Auto-plays at 400ms after a listen question renders.

### Backend (server/src/)

**Routes:**
- `POST /api/auth/register|login` — bcrypt + JWT access token (15min) returned in body, refresh token (30 days) in httpOnly cookie
- `POST /api/auth/refresh` — rotates refresh token; reads from `refresh_token` cookie
- `GET /api/content` — returns all units, vocab, phrases, sentences, listen items (not yet used by frontend)
- `GET|POST|DELETE /api/profiles` — child profiles, requires `Authorization: Bearer <token>`
- `POST /api/sessions` — saves completed game + upserts `WordStat` mastery per question
- `GET /api/stats/:profileId/summary|words` — dashboard stats

**Auth middleware** — `authenticate` in `middleware/auth.ts` sets `req.parentId` from the JWT. All profile/session/stats routes require it.

**Word mastery** — computed in `sessions.ts` on every session save: accuracy < 30% → `STRUGGLING`, 30–70% → `LEARNING`, ≥70% → `MASTERED`. Stored in `WordStat` table keyed by `(profileId, wordKey)` where `wordKey` is the English question text.

### Database (Prisma + PostgreSQL)

Key relationships:
- `Parent` → many `ChildProfile` → many `GameSession` → many `SessionQuestion`
- `ChildProfile` → many `WordStat` (one per unique question text)
- Content tables (`Unit`, `VocabItem`, `PhraseItem`, `SentenceItem`, `ListenItem`) are seed-only, not user-generated

The `WordStat.wordKey` is a plain string (English question text), not a FK to content tables. This makes the adaptive weighting query simpler but means joining to unit info requires a lookup.

### Design System

Dark purple theme. Key CSS custom properties in `client/src/index.css`:
- `--color-bg`: `#0f0c29` (body gradient start)
- `--color-surface-1`: `#1e1a3e` (cards)
- `--color-primary`: `#6c3fc5`
- `--color-accent`: `#f59e0b` (stars, streak, blank underline)
- `--color-success`: `#10b981` / `--color-danger`: `#ef4444`

Hebrew text always needs `direction: rtl` and `lang="he"`. Option buttons for Hebrew answers use `.hebrew-opt` class. The `<span class="blank">` in sentence questions has an amber bottom-border with `&nbsp;` content (not `___` text) to avoid double underlines.

## Deployment (Railway)

- `railway.toml` defines build: `npm install --prefix client && npm install --prefix server && npm run build`
- In production, Express serves `client/dist/` as static files with SPA fallback
- `DATABASE_URL` is auto-set by Railway's PostgreSQL plugin
- Required env vars: `JWT_SECRET`, `REFRESH_SECRET`, `NODE_ENV=production`, `CLIENT_ORIGIN`
- After first deploy, seed the DB via Railway shell: `cd server && npx tsx prisma/seed.ts`

## Known Gaps / Pending Work

- Frontend auth screens (Login/Register) exist but are not wired into `App.tsx` navigation — the app runs in guest mode (localStorage) only
- `contentStore` is seeded from bundled `data/content.ts`, not from `/api/content` — server content updates won't reflect in the client without a code change
- Parent Dashboard screen exists (`DashboardScreen.tsx`) but is not accessible from the UI
- Adaptive weighting (using `WordStat` data to boost struggling words) is not yet implemented on the client side
- No email sending (password reset flow is incomplete)
