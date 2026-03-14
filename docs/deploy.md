# steller09 部署指南（Cloudflare Workers + OpenNext）

## 1) 准备资源
- D1: `steller09`
- R2: `steller09-videos`, `steller09-keyframes`, `steller09-shares`, `steller09-exports`

## 2) 应用 schema
```bash
wrangler d1 execute steller09 --file cloudflare/schema.sql
```

## 3) 配置 vars
编辑 `apps/web/wrangler.jsonc` 的 `vars`：
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_DEFAULT_LOCALE
- NEWS_API_BASE
- ANALYZER_BASE_URL
- GEMINI_MODEL
- GEMINI_API_BASE

## 4) 配置 secrets
```bash
cd apps/web
wrangler secret put GEMINI_API_KEY
wrangler secret put ANALYZER_TOKEN
wrangler secret put AUTH_SECRET
```

## 5) 构建并部署
```bash
npm install
npm --workspace apps/web run build
npx @opennextjs/cloudflare build --cwd apps/web
npx @opennextjs/cloudflare deploy --cwd apps/web
```


## 0) 部署前认证（CI / 非交互环境必需）
在非交互环境需要预先设置：
```bash
export CLOUDFLARE_API_TOKEN=your_token
```
并确保 token 至少具备 Workers、D1、R2 的读写权限。

此外，请把 `apps/web/wrangler.jsonc` 中的 `database_id` 从 `REPLACE_WITH_D1_DATABASE_ID` 替换为真实值。
