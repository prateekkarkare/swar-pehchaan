# Supabase setup (optional cloud sync)

The app works fully on localStorage if you don't configure Supabase. Cloud sync
gives you cross-device progress and a backed-up history.

## 1. Create a project

1. Sign in to https://supabase.com and create a new project.
2. In **Authentication → Providers**, enable **Anonymous sign-ins**.

## 2. Create the `attempts` table

Open **SQL Editor** and run:

```sql
create table attempts (
  id           text primary key,
  user_id      uuid references auth.users on delete cascade not null,
  ts           timestamptz not null,
  session_id   text not null,
  question_id  text not null,
  position     smallint not null,
  played       text not null,
  answered     text,
  correct      boolean not null,
  response_ms  int,
  ctx          jsonb default '{}'::jsonb
);

create index attempts_user_ts_idx       on attempts (user_id, ts desc);
create index attempts_user_played_idx   on attempts (user_id, played);
create index attempts_user_session_idx  on attempts (user_id, session_id);
create index attempts_ctx_mode_idx      on attempts ((ctx->>'mode'));
create index attempts_ctx_levelid_idx   on attempts ((ctx->>'levelId'));
create index attempts_ctx_preset_idx    on attempts ((ctx->>'preset'));

alter table attempts enable row level security;

create policy "own rows: read"
  on attempts for select
  using (auth.uid() = user_id);

create policy "own rows: write"
  on attempts for insert
  with check (auth.uid() = user_id);

create policy "own rows: update"
  on attempts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own rows: delete"
  on attempts for delete
  using (auth.uid() = user_id);
```

## 3. Wire credentials

### Local development

```bash
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

The Progress view shows a `☁ Cloud` badge once connected. With the env vars
unset it shows `💾 Local` and uses localStorage only.

### GitHub Pages deployment

Add two repository secrets (Settings → Secrets and variables → Actions):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The deploy workflow already passes them to the build.

## 4. Migration

The first time the app boots with a populated `ear-training-progress` (v1) key in
localStorage, the legacy sessions are exploded into per-note attempts and
inserted into the active adapter (local or Supabase). This runs exactly once
and is idempotent — the legacy key is left in place so you can re-export it
if needed.

## Data model

A single append-only `attempts` event log is the source of truth. Every
insight (per-swara mastery, sessions list, interval stats, preset breakdown,
...) is derived from it at query time via `src/progress/queries.js`.

| Field         | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `id`          | ULID — sortable, unique, safe to retry/upsert             |
| `user_id`     | Supabase anonymous user; `'local'` in localStorage        |
| `ts`          | Wall-clock time                                           |
| `session_id`  | Groups attempts into one quiz session                     |
| `question_id` | Groups attempts within one question (1+ notes)            |
| `position`    | 0-indexed position within the question                    |
| `played`      | Swara id that was played                                  |
| `answered`    | Swara id the user picked (nullable)                       |
| `correct`     | Whether they matched                                      |
| `response_ms` | Approximate per-note time                                 |
| `ctx`         | JSONB bag — mode, level, preset, interval, key, instrument |
