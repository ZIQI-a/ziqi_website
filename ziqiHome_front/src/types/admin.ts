/**
 * 项目状态由后端枚举完全控制，前端只保留字符串契约，避免每次新增状态都要同步改类型。
 */
export type ProjectStatus = string
export type UserRole = string
export type BlogContentMode = 'LOCAL' | 'EXTERNAL' | 'HYBRID'
export type BlogSourceType = 'ORIGINAL' | 'YUQUE' | 'CSDN' | 'EXTERNAL'

export interface MomentCategoryAdminItem {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface MomentCategoryAdminPayload {
  name: string
}

export interface MomentAdminItem {
  id: number
  content: string
  imageUrl: string | null
  imageAlt: string | null
  category: {
    id: number
    name: string
  }
  published: boolean
  showOnHome: boolean
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface MomentAdminPayload {
  content: string
  imageUrl: string | null
  imageAlt: string | null
  categoryId: number
  published: boolean
  showOnHome: boolean
  pinned: boolean
}

export interface ProjectFormOptions {
  statusOptions: ProjectStatus[]
  stackOptions: string[]
}

export interface ContactLinkAdminItem {
  id: number
  platformName: string
  profileUrl: string
  iconUrl: string
  description: string
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ContactLinkAdminPayload {
  platformName: string
  profileUrl: string
  iconUrl: string
  description: string
  published: boolean
  sortOrder: number
}

export interface BlogAdminItem {
  id: number
  slug: string
  title: string
  publishDate: string
  category: string
  summary: string
  cover: string
  contentMarkdown: string
  tags: string[]
  contentMode: BlogContentMode
  sourceType: BlogSourceType
  sourceLabel: string | null
  sourceUrl: string | null
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface BlogAdminPayload {
  slug: string
  title: string
  publishDate: string
  category: string
  summary: string
  cover: string
  contentMarkdown: string
  tags: string[]
  contentMode: BlogContentMode
  sourceType: BlogSourceType
  sourceLabel: string | null
  sourceUrl: string | null
  published: boolean
  sortOrder: number
}

export interface YuqueSyncPreviewPayload {
  token: string
  repoNamespace: string
}

export interface YuqueSyncPreviewItem {
  docId: string
  slug: string
  title: string
  summary: string
  url: string | null
  updatedAt: string | null
  recommendedAction: 'CREATE' | 'UPDATE' | 'SKIP'
  existingBlogId: number | null
  existingBlogTitle: string | null
}

export interface YuqueSyncPreviewResponse {
  repoNamespace: string
  totalCount: number
  items: YuqueSyncPreviewItem[]
}

export interface YuqueSyncCommitPayload {
  token: string
  repoNamespace: string
  selections: Array<{
    docId: string
    slug: string
  }>
  defaultCategory: string
  defaultCover: string
  defaultTags: string[]
  publishImported: boolean
}

export interface YuqueSyncCommitResult {
  blogId: number
  blogTitle: string
  action: 'CREATED' | 'UPDATED'
  sourceDocId: string
}

export interface YuqueSyncCommitResponse {
  createdCount: number
  updatedCount: number
  items: YuqueSyncCommitResult[]
}

export interface ProjectAdminItem {
  id: number
  slug: string
  name: string
  description: string
  status: ProjectStatus
  cover: string
  link: string | null
  stack: string[]
  highlights: string[]
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProjectAdminPayload {
  slug: string
  name: string
  description: string
  status: ProjectStatus
  cover: string
  link: string
  stack: string[]
  highlights: string[]
  published: boolean
  sortOrder: number
}

export interface UserAdminItem {
  id: number
  username: string
  nickname: string
  role: UserRole
  enabled: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UserCreatePayload {
  username: string
  password: string
  nickname: string
  role: UserRole
  enabled: boolean
}

export interface UserUpdatePayload {
  username: string
  nickname: string
  role: UserRole
  enabled: boolean
}

export interface UserPasswordPayload {
  password: string
}
