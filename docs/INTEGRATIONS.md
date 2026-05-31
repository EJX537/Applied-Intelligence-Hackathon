# Insforge + Opsera Integration Plan

Scope: replace the mocked food backend with **Insforge** (data, auth, storage)
and automate delivery with **Opsera** (CI/CD pipelines). No code changes yet —
this is the design before the work.

> Verify SDK method names, API paths, and dashboard flows against the current
> Insforge and Opsera docs before implementing. Names below are conceptual.

---

## 1. Current state

- App is a single-feature React Native (Expo + custom dev client) build of the
  Food & Drinks flow on branch `feature/food-drinks`.
- All persistence is in-memory (`useFoodStore` — zustand). Meals are lost on
  reload.
- `src/features/food/services/foodApi.ts` exposes three async functions
  (`analyzeMealPhoto`, `logMeal`, `searchFood`) and guards them behind
  `MOCK_MODE = true`. The non-mock branch already calls
  `apiClient.post('/meals/...')` — the shape is the integration seam.
- No auth: every user is anonymous, no per-user data scoping.
- No CI: builds happen locally via `expo run:ios` / `run:android`.

---

## 2. Insforge — backend layer

### 2.1 Data model

Tables (Postgres):

| Table              | Purpose                                                              | Key columns                                                                                                                |
| ------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `users`            | Identity (managed by Insforge auth)                                  | `id`, `email`, `created_at`                                                                                                |
| `meals`            | One row per logged meal                                              | `id`, `user_id` (fk), `meal_type`, `timestamp`, `image_url`, `meal_total_jsonb`                                            |
| `food_items`       | Per-item rows under a meal                                           | `id`, `meal_id` (fk), `name`, `usda_fdc_id`, `category`, `portion_grams`, `quantity`, `effective_grams`, `nutrients_jsonb`, `manual_entry` |
| `food_corrections` | User-edited item names — feeds back into AI improvement              | `id`, `user_id`, `image_url`, `original_name`, `corrected_name`, `original_category`, `corrected_category`, `timestamp`    |
| `daily_targets`    | Per-user calorie & macro targets (optional, defaults hard-coded now) | `user_id` (pk), `calories`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g`, `sugar_g`, `sodium_mg`                              |

Row-level security: every table except `users` filters on `user_id = auth.uid()`.

### 2.2 Auth

- Use Insforge built-in email + Apple Sign-In (iOS app, App Store requires
  Apple SSO if any third-party social login is offered).
- App boots → check session → if none, push a login screen ahead of
  `FoodLogScreen`. Existing `ConsentScreen` stays as a post-login one-time gate.
- Store the access token in `expo-secure-store` (not AsyncStorage) — auth
  tokens shouldn't live in plain-text storage.

### 2.3 Storage

- Bucket `meal-photos`, path convention `{user_id}/{meal_id}.jpg`.
- `CameraScreen` currently produces a base64 string. Flow becomes:
  1. Picker → file URI + base64 (already done).
  2. Upload file URI to Insforge storage → returns CDN URL.
  3. Pass URL (not base64) into `analyzeMealPhoto` and `logMeal`.
- Drop `image_uri: data:image/jpeg;base64,...` from the mock — `MealEntry.image_uri`
  becomes a real https URL.

### 2.4 Analyze endpoint (`/meals/analyze`)

This is the only call that genuinely needs server-side compute (calls out to a
vision model with the OpenAI/Anthropic key). Two options:

- **A. Insforge edge function** — `POST /functions/v1/analyze-meal` that takes
  `{ image_url, meal_type }`, calls the vision API server-side, returns
  `RecognizedItem[]`. Recommended — keeps the LLM API key off the device.
- **B. Direct from device with public key** — faster to build, but leaks the
  API key. Don't do this.

### 2.5 Search endpoint (`/meals/search`)

- Hit USDA FoodData Central API directly from an Insforge edge function (USDA
  API key lives server-side). Cache hot queries in a `usda_cache` table keyed
  by `lower(query)` with a 7-day TTL.

### 2.6 Log endpoint (`/meals/log`)

- Pure CRUD — could be a single edge function or three direct table inserts
  via the Insforge REST/JS client (`meals`, `food_items`, `food_corrections`)
  wrapped in a transaction. Prefer the direct-client path for simplicity unless
  you want server-side nutrition recomputation.

### 2.7 Code seam

In `foodApi.ts`:

- Remove `MOCK_MODE` once Insforge is wired.
- Replace `apiClient` (axios → `http://localhost:3000/api`) with the Insforge
  JS client initialized from `process.env.EXPO_PUBLIC_INSFORGE_URL` +
  `EXPO_PUBLIC_INSFORGE_ANON_KEY`.
