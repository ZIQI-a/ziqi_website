# 前端体验优化建议

> 生成日期: 2026-05-21 | 基于现有页面实现审查

> 实施状态：移动端公共导航、Latest 双列帖子流和首页内容收敛已按六阶段路线完成；后续顺序以 `roadmap.md` 为准。

---

## 🔴 高优先级（体验提升明显 + 改动小）

### 1. 图片懒加载 — 全站性能

**问题：** 部分 `<img>` 标签仍缺少 `loading="lazy"`，会增加非首屏图片的加载开销。首页精选图片已在第三阶段补充懒加载。

**涉及文件：**
- `src/pages/LatestPage.tsx` — galleryCard 图片
- `src/components/BlogCard.tsx` — 封面图片
- `src/pages/BlogDetailPage.tsx` — 封面图片
- `src/components/ProjectCard.tsx` — 封面图片
- `src/pages/ContactPage.tsx` — 平台图标

**方案：** 所有 `<img>` 添加 `loading="lazy"` 属性。

---

### 2. 回到顶部按钮 — 长页面导航

**问题：** 只有主页有侧边导航，博客/项目/最新动态页滚动到底后无快捷回顶方式。

**涉及文件：**
- 新增 `src/components/ScrollToTop.tsx`
- 修改 `src/components/MainLayout.tsx`（非首页路径渲染该组件）

**方案：** 滚动超过一屏时显示圆形浮动按钮，平滑滚动回顶部。

---

### 3. 博客列表服务端筛选

**问题：** 博客页筛选曾在浏览器内遍历完整文章列表，数据量增长后会增加前端状态和计算负担。

**涉及文件：**
- `src/pages/BlogPage.tsx` — 增加筛选栏

**方案：** 关键词、分类和多标签交集通过查询参数交给后端处理，筛选项使用独立接口获取。

---

### 4. 主题跟随系统偏好

**问题：** 首次访问始终暗色模式，系统亮色用户感到突兀。

**涉及文件：**
- `src/components/MainLayout.tsx` — 修改 `useState` 初始值逻辑

**方案：** `useState` 初始值优先读 localStorage，否则 fallback 到 `matchMedia('(prefers-color-scheme: light)')`。

---

### 5. 移动端响应式导航

**问题：** 5 个导航项在小屏放不下，缺少 hamburger 菜单。

**涉及文件：**
- `src/components/MainLayout.tsx` — 增加移动端折叠菜单
- `src/components/MainLayout.module.css` — 响应式样式

**方案：** 小于 768px 时折叠为 hamburger 按钮 + 下拉/抽屉菜单。

---

### 6. 博客详情页文章目录 (TOC)

**问题：** 长文章缺少侧边目录导航，阅读体验不够好。

**涉及文件：**
- `src/components/MarkdownArticle.tsx` — 标题注入锚点 id
- `src/pages/BlogDetailPage.tsx` — 增加侧边 TOC 组件

**方案：** 提取 h1/h2/h3 标题生成目录列表，浮动侧边展示，滚动高亮当前位置。

---

## 🟡 中优先级

### 7. 全局路由加载进度条

**问题：** 懒加载的管理页面切换时无视觉反馈。

**涉及文件：**
- `src/App.tsx` — Suspense fallback 替换

**方案：** 顶部细进度条（NProgress 风格），在路由切换时自动显示/隐藏。

---

### 8. 页面 `<title>` 动态更新

**问题：** 所有页面共用一个 `<title>`，浏览器标签和 SEO 不友好。

**涉及文件：** 所有页面组件

**方案：** 每个页面 mount 时设置 `document.title = '博客笔记 | Ziqi Archive'` 等。

---

### 9. `formatMomentDate` 重复定义

**问题：** 同一函数在 `HomePage` 和 `LatestPage` 中各写一份。

**涉及文件：**
- 新增 `src/utils/dateFormat.ts`
- 修改 `src/pages/HomePage.tsx`、`src/pages/LatestPage.tsx`

**方案：** 抽取为 `src/utils/dateFormat.ts` 公共模块。

---

## 🟢 低优先级

### 10. 404 页面

**问题：** `*` 路由静默重定向首页，用户无感知。

**涉及文件：**
- 新增 `src/pages/NotFoundPage.tsx`
- 修改 `src/App.tsx`

---

### 11. 首页生活卡片交互语义（已完成）

**处理：** 第三阶段已移除不可点击卡片的箭头、手型光标和位移反馈，完整 Moments 浏览统一通过“查看全部瞬间”入口进入 `/latest`。

---

### 12. 全局 CSS 过渡性能优化

**问题：** `#root *` 对每个元素应用 7 种属性 transition。

**涉及文件：**
- `src/index.css` — 精简全局过渡属性列表

---

## 实施建议

优先做 **1（懒加载）+ 2（回到顶部）+ 4（系统主题）**，改动小、效果立竿见影。之后按编号顺序逐步推进。
