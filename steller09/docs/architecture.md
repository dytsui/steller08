# steller09 架构说明（仅继承需求，不继承 steller08 坏代码）

## steller08 主要坏点（需求保留，结构不继承）
- 历史上出现过多套路由/目录镜像，易导致 import/export 断裂。
- 业务逻辑、权限、数据访问分散在多处，难以保证 user/pro scope 一致。
- Cloudflare 部署参数、运行时依赖、环境变量读取方式曾出现不统一。

## steller09 设计原则
- 单一 App Router + 单一 API 实现。
- 统一服务端分层：
  - `lib/env.ts` 统一环境读取
  - `lib/runtime.ts` 统一 Worker 绑定
  - `lib/db.ts` 统一 D1 SQL 执行
  - `lib/auth.ts` 统一会话
  - `lib/scope.ts` 统一 user/pro/admin 访问范围
  - `lib/services.ts` 统一业务主链路
- 深分析链路：Worker 从 R2 读取视频，再转发 Render analyzer。
- 报告链路：规则报告为基础，若有 `GEMINI_API_KEY` 则增强。

## 核心主链路
1. `/api/auth/register` / `/api/auth/login`
2. `/api/students` 创建学员
3. `/api/media` 上传并建 session
4. `/api/analyze/light`
5. `/api/analyze/deep`
6. `/api/report`
7. `/api/history` 查询历史
8. `/pro` + `/pro/students` 查看 Pro 视图
