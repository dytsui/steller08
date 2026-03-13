# Steller08

Steller08 是基于 Cloudflare Workers / OpenNext、Cloudflare D1 + R2、Render FastAPI、Python + OpenCV + MediaPipe Pose 的高尔夫 AI 教练一期源码包。

## 这版重点
- 首页手机优先，精准分析下面直接接中文 Golf 新闻流
- 学员、上传、拍摄、分析、历史、训练主链路保留
- 新增问题列表页与单问题详情页
- 新增 issue catalog / drill catalog / issue-to-drills 训练映射
- 分析页增加阶段通过/警告/失败条带
- 训练页增加最近 5 次改善率、重点问题与 Drill 推荐
- 支持普通模式与 Screen Mode 的轻分析 / 深分析链路

## 工程目录
- `apps/web`：Next.js 16 + OpenNext + Cloudflare
- `services/analyzer`：Render FastAPI 深度分析服务
- `cloudflare/schema.sql`：D1 表结构
- `docs/deploy.md`：部署说明
- `docs/validation.md`：本地源码级校验记录

## 部署前只需要填的配置
- Cloudflare D1
- Cloudflare R2：`VIDEOS` `KEYFRAMES` `SHARES` `EXPORTS`
- Render analyzer 地址与令牌
- Gemini 变量

## 注意
- 没有真实 snapshot 时，轻分析 API 直接拒绝，不会生成假结果。
- 深分析失败会回到错误状态，不会伪造正式分析。
- 当前学员通过 cookie + local cache 同步，session 会写入正确 `student_id`。
