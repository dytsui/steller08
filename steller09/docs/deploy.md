# steller09 部署收尾说明（Cloudflare + Render）

## 0) 必填真实值（手工）
1. `apps/web/wrangler.jsonc`
   - `d1_databases[0].database_id` = 真实 D1 ID
   - `vars.ANALYZER_BASE_URL` = 真实 Render analyzer URL
2. Cloudflare Secrets
   - `GEMINI_API_KEY`
   - `ANALYZER_TOKEN`
   - `AUTH_SECRET`
3. 非交互部署环境变量
   - `CLOUDFLARE_API_TOKEN`

## 1) Cloudflare 资源
- D1: `steller09`
- R2: `steller09-videos`, `steller09-keyframes`, `steller09-shares`, `steller09-exports`

## 2) 应用 D1 schema
```bash
cd steller09
npx wrangler d1 execute steller09 --file cloudflare/schema.sql
```

## 3) 设置 secrets
```bash
cd steller09/apps/web
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put ANALYZER_TOKEN
npx wrangler secret put AUTH_SECRET
```

## 4) 构建与部署命令
```bash
cd steller09
npm install
npm run typecheck:web
npm run build:web
cd apps/web
npx @opennextjs/cloudflare build
npx @opennextjs/cloudflare deploy
```

## 5) 常见阻塞
- `whoami` 未认证：需要 `wrangler login` 或在 CI 注入 `CLOUDFLARE_API_TOKEN`。
- `database_id` 仍为占位符会导致 D1 绑定无效。
- Render 使用占位 URL 时深分析不可用。
