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

默认端口是 `8081`，默认允许 `http://localhost:5174` 和 `http://127.0.0.1:5174` 发起带凭证的本地联调请求。

## 数据库迁移

应用启动时 Flyway 会自动执行：

- `V1__create_content_tables.sql`
- `V2__seed_initial_content.sql`
- `V3__align_project_status_values.sql`
- `V4__create_contact_links_table.sql`
- `V5__create_user_table.sql`
- `V6__create_moments_tables.sql`
- `V7__seed_initial_moments.sql`
- `V8__seed_default_admin_user.sql`
- `V9__extend_blog_post_for_full_articles.sql`
- `V10__add_yuque_sync_fields_to_blog_posts.sql`
- `V11__separate_project_stage_from_publication.sql`

`V8` 会补一条默认管理员账号：`admin-reset`。初始化密码为 `Admin@123456`，首次登录后建议立即在后台改密。
`V9` 会把博客从摘要卡片扩展为完整文章模型，新增 Markdown 正文、内容模式和原文来源字段，便于后续接语雀或 CSDN 导入。
`V10` 会补充语雀同步追踪字段，用于记录来源知识库、语雀文档 ID 和最近同步时间，支撑后台手动同步语雀文章。

如果某个迁移已经在 `flyway_schema_history` 中记录，修改原迁移文件不会再次执行。已启动过的数据库需要新增后续版本迁移，而不是直接改旧版本。

## 主要接口

公开接口：

- `GET /api/site/blogs`，支持 `keyword`、`category`、重复 `tags` 查询参数
- `GET /api/site/blogs/filter-options`，返回已发布博客的分类和标签筛选项
- `GET /api/site/blogs/{slug}`
- `GET /api/site/projects`，支持 `status` 查询参数
- `GET /api/site/projects/filter-options`，返回已发布项目实际使用的阶段筛选项
- `GET /api/site/contact-links`
- `GET /api/site/moments`，支持 `categoryId`、`showOnHome`、`hasImage` 查询参数
- `GET /api/site/moments/categories`

管理认证：

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/logout`

管理 CRUD：

- `/api/admin/blogs`
- `/api/admin/blogs/yuque/*`
- `/api/admin/projects`
- `/api/admin/contact-links`
- `/api/admin/moments`，列表支持 `categoryId`、`published` 查询参数
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
