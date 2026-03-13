# Steller08 Cloudflare build fix

This patch forces Next.js 16 to build with webpack instead of Turbopack inside `apps/web`.

Why:
- Cloudflare/OpenNext was invoking the app's `build` script from `apps/web/package.json`.
- The failing log shows `Turbopack build failed` with false-negative module/export resolution for `@/lib/scope` and `lib/d1.ts`.
- TypeScript structure is present in the repo, so this is treated as a Turbopack/OpenNext build-path compatibility issue.

Changed file:
- `apps/web/package.json`

Updated scripts:
- `dev`: `next dev --webpack`
- `build`: `next build --webpack`

Cloudflare Pages build command can stay:
- `npx @opennextjs/cloudflare build`
