# 前端架构说明

## 技术栈

- Vite
- React 19
- TypeScript
- react-router-dom
- CSS Modules
- Ant Design，仅用于管理端
- ESLint

## 目录结构

```text
src/
  api/          auth/admin/site 三类接口客户端
  auth/         登录态、上下文和后台路由守卫
  components/   公开站点组件与 admin 通用组件
  config/       资源和基础配置
  data/         仍保留的静态个人信息
  pages/        公开页面
  pages/admin/  管理页面
  theme/        Ant Design 管理端主题
  types/        接口类型和页面数据类型
  App.tsx       路由入口
  main.tsx      应用挂载入口
```

## 路由分层

`App.tsx` 负责所有页面级路由：

- 公开站点挂载在 `MainLayout`
- `/admin/login` 独立于后台布局
- `/admin/*` 先经过 `RequireAdminAuth`
- 通过鉴权后进入 `AdminLayout`

这样做可以避免公开站点导航和管理端导航耦合。

## 数据请求分层

- `siteClient.ts`：公开站点接口，只请求 `/api/site/*`
- `adminClient.ts`：后台 CRUD 接口，请求 `/api/admin/*`
- `authClient.ts`：登录、登出和恢复会话，请求 `/api/admin/auth/*`

页面组件只消费这些 client，不直接拼复杂 fetch 逻辑。

## 鉴权分层

- `AuthProvider`：应用启动时请求 `/api/admin/auth/me` 恢复会话
- `authStore`：提供 `useAuth` 和认证状态上下文
- `RequireAdminAuth`：保护 `/admin/*` 路由
- `AdminLoginPage`：登录成功后跳回原访问地址

登录态以服务端 session 为准，前端不自行保存 token。

## 组件分层

公开站点：

- `MainLayout`：顶部导航、主题切换、页脚
- `PageHeader`：二级页面标题
- `BlogCard`、`ProjectCard` 等：展示型组件

管理端：

- `components/admin/AdminLayout`：后台导航和账户操作
- `AdminPageHeader`：后台页面标题和操作区
- `AdminCrudShared.module.css`：后台 CRUD 页面通用样式

## 样式策略

- 公开站点使用 CSS Modules 和 `src/index.css` 中的主题变量
- 管理端使用 Ant Design 组件，但通过 `adminTheme.ts` 和 CSS Modules 贴合主站视觉
- 不在组件中散落大量裸色值

## 当前边界

- 页面状态以本地 `useState/useEffect` 为主，当前不需要额外状态管理库
- 后台页面走懒加载，避免 Ant Design 影响公开站点首屏
- 首页仍保留部分静态个人内容，后续可按接口逐步迁移
