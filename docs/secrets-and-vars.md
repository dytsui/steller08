# Vars / Secrets 约定

## Vars（公开非敏感）
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEFAULT_LOCALE`
- `NEWS_API_BASE`
- `ANALYZER_BASE_URL`
- `GEMINI_MODEL`
- `GEMINI_API_BASE`

## Secrets（仅服务端）
- `GEMINI_API_KEY`
- `ANALYZER_TOKEN`
- `AUTH_SECRET`

## 安全原则
- 前端代码不读取 secrets。
- 所有环境读取集中在 `apps/web/lib/env.ts`。
