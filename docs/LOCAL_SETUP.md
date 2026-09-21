# Local Setup Guide (Z0)

Step-by-step instructions to clone Z0 and run it on your own machine.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 22.x or later | `node --version` |
| pnpm | 10.x | Comes via Corepack (see below) — do **not** use npm directly |
| PostgreSQL | 14 or later | Any option in step 3 works |
| v0 API key | — | Per user (BYOK), from https://v0.app/settings/keys |
| Google OAuth credentials | — | Optional; only for "Continue with Google" |

## 1. Clone and install

```bash
git clone https://github.com/ravirraj/Z0.git
cd Z0
```

If `pnpm` is not on your PATH, enable it through Corepack (ships with Node.js):

```bash
corepack prepare pnpm@10.29.3 --activate
# If plain `pnpm` is still not found (some Windows setups), use:
corepack pnpm install
```

Then install dependencies:

```bash
pnpm install
```

> Windows note: if you see "running scripts is disabled", call `npm.cmd` /
> `pnpm` through Corepack as above instead of the `.ps1` shims.

## 2. Set up PostgreSQL

Pick **one** option. Any PostgreSQL 14+ works (local install, Docker, or a
hosted provider like Neon/Supabase).

**Option A — Docker (simplest if you have Docker):**

```bash
docker run -d --name z0-postgres \
  -e POSTGRES_USER=z0 -e POSTGRES_PASSWORD=z0 -e POSTGRES_DB=z0 \
  -p 5432:5432 postgres:18
```

Connection string: `postgresql://z0:z0@localhost:5432/z0`

**Option B — existing local PostgreSQL:**

```sql
CREATE ROLE z0 LOGIN PASSWORD 'choose-a-password';
CREATE DATABASE z0 OWNER z0;
```

Connection string: `postgresql://z0:choose-a-password@localhost:5432/z0`
(adjust host/port if yours differs).

**Option C — hosted Postgres (Neon, Supabase, etc.):**

Create a database in their dashboard and copy the connection string.
No local setup needed.

## 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

| Variable | Required | How to fill |
|----------|----------|-------------|
| `POSTGRES_URL` | Yes | Connection string from step 2 |
| `BETTER_AUTH_SECRET` | Yes | Generate with `openssl rand -base64 32` (dev fallback exists, but set a real one) |
| `BETTER_AUTH_URL` | Recommended | `http://localhost:3000` locally; your public URL in production |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Only for Google sign-in | See step 5 |
| `V0_API_URL` | No | Leave empty unless you use a custom/enterprise v0 endpoint |

## 4. Run database migrations

```bash
pnpm db:migrate
```

This creates the `user`, `session`, `account`, `verification`, and
`chat_ownerships` tables. If you see a `migration_required` (503) error in the
app later, it means this step was skipped — run it and restart.

## 5. Google OAuth setup (optional)

Email/password sign-in works without this. For "Continue with Google":

1. Go to https://console.cloud.google.com/apis/credentials.
2. Create a project (or select one) and create an **OAuth client ID**
   (type: **Web application**).
3. Add an authorized redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
4. Copy the client ID and secret into `.env` and restart the dev server.

## 6. Start the app

```bash
pnpm dev
```

Open http://localhost:3000 and **create an account** (register page).
Then open the account menu → **API Key** and paste your v0 API key
(from https://v0.app/settings/keys). The key is validated live against the
v0 API and stored encrypted — any current v0 key format is accepted.

## 7. Verify your setup

- [ ] `pnpm typecheck` passes with no errors
- [ ] Homepage loads at http://localhost:3000
- [ ] You can register and sign in (and with Google, if configured)
- [ ] Saving a v0 API key succeeds (wrong keys are rejected with "Invalid v0 API key")
- [ ] Sending a prompt streams a generated component

## Troubleshooting

| Symptom | Cause / Fix |
|---------|-------------|
| Setup screen listing env vars | `.env` is missing `POSTGRES_URL` or `BETTER_AUTH_SECRET`. Fill them in and restart (`pnpm dev` picks up `.env` on boot). |
| `migration_required` / 503 on API key save | Database tables are missing. Run `pnpm db:migrate` and restart. |
| `Database not initialized` | `POSTGRES_URL` is empty or unreachable. Check the string and that Postgres is running. |
| "Invalid v0 API key" for a fresh key | The key is rejected by the v0 API itself. Generate a new one at https://v0.app/settings/keys and retry. A revoked/at-limit key also fails validation. |
| Google button errors | `GOOGLE_CLIENT_ID/SECRET` missing or redirect URI mismatch in Google Cloud Console. Email login still works. |
| Port 3000 already in use | Another dev server is running. Stop it or run `pnpm dev -- --port 3001` (and update `BETTER_AUTH_URL` + Google redirect URI accordingly). |
| `pnpm` not recognized (Windows) | Use `corepack pnpm <command>` (see step 1). |
| Auth broke after pulling new code | If a new migration exists, run `pnpm db:migrate`. Auth migrations can reset local accounts — just re-register. |

## Useful scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Migrate + production build |
| `pnpm start` | Start production server |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Inspect the database in Drizzle Studio |
| `pnpm typecheck` | TypeScript check (must pass before PRs) |
| `pnpm check:fix` | Auto-fix lint/format with Biome |
