import type {
  ProfileInfo,
} from '../types/content'

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
