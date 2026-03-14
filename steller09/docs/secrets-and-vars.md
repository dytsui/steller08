# steller09 vars / secrets（部署收尾）

## vars（wrangler.jsonc）
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_DEFAULT_LOCALE
- NEWS_API_BASE
- ANALYZER_BASE_URL  ← 必须替换占位 URL
- GEMINI_MODEL
- GEMINI_API_BASE

## secrets（Cloudflare secret）
- GEMINI_API_KEY
- ANALYZER_TOKEN
- AUTH_SECRET

## CI/非交互部署额外要求
- CLOUDFLARE_API_TOKEN

## 当前状态提示
- 若 `apps/web/wrangler.jsonc` 中 `database_id` 还是 `REPLACE_WITH_D1_DATABASE_ID`，则不可部署。
