-- 把旧的“学习中”状态平滑迁移到新的“开发中”，避免升级后枚举反序列化失败。
UPDATE projects
SET status = '开发中'
WHERE status = '学习中';
