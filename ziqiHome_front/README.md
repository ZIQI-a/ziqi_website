# Ziqi Archive

一个基于 `Vite + React + TypeScript + react-router-dom + CSS Modules` 的个人网站练习项目。

## 工程文档

项目相关工程文档已整理到 [`docs/`](./docs/README.md)，包含：

- 项目概览
- 前端架构说明
- 开发流程与质量门禁
- 路线图与待办

## 当前版本包含什么

- 首页：个人介绍、博客笔记预览、项目汇总预览
- 博客笔记页：展示静态数据驱动的文章卡片
- 项目汇总页：展示项目简介、技术栈和状态

## 为什么这样搭

- `Vite`：本地启动快，适合 React 初学者理解工程结构
- `React Router`：把个人站拆成多个页面，而不是把所有内容塞在一个组件里
- `CSS Modules`：让样式跟组件绑定，减少全局样式互相污染
- `TypeScript`：先用于类型提示和数据结构约束，帮助理解组件 props 和数据组织

## 目录说明

```text
src/
  components/   可复用组件
  data/         页面用到的静态数据
  pages/        路由页面
  types/        TypeScript 类型定义
```

## 本地启动

```bash
npm install
npm run dev
```

## 当前学习重点

1. 理解 `main.tsx` 如何挂载 React 应用
2. 理解 `App.tsx` 如何配置路由
3. 理解页面如何通过 `map` 把数据渲染成卡片组件
4. 理解 CSS Modules 如何让组件样式更可维护

## 后续可以继续扩展

- 博客详情页
- 项目详情页
- Markdown 内容管理
- 部署上线
