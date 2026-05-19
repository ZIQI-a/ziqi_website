# 数据模型说明

## 内容表

### `blog_posts`

- `id`：主键
- `slug`：业务唯一标识
- `title`
- `publish_date`
- `category`
- `summary`
- `cover`
- `content_markdown`
- `content_mode`
- `source_type`
- `source_label`
- `source_url`
- `source_repo`
- `source_doc_id`
- `source_updated_at`
- `last_synced_at`
- `published`
- `sort_order`
- `created_at`
- `updated_at`

### `blog_tags`

- `blog_post_id`
- `tag_order`
- `tag`

### `projects`

- `id`：主键
- `slug`
- `name`
- `description`
- `status`
- `cover`
- `link`
- `published`
- `sort_order`
- `created_at`
- `updated_at`

### `project_stacks`

- `project_id`
- `stack_order`
- `stack_item`

### `project_highlights`

- `project_id`
- `highlight_order`
- `highlight`

### `contact_links`

- `id`
- `platform_name`
- `profile_url`
- `icon_url`
- `description`
- `published`
- `sort_order`
- `created_at`
- `updated_at`

## moments 表

### `moment_categories`

- `id`
- `name`
- `created_at`
- `updated_at`

### `moments`

- `id`
- `content`
- `image_url`
- `image_alt`
- `category_id`
- `published`
- `show_on_home`
- `pinned`
- `created_at`
- `updated_at`

## 用户表

### `user_manage`

- `id`
- `username`
- `password_hash`
- `nickname`
- `role`
- `enabled`
- `last_login_at`
- `created_at`
- `updated_at`

密码只保存 BCrypt 哈希值，不保存明文。

## 关系说明

- `blog_posts` 和 `blog_tags` 是一对多
- `projects` 和 `project_stacks` 是一对多
- `projects` 和 `project_highlights` 是一对多
- `moment_categories` 和 `moments` 是一对多
- `user_manage.role` 当前是单字段角色，暂未拆角色表

## 排序规则

- 博客：`sort_order asc, publish_date desc`
- 项目：`sort_order asc`
- 联系平台：`sort_order asc`
- moments：置顶优先，再按时间倒序
