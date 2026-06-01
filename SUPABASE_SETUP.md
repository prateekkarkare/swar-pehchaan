# Supabase setup (cloud sync + Google login)

The app works fully on localStorage in local dev when Supabase env vars are not
set. When configured, it **requires Google sign-in** and stores each user's
progress in their own account.

## 1. Create a project

1. Sign in to https://supabase.com and create a new project.

## 1a. Enable Google sign-in

1. In **Google Cloud Console** → APIs & Services → Credentials, create an
   **OAuth 2.0 Client ID** (type: Web application).
   - **Authorized redirect URI:**
     `https://<project-ref>.supabase.co/auth/v1/callback`
     (e.g. `https://dbktmrijojtozawzamyb.supabase.co/auth/v1/callback`)
   - Copy the **Client ID** and **Client Secret**.
2. In **Supabase → Authentication → Providers → Google**, paste the Client ID
   and Client Secret, and enable the provider.
3. In **Supabase → Authentication → URL Configuration**, add to **Redirect URLs**:
   - `http://localhost:3000`
   - `https://prateekkarkare.github.io/swar-pehchaan/`
4. (Optional) Disable **Anonymous sign-ins** — the app no longer uses them.

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

## 4. Local dev legacy migration

In **local dev only** (Supabase env vars unset), the first boot with a populated
`ear-training-progress` (v1) localStorage key explodes the old sessions into
per-note attempts. In cloud mode this is skipped — each user's data lives in
Supabase under their auth id.

## 5. One-time: reassign existing anonymous data to a real account

If you practiced earlier while the app used anonymous auth, those rows are owned
by an anonymous `auth.users` id. After signing in with Google **once** (which
creates your real account), reassign them:

```sql
-- 1. See the distinct owners currently in the table.
select user_id, count(*) from attempts group by user_id;

-- 2. Find your real (Google) account id.
select id, email from auth.users where email = 'prateek.karkare@gmail.com';

-- 3. Repoint the anonymous rows to your real id.
update attempts
set user_id = '<your-google-auth-uuid>'
where user_id = '<old-anonymous-uuid>';

-- 4. (Optional) remove the now-empty anonymous user.
delete from auth.users where id = '<old-anonymous-uuid>';
```

Run these in the Supabase **SQL Editor**. RLS does not block the SQL Editor
(it runs as the service role), so this works without any app changes.

## Data model

A single append-only `attempts` event log is the source of truth. Every
insight (per-swara mastery, sessions list, interval stats, preset breakdown,
...) is derived from it at query time via `src/progress/queries.js`.

| Field         | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `id`          | ULID — sortable, unique, safe to retry/upsert             |
| `user_id`     | Google account id (`auth.users`); `'local'` in local dev  |
| `ts`          | Wall-clock time                                           |
| `session_id`  | Groups attempts into one quiz session                     |
| `question_id` | Groups attempts within one question (1+ notes)            |
| `position`    | 0-indexed position within the question                    |
| `played`      | Swara id that was played                                  |
| `answered`    | Swara id the user picked (nullable)                       |
| `correct`     | Whether they matched                                      |
| `response_ms` | Approximate per-note time                                 |
| `ctx`         | JSONB bag — mode, level, preset, interval, key, instrument |
