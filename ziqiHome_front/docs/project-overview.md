# 项目概览

## 项目定位

`Ziqi Archive` 是个人网站前端，用来承载个人介绍、学习笔记、项目展示、生活动态和联系平台。当前项目是“公开站点 + 后台管理端”的前后端分离应用。

## 当前页面

公开站点：

- `/`：主页，承载个人介绍、生活动态和内容分发
- `/latest`：最新动态，展示 moments 内容
- `/blog`：博客列表
- `/blog/:slug`：博客详情，封面 Hero 承载文章信息并提供正文目录
- `/projects`：项目总览，使用紧凑项目索引和服务端状态筛选
- `/contact`：联系平台入口

管理端：

- `/admin/login`：后台登录
- `/admin`：管理首页
- `/admin/blogs`：博客管理
- `/admin/moments`：动态管理
- `/admin/projects`：项目管理
- `/admin/contact-links`：联系平台管理
- `/admin/users`：用户管理

## 当前内容来源

- 首页个人基础信息仍来自 `src/data/siteContent.ts`
- 博客列表来自 `/api/site/blogs`，关键词、分类和多标签通过查询参数交给后端组合筛选
- 博客分类和标签筛选项来自 `/api/site/blogs/filter-options`，不再由当前结果集临时推导
- 项目列表来自 `/api/site/projects`
- 联系平台来自 `/api/site/contact-links`
- moments 和分类来自 `/api/site/moments`、`/api/site/moments/categories`
- 管理端所有 CRUD 来自 `/api/admin/*`

## 当前已完成

- 公开站点路由拆分
- 公开内容接口化
- 后台管理端独立布局
- 登录页和后台由守卫
- session 登录态恢复
- 用户管理和密码修改入口
- 管理端 CRUD 页面懒加载
- 暗/亮主题切换
- 博客详情页、Markdown 正文和文章目录
- Projects 页紧凑项目总览与响应式卡片布局

## 当前非目标

- 项目详情页
- 文件上传和素材管理
- 完整多角色权限系统
- CI/CD 和部署流水线
