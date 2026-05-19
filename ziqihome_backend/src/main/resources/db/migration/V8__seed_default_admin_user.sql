-- 补充一个稳定的默认管理员账号，避免本地账号数据缺失时无法进入后台。
INSERT INTO user_manage (
  username,
  password_hash,
  nickname,
  role,
  enabled
)
SELECT
  'admin-reset',
  '$2a$10$EaRIv10oo9Wm.BxkGVpYq.Pe4ETkPVXHRD785/u5ZBTDOKEYgYma6',
  '系统管理员',
  'ADMIN',
  TRUE
WHERE NOT EXISTS (
  SELECT 1
  FROM user_manage
  WHERE username = 'admin-reset'
);
