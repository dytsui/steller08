# steller09

全新重建的高尔夫 AI 教练平台（Next.js + OpenNext + Cloudflare Workers + D1 + R2）。

## 核心链路
1. 注册 / 登录
2. 创建学员
3. 上传或拍摄视频
4. 创建 session
5. 轻分析
6. 深分析（转发 R2 文件给 Render 分析器）
7. 生成报告（Rules + Gemini 降级）
8. 写入 D1
9. 历史可见
10. Pro 端查看学员与分析记录

## 快速启动
```bash
npm install
npm run dev:web
```

## 构建
```bash
npm run build:web
npm --workspace apps/web run typecheck
npx @opennextjs/cloudflare build --cwd apps/web
```

部署详见 `docs/deploy.md`。
