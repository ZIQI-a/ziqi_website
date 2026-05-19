# Ziqi Archive Frontend

`ziqiHome_front` 是个人网站 `Ziqi Archive` 的前端工程，负责公开站点展示和后台管理端交互。项目基于 `Vite + React + TypeScript + react-router-dom + CSS Modules`，管理端局部使用 `Ant Design`。

## 当前能力

- 公开站点：主页、最新动态、博客列表、项目列表、联系平台页
- 后台管理：博客、项目、动态 moments、联系平台、用户管理
- 登录鉴权：`/admin/login` 登录，`/admin/*` 通过路由守卫保护
- 接口联动：公开页通过 `/api/site/*` 获取数据，管理页通过 `/api/admin/*` 做 CRUD
- 主题系统：默认暗色，支持亮色切换
- 响应式布局：公开站点和管理端都按移动端可用性设计

## 技术栈

- `Vite`：前端构建与本地开发服务
- `React 19`：页面和组件开发
- `TypeScript`：类型约束和接口契约
- `react-router-dom`：公开站点和管理端路由
- `CSS Modules`：公开站点和局部组件样式
- `Ant Design`：仅用于 `/admin` 管理端
- `ESLint`：基础代码检查

## 目录说明

```text
src/
  api/          后端接口客户端，按 auth/admin/site 分组
  auth/         登录态上下文、路由守卫和会话状态
  components/   公开站点复用组件与 admin 通用组件
  config/       静态资源映射等配置
  data/         仍保留的静态个人信息和首页基础数据
  pages/        公开页面与 pages/admin 后台页面
  theme/        管理端 Ant Design 主题配置
  types/        前后端接口和页面数据类型
  App.tsx       路由配置入口
  main.tsx      React 挂载入口
```

## 本地启动

先启动后端服务，再启动前端：

```bash
npm install
npm run dev
```

默认前端开发服务运行在 `http://localhost:5174`，并会把 `/api/*` 转发到 `http://localhost:8081`。如果需要改后端地址，可以配置：

```bash
VITE_API_BASE_URL=http://localhost:8081
```

## 常用命令

```bash
npm run dev      # 本地开发
npm run lint     # ESLint 检查
npm run build    # TypeScript + Vite 构建
npm run preview  # 预览构建产物
```

## 当前路由

公开站点：

- `/`
- `/latest`
- `/blog`
- `/projects`
- `/contact`

管理端：

- `/admin/login`
- `/admin`
- `/admin/blogs`
- `/admin/moments`
- `/admin/projects`
- `/admin/contact-links`
- `/admin/users`

## 文档

工程文档在 [`docs/`](./docs/README.md)：

- 项目概览
- 架构说明
- 管理页说明
- 开发流程
- 路线图

## 质量门禁

每次功能改动后至少执行：

```bash
npm run lint
npm run build
```

如果改动了接口契约、路由、管理页或内容来源，需要同步更新 `docs/` 和本 README。

## 后续规划

- 增加博客详情页和项目详情页
- 优化 moments 在首页和最新页的聚合展示
- 完善后台登录后的账户设置体验
- 增加前端自动化测试
- 补充部署和 CI 文档
