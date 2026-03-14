# steller09 部署验证记录（本次执行）

## 已执行命令与结果
1. `npm install`
   - 结果：失败（403 Forbidden）
   - 原因：当前环境无法访问 npm registry 的 `@opennextjs/cloudflare` 包。

2. `npm run build:web`
   - 结果：成功
   - 说明：`next build --webpack` 完成，核心页面与 API 路由完成编译。

3. `npx @opennextjs/cloudflare build --cwd apps/web`
   - 结果：失败（CLI 在 root + --cwd 场景下交互报 missing config）

4. `cd apps/web && npx @opennextjs/cloudflare build`
   - 结果：失败
   - 原因：当前环境实际加载的是 `next@16.1.6` 与 `@opennextjs/cloudflare@1.17.1`（node_modules 现状），在 OpenNext bundle 阶段出现 `next-server.js` 依赖解析错误。

5. `cd apps/web && npx wrangler whoami`
   - 结果：失败（未登录）

6. `cd apps/web && npx @opennextjs/cloudflare deploy`
   - 结果：失败
   - 原因：非交互环境缺少 `CLOUDFLARE_API_TOKEN`。

## 结论
- `next build` 通过。
- OpenNext build / deploy 在当前容器受 **依赖下载受限 + Cloudflare 凭据缺失** 阻塞，无法完成最终部署。
