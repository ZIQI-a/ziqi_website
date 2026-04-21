/**
 * 统一声明站点内容的数据类型，便于页面和组件共享结构约束。
 */
export interface ProfileInfo {
  name: string
  englishName: string
  role: string
  intro: string
  location: string
  email: string
  motto: string
  tags: string[]
  identityTags: string[]
  storyCards: Array<{
    title: string
    description: string
  }>
}

export interface BlogPostSummary {
  id: string
  title: string
  date: string
  category: string
  summary: string
  tags: string[]
  cover: string
}

export interface ProjectSummary {
  id: string
  name: string
  description: string
  stack: string[]
  status: string
  highlights: string[]
  cover: string
  link?: string
}

export interface ContactLinkSummary {
  id: string
  platformName: string
  profileUrl: string
  iconUrl: string
  description: string
}

export interface LifeMoment {
  id: string
  date: string
  title: string
  tag: '生活' | '学习' | '随手记'
  cover: string
}

export interface RecentUpdate {
  id: string
  period: string
  title: string
  summary: string
}
