# ziqihome_backend Agent 约束

## 文档定位

- 本文件是 AI 进入后端工程后的第一入口，只保留高频决策规则，不替代详细设计文档。

## 项目边界

- 这是个人网站后端，当前服务公开站点和后台管理端。
- 当前内容域包括：博客、项目、联系平台、moments、用户。
- 后端保持单体结构，不提前拆多模块、多服务。
- 新增内容域前必须先判断是否符合个人站需求，避免过度设计。

## 当前主要模块

- `auth/`：管理端 session 鉴权拦截器和会话 key
- `controller/`：HTTP 接口入口
- `service/`：业务规则和事务流程
- `repository/`：Spring Data JPA 数据访问
- `domain/`：JPA 实体和枚举
- `dto/`：请求 DTO 和响应 DTO
- `mapper/`：实体和 DTO 转换
- `config/`：CORS、拦截器注册、密码编码器等配置
- `exception/`：统一业务异常

## 分层规则

- controller 只做参数接收、状态码返回和校验入口，不直接操作 repository。
- service 承载业务规则，例如唯一性校验、密码加密、删除规则、事务边界。
- repository 只负责数据库访问，不写业务判断。
- DTO 与实体分离，禁止直接把数据库实体返回给前端。
- mapper 负责实体与 DTO 转换，避免 controller/service 堆字段赋值代码。
- 密码只能保存哈希值，不能保存明文。
- `/api/admin/**` 必须经过登录态校验，认证入口 `/api/admin/auth/**` 除外。

## 修改顺序

新增或修改字段建议按顺序处理：

1. 更新 `docs/data-model.md`
2. 增加或调整 Flyway migration
3. 修改 domain/entity
4. 修改 DTO
5. 修改 mapper
6. 修改 repository/service/controller
7. 补测试
8. 更新 `docs/api-contract.md`、相关 docs 和 README

## 注释规则

- 函数、关键数据转换和非直观设计决策补必要注释。
- 对密码、鉴权、会话、删除、迁移这类容易误解的逻辑必须注释。
- 不写“给字段赋值”这类低价值注释。

## 文档同步

以下改动必须同步更新 `docs/` 和 `README.md`：

- 新增接口或修改接口路径
- 新增表、字段或迁移脚本
- 修改鉴权流程
- 修改数据模型关系
- 新增内容域或管理模块
- 新增重要工程约束

## 质量门禁

后端功能改动后至少执行：

```bash
mvn test
```

如果影响前端联调，再补充前端 `npm run build`