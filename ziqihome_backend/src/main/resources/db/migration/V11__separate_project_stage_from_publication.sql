-- 项目阶段只描述建设进度；是否公开继续由 published 字段单独控制。
UPDATE projects
SET status = '已完成'
WHERE status = '已发布';
