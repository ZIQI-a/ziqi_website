# 后端工程文档

这组文档面向 AI 协作和后端维护，用于快速理解 `ziqihome_backend` 的架构、接口、数据模型和迁移规则。

`README.md` 用于给人快速启动和了解项目；本目录用于给 AI 或维护者判断“接口怎么分层、表怎么迁移、契约怎么同步”。

## 文档索引

- [架构说明](./architecture.md)
- [项目分层说明](./project-guide.md)
- [数据模型](./data-model.md)
- [API 契约](./api-contract.md)
- [开发流程](./engineering-workflow.md)
- [迁移说明](./migration-guide.md)

## 当前状态

- 技术栈：`Spring Boot + JPA + Flyway + MySQL`
- 内容域：博客、项目、联系平台、moments、用户
- 博客语雀同步会清洗摘要，并对无效描述回退到正文提取结果
- 公开接口：`/api/site/*`
- 管理接口：`/api/admin/*`
- 鉴权：session + Spring MVC interceptor
- 密码：BCrypt 哈希
- 数据库：Flyway 管理迁移，JPA `ddl-auto=validate`

## 使用建议

- 初次接手先看“架构说明”和“项目分层说明”。
- 改字段或表结构先看“数据模型”和“迁移说明”。
- 改接口前先看“API 契约”。
- 开发前先看“开发流程”。
