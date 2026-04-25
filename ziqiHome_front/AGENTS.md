# ziqiHome_front Agent 约束

## 文档定位

- 本文件是 AI 进入前端工程后的第一入口，只保留高频决策规则，不写过长背景说明。

## 项目边界

- 这是个人网站前端，包含公开站点和 `/admin` 管理端。
- 公开站点使用 `React + TypeScript + CSS Modules`，管理端局部使用 `Ant Design`。
- 不随意引入新的框架、状态管理库或重型 UI 组件库。
- 管理端相关内容必须保持在 `/admin` 路由和 `src/pages/admin/`、`src/components/admin/` 内，避免混入公开站点布局。

## 当前主要模块

- 公开站点：`HomePage`、`LatestPage`、`BlogPage`、`ProjectsPage`、`ContactPage`
- 管理端：博客、项目、moments、联系平台、用户、登录页
- 鉴权：`src/auth/` 中的 `AuthProvider`、`RequireAdminAuth`、`authStore`
- 接口客户端：`src/api/siteClient.ts`、`src/api/adminClient.ts`、`src/api/authClient.ts`
- 类型定义：`src/types/content.ts`、`src/types/admin.ts`

## 修改位置判断

- 路由和全站结构：改 `src/App.tsx`
- 公开站点布局：改 `src/components/MainLayout.tsx`
- 管理端布局：改 `src/components/admin/AdminLayout.tsx`
- 公开页面：改 `src/pages/`
- 管理页面：改 `src/pages/admin/`
- 复用组件：改 `src/components/`
- 接口请求：改 `src/api/`
- 登录状态：改 `src/auth/`
- 类型契约：改 `src/types/`
- 静态个人信息：改 `src/data/siteContent.ts`
- 主题变量：改 `src/index.css`

## 编码规则

- 页面组件负责页面布局、数据组合和页面级交互。
- 复用组件只负责展示或结构，不把路由判断和页面级业务塞进通用组件。
- 优先数据驱动，不把大量列表、卡片和文案硬编码进 JSX。
- 新增接口字段时先补 `src/types/`，再改 API client、页面和组件。
- 接口模型尽量对齐后端 DTO，不在页面里堆临时字段转换。
- 样式优先复用 CSS 变量和 CSS Modules，不随意写裸色值。
- 除样式文件外，新增函数、关键转换和非直观逻辑应写必要注释。

## 文档同步

以下改动必须同步更新 `docs/` 和 `README.md`：

- 新增页面或管理模块
- 调整路由或导航结构
- 修改登录鉴权流程
- 修改接口契约或数据来源
- 修改主题系统或重要工程约束
- 改变内容组织方式

## 质量门禁

每次功能改动后至少执行：

```bash
npm run lint
npm run build
```

如果这两步不过，不应视为改动完成。
