# Steller08 deployment

## 1) Cloudflare resources

Create these resources first:

- D1 database: `steller08`
- R2 buckets:
  - `steller08-videos`
  - `steller08-keyframes`
  - `steller08-shares`
  - `steller08-exports`

Apply schema:

```bash
wrangler d1 execute steller08 --file=cloudflare/schema.sql
```

## 2) Web app deploy

Cloudflare Pages / Workers root directory:

- Root: `apps/web`
- Build command: `npx @opennextjs/cloudflare build`
- Deploy command: `npx @opennextjs/cloudflare deploy`

Bindings expected by code:

- D1: `DB`
- R2: `VIDEOS`, `KEYFRAMES`, `SHARES`, `EXPORTS`

Required vars:

- `NEXT_PUBLIC_APP_URL`
- `ANALYZER_BASE_URL`
- `ANALYZER_TOKEN`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_API_BASE`
- `NEWS_API_BASE`
- `AUTH_SECRET`

## 3) Render analyzer deploy

Service root:

- `services/analyzer`

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment:

- `ANALYZER_TOKEN` should match Cloudflare side if you later enforce bearer auth.

## 4) Runtime chain

1. Create student in `/students`
2. Set current student
3. Use `/upload` or `/capture`
4. Browser performs real quick scan
5. `/api/sessions` writes source video to `VIDEOS` and session row to D1
6. `/api/analyze/light` writes quick result to D1
7. `/api/analyze/deep` calls Render analyzer
8. Deep result writes keyframe images to `KEYFRAMES`, writes structured result to D1, then stores share cards to `SHARES` when requested
9. `/analysis/[id]`, `/history`, `/training` read only persisted data

## 5) Important behavior

- No fake fallback in light analysis API: it rejects requests without a real browser snapshot.
- Deep analysis errors are surfaced back to the UI.
- Current student is stored in cookie + local cache, and every created session uses the selected `student_id`.

## 6) Auth and portals

- `/login` and `/register` are the public identity entry points.
- `role=user` enters `/app` (用户端).
- `role=pro` enters `/pro` (Pro端 / Pro工作台).
- D1 auth tables: `users`, `auth_sessions`, `coach_student_links`, `coach_invites`.
