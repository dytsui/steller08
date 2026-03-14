# AGENTS.md

## Mission

This repository contains legacy code and unstable experiments.

Your job is **not** to patch the legacy project blindly.

Your primary task is to create and maintain a **new, clean, buildable project** under:

- `steller09/`

The old `steller08` code may be used only for understanding business requirements and UI ideas.
It must **not** be treated as a reliable implementation reference.

---

## Hard rules

You must obey all rules below.

### Rule 1: Never fake completion

Never say a task is complete unless all required verification steps have passed.

A task is **NOT complete** if any of the following is true:

- install fails
- typecheck fails
- `next build` fails
- `npx @opennextjs/cloudflare build` fails
- unresolved imports remain
- missing exports remain
- route handlers reference non-existent functions
- D1 schema and code are mismatched
- Cloudflare configuration is incomplete

If any failure exists, explicitly report:

1. what failed
2. why it failed
3. what you changed
4. what still blocks completion

Do not say:
- “done”
- “completed”
- “ready”
- “fixed”

unless verification has actually passed.

---

### Rule 2: Do not damage legacy code

Do **not** modify existing legacy `steller08` core files unless absolutely necessary.

Prefer creating new code under:

- `steller09/`

If legacy code must be touched, minimize the change and explain exactly why.

Do not perform broad speculative refactors in old code.

---

### Rule 3: New work belongs in steller09

All new architecture, new routes, new libraries, new components, and new deployment files must live under:

- `steller09/`

Do not scatter new files across unrelated legacy directories.

---

### Rule 4: No broken code allowed

Do not introduce or keep any of the following:

- unresolved imports
- missing exports
- dead routes
- placeholder functions without implementation
- duplicate conflicting logic
- half-migrated architecture
- dead files that are referenced nowhere
- pages that compile but cannot function
- routes that rely on missing environment variables without documenting them

Every import must resolve.
Every export used must exist.
Every route must compile.

---

### Rule 5: Buildability over cleverness

Prefer small, working, verifiable implementations over large speculative rewrites.

Do not optimize for fancy architecture at the expense of reliability.

If forced to choose:
- choose code that builds
- choose code that deploys
- choose code that is easy to reason about

---

## Required working scope for steller09

The new project under `steller09/` must support at minimum:

1. register
2. login
3. logout
4. role-aware routing (`user`, `pro`)
5. create student
6. list students
7. create session
8. upload video
9. light analysis
10. deep analysis
11. report generation
12. D1 persistence
13. history display
14. pro-side student/history visibility
15. Cloudflare deployment configuration

These do not need to be perfect, but they must be structurally real and buildable.

---

## Required structure for steller09

Expected structure should look roughly like:

- `steller09/apps/web`
- `steller09/apps/web/app`
- `steller09/apps/web/components`
- `steller09/apps/web/lib`
- `steller09/apps/web/public`
- `steller09/cloudflare`
- `steller09/docs`
- `steller09/README.md`
- `steller09/AGENTS.md`

Use a clear, maintainable layout.

---

## Cloudflare rules

The project must be compatible with:

- Cloudflare Workers
- OpenNext
- D1
- R2

Must include:

- `wrangler.jsonc`
- D1 schema
- deployment docs
- secrets and vars documentation

Secrets must never be exposed to the frontend.

Do not place secrets in public config.

Examples of secrets:
- `GEMINI_API_KEY`
- `ANALYZER_TOKEN`
- `AUTH_SECRET`

Examples of normal vars:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEFAULT_LOCALE`
- `ANALYZER_BASE_URL`
- `GEMINI_MODEL`
- `GEMINI_API_BASE`

---

## Database rules

D1 schema and code must match exactly.

If code reads or writes a field, that field must exist in schema.

If schema defines a column, naming must be mapped consistently in code.

Avoid silent mismatches between:
- snake_case DB fields
- camelCase TypeScript fields

---

## Scope and authorization rules

Use a single clear scope/ownership approach.

If implementing authorization helpers, keep them centralized.

Do not create multiple conflicting permission systems.

Expected concepts include:
- `scopeFromPayload`
- `getRequestScope`

User access:
- can only access own records

Pro access:
- can only access coach-owned student/session/analysis records

Admin access:
- may access all if implemented

---

## Verification checklist

Before claiming success, you must run and report:

1. dependency install
2. typecheck
3. `next build`
4. `npx @opennextjs/cloudflare build`

If tests exist, run them too.

If a command fails, include the exact failure summary.

---

## Pull request rules

After completing work, create a GitHub Pull Request whenever possible.

Final output must include:

1. summary of changes
2. list of modified files
3. build verification results
4. deployment notes
5. vars/secrets required
6. known risks or remaining gaps
7. GitHub PR link

Do not stop at “code changed in environment”.
Changes must be reviewable in GitHub.

---

## Response style rules for coding tasks

When reporting progress:

- be concrete
- name files
- name commands
- name failures
- name remaining blockers

Do not use vague claims like:
- “should work”
- “probably fixed”
- “almost done”

Use explicit status:
- PASSED
- FAILED
- BLOCKED

---

## Preferred workflow

Use this order:

1. inspect existing repository
2. identify legacy risks
3. design clean solution under `steller09/`
4. implement smallest viable working version
5. run verification
6. fix failures
7. document deployment
8. create PR
9. report final status

---

## Definition of done

Work is only done when all of the following are true:

- new code exists under `steller09/`
- required files exist
- imports resolve
- exports resolve
- install passes
- build passes
- OpenNext Cloudflare build passes
- deployment docs exist
- vars/secrets docs exist
- GitHub PR exists or a clear reason is given why PR creation was blocked

If any item above is missing, work is not done.
