# 后端架构说明

## 项目目标

后端服务个人网站的公开站点和后台管理端。当前重点是稳定支持内容管理、公开展示和后台登录，不做过度复杂的平台化设计。

## 技术栈

- Java 21
- Spring Boot 3.5.7
- Spring Web
- Spring Data JPA
- Spring Validation
- Spring Security Crypto
- Flyway
- MySQL
- H2 测试数据库

## 分层结构

- `controller`：HTTP 接口入口，只处理请求、校验和响应状态
- `service`：业务规则、事务边界、密码加密、唯一性校验
- `repository`：数据库访问
- `domain`：JPA 实体和枚举
- `dto`：前后端传输对象
- `mapper`：实体和 DTO 转换
- `auth`：管理端 session 鉴权
- `config`：Web、CORS、密码编码器等配置
- `exception`：统一业务异常

## 接口分区

- `/api/site/*`：公开站点接口，不需要登录
- `/api/admin/auth/*`：登录、退出、恢复当前用户
- `/api/admin/*`：后台管理接口，需要登录

## 鉴权模型

当前使用 session 鉴权：

- 登录成功后，后端把用户 ID 写入 session
- 前端请求后台接口时通过 cookie 携带 session
- `AdminAuthInterceptor` 拦截 `/api/admin/**`
- `/api/admin/auth/**` 排除拦截
- 用户被禁用或删除后，旧 session 会失效
- 当前只有 `ADMIN` 能建立管理会话；`USER` 仅作为后续社区账号扩展位保留

当前不是完整 RBAC，多角色权限后续再扩展。

## 数据模型边界

当前主内容域：

- 博客：`blog_posts`、`blog_tags`
- 项目：`projects`、`project_stacks`、`project_highlights`
- 联系平台：`contact_links`
- moments：`moments`、`moment_categories`
- 用户：`user_manage`

## 设计取舍

- 保持单体，避免过早模块化。
- DTO 与实体分离，防止敏感字段泄漏。
- 用户角色先放在 `user_manage.role`，后续需要多角色时再拆表。
- 图片当前使用 URL，不做文件上传。
- Flyway 负责结构演进，JPA 只校验表结构。
