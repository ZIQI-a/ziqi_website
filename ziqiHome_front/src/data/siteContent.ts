import type {
  BlogPostSummary,
  LifeMoment,
  ProfileInfo,
  ProjectSummary,
  RecentUpdate,
} from '../types/content'
import { SITE_ASSETS } from '../config/assets'

/**
 * 个人信息是首页 Hero 和关于我区域的单一数据源。
 * 这样的好处是：后续改文案时只动数据，不需要改组件结构。
 */
export const profileInfo: ProfileInfo = {
  name: '王子琦',
  englishName: 'Ziqi Wang',
  role: 'Frontend Learner / Creative Builder',
  intro:
    '刚完成 React 学习，正在把过去的静态原型升级成一个更完整的个人网站。这里会整理我的博客笔记、项目实践，也保留一点生活感和个人表达。',
  location: '中国 · 学习与创作中',
  email: 'ziqi@example.com',
  motto: '你的生活方式，就是你的天赋所在。',
  tags: ['React', 'Vue', 'TypeScript', 'Electron', '前端成长记录'],
  identityTags: ['技术宅', '游戏党', 'UP主'],
  storyCards: [
    {
      title: '兴趣爱好',
      description:
        '喜欢喊麦，喜欢的歌手有小少焱、毛不易；爱玩游戏，那种对游戏的纯粹热爱；可能还会有更多的爱好绘画、吉他。',
    },
    {
      title: '学习',
      description:
        '学会很多技术，从此成为技术大牛，走上人生巅峰哈哈；前端、C++、Java 正在努力学习中 ing……',
    },
    {
      title: '我的梦想',
      description:
        '梦想当然是有钱！！！bushi；想成为一名 up 主；想自己制作游戏；想成为公司老板；想和喜欢的人去看遍这世间万物~',
    },
  ],
}

/**
 * 博客数据使用数组组织，后续可以无缝迁移到 Markdown 或接口返回值。
 */
export const blogPosts: BlogPostSummary[] = [
  {
    id: 'react-routing-notes',
    title: 'React 路由入门：从单页思维到页面组织',
    date: '2026-04-10',
    category: '学习笔记',
    summary:
      '记录我第一次把静态页面拆成多个 React 页面时，对 BrowserRouter、Routes 和组件嵌套关系的理解。',
    tags: ['React', 'Router', '学习记录'],
    cover: SITE_ASSETS.content.time3,
  },
  {
    id: 'css-modules-practice',
    title: '为什么我在第一个 React 项目里选择 CSS Modules',
    date: '2026-04-08',
    category: '前端思考',
    summary:
      '对比普通 CSS、组件化样式和工具类方案，整理 CSS Modules 在初学阶段的实际价值。',
    tags: ['CSS Modules', '工程化', '样式管理'],
    cover: SITE_ASSETS.content.time2,
  },
  {
    id: 'life-sense-record',
    title: '把生活感放进个人网站，而不是只堆技术关键词',
    date: '2026-04-02',
    category: '生活感想',
    summary:
      '个人站不只是简历页面，我想让它保留照片、心情和成长中的真实痕迹。',
    tags: ['个人网站', '表达', '生活'],
    cover: SITE_ASSETS.content.time5,
  },
  {
    id: 'react-from-zero',
    title: '刚学完 React 之后，我最先搞懂的 3 件事',
    date: '2026-03-29',
    category: '学习笔记',
    summary:
      '组件、props 和数据驱动渲染，是我从“会写页面”走向“会组织项目”的第一步。',
    tags: ['React', 'JSX', '组件化'],
    cover: SITE_ASSETS.content.time8,
  },
]

export const projects: ProjectSummary[] = [
  {
    id: 'react-personal-site',
    name: 'React 个人网站',
    description:
      '把早期静态原型升级为组件化、可路由、可维护的个人站点，用来沉淀博客和项目内容。',
    stack: ['React', 'TypeScript', 'Vite', 'CSS Modules'],
    status: '开发中',
    highlights: ['路由组织', '组件拆分', '数据驱动渲染'],
    cover: SITE_ASSETS.content.time1,
  },
  {
    id: 'desktop-clock',
    name: '极简浮窗时钟',
    description:
      '一个偏桌面端体验的小工具项目，探索界面呈现、窗口行为和更轻量的交互反馈。',
    stack: ['Electron', 'Vue', 'JavaScript'],
    status: '已完成',
    highlights: ['桌面端浮窗', '轻量交互', '多场景展示'],
    cover: SITE_ASSETS.content.time4,
  },
  {
    id: 'visual-dashboard',
    name: '数据可视化练习看板',
    description:
      '围绕图表布局和信息层级做的一组可视化练习，用来训练界面结构与数据展示能力。',
    stack: ['React', 'ECharts', 'TypeScript'],
    status: '构思中',
    highlights: ['信息层级', '图表布局', '组件复用'],
    cover: SITE_ASSETS.content.time2,
  },
  {
    id: 'study-blog-system',
    name: '学习笔记内容系统',
    description:
      '计划把零散笔记整理为更稳定的内容结构，后续可能接入 Markdown 或简单内容管理流程。',
    stack: ['Markdown', 'React', '内容建模'],
    status: '构思中',
    highlights: ['内容结构设计', '可扩展性', '个人知识沉淀'],
    cover: SITE_ASSETS.content.time3,
  },
]

/**
 * 生活记录区沿用旧站的情绪氛围，但数据结构仍保持可维护。
 */
export const lifeMoments: LifeMoment[] = [
  {
    id: 'orchard-sunrise',
    date: '2021年8月24日',
    title: '果园日出',
    tag: '生活',
    cover: SITE_ASSETS.content.time1,
  },
  {
    id: 'cornfield-shot',
    date: '2021年9月6日',
    title: '玉米地随拍',
    tag: '随手记',
    cover: SITE_ASSETS.content.time2,
  },
  {
    id: 'school-playground',
    date: '2021年9月',
    title: '初见学校：操场',
    tag: '学习',
    cover: SITE_ASSETS.content.time3,
  },
  {
    id: 'new-friend',
    date: '2021年10月',
    title: '认识一位好“朋友”',
    tag: '生活',
    cover: SITE_ASSETS.content.time4,
  },
  {
    id: 'snowy-day',
    date: '2022年2月5日',
    title: '雪地中二时',
    tag: '随手记',
    cover: SITE_ASSETS.content.time5,
  },
  {
    id: 'peacock',
    date: '2022年8月',
    title: '初见孔雀',
    tag: '生活',
    cover: SITE_ASSETS.content.time8,
  },
]

export const recentUpdates: RecentUpdate[] = [
  {
    id: 'site-refresh',
    period: '最近更新',
    title: '个人网站 React 版持续重构中',
    summary:
      '正在把以前的静态主页拆成组件和页面，让它既保留原来的气质，也更适合长期维护。',
  },
  {
    id: 'learning-track',
    period: '近期状态',
    title: 'React、TypeScript 与页面结构整理同步推进',
    summary:
      '目前把学习笔记、项目展示和个人表达一起收进站点里，边做边补工程化基础。',
  },
]
