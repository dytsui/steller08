# steller09 新架构说明

- 单一 App Router 结构，去除旧版重复目录。
- 统一权限入口：`lib/scope.ts`。
- 统一环境变量入口：`lib/env.ts`。
- 统一数据访问：`lib/db.ts` + `cloudflare/schema.sql`。
- 上传与分析链路：`/api/media` -> `/api/analyze/light` -> `/api/analyze/deep` -> `/api/report`。
- 深分析由 Worker 读取 R2 二进制并转发 Render 分析器，避免 Render 反向拉取受保护 URL。
