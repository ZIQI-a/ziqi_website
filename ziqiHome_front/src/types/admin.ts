/**
 * 项目状态由后端枚举完全控制，前端只保留字符串契约，避免每次新增状态都要同步改类型。
 */
export type ProjectStatus = string

export interface ProjectFormOptions {
  statusOptions: ProjectStatus[]
  stackOptions: string[]
}

export interface BlogAdminItem {
  id: number
  slug: string
  title: string
  publishDate: string
  category: string
  summary: string
  cover: string
  tags: string[]
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
  tags: string[]
  published: boolean
  sortOrder: number
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
