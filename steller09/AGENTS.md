# AGENTS.md - steller09

## 项目结构
- `apps/web`: Next.js + OpenNext Cloudflare Worker 项目
- `cloudflare/schema.sql`: D1 schema
- `docs/deploy.md`: 部署手册
- `docs/secrets-and-vars.md`: 变量与密钥说明

## 启动与构建
- `npm install`
- `npm run build:web`
- `npm run typecheck:web`
- `npm run open-next:build`

## 部署
- 配置 `apps/web/wrangler.jsonc`
- 配置 secrets
- `npm run open-next:deploy`

## Done Definition
- Next build 通过
- OpenNext build 通过
- 核心页面 / API 可解析
- D1 schema 与代码字段匹配
- 无未解析 import/export

## 禁止事项
- 不要依赖 steller08 旧代码
- 不要散落 env 读取
- 不要绕过 scope 权限
