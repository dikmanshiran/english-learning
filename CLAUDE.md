# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is

English Adventure is an English-Hebrew vocabulary learning game for Israeli children, with a per-child difficulty **Level** (`BEGINNER` / `INTERMEDIATE` / `ADVANCED`) driving what content they see. Intermediate/Advanced play a mix of English→Hebrew, Hebrew→English, sentence completion (fill-the-blank), and listen-and-choose questions. Beginner children instead get two dedicated folders: **Letters** (recognize + type the alphabet) and **First Words** (colors/numbers/family/animals/body parts from scratch) — see "Levels & Beginner folders" below. There's also a separate **Exercises** mode (book-based reading/grammar exercises, Intermediate/Advanced only). The legacy single-file version is `index.html` at the repo root — it still works and is kept as reference.

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

Note: this repo has no `prisma/migrations` history — schema changes have been applied with `npx prisma db push` rather than versioned migrations so far.

### Type checking
```bash
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

## Architecture

### Frontend (client/src/)

**Navigation** — `App.tsx` manages a `screen` state string (`'landing' | 'login' | 'register' | 'profile' | 'newUser' | 'home' | 'game' | 'results' | 'dashboard' | 'exercises' | 'exercises-results'`). No React Router — screens are conditionally rendered. All screen transitions go through a `navigate(screen)` helper that also does `history.pushState`, with a `popstate` listener applying the screen on browser back/forward — so the browser's back/forward buttons work as expected. `LoginScreen`, `RegisterScreen`, and `DashboardScreen` are fully wired in (reachable from `'landing'` and `ProfileScreen`'s Parent Zone); guest mode (localStorage) and logged-in mode (JWT) both work.

**State** — Four Zustand stores:
- `gameStore` — active session state: questions array, currentQ index, score, lives, streak, wrongAnswers, questionLog, `selectedUnits` (also used to route Beginner folder picks — see below). `resetGame()` must be called before `setQuestions()` when starting a new game.
- `profileStore` — user profiles persisted to `localStorage` under key `ea_users`. Each profile has a `level` (`Level`) and a `stats` map keyed by question text storing `{correct, wrong, lastSeen}`.
- `contentStore` — vocab/phrases/sentences/listenItems. Currently **bundled from `data/content.ts`**, not fetched from the API. The API `/api/content` exists but is not used by the frontend (the client-side service that would have called it, `contentService.ts`, was removed as dead code).
- `authStore` — JWT access token in memory. Server auth (register/login/refresh) is fully wired into the main navigation flow alongside guest mode.

**Levels & Beginner folders** — `ChildProfile.level` (`BEGINNER`/`INTERMEDIATE`/`ADVANCED`) is set at profile creation (`NewUserScreen`) and editable later (`DashboardScreen`). Content items (`VocabItem`/`PhraseItem`/`SentenceItem`/`ListenItem`/`BookExercise`) carry a `level` tag; `utils/level.ts`'s `filterByLevel` filters to the child's level and **falls back to INTERMEDIATE** if nothing matches yet (only Intermediate content exists for most categories today — no `ADVANCED` content exists anywhere in the codebase yet). Beginner children see two dedicated folders directly on the Home screen instead of the normal Vocabulary/Exercises choice — **Letters** (`data/letters.ts`, the alphabet with an example word/emoji/Hebrew translation each) and **First Words** (~37 simple words in `data/content.ts`'s `BEGINNER_VOCAB_RAW`, tagged unit `FIRST_WORDS_UNIT_ID`). These are built by dedicated hooks in `hooks/useBeginnerGame.ts` that **bypass `useQuestionPool` entirely** (no unit filtering, reads `VOCAB`/`LETTERS` directly) — `App.tsx`'s `handleStart` branches on `useGameStore.getState().selectedUnits[0]` being `LETTERS_UNIT_ID`/`FIRST_WORDS_UNIT_ID` vs. the normal pool-based path. Exercises mode is not reachable for Beginner children at all.

**Question generation flow (Intermediate/Advanced):**
1. `useQuestionPool(selectedUnits, level)` — filters content by selected units, then by level (with the fallback above)
2. `useBuildQuestions()` — builds a shuffled mix of questions at these ratios: 35% e2h vocab, 25% h2e vocab, 15% sentence, 15% phrases, 20% listen (half full sentences, half words)
3. Wrong options for vocab/phrase questions are sampled from the **global** pool (not just selected units) to ensure 4 credible distractors

**Adaptive weighting** — `utils/weightedSample.ts` (`shuffle`/`getWeight`/`weightedSample`) is shared by `useGame.ts`, `useBeginnerGame.ts`, and `ExercisesScreen.tsx`: struggling words/letters come up ~4x more often, mastered ones ~0.5x, based on `WordStat` mastery. For the Letters folder, the weighting key is the canonical uppercase letter even though the actual rendered question (and therefore the stat recorded server-side) varies by variant — an accepted approximation, same as e2h vs h2e already being tracked as separate keys for one vocab pair.

**Wrong-answer behaviour** — On wrong answer: flash red + shake (800ms), then reset all buttons to default state. A `_wrongLogged` flag on the question object prevents charging more than one life per question. The `resetting` flag in `gameStore` blocks clicks during the 800ms reset window. The Letters folder's typing questions (`letter-type` kind) render a text input instead of option buttons in `GameScreen.tsx`, normalized to uppercase before comparing.

**Audio** — `playTone(correct)` in `useGame.ts` uses Web Audio API. `speak(text)` uses Web Speech API (`lang: 'en-US'`, `rate: 0.85`). Auto-plays at 400ms after a listen question renders.

### Backend (server/src/)

**Routes:**
- `POST /api/auth/register|login` — bcrypt + JWT access token (15min) returned in body, refresh token (30 days) in httpOnly cookie
- `POST /api/auth/refresh` — rotates refresh token; reads from `refresh_token` cookie
- `GET /api/content` — returns all units, vocab, phrases, sentences, listen items (not used by the frontend; these Prisma tables have no `level`/folder concept and have drifted behind the client's content model — see Known Gaps)
- `GET|POST|DELETE|PATCH /api/profiles` — child profiles (including `level`), requires `Authorization: Bearer <token>`
- `POST /api/sessions` — saves completed game + upserts `WordStat` mastery per question
- `GET /api/stats/:profileId/summary|words` — dashboard stats
- `GET /api/tts` — proxies ElevenLabs TTS, falls back to browser speech on the client if it fails; unauthenticated, covered only by the general rate limiter (no dedicated limit despite calling a paid API)

**Auth middleware** — `authenticate` in `middleware/auth.ts` sets `req.parentId` from the JWT. All profile/session/stats routes require it.

**Word mastery** — computed in `sessions.ts` on every session save: accuracy < 30% → `STRUGGLING`, 30–70% → `LEARNING`, ≥70% → `MASTERED`. Stored in `WordStat` table keyed by `(profileId, wordKey)` where `wordKey` is the question text. Per-question updates are sequential (not batched/transactional) — fine for solo use, but not atomic if one fails mid-session-save.

**Question kinds** — `QuestionKind` (client `types/game.ts` and Prisma enum) includes `E2H`/`H2E`/`SENTENCE`/`LISTEN` plus `LETTER_CHOICE`/`LETTER_TYPE` for the Beginner Letters folder. `sessionService.ts`'s `kindMap` must map every client-side kind (`e2h`/`h2e`/`sentence`/`listen`/`letter-choice`/`letter-type`) — if a new kind is ever added on the client without updating this map (and the Prisma enum + `sessions.ts`'s zod schema), it silently falls back to `E2H` in saved sessions instead of erroring.

### Database (Prisma + PostgreSQL)

Key relationships:
- `Parent` → many `ChildProfile` (has `level: Level`) → many `GameSession` → many `SessionQuestion`
- `ChildProfile` → many `WordStat` (one per unique question text)
- Content tables (`Unit`, `VocabItem`, `PhraseItem`, `SentenceItem`, `ListenItem`) are seed-only, not user-generated, and **do not have a `level` column or any Beginner-folder concept** — they only reflect the pre-Level content model. If `contentStore` is ever switched to fetch from `/api/content`, every item would collapse to a fallback level and the Beginner folders would disappear server-side. See Known Gaps.

The `WordStat.wordKey` is a plain string (question text), not a FK to content tables. This makes the adaptive weighting query simpler but means joining to unit info requires a lookup.

### Design System

Dark purple theme. Key CSS custom properties in `client/src/index.css`:
- `--color-bg`: `#0f0c29` (body gradient start)
- `--color-surface-1`: `#1e1a3e` (cards)
- `--color-primary`: `#6c3fc5`
- `--color-accent`: `#f59e0b` (stars, streak, blank underline)
- `--color-success`: `#10b981` / `--color-danger`: `#ef4444`

