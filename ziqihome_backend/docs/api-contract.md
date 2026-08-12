# API Contract

## 公开接口

- `GET /api/site/blogs`
  - Query：
    - `keyword` 可选，忽略大小写匹配标题、摘要或标签
    - `category` 可选，按分类名称精确筛选
    - `tags` 可选且可重复传递；传入多个标签时只返回同时包含全部标签的文章
- `GET /api/site/blogs/filter-options`
  - 返回全部已发布文章的去重分类和标签，供公开博客页构建稳定筛选项
- `GET /api/site/blogs/{slug}`
- `GET /api/site/projects`
  - Query：
    - `status` 可选，按项目阶段筛选，取值来自 `ProjectStatus`：`构思中`、`开发中`、`已完成`
  - 仅返回公开卡片所需的 `slug`、名称、描述、阶段、封面、链接和技术栈
- `GET /api/site/projects/filter-options`
  - 返回全部已发布项目实际使用的阶段，供公开项目页构建稳定筛选项
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
- `GET /api/admin/blogs/{id}`
- `POST /api/admin/blogs`
- `PUT /api/admin/blogs/{id}`
- `DELETE /api/admin/blogs/{id}`
- `POST /api/admin/blogs/yuque/preview`
- `POST /api/admin/blogs/yuque/sync`

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
- 博客正文不能为空；外链文章建议补 `source_url`
- 用户账号、密码、昵称不能为空
- 用户密码长度由 `UserPasswordRules` 统一约束
- `cover`、`profileUrl`、`iconUrl` 必须是 `http/https` URL
- `imageUrl`、`link` 允许为空；非空时必须是 `http/https` URL
- 博客标签、项目技术栈、项目亮点至少保留一项
- 项目阶段必须来自 `ProjectStatus`，是否公开仅由 `published` 控制
- 项目 slug 仅允许小写字母、数字和单个连字符，且全局唯一
- 项目排序值不能小于 0；数值越小越靠前，相同排序按 ID 倒序
- 管理端当前仅创建和使用 `ADMIN`；`USER` 为后续社区账号预留，不能登录或访问管理后台
- 当前登录管理员不能停用、降级或删除自己，并且系统至少保留一个启用的管理员账号

## 错误响应

统一异常处理在 `ApiExceptionHandler`：

- `400`：参数校验失败
- `401`：未登录或登录失效
- `404`：资源不存在
- `409`：唯一性冲突

响应体包含 `timestamp`、`status`、`message`，字段校验失败时包含 `fieldErrors`。
