# 数据库迁移说明

项目使用 Flyway 管理数据库结构和初始化数据。

## 当前迁移

- `V1__create_content_tables.sql`：博客和项目基础表
- `V2__seed_initial_content.sql`：博客和项目初始化数据
- `V3__align_project_status_values.sql`：项目状态旧值迁移
- `V4__create_contact_links_table.sql`：联系平台表和初始数据
- `V5__create_user_table.sql`：用户表 `user_manage`
- `V6__create_moments_tables.sql`：moments 和分类表
- `V7__seed_initial_moments.sql`：moments 初始化数据

## 重要规则

- 已经执行过的迁移会记录在 `flyway_schema_history`。
- 如果本地数据库已经执行过某个版本，修改同名 SQL 不会自动重新执行。
- 已重启并执行过的数据库，需要新增 `V8`、`V9` 等后续迁移。
- 如果只是本地开发且可以清库，可以删除数据库后重新创建，再让 Flyway 从 V1 重新执行。

## 常见问题

### 新表没有出现

先检查：

- 应用是否连接到正确的数据库
- `flyway_schema_history` 中是否已经有对应版本
- SQL 文件名是否符合 `V数字__描述.sql`
- `spring.flyway.enabled` 是否为 `true`

### 修改旧迁移无效

这是 Flyway 的正常行为。已经执行过的 migration 不会因为文件内容改变而自动重跑。应该新增一个新版本迁移。

## 与前端静态数据的关系

早期博客、项目和 moments 的初始化数据来自前端静态内容。后续如果调整前端展示字段，应优先保持后端接口字段稳定，避免破坏管理页和公开页联调。
