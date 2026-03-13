# Steller08 架构叙述

## 产品定位
Steller08 从单体分析工具升级为双门户训练平台：
- 用户端：面向普通训练者与学员
- Pro端：面向教练、工作室、练习场、机构

## 核心原则
1. 先有可信分析，再有 AI 教练输出
2. 轻分析与深分析职责严格分离
3. 用户端 / Pro端 统一账号体系，不做两套割裂系统
4. D1 是主业务数据层，R2 存视频、关键帧、分享图
5. 没有真实分析结果，不展示假 Tempo / 假评分 / 假问题

## 双门户结构
### 用户端
- `/app`
- `/app/capture`
- `/app/upload`
- `/app/history`
- `/app/training`

定位：拍摄、上传、查看分析结果、执行训练计划、跟踪成长趋势。

### Pro端
- `/pro`
- `/pro/students`
- `/pro/invites`
- 后续可继续扩展 `/pro/analysis/[sessionId]`、`/pro/training`

定位：管理用户、复盘分析、下发训练计划、邀请绑定、沉淀训练关系。

## 登录与权限
### 公共入口
- `/login`
- `/register`

### 账号体系
- `users`：登录身份
- `auth_sessions`：服务端会话
- `students`：学员业务档案
- `coach_student_links`：Pro 与学员的关系层
- `coach_invites`：邀请码绑定

### 角色
- `user`
- `pro`
- `admin`

### 路由权限
- `/app/**`：登录后可进入用户端
- `/pro/**`：仅 Pro / admin 可进入

## 训练分析主链路
1. 选择当前学员
2. 普通拍摄 / 普通上传 / Screen Mode 实拍 / Screen Mode 上传
3. Cloudflare 轻分析：实时骨架、9宫格、HUD、阶段识别、初步 Tempo
4. Render 深分析：抽帧、关键帧精修、Tempo 精算、结构指标、问题识别、Screen 预处理
5. 回写 D1 / R2
6. 分析页、历史页、训练页同步刷新
7. 用户端看训练计划，Pro端做复盘与下发

## AI 定位
AI 不直接猜原始视频结论，只吃结构化结果：
- primary issue
- priority reason
- 3 秒小贴士
- 训练计划
- 成长追踪摘要

## 页面层级
### 未登录首页
- 产品定位
- 用户端 / Pro端入口
- 开始拍摄 / 上传视频 / Screen Mode
- 高尔夫新闻流

### 分析页
- 总览
- 挥杆流程示意图
- Pro 对比
- 问题诊断
- 训练计划

## Cloudflare 数据层
### D1
- users
- auth_sessions
- coach_student_links
- coach_invites
- students
- sessions
- analysis_results
- keyframes
- metrics
- issues
- reports
- training_plans
- share_logs
- drills
- news_cache
- app_settings

### R2
- videos
- keyframes
- shares
- exports

## 部署原则
填完 Cloudflare、D1、R2、Render、Gemini、AUTH_SECRET 配置后，不改代码即可继续推进双端运营版。