Hebrew text always needs `direction: rtl` and `lang="he"`. Option buttons for Hebrew answers use `.hebrew-opt` class. The `<span class="blank">` in sentence questions has an amber bottom-border with `&nbsp;` content (not `___` text) to avoid double underlines. `GameScreen`/`QuestionCard`/`OptionButton` use CSS classes throughout; most other screens (`DashboardScreen`, `ExercisesScreen`, `HomeScreen`, `NewUserScreen`, `ParentZoneModal`) use heavy inline styles instead — an inconsistency that hasn't been resolved, just extended by newer screens.

## Deployment (Railway)

- `railway.toml` defines build: `npm install --prefix client && npm install --prefix server && npm run build`
- In production, Express serves `client/dist/` as static files with SPA fallback
- `DATABASE_URL` is auto-set by Railway's PostgreSQL plugin
- Required env vars: `JWT_SECRET`, `REFRESH_SECRET`, `NODE_ENV=production`, `CLIENT_ORIGIN`
- After first deploy, seed the DB via Railway shell: `cd server && npx tsx prisma/seed.ts`
- After any Prisma schema change, run `npx prisma db push` against the production DB via Railway shell (no migration history exists — see Database commands above)

## Known Gaps / Pending Work

- No email sending (password reset flow is incomplete)
- No `ADVANCED` content exists anywhere — Advanced-level children get the same content as Intermediate via `filterByLevel`'s fallback
- Prisma's content tables (`Unit`/`VocabItem`/etc.) have no `level`/folder concept and are seed-only/unused (`/api/content` has no client callers) — either delete them to stop the drift, or bring them up to date with `level`/folder concepts before more Beginner-style modes get added
- A residual stale-closure risk in `App.tsx`: `handleStart` reads `useGameStore.getState().selectedUnits` directly (not the destructured hook value) to decide which question builder to use, but the `pool` variable it falls back to for the normal path is still a `useMemo` off the render-time value. This is currently masked because the Beginner branches never touch `pool`, but adding a future folder that both (a) is picked the same way `HomeScreen`'s folder-pick works (`setSelectedUnits` + immediate `onStartVocab()` in the same tick) and (b) needs the pool-based pipeline, would silently build from the wrong unit on the first play after switching.
- `/api/tts` is unauthenticated with no dedicated rate limit despite proxying a paid ElevenLabs call — only covered by the app's general limiter
- Adding a new `QuestionKind` on the client requires remembering to also update `sessionService.ts`'s `kindMap`, the Prisma `QuestionKind` enum, and `sessions.ts`'s zod schema — nothing enforces this today
