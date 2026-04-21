INSERT INTO blog_posts (id, slug, title, publish_date, category, summary, cover, published, sort_order)
VALUES
  (1, 'react-routing-notes', 'React 路由入门：从单页思维到页面组织', '2026-04-10', '学习笔记', '记录我第一次把静态页面拆成多个 React 页面时，对 BrowserRouter、Routes 和组件嵌套关系的理解。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time3.jpg', TRUE, 1),
  (2, 'css-modules-practice', '为什么我在第一个 React 项目里选择 CSS Modules', '2026-04-08', '前端思考', '对比普通 CSS、组件化样式和工具类方案，整理 CSS Modules 在初学阶段的实际价值。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time2.jpg', TRUE, 2),
  (3, 'life-sense-record', '把生活感放进个人网站，而不是只堆技术关键词', '2026-04-02', '生活感想', '个人站不只是简历页面，我想让它保留照片、心情和成长中的真实痕迹。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time5.jpg', TRUE, 3),
  (4, 'react-from-zero', '刚学完 React 之后，我最先搞懂的 3 件事', '2026-03-29', '学习笔记', '组件、props 和数据驱动渲染，是我从“会写页面”走向“会组织项目”的第一步。', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time8.jpg', TRUE, 4);

INSERT INTO blog_tags (blog_post_id, tag_order, tag)
VALUES
  (1, 0, 'React'),
  (1, 1, 'Router'),
  (1, 2, '学习记录'),
  (2, 0, 'CSS Modules'),
  (2, 1, '工程化'),
  (2, 2, '样式管理'),
  (3, 0, '个人网站'),
  (3, 1, '表达'),
  (3, 2, '生活'),
  (4, 0, 'React'),
  (4, 1, 'JSX'),
  (4, 2, '组件化');

INSERT INTO projects (id, slug, name, description, status, cover, link, published, sort_order)
VALUES
  (1, 'react-personal-site', 'React 个人网站', '把早期静态原型升级为组件化、可路由、可维护的个人站点，用来沉淀博客和项目内容。', '学习中', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time1.jpg', NULL, TRUE, 1),
  (2, 'desktop-clock', '极简浮窗时钟', '一个偏桌面端体验的小工具项目，探索界面呈现、窗口行为和更轻量的交互反馈。', '已完成', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time4.jpg', NULL, TRUE, 2),
  (3, 'visual-dashboard', '数据可视化练习看板', '围绕图表布局和信息层级做的一组可视化练习，用来训练界面结构与数据展示能力。', '构思中', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time2.jpg', NULL, TRUE, 3),
  (4, 'study-blog-system', '学习笔记内容系统', '计划把零散笔记整理为更稳定的内容结构，后续可能接入 Markdown 或简单内容管理流程。', '构思中', 'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time3.jpg', NULL, TRUE, 4);

INSERT INTO project_stacks (project_id, stack_order, stack_item)
VALUES
  (1, 0, 'React'),
  (1, 1, 'TypeScript'),
  (1, 2, 'Vite'),
  (1, 3, 'CSS Modules'),
  (2, 0, 'Electron'),
  (2, 1, 'Vue'),
  (2, 2, 'JavaScript'),
  (3, 0, 'React'),
  (3, 1, 'ECharts'),
  (3, 2, 'TypeScript'),
  (4, 0, 'Markdown'),
  (4, 1, 'React'),
  (4, 2, '内容建模');

INSERT INTO project_highlights (project_id, highlight_order, highlight)
VALUES
  (1, 0, '路由组织'),
  (1, 1, '组件拆分'),
  (1, 2, '数据驱动渲染'),
  (2, 0, '桌面端浮窗'),
  (2, 1, '轻量交互'),
  (2, 2, '多场景展示'),
  (3, 0, '信息层级'),
  (3, 1, '图表布局'),
  (3, 2, '组件复用'),
  (4, 0, '内容结构设计'),
  (4, 1, '可扩展性'),
  (4, 2, '个人知识沉淀');
