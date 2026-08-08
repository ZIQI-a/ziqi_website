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
        `歌单固定顺序播放,也认真喜欢游戏，不只享受通关，还好奇它如何被创造出来；`,
    },
    {
      title: '学习进度',
      description:
        '距离“技术大牛”大概还差几个大版本，好在每天都有新的 commit。',
    },
    {
      title: '长期愿望',
      description:
        '经济自由——这次不是玩笑。更想认真做一名 UP 主，亲手完成一款游戏，未来拥有自己的团队；和喜欢的人一起把世界这张大地图慢慢走完。',
    },
  ],
}
