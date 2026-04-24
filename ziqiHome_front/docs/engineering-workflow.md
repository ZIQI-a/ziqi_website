# 开发流程与质量门禁

## 开发原则

- 先判断改动属于公开站点、管理端、鉴权、接口还是类型。
- 页面负责组织数据和布局，通用组件负责展示。
- 接口字段先改 `types/`，再改 `api/`，最后改页面。
- 管理端逻辑保持在 `pages/admin/` 和 `components/admin/`。
- 新增非样式代码时补必要注释。
- 不新增不必要依赖。

## 推荐流程

1. 明确改动目标和影响范围。
2. 先读相关页面、类型和接口 client。
3. 修改对应层级，不跨层硬塞逻辑。
4. 同步更新 `docs/` 和 `README.md`。
5. 运行质量检查。

## 改动位置参考

- 路由：`src/App.tsx`
- 公开布局：`src/components/MainLayout.tsx`
- 后台布局：`src/components/admin/AdminLayout.tsx`
- 公开页面：`src/pages/`
- 后台页面：`src/pages/admin/`
- 接口请求：`src/api/`
- 登录态：`src/auth/`
- 类型：`src/types/`
- 主题：`src/index.css`、`src/theme/adminTheme.ts`

## 质量门禁

```bash
npm run lint
npm run build
```

两条命令都通过，才算前端改动完成。

## 文档维护规则

以下情况必须更新文档：

- 新增页面或管理模块
- 修改路由
- 修改接口契约
- 修改登录鉴权流程
- 修改内容来源
- 新增重要工程约束

## 当前注意点

- 后台请求必须携带 `credentials: 'include'`
- 公开站点不要直接调用 `/api/admin/*`
- 登录态以 `/api/admin/auth/me` 为准
- 用户密码只走单独改密接口
- 首页仍有部分静态个人内容，不能误以为全站都已接口化
