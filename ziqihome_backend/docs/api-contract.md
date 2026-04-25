# API Contract

## 公开接口

- `GET /api/site/blogs`
- `GET /api/site/projects`
  - Query：
    - `status` 可选，按项目状态筛选，取值来自 `ProjectStatus`：`构思中`、`开发中`、`已完成`、`已发布`
- `GET /api/site/contact-links`
- `GET /api/site/moments`
  - Query：
    - `categoryId` 可选，按 moment 分类 ID 筛选
    - `showOnHome` 可选，`true/false`，筛选是否展示到首页
    - `hasImage` 可选，`true` 返回图文 moment，`false` 返回纯文字 moment
- `GET /api/site/moments/categories`

公开接口只返回已发布或可公开展示的数据；查询参数只收窄公开数据范围，不会返回未发布内容。

## 认证接口

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/logout`

登录成功后由后端 session 维持登录态，前端需要携带 cookie。

## 管理接口

博客：

- `GET /api/admin/blogs`
- `POST /api/admin/blogs`
- `PUT /api/admin/blogs/{id}`
- `DELETE /api/admin/blogs/{id}`

项目：

- `GET /api/admin/projects`
- `GET /api/admin/projects/options`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/{id}`
- `DELETE /api/admin/projects/{id}`

联系平台：

- `GET /api/admin/contact-links`
- `POST /api/admin/contact-links`
- `PUT /api/admin/contact-links/{id}`
- `DELETE /api/admin/contact-links/{id}`

moments：

- `GET /api/admin/moments`
  - Query：
    - `categoryId` 可选，按 moment 分类 ID 筛选
    - `published` 可选，`true/false`，按发布状态筛选
- `POST /api/admin/moments`
- `PUT /api/admin/moments/{id}`
- `DELETE /api/admin/moments/{id}`

moment 分类：

- `GET /api/admin/moments/categories`
- `POST /api/admin/moments/categories`
- `PUT /api/admin/moments/categories/{id}`
- `DELETE /api/admin/moments/categories/{id}`

用户：

- `GET /api/admin/users`
- `GET /api/admin/users/{id}`
- `POST /api/admin/users`
- `PUT /api/admin/users/{id}`
- `PUT /api/admin/users/{id}/password`
- `DELETE /api/admin/users/{id}`

## 校验规则

- 标题、名称、平台名、描述、分类不能为空
- 用户账号、密码、昵称不能为空
- 用户密码长度由 `UserPasswordRules` 统一约束
- `cover`、`profileUrl`、`iconUrl` 必须是 `http/https` URL
- `imageUrl`、`link` 允许为空；非空时必须是 `http/https` URL
- 博客标签、项目技术栈、项目亮点至少保留一项
- 项目状态必须来自 `ProjectStatus`
- 用户角色当前仅支持 `ADMIN`

## 错误响应

统一异常处理在 `ApiExceptionHandler`：

- `400`：参数校验失败
- `401`：未登录或登录失效
- `404`：资源不存在
- `409`：唯一性冲突

响应体包含 `timestamp`、`status`、`message`，字段校验失败时包含 `fieldErrors`。
