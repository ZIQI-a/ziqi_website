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

/**
 * 公开站 moments 使用统一摘要结构，方便首页和最新页直接复用。
 */
export interface MomentSummary {
  id: string
  content: string
  imageUrl?: string
  imageAlt?: string
  categoryId: string
  categoryName: string
  published: boolean
  showOnHome: boolean
  pinned: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 分类单独抽成类型，便于后面做最新页筛选和后台联动。
 */
export interface MomentCategorySummary {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
