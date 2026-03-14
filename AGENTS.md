# AGENTS.md - steller09

## 项目结构
- `apps/web`: Next.js App Router + OpenNext Cloudflare 入口
- `cloudflare/schema.sql`: D1 全量表结构
- `docs/deploy.md`: 部署步骤
- `docs/secrets-and-vars.md`: 变量与密钥策略

## 启动方式
- `npm install`
- `npm run dev:web`

## 构建方式
- `npm run build:web`
- `npm run typecheck:web`
- `npx @opennextjs/cloudflare build --cwd apps/web`

## 部署方式
- 配置 `apps/web/wrangler.jsonc`
- `wrangler secret put ...`
- `npx @opennextjs/cloudflare deploy --cwd apps/web`

## Done Definition
- Next build 成功
- OpenNext build 成功
- 指定页面与 API 路由均可解析
- D1 schema 与代码字段一致
- 不存在未解析 import/export

## 不允许做的事
- 不允许保留无效/重复路由（如 app/app 镜像）
- 不允许散落读取 env（必须集中到 `lib/env.ts`）
- 不允许绕过 scope 权限校验
- 不允许提交 build 失败代码
