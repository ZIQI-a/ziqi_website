# ZiqiHome Backend

`ziqihome_backend` 是个人网站 `Ziqi Archive` 的后端服务，负责公开内容接口、后台管理 CRUD、用户管理和管理端登录会话。项目基于 `Spring Boot + Spring Web + Spring Data JPA + Flyway + MySQL`。

## 当前能力

- 公开接口：博客、项目、联系平台、moments、moment 分类
- 管理接口：博客、项目、联系平台、moments、moment 分类、用户
- 登录鉴权：管理端通过 session 维护登录态，`/api/admin/**` 由拦截器保护
- 密码安全：用户密码使用 BCrypt 哈希，不保存明文
- 数据迁移：Flyway 管理表结构和初始化数据
- 测试：已有服务层和控制器层基础测试

## 技术栈

- `Java 21`
- `Spring Boot 3.5.7`
- `Spring Web`
- `Spring Data JPA`
- `Spring Validation`
- `Spring Security Crypto`
- `Flyway`
- `MySQL`
- `H2` 测试数据库
- `JUnit / MockMvc`

## 目录说明

```text
src/main/java/com/ziqihome/backend/
  auth/          管理端 session 鉴权拦截器和会话 key
  config/        Web/CORS/密码编码器等配置
  controller/    HTTP 接口入口
  domain/        JPA 实体和枚举
  dto/           请求与响应 DTO
  exception/     统一业务异常
  mapper/        实体与 DTO 转换
  repository/    Spring Data JPA 仓库
  service/       业务流程和事务边界

src/main/resources/
  application.yml
  db/migration/  Flyway 迁移脚本

src/test/
  控制器和服务层测试
```

## 本地启动

1. 创建 MySQL 数据库：

```sql
CREATE DATABASE ziqihome DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置数据库连接。

可以使用环境变量：

```bash
export DB_URL='jdbc:mysql://localhost:3306/ziqihome?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai'
export DB_USERNAME='root'
export DB_PASSWORD='你的数据库密码'
```

也可以在仓库外或本地私有文件 `application-local.yml` 中覆盖配置。

3. 启动服务：

```bash
mvn spring-boot:run
```

默认端口是 `8080`。

## 数据库迁移

应用启动时 Flyway 会自动执行：

- `V1__create_content_tables.sql`
- `V2__seed_initial_content.sql`
- `V3__align_project_status_values.sql`
- `V4__create_contact_links_table.sql`
- `V5__create_user_table.sql`
- `V6__create_moments_tables.sql`
- `V7__seed_initial_moments.sql`

如果某个迁移已经在 `flyway_schema_history` 中记录，修改原迁移文件不会再次执行。已启动过的数据库需要新增后续版本迁移，而不是直接改旧版本。

## 主要接口

公开接口：

- `GET /api/site/blogs`
- `GET /api/site/projects`
- `GET /api/site/contact-links`
- `GET /api/site/moments`
- `GET /api/site/moments/categories`

管理认证：

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/logout`

管理 CRUD：

- `/api/admin/blogs`
- `/api/admin/projects`
- `/api/admin/contact-links`
- `/api/admin/moments`
- `/api/admin/moments/categories`
- `/api/admin/users`

完整契约见 [`docs/api-contract.md`](./docs/api-contract.md)。

## 常用命令

```bash
mvn spring-boot:run  # 启动服务
mvn test             # 运行测试
```

## 文档

工程文档在 [`docs/`](./docs/README.md)：

- 架构说明
- 项目分层说明
- 数据模型
- API 契约
- 开发流程
- 迁移说明

## 质量门禁

后端功能改动后至少执行：

```bash
mvn test
```

如果改动影响前端联调，还需要同步更新前端文档和运行前端构建检查。

## 后续规划

- 增加首次管理员初始化流程
- 完善用户角色模型，必要时拆出角色表
- 增加登录失败限制和更完整的安全策略
- 增加文件上传或图片素材管理
- 补充部署、备份和 CI 文档
