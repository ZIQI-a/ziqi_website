# 前端工程文档

这组文档面向 AI 协作和开发维护，用于快速理解 `ziqiHome_front` 的项目结构、页面边界、管理端规则和后续规划。

## 文档索引

- [项目概览](./project-overview.md)
- [前端架构说明](./architecture.md)
- [管理页说明](./admin-management.md)
- [开发流程与质量门禁](./engineering-workflow.md)
- [路线图与待办](./roadmap.md)

## 当前状态

- 技术栈：`Vite + React + TypeScript + react-router-dom + CSS Modules`
- 管理端：`Ant Design`，仅限 `/admin`
- 公开页面：主页、最新、写点、做点、找我鸭
- 管理页面：博客、moments、项目、联系平台、用户
- 鉴权：`/admin/login` 登录，`/admin/*` 路由守卫保护
- 数据来源：公开页主要走 `/api/site/*`，管理页走 `/api/admin/*`

## 使用建议

- 初次接手先看“项目概览”和“前端架构说明”。
- 修改后台页面先看“管理页说明”。
- 修改接口、路由或数据流前先看“开发流程与质量门禁”。
- 规划功能优先看“路线图与待办”。
