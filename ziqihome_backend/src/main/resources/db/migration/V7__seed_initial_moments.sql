INSERT INTO moment_categories (id, name)
VALUES
  (1, '生活'),
  (2, '学习'),
  (3, '随手记');

INSERT INTO moments (
  id, content, image_url, image_alt, category_id, published, show_on_home, pinned, created_at, updated_at
)
VALUES
  (1, '果园日出。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time1.jpg', '果园日出', 1, TRUE, TRUE, FALSE, '2021-08-24 08:00:00', '2021-08-24 08:00:00'),
  (2, '玉米地随拍。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time2.jpg', '玉米地随拍', 3, TRUE, TRUE, FALSE, '2021-09-06 10:00:00', '2021-09-06 10:00:00'),
  (3, '初见学校：操场。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time3.jpg', '初见学校：操场', 2, TRUE, TRUE, FALSE, '2021-09-20 09:00:00', '2021-09-20 09:00:00'),
  (4, '认识一位好“朋友”。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time4.jpg', '认识一位好“朋友”', 1, TRUE, TRUE, FALSE, '2021-10-16 16:00:00', '2021-10-16 16:00:00'),
  (5, '雪地中二时。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time5.jpg', '雪地中二时', 3, TRUE, TRUE, FALSE, '2022-02-05 11:00:00', '2022-02-05 11:00:00'),
  (6, '初见孔雀。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time8.jpg', '初见孔雀', 1, TRUE, TRUE, FALSE, '2022-08-18 14:00:00', '2022-08-18 14:00:00'),
  (7, '个人网站 React 版持续重构中。正在把以前的静态主页拆成组件和页面，让它既保留原来的气质，也更适合长期维护。', NULL, NULL, 2, TRUE, TRUE, TRUE, '2026-04-12 20:00:00', '2026-04-12 20:00:00'),
  (8, 'React、TypeScript 与页面结构整理同步推进。目前把学习笔记、项目展示和个人表达一起收进站点里，边做边补工程化基础。', NULL, NULL, 2, TRUE, TRUE, FALSE, '2026-04-16 21:00:00', '2026-04-16 21:00:00');
