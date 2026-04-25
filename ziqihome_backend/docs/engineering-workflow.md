# 后端开发流程

## 开发原则

- controller 不直接访问 repository。
- service 负责业务规则和事务。
- DTO 不直接复用实体。
- mapper 集中处理实体与 DTO 转换。
- 密码、会话、鉴权相关逻辑必须有必要注释。
- 新增字段必须同步 migration、实体、DTO、文档和测试。

## 推荐顺序

1. 确认改动属于哪个内容域。
2. 更新 `docs/data-model.md`。
3. 新增 Flyway migration，不修改已执行过的旧迁移。
4. 修改 domain。
5. 修改 DTO。
6. 修改 mapper。
7. 修改 repository、service、controller。
8. 补充或调整测试。
9. 更新 `docs/api-contract.md`、README 和相关文档。

## 当前内容域

- 博客
- 项目
- 联系平台
- moments
- 用户
- 管理端认证

## 质量门禁

```bash
mvn test
```

如果影响前端联调，需要同步运行前端：

```bash
npm run build
```

## 注意事项

- 已经被 Flyway 执行过的迁移不要直接改，新增版本迁移。
- `ddl-auto=validate` 只校验结构，不自动建表。
- 管理接口默认需要登录，新增 `/api/admin/*` 时确认是否应该被拦截。
- 登录和会话接口必须保留在 `/api/admin/auth/*`。
- 用户密码不能进入响应 DTO。