- Function signatures don't change — screens don't need edits.

---

## 3. Opsera — delivery layer

### 3.1 Pipeline stages

Recommended single pipeline triggered on push to any branch:

1. **Lint** — `npm run lint` (eslint).
2. **Typecheck** — `npx tsc --noEmit`.
3. **Unit tests** — `npm test` (none exist yet; placeholder until Jest is
   added).
4. **Security scan** — Opsera-orchestrated SCA (e.g. Snyk/Trivy step on
   `package-lock.json`) + secret scan.
5. **Build matrix** (only on `main` and tags):
   - iOS: `eas build --platform ios --profile preview` → TestFlight on tag.
   - Android: `eas build --platform android --profile preview` → internal
     track on tag.
6. **Notify** — Slack/Teams on failure, on successful TestFlight upload.

### 3.2 Environments

- `dev` — Insforge dev project, points at staging USDA cache, debug builds.
- `prod` — Insforge prod project, signed release builds, TestFlight/Play.
- Opsera holds the env-var sets; the pipeline injects them into EAS as
  `--env` overrides.

### 3.3 Secrets

Stored in Opsera's vault (not in repo, not in `.env`):

- `INSFORGE_URL`, `INSFORGE_ANON_KEY` (per env)
- `INSFORGE_SERVICE_ROLE_KEY` (only used by edge function deploys, never the app)
- `EXPO_TOKEN` (for EAS CLI auth)
- `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `ASC_KEY_ID`, `ASC_KEY_P8` (for
  App Store Connect uploads)
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
- `USDA_API_KEY`, `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` (used only by Insforge
  edge functions — set in Insforge dashboard, mirrored in Opsera so the
  function deploy step can push them)

### 3.4 Edge function deploys

If using Insforge edge functions (recommended for `/meals/analyze` and
`/meals/search`), add a pipeline stage that:

1. Detects changes under `infra/insforge/functions/**`.
2. Runs `insforge functions deploy <name>` with the prod URL+service key.

---

## 4. Migration sequence

Do these in order — each is independently shippable:

1. **Auth + user scoping in zustand** — add a placeholder `userId` so the app
   compiles with the eventual schema in mind. (~1 hr)
2. **Insforge schema + RLS** — apply migrations in the Insforge dashboard.
   Don't wire the app yet. (~2 hr)
3. **Replace `searchFood` mock** with a direct Insforge edge function call.
   Easiest endpoint to swap — proves the auth + client setup. (~3 hr)
4. **Replace `logMeal` mock** with table inserts. Backfill `image_uri` as
   `null` initially. (~3 hr)
5. **Storage upload** in `CameraScreen` — meals now persist a real photo URL.
   (~2 hr)
6. **Replace `analyzeMealPhoto` mock** with the edge function. This is the
   highest-risk step — vision model latency, cost. (~half day)
7. **Opsera pipeline v1** — lint + typecheck + EAS preview build on PRs. (~half
   day)
8. **Opsera pipeline v2** — TestFlight on tag, function deploys, secret
   rotation. (~1 day)

Total rough estimate: **3–4 days of focused work**, half backend, half DevOps.

---

## 5. Open questions

1. **Vision model choice** — Anthropic Claude vision vs OpenAI vision vs a
   self-hosted model? Affects cost and the prompt that `RecognizedItem[]` is
   parsed from.
2. **Offline-first?** — If the user logs a meal with no network, do we queue
   it locally and sync later, or hard-fail? Affects whether zustand needs
   persist middleware + a sync reconciler.
3. **USDA quota** — USDA FDC API has a 3,600 req/hr cap per key. Cache TTL of
   7 days is a starting guess; revisit once we see real traffic.
4. **Apple privacy nutrition labels** — once Insforge is wired, the App Store
   submission needs updated privacy disclosures (photos, health-and-fitness
   data, identifiers).
5. **Should `food_corrections` be opt-in?** — It's user-generated training data.
   Privacy-friendly default: opt-out toggle in settings, mention in the
   `ConsentScreen` copy.

---

## 6. What stays the same

- All screens, components, types, navigation. The integration is contained to
  `services/foodApi.ts`, `hooks/useConsentStatus.ts` (extend to track user),
  and a new auth screen/provider above the navigator.
- `foodApi.ts` function signatures are unchanged — screens don't care that
  the data now comes from Insforge.
