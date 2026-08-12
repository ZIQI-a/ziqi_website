# 后端项目分层说明

这份文档用于帮助 AI 和开发者快速理解后端模块之间的关系。

## 一次请求如何流转

以创建项目为例：

1. 前端调用 `POST /api/admin/projects`
2. `AdminProjectController` 接收 `ProjectRequest`
3. controller 调用 `ProjectService`
4. service 执行业务规则和事务
5. mapper 把 DTO 写入 `Project` 实体
6. repository 保存实体
7. mapper 把实体转成 `ProjectResponse`
8. controller 返回响应

博客、联系平台、moments、用户模块基本遵循同样链路。

## controller

职责：

- 接收 HTTP 请求
- 绑定路径参数和请求体
- 触发 `@Valid` 校验
- 返回 HTTP 状态码
- 调用 service

禁止：

- 直接操作 repository
- 直接返回 domain 实体
- 写密码加密、唯一性校验等业务逻辑

## service

职责：

- 业务规则
- 事务边界
- 唯一性校验
- 密码加密
- 删除和更新流程
- 调用 mapper 和 repository

例子：

- `UserService` 负责密码哈希和账号唯一性
- `AdminAuthService` 负责登录校验和 session 写入
- `ProjectService` 负责项目阶段选项、slug 唯一性、公开筛选项和项目 CRUD

## repository

职责：

- 继承 `JpaRepository`
- 定义数据库查询方法
- 不写业务判断

例子：

- `UserRepository.findByUsername`
- `ProjectRepository.findDistinctStackOptions`

## domain

职责：

- 描述数据库实体
- 定义枚举
- 维护实体生命周期字段

实体与表的对应关系：

- `BlogPost` -> `blog_posts`
- `Project` -> `projects`
- `ContactLink` -> `contact_links`
- `Moment` -> `moments`
- `MomentCategory` -> `moment_categories`
- `User` -> `user_manage`

## dto

职责：

- 定义接口请求体
- 定义接口响应体
- 通过 validation 注解约束输入

原则：

- 响应 DTO 不包含敏感字段
- 请求 DTO 与前端表单对齐
- 不把实体直接暴露给前端

## mapper

职责：

- 实体转响应 DTO
- 请求 DTO 写入实体
- 集中处理 trim、列表清洗、空字符串转 null 等转换

mapper 让 service 保持业务流程清晰，避免大量字段赋值散落在多个地方。

## auth

当前鉴权基于 session：

- `AdminAuthController` 提供登录、退出、当前用户接口
- `AdminAuthService` 校验账号密码并写入 session
- `AdminAuthInterceptor` 保护 `/api/admin/**`
- `AdminSessionKeys` 统一管理 session key

前端必须使用 `credentials: 'include'` 携带 session cookie。

## exception

统一异常处理在 `ApiExceptionHandler`：

- `ResourceNotFoundException`
- `ConflictException`
- `UnauthorizedException`
- `MethodArgumentNotValidException`

这样前端可以稳定消费 `message` 和 `fieldErrors`。

## 学习建议

推荐阅读顺序：

1. `SiteContentController`
2. 任意一个 `Admin*Controller`
3. 对应 `Service`
4. 对应 `Mapper`
5. `DTO`
6. `Domain`
7. `Repository`
8. Flyway migration
