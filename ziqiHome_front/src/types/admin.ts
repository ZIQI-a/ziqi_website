/**
 * 项目状态由后端枚举完全控制，前端只保留字符串契约，避免每次新增状态都要同步改类型。
 */
export type ProjectStatus = string
export type UserRole = string

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
