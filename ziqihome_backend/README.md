# ZiqiHome Backend

`ziqihome_backend` 是个人网站内容管理后端，当前覆盖博客、项目和联系方式三个内容域，目标是把静态数据迁移到可维护的 MySQL 持久化结构中。

## 技术栈

- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Validation
- Flyway
- MySQL

## 本地启动

1. 先手动创建一个名为 `ziqihome` 的 MySQL 数据库。
2. 按需设置环境变量：
   - `DB_URL`
   - `DB_USERNAME`
   - `DB_PASSWORD`
3. 运行：

```bash
mvn spring-boot:run
```

默认端口为 `8080`。

## 数据库初始化说明

- 数据库本身需要你先手动创建
- 表结构和初始数据不需要你手动执行 `V1`、`V2` SQL
- 应用启动时，Flyway 会自动执行：
  - `V1__create_content_tables.sql`
  - `V2__seed_initial_content.sql`

如果你只是本地默认启动，当前默认配置就是：

- 数据库名：`ziqihome`
- 用户名：`root`
- 密码：通过 `DB_PASSWORD` 环境变量传入

## 目录说明

- `src/main/java`：后端业务代码
- `src/main/resources/db/migration`：Flyway 迁移脚本和初始化数据
- `src/test`：后端接口和服务层测试
- `docs/`：后端协作约束、接口契约和建模文档

## 当前项目管理补充接口

为了让管理端表单不再手写项目状态和技术栈候选项，当前后端已提供：

- `GET /api/admin/projects/options`

返回内容包含：

- `statusOptions`：来自后端 `ProjectStatus` 枚举
- `stackOptions`：从已有项目数据中汇总出的技术栈候选项

当前项目状态枚举值为：

- `构思中`
- `开发中`
- `已完成`
- `已发布`
